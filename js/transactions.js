(function () {
  const STORAGE_KEY = "smaj_pi_transactions_history";
  const MAX_RECORDS = 50;
  const sendForm = document.getElementById("sendPiForm");
  const receiveForm = document.getElementById("receivePiForm");
  const historyList = document.getElementById("transactionList");
  const historyEmpty = document.getElementById("transactionHistoryEmpty");
  const historyCount = document.getElementById("transactionHistoryCount");
  const clearHistoryBtn = document.getElementById("clearTransactionHistory");

  if (!sendForm || !receiveForm || !historyList || !historyCount || !historyEmpty || !clearHistoryBtn) {
    return;
  }

  function getWalletState() {
    if (window.SmajWallet && typeof window.SmajWallet.getState === "function") {
      return window.SmajWallet.getState();
    }
    return { connected: !!localStorage.getItem("pi_user") };
  }

  function isWalletConnected() {
    const state = getWalletState();
    return Boolean(state && state.connected);
  }

  function notify(message, type = "info") {
    if (window.appNotify) {
      window.appNotify(message, type);
      return;
    }
    // Fallback if the global helper is unavailable
    const prefix = type === "error" ? "Error:" : type === "warning" ? "Warning:" : "";
    alert(`${prefix} ${message}`);
  }

  function loadHistory() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
      return [];
    } catch (_) {
      return [];
    }
  }

  function persistHistory(entries) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  }

  function formatAmount(value) {
    const amount = Number(value);
    if (!Number.isFinite(amount)) return "0.00";
    return amount.toFixed(2);
  }

  function formatDate(value) {
    try {
      const date = new Date(value);
      if (Number.isNaN(date.getTime())) return value || "–";
      return date.toLocaleString(undefined, { hour12: true });
    } catch (_) {
      return value || "–";
    }
  }

  function renderHistory() {
    const records = loadHistory();
    historyCount.textContent = records.length ? `${records.length} record${records.length === 1 ? "" : "s"}` : "No records yet";
    historyEmpty.style.display = records.length ? "none" : "block";
    if (!records.length) {
      historyList.innerHTML = "";
      return;
    }

    const items = records.map((record) => {
      const typeLabel = record.type === "receive" ? "Received Pi" : "Sent Pi";
      const counterpartyLabel = record.counterparty || "Unknown counterparty";
      const noteMarkup = record.note ? `<span class="transaction-meta">${record.note}</span>` : "";
      return `
        <li class="transaction-item">
          <div class="transaction-detail">
            <span class="transaction-type">${typeLabel}</span>
            <span class="transaction-meta">${counterpartyLabel}</span>
            ${noteMarkup}
          </div>
          <div class="transaction-detail">
            <span class="transaction-type">${formatAmount(record.amount)} Pi</span>
            <span class="transaction-meta">${formatDate(record.timestamp)}</span>
          </div>
        </li>
      `;
    });

    historyList.innerHTML = items.join("");
  }

  function logTransaction({ type, amount, counterparty, note }) {
    const record = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
      type,
      amount: Math.abs(Number(amount)) || 0,
      counterparty: counterparty || (type === "receive" ? "Incoming Pi" : "Outgoing Pi"),
      note: note || "",
      timestamp: new Date().toISOString()
    };

    const next = [record].concat(loadHistory()).slice(0, MAX_RECORDS);
    persistHistory(next);
    renderHistory();
    return record;
  }

  function handleForm(event, type) {
    event.preventDefault();
    if (!isWalletConnected()) {
      notify("Connect your Pi wallet before logging transactions.", "warning");
      return;
    }

    const form = event.currentTarget;
    const amount = form.elements.amount?.value;
    const counterparty = form.elements.recipient ? form.elements.recipient.value.trim() : (form.elements.sender ? form.elements.sender.value.trim() : "");
    const note = form.elements.note ? form.elements.note.value.trim() : "";

    if (!amount || Number(amount) <= 0) {
      notify("Enter a valid Pi amount.", "error");
      return;
    }

    if (!counterparty) {
      notify("Add a counterparty (Pi ID or wallet address).", "error");
      return;
    }

    logTransaction({ type, amount, counterparty, note });
    notify(`Transaction logged: ${type === "send" ? "Sent" : "Received"} ${formatAmount(amount)} Pi.`, "info");
    form.reset();
    form.elements.amount.focus();
  }

  sendForm.addEventListener("submit", (event) => handleForm(event, "send"));
  receiveForm.addEventListener("submit", (event) => handleForm(event, "receive"));

  clearHistoryBtn.addEventListener("click", () => {
    localStorage.removeItem(STORAGE_KEY);
    renderHistory();
    notify("Transaction history cleared.", "info");
  });

  renderHistory();
})();
