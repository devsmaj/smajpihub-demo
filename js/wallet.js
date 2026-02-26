(function () {
  const STORAGE_KEY = "smaj_wallet_state";
  const USER_KEY = "smaj_user";
  const TOKEN_KEY = "smaj_token";
  const PI_USER_KEY = "pi_user";
  const PI_ADDRESS_KEY = "pi_wallet_address";
  const CONNECT_TEXT = "Connect Wallet";
  const DISCONNECT_TEXT = "Disconnect Wallet";

  let isConnecting = false;

  function safeParse(raw) {
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch (_) {
      return null;
    }
  }

  function randomAddress() {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let out = "PI";
    for (let i = 0; i < 24; i += 1) {
      out += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return out;
  }

  function shortenAddress(address) {
    const value = String(address || "").trim();
    if (value.length <= 10) return value;
    return `${value.slice(0, 6)}...${value.slice(-4)}`;
  }

  function getState() {
    return safeParse(localStorage.getItem(STORAGE_KEY)) || { connected: false, address: "" };
  }

  function persistState(state) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function getStoredPiUser() {
    return safeParse(localStorage.getItem(PI_USER_KEY));
  }

  function getStoredUser() {
    return safeParse(localStorage.getItem(USER_KEY));
  }

  function getWalletUser() {
    return getStoredUser() || getStoredPiUser();
  }

  function syncLegacyKeys(state) {
    if (!state.connected) {
      localStorage.removeItem(PI_USER_KEY);
      localStorage.removeItem(PI_ADDRESS_KEY);
      localStorage.removeItem(USER_KEY);
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      return;
    }

    const walletAddress = state.address || randomAddress();
    const user = {
      username: "pioneer",
      walletAddress
    };

    localStorage.setItem(PI_USER_KEY, JSON.stringify(user));
    localStorage.setItem(PI_ADDRESS_KEY, walletAddress);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem(TOKEN_KEY, "wallet-session");
    localStorage.setItem("token", "wallet-session");
  }

  function updateButton(btn, state) {
    if (!btn) return;
    const isConnected = !!state.connected;
    const shortAddress = shortenAddress(state.address);

    btn.type = "button";
    btn.dataset.walletConnected = isConnected ? "true" : "false";

    if (btn.classList.contains("wallet-btn")) {
      const icon = "<i class='bx bx-wallet'></i> ";
      const addressSuffix = isConnected && shortAddress ? ` <span class="wallet-address">${shortAddress}</span>` : "";
      btn.innerHTML = `${icon}${isConnected ? DISCONNECT_TEXT : CONNECT_TEXT}${addressSuffix}`;
    } else {
      btn.textContent = isConnected ? DISCONNECT_TEXT : CONNECT_TEXT;
    }

    btn.classList.toggle("connected", isConnected);
    btn.setAttribute("aria-pressed", isConnected ? "true" : "false");
  }

  function updateAllButtons() {
    const state = getState();
    document.querySelectorAll(".wallet-btn, #connectWalletAction").forEach((btn) => {
      updateButton(btn, state);
    });

    document.querySelectorAll('[data-wallet-connect="true"]').forEach((el) => {
      if (el.tagName.toLowerCase() === "a") {
        el.dataset.walletConnected = state.connected ? "true" : "false";
      }
    });

    const event = new CustomEvent("smaj:wallet-changed", { detail: state });
    window.dispatchEvent(event);
  }

  function ensureDesktopWalletButton() {
    const nav = document.getElementById("navMenu");
    if (!nav || nav.querySelector(".desktop-wallet-btn")) return;

    const btn = document.createElement("button");
    btn.className = "wallet-btn desktop-wallet-btn";
    btn.type = "button";
    nav.appendChild(btn);
  }

  async function connectWallet() {
    if (isConnecting) return getState();

    const current = getState();
    if (current.connected) {
      updateAllButtons();
      return current;
    }

    isConnecting = true;
    try {
      let address = "";
      if (window.Pi && typeof window.Pi.authenticate === "function") {
        try {
          if (typeof window.Pi.init === "function" && !window.__smajPiInit) {
            window.Pi.init({ version: "2.0", sandbox: true });
            window.__smajPiInit = true;
          }

          const scopes = ["username", "payments"];
          const auth = await window.Pi.authenticate(scopes, function () {});
          const fromPi = auth && auth.user && auth.user.wallets && auth.user.wallets[0] && auth.user.wallets[0].address;
          const fromAlt = auth && auth.user && (auth.user.walletAddress || auth.user.wallet_address || auth.user.address);
          address = String(fromPi || fromAlt || "").trim();
        } catch (_) {
          address = "";
        }
      }

      if (!address) {
        address = randomAddress();
      }

      const next = { connected: true, address, updatedAt: Date.now() };
      persistState(next);
      syncLegacyKeys(next);
      updateAllButtons();
      alert("Wallet connected successfully.");
      return next;
    } catch (error) {
      console.error("Wallet connect failed:", error);
      return current;
    } finally {
      isConnecting = false;
    }
  }

  function disconnectWallet() {
    const current = getState();
    if (!current.connected) {
      updateAllButtons();
      return current;
    }

    const next = { connected: false, address: "", updatedAt: Date.now() };
    persistState(next);
    syncLegacyKeys(next);
    updateAllButtons();
    alert("Wallet disconnected successfully.");
    return next;
  }

  async function toggleWallet() {
    const state = getState();
    if (state.connected) {
      return disconnectWallet();
    }
    return connectWallet();
  }

  function bindWalletButtons() {
    document.querySelectorAll(".wallet-btn, #connectWalletAction").forEach((btn) => {
      if (btn.dataset.walletBound === "true") return;
      btn.dataset.walletBound = "true";
      btn.addEventListener("click", function (event) {
        event.preventDefault();
        toggleWallet();
      });
    });
  }

  function bindWalletConnectLinks() {
    document.querySelectorAll('[data-wallet-connect="true"]').forEach((el) => {
      if (el.dataset.walletConnectBound === "true") return;
      el.dataset.walletConnectBound = "true";

      el.addEventListener("click", function (event) {
        const state = getState();
        if (state.connected) return;
        event.preventDefault();
        connectWallet();
      });
    });
  }

  function init() {
    ensureDesktopWalletButton();
    bindWalletButtons();
    bindWalletConnectLinks();
    updateAllButtons();
  }

  window.SmajWallet = {
    init,
    getState,
    getWalletUser,
    getStoredPiUser,
    connectWallet,
    disconnectWallet,
    toggleWallet,
    updateAllButtons,
    shortenAddress
  };

  window.getStoredPiUser = getStoredPiUser;
  window.getWalletUser = getWalletUser;
  window.connectWallet = connectWallet;
  window.disconnectWallet = disconnectWallet;

  window.addEventListener("storage", function (event) {
    if (event.key === STORAGE_KEY) {
      updateAllButtons();
    }
  });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();

