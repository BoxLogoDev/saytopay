import test from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import { llmConfig, extractItems, parseWithLLM } from "../src/llm.js";
import { parseOrderSmart } from "../src/aiParse.js";
import { createServer } from "../src/server.js";

// The LLM path is tested with mocked responses and a local stand-in
// endpoint only — no real API key is needed or used.

function jsonResponse(body, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  };
}

const openAiReply = (content) =>
  jsonResponse({ choices: [{ message: { content } }] });

const FAKE_CFG = {
  provider: "openai",
  apiKey: "test-key",
  model: "test-model",
  baseUrl: "https://llm.example/v1",
  timeoutMs: 1000,
};

test("llmConfig is null when no key is configured", () => {
  assert.equal(llmConfig({}), null);
  assert.equal(llmConfig({ LLM_PROVIDER: "openai" }), null);
});

test("llmConfig resolves provider keys and overrides", () => {
  const openai = llmConfig({ OPENAI_API_KEY: "k" });
  assert.equal(openai.provider, "openai");
  assert.equal(openai.model, "gpt-4o-mini");
  assert.equal(openai.baseUrl, "https://api.openai.com/v1");

  const anthropic = llmConfig({ ANTHROPIC_API_KEY: "k" });
  assert.equal(anthropic.provider, "anthropic");
  assert.equal(anthropic.baseUrl, "https://api.anthropic.com/v1");

  const gemini = llmConfig({ GEMINI_API_KEY: "k" });
  assert.equal(gemini.provider, "gemini");

  const compat = llmConfig({
    LLM_API_KEY: "k",
    LLM_API_BASE: "https://proxy.example/v1/",
    LLM_MODEL: "some-model",
  });
  assert.equal(compat.provider, "openai-compatible");
  assert.equal(compat.baseUrl, "https://proxy.example/v1");
  assert.equal(compat.model, "some-model");

  const forced = llmConfig({ LLM_PROVIDER: "anthropic", LLM_API_KEY: "k" });
  assert.equal(forced.provider, "anthropic");
  assert.equal(forced.apiKey, "k");
});

test("extractItems parses plain, fenced, and prose-wrapped JSON", () => {
  const want = [{ sku: "mug", quantity: 3 }];
  assert.deepEqual(extractItems('{"items":[{"sku":"mug","quantity":3}]}'), want);
  assert.deepEqual(extractItems('```json\n{"items":[{"sku":"mug","quantity":3}]}\n```'), want);
  assert.deepEqual(
    extractItems('Here is the order: {"items":[{"sku":"mug","quantity":3}]} — done.'),
    want
  );
});

test("extractItems drops unknown SKUs and coerces quantities", () => {
  const items = extractItems(
    '{"items":[{"sku":"spaceship","quantity":1},{"sku":"mug","quantity":"2"},{"sku":"mug","quantity":1},{"sku":"candle","quantity":0}]}'
  );
  assert.deepEqual(items, [{ sku: "mug", quantity: 3 }]);
});

test("extractItems accepts an explicit empty list but rejects garbage", () => {
  assert.deepEqual(extractItems('{"items":[]}'), []);
  assert.throws(() => extractItems("no json here"), /llm_invalid_response|not JSON/);
  assert.throws(() => extractItems('{"answer":42}'), /no items array/);
});

test("parseWithLLM reads the OpenAI chat-completions shape", async () => {
  let seen;
  const fetchImpl = async (url, opts) => {
    seen = { url, headers: opts.headers, body: JSON.parse(opts.body) };
    return openAiReply('{"items":[{"sku":"coffee-beans","quantity":2}]}');
  };
  const out = await parseWithLLM("2 coffee beans", { config: FAKE_CFG, fetchImpl });
  assert.deepEqual(out.items, [{ sku: "coffee-beans", quantity: 2 }]);
  assert.equal(out.provider, "openai");
  assert.equal(seen.url, "https://llm.example/v1/chat/completions");
  assert.equal(seen.headers.authorization, "Bearer test-key");
  assert.equal(seen.body.model, "test-model");
});

test("parseWithLLM reads the Anthropic messages shape", async () => {
  let seen;
  const fetchImpl = async (url, opts) => {
    seen = { url, headers: opts.headers };
    return jsonResponse({
      content: [{ type: "text", text: '{"items":[{"sku":"notebook","quantity":1}]}' }],
    });
  };
  const cfg = { ...FAKE_CFG, provider: "anthropic", baseUrl: "https://api.anthropic.com/v1" };
  const out = await parseWithLLM("a notebook", { config: cfg, fetchImpl });
  assert.deepEqual(out.items, [{ sku: "notebook", quantity: 1 }]);
  assert.equal(seen.url, "https://api.anthropic.com/v1/messages");
  assert.equal(seen.headers["x-api-key"], "test-key");
});

