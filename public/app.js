let draft = null;

async function api(path, body) {
  const res = await fetch(path, {
    method: body ? "POST" : "GET",
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || data.error || `HTTP ${res.status}`);
  return data;
}

function renderDraft(d) {
  draft = d;
  const tbody = document.querySelector("#draftTable tbody");
  tbody.innerHTML = d.items
    .map(
      (i) => `<tr>
        <td>${i.name}</td>
        <td><input class="qty" data-sku="${i.sku}" type="number" min="0" max="99" step="1" value="${i.quantity}" aria-label="Quantity for ${i.name}" /></td>
        <td>$${i.unitPrice.toFixed(2)}</td>
        <td>$${i.lineTotal.toFixed(2)}</td>
        <td><button class="removeBtn" data-sku="${i.sku}" type="button">Remove</button></td>
      </tr>`
    )
    .join("");
  document.querySelector("#draftTotal").textContent = `Total: $${d.total.toFixed(2)} ${d.currency}`;
  document.querySelector("#draftNote").textContent = d.note || "";
  document.querySelector("#step-draft").hidden = d.items.length === 0;
  document.querySelector("#payBtn").disabled = d.items.length === 0;
  tbody.querySelectorAll(".qty").forEach((input) => {
    input.addEventListener("change", () => editDraft(input.dataset.sku, Number(input.value)));
  });
  tbody.querySelectorAll(".removeBtn").forEach((btn) => {
    btn.addEventListener("click", () => editDraft(btn.dataset.sku, 0));
  });
}

// Send only SKUs + quantities; the server reprices from the catalog.
async function editDraft(sku, quantity) {
  if (!draft) return;
  const edited = {
    items: draft.items.map((i) => ({ sku: i.sku, quantity: i.sku === sku ? quantity : i.quantity })),
  };
  try {
    renderDraft(await api("/api/draft/normalize", { draft: edited }));
  } catch (e) {
    alert(e.message);
  }
}

document.querySelector("#parseBtn").addEventListener("click", async () => {
  const text = document.querySelector("#prompt").value;
  try {
    renderDraft(await api("/api/parse", { text }));
  } catch (e) {
    alert(e.message);
  }
});

document.querySelector("#payBtn").addEventListener("click", async () => {
  const status = document.querySelector("#payStatus");
  status.textContent = "Creating PayPal sandbox order…";
  try {
    const created = await api("/api/orders", { draft });
    status.textContent = `Order ${created.id} created (${created.status}). Opening PayPal approval…`;
    if (created.approveUrl) {
      localStorage.setItem("saytopay_order", created.id);
      window.location.href = created.approveUrl;
    }
  } catch (e) {
    status.textContent = `Could not create the order: ${e.message}`;
  }
});

// Returning from PayPal approval: /return?token=<orderId>
(async () => {
  const params = new URLSearchParams(location.search);
  if (location.pathname === "/return") {
    const orderId = params.get("token") || localStorage.getItem("saytopay_order");
    const box = document.querySelector("#resultBox");
    document.querySelector("#step-result").hidden = false;
    if (!orderId) {
      box.textContent = "No order id found on return.";
      return;
    }
    box.textContent = `Returned with order ${orderId}. Checking its status…`;
    try {
      // Check first: a refresh after a completed payment must show the
      // existing result, not capture the same order a second time.
      const current = await api(`/api/orders/${encodeURIComponent(orderId)}`);
      if (current.status === "COMPLETED") {
        box.textContent = JSON.stringify(
          { orderId: current.id, status: current.status, captureId: current.captureId, amount: current.amount },
          null, 2
        );
        return;
      }
      if (current.status !== "APPROVED") {
        box.textContent = `Order ${orderId} is ${current.status} — it has not been approved yet, so nothing was captured.`;
        return;
      }
      box.textContent = `Approved order ${orderId}. Capturing…`;
      const captured = await api("/api/orders/capture", { orderId });
      box.textContent = JSON.stringify(
        { orderId: captured.id, status: captured.status, captureId: captured.captureId, amount: captured.amount },
        null, 2
      );
    } catch (e) {
      box.textContent = `Capture failed: ${e.message}`;
    }
  }
  if (location.pathname === "/cancel") {
    document.querySelector("#step-result").hidden = false;
    document.querySelector("#resultBox").textContent = "Payment cancelled by the buyer.";
  }
  try {
    const h = await api("/api/health");
    document.querySelector("#health").textContent =
      `PayPal environment: ${h.paypalEnv} · sandbox credentials: ${h.credentialsConfigured ? "configured" : "not configured (see .env.example)"}`;
  } catch {}
})();
