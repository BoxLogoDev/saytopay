import { CATALOG } from "./catalog.js";

// Provider-neutral LLM client for SayToPay's language step.
//
// The app reads its AI configuration from environment variables only —
// no key is ever stored in code or in the repository. Any one of these
// is enough to switch the language step from the built-in rules parser
// to a real model:
//
//   OPENAI_API_KEY      OpenAI (or, with LLM_API_BASE, any
//                       OpenAI-compatible endpoint)
//   ANTHROPIC_API_KEY   Anthropic Messages API
//   GEMINI_API_KEY      Google Gemini (GOOGLE_API_KEY also accepted)
//   LLM_API_KEY         Generic key for the provider in LLM_PROVIDER
//
// Optional overrides: LLM_PROVIDER (openai | anthropic | gemini |
// openai-compatible), LLM_MODEL, LLM_API_BASE, LLM_TIMEOUT_MS.
//
// The model only extracts { sku, quantity } pairs. It never sees or
// sets prices: the draft is rebuilt from the catalog on the server
// (src/draft.js), exactly like an edited draft.

const KNOWN_PROVIDERS = ["openai", "anthropic", "gemini", "openai-compatible"];

const PROVIDER_KEY_VARS = {
  openai: "OPENAI_API_KEY",
  anthropic: "ANTHROPIC_API_KEY",
  gemini: "GEMINI_API_KEY",
};

const DEFAULT_MODELS = {
  openai: "gpt-4o-mini",
  "openai-compatible": "gpt-4o-mini",
  anthropic: "claude-haiku-4-5",
  gemini: "gemini-2.0-flash",
};

const DEFAULT_BASES = {
  openai: "https://api.openai.com/v1",
  "openai-compatible": "https://api.openai.com/v1",
  anthropic: "https://api.anthropic.com/v1",
  gemini: "https://generativelanguage.googleapis.com/v1beta",
};

const BY_SKU = new Map(CATALOG.map((p) => [p.sku, p]));

/**
 * Resolve the LLM configuration from environment variables.
 * Returns null when no usable key is configured — the caller then
 * uses the built-in rules parser.
 */
export function llmConfig(env = process.env) {
  let provider = String(env.LLM_PROVIDER || "").trim().toLowerCase();
  if (provider === "google") provider = "gemini";
  if (!KNOWN_PROVIDERS.includes(provider)) {
    if (env.ANTHROPIC_API_KEY) provider = "anthropic";
    else if (env.OPENAI_API_KEY) provider = "openai";
    else if (env.GEMINI_API_KEY || env.GOOGLE_API_KEY) provider = "gemini";
    else if (env.LLM_API_KEY) provider = env.LLM_API_BASE ? "openai-compatible" : "openai";
    else return null;
  }
  const apiKey =
    env[PROVIDER_KEY_VARS[provider]] ||
    (provider === "gemini" ? env.GOOGLE_API_KEY : undefined) ||
    env.LLM_API_KEY ||
    "";
  if (!apiKey) return null;
  const timeout = Number(env.LLM_TIMEOUT_MS);
  return {
    provider,
    apiKey,
    model: env.LLM_MODEL || DEFAULT_MODELS[provider],
    baseUrl: String(env.LLM_API_BASE || DEFAULT_BASES[provider]).replace(/\/+$/, ""),
    timeoutMs: Number.isFinite(timeout) && timeout > 0 ? timeout : 8000,
  };
}

const SYSTEM_PROMPT = [
  "You extract a shopping order from one sentence written by a buyer.",
  "The buyer can only buy items from this catalog (sku: name):",
  ...CATALOG.map((p) => `- ${p.sku}: ${p.name}`),
  "Rules:",
  "- Reply with JSON only, no prose: {\"items\":[{\"sku\":\"<sku>\",\"quantity\":<integer>}]}",
  "- Use only SKUs from the catalog. If nothing in the sentence matches the catalog, return {\"items\":[]}.",
  "- Quantities are positive integers. A dozen is 12, half a dozen is 6, a pair or a couple is 2.",
  "- An item the buyer explicitly rules out (\"no notebook\", \"not a candle\") must not appear in the items.",
  "- Mentioning the same item twice sums its quantities.",
  "- Never invent prices; prices are handled by the server, not by you.",
].join("\n");

