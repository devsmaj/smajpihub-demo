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
  let environmentAlertShown = false;
  let isPiWalletReady = false;
  let hasDetectionRun = false;
  let detectionPromise = null;
  let piInitialized = false;

  const DETECTION_RETRIES = 3;
  const DETECTION_DELAY_MS = 350;

  function safeParse(raw) {
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch (_) {
      return null;
    }
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

  function clearStoredSession() {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(PI_USER_KEY);
    localStorage.removeItem(PI_ADDRESS_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  }

  function storeConnectedSession(address) {
    const walletAddress = String(address || "").trim();
    const state = { connected: true, address: walletAddress, updatedAt: Date.now() };
    const user = { username: "pioneer", walletAddress };

    persistState(state);
    localStorage.setItem(PI_USER_KEY, JSON.stringify(user));
    localStorage.setItem(PI_ADDRESS_KEY, walletAddress);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem(TOKEN_KEY, "wallet-session");
    localStorage.setItem("token", "wallet-session");
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
    if (!target || /^https?:\/\//i.test(target)) return target;
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
    badge.style.marginLeft = "8px";
    badge.style.fontSize = "0.82rem";
    badge.style.opacity = "0.9";
    badge.style.whiteSpace = "nowrap";
    btn.insertAdjacentElement("afterend", badge);
  }

  function animateButton(btn) {
    if (!btn || typeof btn.animate !== "function") return;
    btn.animate(
      [
        { transform: "scale(1)", opacity: 1 },
        { transform: "scale(0.97)", opacity: 0.9 },
        { transform: "scale(1)", opacity: 1 }
      ],
      { duration: 180, easing: "ease-out" }
    );
  }

  function updateButton(btn, state, opts) {
    if (!btn) return;
    const isConnected = !!state.connected;
    const options = opts || {};
    const label = options.busyLabel || (isConnected ? DISCONNECT_TEXT : CONNECT_TEXT);

    btn.type = "button";
    btn.dataset.walletConnected = isConnected ? "true" : "false";
    btn.title = isPiWalletReady ? "" : "Open this site in Pi Browser to connect wallet";

    if (btn.classList.contains("wallet-btn")) {
      btn.innerHTML = `<i class='bx bx-wallet'></i> ${label}`;
    } else {
      btn.textContent = label;
    }

    btn.classList.toggle("connected", isConnected);
    btn.setAttribute("aria-pressed", isConnected ? "true" : "false");

    if (!options.skipAddressBadge) updateAddressBadge(btn, state);
    animateButton(btn);
  }

  function updateAllButtons(opts) {
    const state = getState();
    document.querySelectorAll(".wallet-btn, #connectWalletAction").forEach(function (btn) {
      updateButton(btn, state, opts);
    });

    document.querySelectorAll('[data-wallet-connect="true"]').forEach(function (el) {
      el.dataset.walletConnected = state.connected ? "true" : "false";
    });

    window.dispatchEvent(new CustomEvent("smaj:wallet-changed", { detail: state }));
  }

  function ensureDesktopWalletButton() {
    const nav = document.getElementById("navMenu");
    if (!nav || nav.querySelector(".desktop-wallet-btn")) return;

    const btn = document.createElement("button");
    btn.className = "wallet-btn desktop-wallet-btn";
    btn.type = "button";
    nav.appendChild(btn);
  }

  function detectPiWalletEnvironment(showAlert) {
    if (typeof window.Pi === "undefined") {
      isPiWalletReady = false;
      if (showAlert && !environmentAlertShown) {
        environmentAlertShown = true;
        alert("Pi Wallet not detected. Please open this site in Pi Browser.");
      }
      return false;
    }

    const hasRequest = typeof window.Pi.request === "function";
    const hasAuthenticate = typeof window.Pi.authenticate === "function";
    isPiWalletReady = hasRequest || hasAuthenticate;

    if (!isPiWalletReady && showAlert && !environmentAlertShown) {
      environmentAlertShown = true;
      alert("Pi Wallet not detected. Please open this site in Pi Browser.");
    }

    return isPiWalletReady;
  }

  function wait(ms) {
    return new Promise(function (resolve) {
      setTimeout(resolve, ms);
    });
  }

  async function ensurePiWalletDetected(showAlert) {
    if (isPiWalletReady) return true;

    for (let attempt = 0; attempt < DETECTION_RETRIES; attempt += 1) {
      if (detectPiWalletEnvironment(false)) return true;
      await wait(DETECTION_DELAY_MS);
    }

    return detectPiWalletEnvironment(!!showAlert);
  }

  function runWalletDetection(showAlert) {
    if (detectionPromise) return detectionPromise;
    detectionPromise = ensurePiWalletDetected(showAlert)
      .finally(function () {
        detectionPromise = null;
      });
    return detectionPromise;
  }

  function resolveAddress(accountPayload) {
    if (!accountPayload) return "";
    const direct = accountPayload.address || accountPayload.walletAddress || accountPayload.wallet_address;
    if (direct) return String(direct || "").trim();

    if (accountPayload.result) {
      const fromResult = resolveAddress(accountPayload.result);
      if (fromResult) return fromResult;
    }

    if (accountPayload.data) {
      const fromData = resolveAddress(accountPayload.data);
      if (fromData) return fromData;
    }

    if (accountPayload.user) {
      const fromUser = resolveAddress(accountPayload.user);
      if (fromUser) return fromUser;
    }

    if (Array.isArray(accountPayload.wallets) && accountPayload.wallets.length > 0) {
      const primary = accountPayload.wallets.find(function (w) { return w && w.primary; }) || accountPayload.wallets[0];
      if (primary) {
        const fromWallet = resolveAddress(primary);
        if (fromWallet) return fromWallet;
      }
    }

    return "";
  }

  function resolvePiIdentityFallback(accountPayload) {
    if (!accountPayload || typeof accountPayload !== "object") return "";

    const user = accountPayload.user || (accountPayload.result && accountPayload.result.user) || null;
    const uid = user && user.uid ? String(user.uid).trim() : "";
    const username = user && user.username ? String(user.username).trim() : "";
    const existing = String(localStorage.getItem(PI_ADDRESS_KEY) || "").trim();

    if (existing) return existing;
    if (uid) return `pi-user-${uid}`;
    if (username) return `pi-user-${username}`;
    return "";
  }

  function ensurePiInit() {
    if (piInitialized || !window.Pi || typeof window.Pi.init !== "function") return;
    try {
      window.Pi.init({ version: "2.0", sandbox: true });
      piInitialized = true;
    } catch (error) {
      console.warn("Pi init warning:", error);
    }
  }

  async function requestPiAccount() {
    ensurePiInit();

    if (window.Pi && typeof window.Pi.request === "function") {
      return window.Pi.request({ method: "getAccount" });
    }

    if (window.Pi && typeof window.Pi.authenticate === "function") {
      return window.Pi.authenticate(["username", "payments"], function () {});
    }

    return null;
  }

  async function connectWallet() {
    if (isConnecting) return getState();
    const hasPiWallet = await runWalletDetection(true);
    if (!hasPiWallet) return getState();

    const current = getState();
    if (current.connected && current.address) {
      updateAllButtons();
      redirectToDashboard();
      return current;
    }

    isConnecting = true;
    updateAllButtons({ busyLabel: CONNECTING_TEXT, skipAddressBadge: true });

    try {
      const account = await requestPiAccount();
      const address = resolveAddress(account) || resolvePiIdentityFallback(account);

      if (!address) {
        alert("Wallet connection failed: no wallet address received");
        updateAllButtons();
        return current;
      }

      storeConnectedSession(address);
      updateAllButtons();
      alert("Wallet connected successfully.");
      redirectToDashboard();
      return getState();
    } catch (error) {
      console.error("Wallet connect failed:", error);
      alert("Wallet connection failed: no wallet address received");
      updateAllButtons();
      return current;
    } finally {
      isConnecting = false;
    }
  }

  function disconnectWallet() {
    clearStoredSession();
    persistState({ connected: false, address: "", updatedAt: Date.now() });
    updateAllButtons();
    alert("Wallet disconnected successfully.");
    return getState();
  }

  function toggleWallet() {
    const state = getState();
    if (state.connected) return disconnectWallet();
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

  async function initializeWalletState() {
    const hasPiEnv = await runWalletDetection(false);
    hasDetectionRun = true;
    const rawState = getState();
    const storedAddress = String(localStorage.getItem(PI_ADDRESS_KEY) || rawState.address || "").trim();
    const connected = !!storedAddress;
    const next = { connected, address: connected ? storedAddress : "", updatedAt: Date.now() };

    persistState(next);
    updateAllButtons();

    if (!hasPiEnv) return;
    if (next.connected) redirectToDashboard();
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
      if (hasDetectionRun) {
        const rawState = getState();
        const storedAddress = String(localStorage.getItem(PI_ADDRESS_KEY) || rawState.address || "").trim();
        persistState({ connected: !!storedAddress, address: storedAddress, updatedAt: Date.now() });
        updateAllButtons();
        return;
      }
      initializeWalletState();
    }
  });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();

