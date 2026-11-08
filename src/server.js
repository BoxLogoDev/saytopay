import http from "node:http";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { parseOrderText } from "./parseOrder.js";
import { publicCatalog } from "./catalog.js";
import { normalizeDraft } from "./draft.js";
import { paypalConfig, hasCredentials, createOrder, captureOrder, getOrder } from "./paypal.js";
import { loadEnvFile } from "./env.js";

loadEnvFile();

const root = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(root, "..", "public");
const config = paypalConfig();
const port = Number(process.env.PORT || 3000);

function json(res, status, body) {
  const data = JSON.stringify(body);
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(data);
}

async function readBody(req) {
  const chunks = [];
  for await (const c of req) chunks.push(c);
  const text = Buffer.concat(chunks).toString("utf8");
  return text ? JSON.parse(text) : {};
}

const MIME = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css" };

export function createServer(paypalCfg = config) {
  return http.createServer(async (req, res) => {
    const url = new URL(req.url, `http://${req.headers.host}`);
    try {
      if (req.method === "GET" && url.pathname === "/api/health") {
        return json(res, 200, {
          ok: true,
          paypalEnv: paypalCfg.envName,
          credentialsConfigured: hasCredentials(paypalCfg),
        });
      }

      // What a buyer can say: the demo catalog, rendered by the UI so the
      // buyable items and their prices are visible before ordering.
      if (req.method === "GET" && url.pathname === "/api/catalog") {
        return json(res, 200, { items: publicCatalog(), currency: "USD" });
      }

      if (req.method === "POST" && url.pathname === "/api/parse") {
        const { text } = await readBody(req);
        return json(res, 200, parseOrderText(text));
      }

      // The UI edits quantities/removes items, then asks the server to
      // reprice the draft from the catalog before payment.
      if (req.method === "POST" && url.pathname === "/api/draft/normalize") {
        const { draft } = await readBody(req);
        return json(res, 200, normalizeDraft(draft));
      }

      if (req.method === "POST" && url.pathname === "/api/orders") {
        if (!hasCredentials(paypalCfg)) {
          return json(res, 503, {
            error: "paypal_credentials_missing",
            message:
              "Set PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET from a PayPal sandbox app in .env, then restart.",
          });
        }
        const { text, draft } = await readBody(req);
        // Never trust client-supplied prices: a supplied draft is rebuilt
        // from the catalog (SKU + quantity only) before the order is created.
        const orderDraft = draft ? normalizeDraft(draft) : parseOrderText(text);
        if (!orderDraft.items?.length || !(orderDraft.total > 0)) {
          return json(res, 400, { error: "empty_order", message: "The order draft has no items." });
        }
        const base = `http://${req.headers.host}`;
        const created = await createOrder(paypalCfg, orderDraft, {
          returnUrl: `${base}/return`,
          cancelUrl: `${base}/cancel`,
        });
        return json(res, 201, created);
      }

      // Read-only status lookup: the return page checks this before
      // capturing, so a refresh after a completed payment does not try
      // to capture the same order again.
      const statusMatch = url.pathname.match(/^\/api\/orders\/([^/]+)$/);
      if (req.method === "GET" && statusMatch) {
        if (!hasCredentials(paypalCfg)) {
          return json(res, 503, { error: "paypal_credentials_missing" });
        }
        const order = await getOrder(paypalCfg, decodeURIComponent(statusMatch[1]));
        return json(res, 200, order);
      }

      if (req.method === "POST" && url.pathname === "/api/orders/capture") {
        if (!hasCredentials(paypalCfg)) {
          return json(res, 503, { error: "paypal_credentials_missing" });
        }
        const { orderId } = await readBody(req);
        if (!orderId) return json(res, 400, { error: "order_id_required" });
        const captured = await captureOrder(paypalCfg, orderId);
        return json(res, 200, captured);
      }

      if (req.method === "GET" && ["/", "/return", "/cancel"].includes(url.pathname)) {
        const file = await readFile(path.join(publicDir, "index.html"));
        res.writeHead(200, { "Content-Type": "text/html" });
        return res.end(file);
      }

      if (req.method === "GET" && MIME[path.extname(url.pathname)]) {
        const file = await readFile(path.join(publicDir, path.basename(url.pathname)));
        res.writeHead(200, { "Content-Type": MIME[path.extname(url.pathname)] });
        return res.end(file);
      }

      return json(res, 404, { error: "not_found" });
    } catch (err) {
      return json(res, 502, { error: "upstream_error", message: String(err.message || err) });
    }
  });
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  createServer().listen(port, () => {
    console.log(`SayToPay listening on http://localhost:${port} (PayPal env: ${config.envName}, credentials: ${hasCredentials(config) ? "set" : "MISSING"})`);
  });
}
