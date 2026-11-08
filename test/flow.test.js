import test from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import { createServer } from "../src/server.js";

// A local stand-in for the PayPal sandbox API. It implements exactly the
// endpoints the app calls, tracks order state (CREATED -> APPROVED ->
// COMPLETED), and refuses capture before approval, like the real API.
// The live sandbox run uses the same app code with PAYPAL_API_BASE unset.
function startMockPayPal() {
  const orders = new Map();
  const server = http.createServer(async (req, res) => {
    const url = new URL(req.url, "http://mock");
    const send = (status, body) => {
      res.writeHead(status, { "Content-Type": "application/json" });
      res.end(JSON.stringify(body));
    };
    if (req.method === "POST" && url.pathname === "/v1/oauth2/token") {
      if (!String(req.headers.authorization || "").startsWith("Basic ")) {
        return send(401, { error: "invalid_client" });
      }
      return send(200, { access_token: "mock-token", token_type: "Bearer", expires_in: 3600 });
    }
    if (req.method === "POST" && url.pathname === "/v2/checkout/orders") {
      const chunks = [];
      for await (const c of req) chunks.push(c);
      const body = JSON.parse(Buffer.concat(chunks).toString());
      const id = "MOCK-ORDER-7XJ20431";
      orders.set(id, { body, approved: false });
      return send(201, {
        id,
        status: "CREATED",
        links: [
          { rel: "self", href: `http://mock/v2/checkout/orders/${id}` },
          { rel: "approve", href: `http://127.0.0.1:${server.address().port}/approve?token=${id}` },
        ],
      });
    }
    if (req.method === "GET" && url.pathname === "/approve") {
      const id = url.searchParams.get("token");
      if (!orders.has(id)) return send(404, { error: "not_found" });
      orders.get(id).approved = true;
      return send(200, { approved: true, id });
    }
    const get = url.pathname.match(/^\/v2\/checkout\/orders\/([^/]+)$/);
    if (req.method === "GET" && get) {
      const order = orders.get(get[1]);
      if (!order) return send(404, { error: "not_found" });
      if (order.captured) {
        const amount = order.body.purchase_units[0].amount;
        return send(200, {
          id: get[1],
          status: "COMPLETED",
          purchase_units: [
            { payments: { captures: [{ id: "MOCK-CAPTURE-9KD55210", status: "COMPLETED", amount }] } },
          ],
        });
      }
      return send(200, { id: get[1], status: order.approved ? "APPROVED" : "CREATED", purchase_units: [] });
    }
    const cap = url.pathname.match(/^\/v2\/checkout\/orders\/([^/]+)\/capture$/);
    if (req.method === "POST" && cap) {
      const order = orders.get(cap[1]);
      if (!order) return send(404, { error: "not_found" });
      if (!order.approved) return send(422, { error: "ORDER_NOT_APPROVED" });
      if (order.captured) return send(422, { error: "ORDER_ALREADY_CAPTURED" });
      order.captured = true;
      const amount = order.body.purchase_units[0].amount;
      return send(200, {
        id: cap[1],
        status: "COMPLETED",
        purchase_units: [
          { payments: { captures: [{ id: "MOCK-CAPTURE-9KD55210", status: "COMPLETED", amount }] } },
        ],
      });
    }
    return send(404, { error: "unknown_path", path: url.pathname });
  });
  return new Promise((resolve) => server.listen(0, "127.0.0.1", () => resolve(server)));
}