test("parseWithLLM reads the Gemini generateContent shape", async () => {
  let seen;
  const fetchImpl = async (url, opts) => {
    seen = { url, headers: opts.headers };
    return jsonResponse({
      candidates: [
        { content: { parts: [{ text: '{"items":[{"sku":"candle","quantity":4}]}' }] } },
      ],
    });
  };
  const cfg = {
    ...FAKE_CFG,
    provider: "gemini",
    baseUrl: "https://generativelanguage.googleapis.com/v1beta",
  };
  const out = await parseWithLLM("four candles", { config: cfg, fetchImpl });
  assert.deepEqual(out.items, [{ sku: "candle", quantity: 4 }]);
  assert.match(seen.url, /:generateContent$/);
  assert.equal(seen.headers["x-goog-api-key"], "test-key");
});

test("parseWithLLM surfaces HTTP errors and a missing key", async () => {
  await assert.rejects(
    () => parseWithLLM("x", { config: FAKE_CFG, fetchImpl: async () => jsonResponse({}, 500) }),
    /llm_http_error|HTTP 500/
  );
  await assert.rejects(
    () => parseWithLLM("x", { config: null }),
    (err) => err.code === "llm_not_configured"
  );
});

test("parseOrderSmart prices the LLM result from the catalog, never from the model", async () => {
  const fetchImpl = async () =>
    openAiReply('{"items":[{"sku":"coffee-beans","quantity":2},{"sku":"notebook","quantity":1}]}');
  const { draft, source } = await parseOrderSmart("2 coffee beans and a notebook", {
    config: FAKE_CFG,
    fetchImpl,
  });
  assert.equal(source.type, "llm");
  assert.equal(source.provider, "openai");
  assert.equal(draft.total, 45.5);
  assert.equal(draft.items.find((i) => i.sku === "coffee-beans").unitPrice, 18);
});

test("parseOrderSmart falls back to the rules parser when the LLM fails", async () => {
  const failing = async () => {
    throw new Error("network down");
  };
  const { draft, source } = await parseOrderSmart("2 coffee beans and a notebook", {
    config: FAKE_CFG,
    fetchImpl: failing,
  });
  assert.equal(source.type, "rules");
  assert.equal(source.fallback, true);
  assert.ok(source.llmError);
  assert.equal(draft.total, 45.5);
});

test("parseOrderSmart falls back when the LLM replies with garbage", async () => {
  const fetchImpl = async () => openAiReply("I cannot help with that.");
  const { draft, source } = await parseOrderSmart("three mugs", {
    config: FAKE_CFG,
    fetchImpl,
  });
  assert.equal(source.type, "rules");
  assert.equal(source.fallback, true);
  assert.equal(draft.items.find((i) => i.sku === "mug").quantity, 3);
});

test("parseOrderSmart falls back on LLM timeout", async () => {
  const hanging = (url, opts) =>
    new Promise((_, reject) => {
      opts.signal.addEventListener("abort", () => {
        const err = new Error("The operation was aborted");
        err.name = "AbortError";
        reject(err);
      });
    });
  const { draft, source } = await parseOrderSmart("a mug", {
    config: { ...FAKE_CFG, timeoutMs: 25 },
    fetchImpl: hanging,
  });
  assert.equal(source.type, "rules");
  assert.equal(source.fallback, true);
  assert.equal(source.llmError, "llm_timeout");
  assert.equal(draft.items.find((i) => i.sku === "mug").quantity, 1);
});

test("parseOrderSmart uses the rules parser directly when no key is configured", async () => {
  let called = false;
  const fetchImpl = async () => {
    called = true;
    throw new Error("must not be called");
  };
  const { draft, source } = await parseOrderSmart("a mug and three mugs", {
    config: null,
    fetchImpl,
  });
  assert.equal(called, false);
  assert.deepEqual(source, { type: "rules" });
  assert.equal(draft.items.find((i) => i.sku === "mug").quantity, 4);
});

test("server parses through a real HTTP call to a local OpenAI-compatible stand-in", async (t) => {
  let seenAuth;
  const standin = http.createServer(async (req, res) => {
    seenAuth = req.headers.authorization;
    for await (const chunk of req) void chunk; // drain the request body
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        choices: [
          {
            message: {
              content:
                '{"items":[{"sku":"coffee-beans","quantity":2},{"sku":"notebook","quantity":1}]}',
            },
          },
        ],
      })
    );
  });
  await new Promise((r) => standin.listen(0, "127.0.0.1", r));
  t.after(() => standin.close());

  const cfg = llmConfig({
    LLM_API_KEY: "test-key",
    LLM_API_BASE: `http://127.0.0.1:${standin.address().port}/v1`,
  });
  assert.equal(cfg.provider, "openai-compatible");

  const app = createServer(
    { clientId: "", clientSecret: "", base: "http://127.0.0.1:1", envName: "sandbox" },
    { config: cfg }
  );
  await new Promise((r) => app.listen(0, "127.0.0.1", r));
  t.after(() => app.close());
  const base = `http://127.0.0.1:${app.address().port}`;

  const health = await (await fetch(`${base}/api/health`)).json();
  assert.equal(health.ai.configured, true);
  assert.equal(health.ai.provider, "openai-compatible");

  const parsed = await (
    await fetch(`${base}/api/parse`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: "2 coffee beans and a notebook" }),
    })
  ).json();
  assert.equal(parsed.source.type, "llm");
  assert.equal(parsed.total, 45.5);
  assert.equal(seenAuth, "Bearer test-key");
});