function requestShape(cfg, text) {
  if (cfg.provider === "anthropic") {
    return {
      url: `${cfg.baseUrl}/messages`,
      headers: {
        "content-type": "application/json",
        "x-api-key": cfg.apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: {
        model: cfg.model,
        max_tokens: 512,
        temperature: 0,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: text }],
      },
      pick: (j) =>
        (Array.isArray(j?.content) ? j.content : [])
          .filter((b) => b?.type === "text")
          .map((b) => b.text || "")
          .join(""),
    };
  }
  if (cfg.provider === "gemini") {
    return {
      url: `${cfg.baseUrl}/models/${encodeURIComponent(cfg.model)}:generateContent`,
      headers: {
        "content-type": "application/json",
        "x-goog-api-key": cfg.apiKey,
      },
      body: {
        systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: [{ role: "user", parts: [{ text }] }],
        generationConfig: { temperature: 0 },
      },
      pick: (j) =>
        (j?.candidates?.[0]?.content?.parts || []).map((p) => p?.text || "").join(""),
    };
  }
  // openai and openai-compatible share the chat completions shape.
  return {
    url: `${cfg.baseUrl}/chat/completions`,
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${cfg.apiKey}`,
    },
    body: {
      model: cfg.model,
      temperature: 0,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: text },
      ],
    },
    pick: (j) => j?.choices?.[0]?.message?.content || "",
  };
}

/**
 * Validate and normalize the model's reply into [{ sku, quantity }].
 * Unknown SKUs are dropped and quantities are coerced to integers in
 * [1, 99]; the server repricing step applies the same limits again.
 * An explicit empty items list is a valid result (nothing matched).
 * Throws when the reply carries no usable JSON at all.
 */
export function extractItems(raw) {
  if (typeof raw !== "string" || !raw.trim()) {
    const err = new Error("LLM response contained no text.");
    err.code = "llm_empty_response";
    throw err;
  }
  let text = raw.trim();
  const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence) text = fence[1].trim();
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    if (start < 0 || end <= start) {
      const err = new Error("LLM response was not JSON.");
      err.code = "llm_invalid_response";
      throw err;
    }
    try {
      parsed = JSON.parse(text.slice(start, end + 1));
    } catch {
      const err = new Error("LLM response was not valid JSON.");
      err.code = "llm_invalid_response";
      throw err;
    }
  }
  const list = Array.isArray(parsed) ? parsed : parsed?.items;
  if (!Array.isArray(list)) {
    const err = new Error("LLM response has no items array.");
    err.code = "llm_invalid_response";
    throw err;
  }
  const merged = new Map();
  for (const entry of list) {
    const product = BY_SKU.get(entry?.sku);
    if (!product) continue;
    const qty = Math.floor(Number(entry?.quantity));
    if (!Number.isFinite(qty) || qty <= 0) continue;
    merged.set(product.sku, Math.min((merged.get(product.sku) || 0) + qty, 99));
  }
  return [...merged.entries()].map(([sku, quantity]) => ({ sku, quantity }));
}

/**
 * Ask the configured model to extract the order from one sentence.
 * Returns { items, provider, model }. Throws (with err.code set) on a
 * missing key, an HTTP error, a timeout, or an unusable reply — the
 * caller is expected to fall back to the rules parser.
 */
export async function parseWithLLM(text, { config, fetchImpl = fetch } = {}) {
  const cfg = config || llmConfig();
  if (!cfg) {
    const err = new Error("No LLM API key is configured.");
    err.code = "llm_not_configured";
    throw err;
  }
  const { url, headers, body, pick } = requestShape(cfg, String(text || ""));
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), cfg.timeoutMs);
  try {
    const res = await fetchImpl(url, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    if (!res.ok) {
      const err = new Error(`LLM request failed: HTTP ${res.status}`);
      err.code = "llm_http_error";
      err.status = res.status;
      throw err;
    }
    const data = await res.json();
    return {
      items: extractItems(pick(data)),
      provider: cfg.provider,
      model: cfg.model,
    };
  } catch (err) {
    if (err?.name === "AbortError") {
      const timeoutErr = new Error(`LLM request timed out after ${cfg.timeoutMs}ms.`);
      timeoutErr.code = "llm_timeout";
      throw timeoutErr;
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}
