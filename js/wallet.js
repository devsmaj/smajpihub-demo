(function () {
  const STORAGE_KEY = "smaj_wallet_state";
  const USER_KEY = "smaj_user";
  const TOKEN_KEY = "smaj_token";
  const PI_USER_KEY = "pi_user";
  const PI_ADDRESS_KEY = "pi_wallet_address";

  const CONNECT_TEXT = "Connect Wallet";
  const DISCONNECT_TEXT = "Disconnect Wallet";
  const CONNECTING_TEXT = "Connecting...";

  let isConnecting = false;
  let isDisconnecting = false;

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

  function getAppPrefix() {
    const path = window.location.pathname.replace(/\\/g, "/");
    const host = window.location.hostname.toLowerCase();

    if (host.endsWith("github.io")) {
      const parts = path.split("/").filter(Boolean);
      if (parts.length > 0) return `/${parts[0]}/`;
    }

    return "/";
  }

  function appPath(target) {
    if (!target || /^https?:\/\//i.test(target)) {
      return target;
    }

    const normalized = target.replace(/^\/+/, "");
    return `${getAppPrefix()}${normalized}`;
  }

  function isDashboardPage() {
    const path = window.location.pathname.replace(/\\/g, "/").toLowerCase();
    return path.includes("/pages/dashboard/client.html");
  }

  function redirectToDashboard() {
    if (isDashboardPage()) return;
    window.location.replace(appPath("pages/dashboard/client.html"));
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

  function extractWalletAddress(payload) {
    if (!payload) return "";

    const direct = payload.walletAddress || payload.wallet_address || payload.address;
    if (direct) return String(direct).trim();

    const wallets = payload.wallets;
    if (Array.isArray(wallets) && wallets.length > 0) {
      const primary = wallets.find(function (w) {
        return w && w.primary;
      }) || wallets[0];
      if (primary && (primary.address || primary.walletAddress || primary.wallet_address)) {
        return String(primary.address || primary.walletAddress || primary.wallet_address).trim();
      }
    }

    const user = payload.user;
    if (user) return extractWalletAddress(user);

    return "";
  }

  function inferStateFromStorage() {
    const saved = getState();
    const storedPiUser = getStoredPiUser();
    const storedUser = getStoredUser();
    const piAddress = String(localStorage.getItem(PI_ADDRESS_KEY) || "").trim();

    const inferredAddress = saved.address || extractWalletAddress(storedPiUser) || extractWalletAddress(storedUser) || piAddress;
    const inferredConnected = !!(saved.connected || inferredAddress);

    return {
      connected: inferredConnected,
      address: inferredConnected ? inferredAddress : "",
      updatedAt: Date.now()
    };
  }

  function updateAddressBadge(btn, state) {
    if (!btn || !btn.parentElement) return;

    const previous = btn.parentElement.querySelector(`[data-wallet-address-for="${btn.dataset.walletId || ""}"]`);
    if (previous) previous.remove();

    if (!state.connected || !state.address) return;

    if (!btn.dataset.walletId) {
      btn.dataset.walletId = `wallet-${Math.random().toString(36).slice(2, 10)}`;
    }

    const badge = document.createElement("span");
    badge.className = "wallet-inline-address";
    badge.dataset.walletAddressFor = btn.dataset.walletId;
    badge.textContent = shortenAddress(state.address);
    badge.title = state.address;

    if (btn.classList.contains("wallet-btn")) {
      badge.style.marginLeft = "8px";
      badge.style.fontSize = "0.82rem";
      badge.style.opacity = "0.9";
      badge.style.whiteSpace = "nowrap";
    }

    btn.insertAdjacentElement("afterend", badge);
  }

  function animateButton(btn) {
    if (!btn || typeof btn.animate !== "function") return;
    btn.animate(
      [
        { transform: "scale(1)", opacity: 1 },
        { transform: "scale(0.96)", opacity: 0.9 },
        { transform: "scale(1)", opacity: 1 }
      ],
      { duration: 200, easing: "ease-out" }
    );
  }

  function updateButton(btn, state, opts) {
    if (!btn) return;
    const isConnected = !!state.connected;
    const options = opts || {};

    btn.type = "button";
    btn.dataset.walletConnected = isConnected ? "true" : "false";

    const label = options.busyLabel || (isConnected ? DISCONNECT_TEXT : CONNECT_TEXT);
    if (btn.classList.contains("wallet-btn")) {
      const icon = "<i class='bx bx-wallet'></i> ";
      btn.innerHTML = `${icon}${label}`;
    } else {
      btn.textContent = label;
    }

    btn.classList.toggle("connected", isConnected);
    btn.setAttribute("aria-pressed", isConnected ? "true" : "false");

    if (!options.skipAddressBadge) {
      updateAddressBadge(btn, state);
    }

    animateButton(btn);
  }

  function updateAllButtons(opts) {
    const state = getState();
    const options = opts || {};

    document.querySelectorAll(".wallet-btn, #connectWalletAction").forEach(function (btn) {
      updateButton(btn, state, options);
    });

    document.querySelectorAll('[data-wallet-connect="true"]').forEach(function (el) {
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

  async function authenticateWithPi() {
    if (!window.Pi || typeof window.Pi.authenticate !== "function") {
      throw new Error("Pi Wallet API is unavailable. Please open this in Pi Browser.");
    }

    if (typeof window.Pi.init === "function" && !window.__smajPiInit) {
      window.Pi.init({ version: "2.0", sandbox: true });
      window.__smajPiInit = true;
    }

    const auth = await window.Pi.authenticate(["username", "payments"], function () {});
    const address = extractWalletAddress(auth);

    if (!address) {
      throw new Error("No wallet address received from Pi Wallet.");
    }

    return address;
  }

  async function connectWallet() {
    if (isConnecting) return getState();

    const current = getState();
    if (current.connected) {
      updateAllButtons();
      redirectToDashboard();
      return current;
    }

    isConnecting = true;
    updateAllButtons({ busyLabel: CONNECTING_TEXT, skipAddressBadge: true });

    try {
      const address = await authenticateWithPi();

      const next = { connected: true, address, updatedAt: Date.now() };
      persistState(next);
      syncLegacyKeys(next);
      updateAllButtons();
      alert("Wallet connected successfully.");
      redirectToDashboard();
      return next;
    } catch (error) {
      console.error("Wallet connect failed:", error);
      const message = error && error.message ? error.message : "Please try again.";
      alert(`Wallet connection failed. ${message}`);
      updateAllButtons();
      return current;
    } finally {
      isConnecting = false;
    }
  }

  async function disconnectWallet() {
    if (isDisconnecting) return getState();

    const current = getState();
    if (!current.connected) {
      updateAllButtons();
      return current;
    }

    isDisconnecting = true;

    try {
      if (window.Pi && typeof window.Pi.disconnect === "function") {
        await window.Pi.disconnect();
      } else if (window.Pi && typeof window.Pi.logout === "function") {
        await window.Pi.logout();
      }
    } catch (error) {
      console.warn("Wallet provider disconnect warning:", error);
    }

    const next = { connected: false, address: "", updatedAt: Date.now() };
    persistState(next);
    syncLegacyKeys(next);
    updateAllButtons();
    alert("Wallet disconnected successfully.");

    isDisconnecting = false;
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
    document.querySelectorAll(".wallet-btn, #connectWalletAction").forEach(function (btn) {
      if (btn.dataset.walletBound === "true") return;
      btn.dataset.walletBound = "true";
      btn.addEventListener("click", function (event) {
        event.preventDefault();
        toggleWallet();
      });
    });
  }

  function bindWalletConnectLinks() {
    document.querySelectorAll('[data-wallet-connect="true"]').forEach(function (el) {
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

  function initializeWalletState() {
    const inferred = inferStateFromStorage();
    persistState(inferred);
    syncLegacyKeys(inferred);
    updateAllButtons();

    if (inferred.connected) {
      redirectToDashboard();
    }
  }

  function init() {
    ensureDesktopWalletButton();
    bindWalletButtons();
    bindWalletConnectLinks();
    initializeWalletState();
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
    if (event.key === STORAGE_KEY || event.key === PI_USER_KEY || event.key === PI_ADDRESS_KEY || event.key === USER_KEY) {
      initializeWalletState();
    }
  });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();

