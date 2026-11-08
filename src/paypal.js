// PayPal Orders v2 client (sandbox by default).
// Docs flow: create order -> buyer approves on PayPal -> capture the order.

const BASES = {
  sandbox: "https://api-m.sandbox.paypal.com",
  live: "https://api-m.paypal.com",
};

export function paypalConfig(env = process.env) {
  return {
    clientId: env.PAYPAL_CLIENT_ID || "",
    clientSecret: env.PAYPAL_CLIENT_SECRET || "",
    // PAYPAL_API_BASE overrides everything (used by the local mock in tests).
    base: env.PAYPAL_API_BASE || BASES[env.PAYPAL_ENV === "live" ? "live" : "sandbox"],
    envName: env.PAYPAL_API_BASE ? "custom" : env.PAYPAL_ENV === "live" ? "live" : "sandbox",
  };
}

export function hasCredentials(config) {
  return Boolean(config.clientId && config.clientSecret);
}

async function paypalFetch(config, path, options = {}) {
  const res = await fetch(`${config.base}${path}`, options);
  const text = await res.text();
  let body = null;
  try { body = text ? JSON.parse(text) : null; } catch { body = { raw: text }; }
  if (!res.ok) {
    const err = new Error(`PayPal API ${res.status} on ${path}: ${text.slice(0, 300)}`);
    err.status = res.status;
    err.body = body;
    throw err;
  }
  return body;
}

export async function getAccessToken(config) {
  const basic = Buffer.from(`${config.clientId}:${config.clientSecret}`).toString("base64");
  const body = await paypalFetch(config, "/v1/oauth2/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });
  return body.access_token;
}

/** Create an order from a parsed draft. Returns { id, status, approveUrl }. */
export async function createOrder(config, draft, { returnUrl, cancelUrl } = {}) {
  const token = await getAccessToken(config);
  const order = await paypalFetch(config, "/v2/checkout/orders", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: {
            currency_code: draft.currency || "USD",
            value: draft.total.toFixed(2),
            breakdown: {
              item_total: { currency_code: draft.currency || "USD", value: draft.total.toFixed(2) },
            },
          },
          items: draft.items.map((i) => ({
            name: i.name,
            sku: i.sku,
            quantity: String(i.quantity),
            unit_amount: { currency_code: draft.currency || "USD", value: i.unitPrice.toFixed(2) },
          })),
        },
      ],
      application_context: {
        brand_name: "SayToPay (sandbox demo)",
        user_action: "PAY_NOW",
        return_url: returnUrl,
        cancel_url: cancelUrl,
      },
    }),
  });
  const approveUrl = (order.links || []).find((l) => l.rel === "approve")?.href || null;
  return { id: order.id, status: order.status, approveUrl, raw: order };
}

/** Capture an approved order. Returns { id, status, captureId, amount }. */
export async function captureOrder(config, orderId) {
  const token = await getAccessToken(config);
  const result = await paypalFetch(config, `/v2/checkout/orders/${orderId}/capture`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  const capture =
    result?.purchase_units?.[0]?.payments?.captures?.[0] || null;
  return {
    id: result.id,
    status: result.status,
    captureId: capture?.id || null,
    amount: capture?.amount || null,
    raw: result,
  };
}