test("full flow: parse -> create order -> approve -> capture", async (t) => {
  const mock = await startMockPayPal();
  const mockBase = `http://127.0.0.1:${mock.address().port}`;
  const app = createServer({
    clientId: "mock-client",
    clientSecret: "mock-secret",
    base: mockBase,
    envName: "custom",
  });
  await new Promise((r) => app.listen(0, "127.0.0.1", r));
  const appBase = `http://127.0.0.1:${app.address().port}`;
  t.after(() => { app.close(); mock.close(); });

  const post = async (path, body) => {
    const res = await fetch(`${appBase}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return { status: res.status, body: await res.json() };
  };

  // 1) Natural language -> order draft
  const parsed = await post("/api/parse", { text: "2 coffee beans and a notebook" });
  assert.equal(parsed.status, 200);
  assert.equal(parsed.body.total, 45.5);
  assert.equal(parsed.body.items.length, 2);

  // 2) Create the PayPal order
  const created = await post("/api/orders", { draft: parsed.body });
  assert.equal(created.status, 201);
  assert.equal(created.body.status, "CREATED");
  assert.ok(created.body.approveUrl, "approve URL returned");

  // 3) Buyer approval (on real sandbox this is the PayPal checkout page)
  const approveRes = await fetch(created.body.approveUrl);
  assert.equal(approveRes.status, 200);

  // 4) Capture
  const captured = await post("/api/orders/capture", { orderId: created.body.id });
  assert.equal(captured.status, 200);
  assert.equal(captured.body.status, "COMPLETED");
  assert.equal(captured.body.captureId, "MOCK-CAPTURE-9KD55210");
  assert.equal(captured.body.amount.value, "45.50");
});

test("full flow: a price-tampered draft is repriced by the server before capture", async (t) => {
  const mock = await startMockPayPal();
  const mockBase = `http://127.0.0.1:${mock.address().port}`;
  const app = createServer({
    clientId: "mock-client",
    clientSecret: "mock-secret",
    base: mockBase,
    envName: "custom",
  });
  await new Promise((r) => app.listen(0, "127.0.0.1", r));
  const appBase = `http://127.0.0.1:${app.address().port}`;
  t.after(() => { app.close(); mock.close(); });

  const post = async (path, body) => {
    const res = await fetch(`${appBase}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return { status: res.status, body: await res.json() };
  };

  // Client claims every item costs $0.01 — the server must ignore that.
  const tampered = {
    items: [
      { sku: "coffee-beans", name: "Coffee beans 1kg", quantity: 2, unitPrice: 0.01, lineTotal: 0.02 },
      { sku: "notebook", name: "Paper notebook", quantity: 1, unitPrice: 0.01, lineTotal: 0.01 },
    ],
    total: 0.03,
    currency: "USD",
  };

  const normalized = await post("/api/draft/normalize", { draft: tampered });
  assert.equal(normalized.status, 200);
  assert.equal(normalized.body.total, 45.5);

  const created = await post("/api/orders", { draft: tampered });
  assert.equal(created.status, 201);
  await fetch(created.body.approveUrl);
  const captured = await post("/api/orders/capture", { orderId: created.body.id });
  assert.equal(captured.status, 200);
  assert.equal(captured.body.status, "COMPLETED");
  assert.equal(captured.body.amount.value, "45.50");
});

test("order status lookup tracks CREATED -> APPROVED -> COMPLETED without re-capturing", async (t) => {
  const mock = await startMockPayPal();
  const mockBase = `http://127.0.0.1:${mock.address().port}`;
  const app = createServer({
    clientId: "mock-client",
    clientSecret: "mock-secret",
    base: mockBase,
    envName: "custom",
  });
  await new Promise((r) => app.listen(0, "127.0.0.1", r));
  const appBase = `http://127.0.0.1:${app.address().port}`;
  t.after(() => { app.close(); mock.close(); });

  const post = async (path, body) => {
    const res = await fetch(`${appBase}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return { status: res.status, body: await res.json() };
  };
  const getStatus = async (id) => {
    const res = await fetch(`${appBase}/api/orders/${id}`);
    return { status: res.status, body: await res.json() };
  };

  const created = await post("/api/orders", { text: "a mug" });
  assert.equal(created.status, 201);

  // Before approval: CREATED, nothing captured yet.
  let lookup = await getStatus(created.body.id);
  assert.equal(lookup.status, 200);
  assert.equal(lookup.body.status, "CREATED");
  assert.equal(lookup.body.captureId, null);

  await fetch(created.body.approveUrl);
  lookup = await getStatus(created.body.id);
  assert.equal(lookup.body.status, "APPROVED");
  assert.equal(lookup.body.captureId, null);

  const captured = await post("/api/orders/capture", { orderId: created.body.id });
  assert.equal(captured.status, 200);

  // After capture (the refresh-on-return case): the lookup alone reports
  // the completed payment, so the UI never needs a second capture call —
  // the mock rejects one with ORDER_ALREADY_CAPTURED, like the real API.
  lookup = await getStatus(created.body.id);
  assert.equal(lookup.body.status, "COMPLETED");
  assert.equal(lookup.body.captureId, "MOCK-CAPTURE-9KD55210");
  assert.equal(lookup.body.amount.value, "12.00");
});

test("orders endpoint refuses to run without credentials", async (t) => {
  const app = createServer({ clientId: "", clientSecret: "", base: "http://127.0.0.1:1", envName: "sandbox" });
  await new Promise((r) => app.listen(0, "127.0.0.1", r));
  t.after(() => app.close());
  const res = await fetch(`http://127.0.0.1:${app.address().port}/api/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text: "a mug" }),
  });
  assert.equal(res.status, 503);
  const body = await res.json();
  assert.equal(body.error, "paypal_credentials_missing");
});
