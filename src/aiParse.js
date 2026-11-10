import { parseOrderText } from "./parseOrder.js";
import { normalizeDraft } from "./draft.js";
import { llmConfig, parseWithLLM } from "./llm.js";

/**
 * The language step of the app, with a real AI model in front.
 *
 * When an LLM API key is configured (see src/llm.js), the sentence is
 * sent to the model, which returns { sku, quantity } pairs; the draft
 * is then rebuilt from the catalog by the same server-side repricing
 * used for hand-edited drafts, so the model never sets prices.
 *
 * Any failure — no key, HTTP error, timeout, unusable reply — falls
 * back to the deterministic offline rules parser in
 * src/parseOrder.js, so the demo keeps working with no key at all.
 *
 * Returns { draft, source } where source says which path produced the
 * draft: { type: "llm", provider, model } or
 * { type: "rules" } / { type: "rules", fallback: true, llmError }.
 */
export async function parseOrderSmart(text, opts = {}) {
  const cfg = opts.config === undefined ? llmConfig(opts.env) : opts.config;
  if (cfg) {
    try {
      const { items, provider, model } = await parseWithLLM(text, {
        config: cfg,
        fetchImpl: opts.fetchImpl,
      });
      return {
        draft: normalizeDraft({ items }),
        source: { type: "llm", provider, model },
      };
    } catch (err) {
      return {
        draft: parseOrderText(text),
        source: {
          type: "rules",
          fallback: true,
          llmError: String(err?.code || err?.message || err),
        },
      };
    }
  }
  return { draft: parseOrderText(text), source: { type: "rules" } };
}
