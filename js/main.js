// ===============================
// PI SDK – SANDBOX MODE
// ===============================
if (window.Pi) {
  Pi.init({
    version: "2.0",
    sandbox: true
  });
  console.log("Pi SDK initialized in SANDBOX mode");
} else {
  console.warn("Pi SDK not found. Open in Pi Browser.");
}

const API_BASE = "http://localhost:3000";
const TOKEN_KEY = "smaj_token";
const USER_KEY = "smaj_user";

function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

function getStoredUser() {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch (_) {
    return null;
  }
}

function storeAuth(token, user) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
}

function clearAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  localStorage.removeItem("pi_user");
  localStorage.removeItem("pi_wallet_address");
}

function ensureAppUiPrimitives() {
  if (!document.body) return;
  if (document.getElementById("appLoaderOverlay")) return;

  const loader = document.createElement("div");
  loader.id = "appLoaderOverlay";
  loader.className = "app-loader-overlay";
  loader.innerHTML = "<div class='app-loader-spinner'></div><p>Processing...</p>";
  document.body.appendChild(loader);
}

function setAppLoading(isLoading, message) {
  ensureAppUiPrimitives();
  const overlay = document.getElementById("appLoaderOverlay");
  if (!overlay) return;
  const text = overlay.querySelector("p");
  if (text && message) text.textContent = message;
  overlay.classList.toggle("show", !!isLoading);
}

function appNotify(message, type = "info") {
  ensureAppUiPrimitives();
  const toast = document.createElement("div");
  toast.className = `app-toast ${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add("show"));
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 220);
  }, 2300);
}

window.appNotify = appNotify;

// Theme mode removed globally: keep one consistent light color system.
const SITE_THEME_KEY = "site_theme";
function isDashboardPage() {
  return window.location.pathname.replace(/\\/g, "/").toLowerCase().includes("/pages/dashboard/");
}
function enforceSingleTheme() {
  if (isDashboardPage()) return;
  document.body.classList.remove("dark");
  localStorage.removeItem(SITE_THEME_KEY);
}
window.toggleSiteTheme = () => {};
enforceSingleTheme();
document.addEventListener("DOMContentLoaded", enforceSingleTheme);
// Required callback (even if unused now)
function onIncompletePayment(payment) {
  console.log("Incomplete payment found:", payment);
}

function setupScreenModeAutoRefresh() {
  const bucketKey = "screen_mode_bucket";
  const getBucket = () => (window.innerWidth <= 768 ? "mobile" : "desktop");
  const initial = getBucket();
  if (!sessionStorage.getItem(bucketKey)) {
    sessionStorage.setItem(bucketKey, initial);
  }

  let resizeTimer = null;
  window.addEventListener("resize", () => {
    if (resizeTimer) clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      const prev = sessionStorage.getItem(bucketKey) || initial;
      const current = getBucket();
      if (current !== prev) {
        sessionStorage.setItem(bucketKey, current);
        window.location.reload();
      }
    }, 250);
  });

  window.addEventListener("orientationchange", () => {
    setTimeout(() => window.location.reload(), 250);
  });
}
setupScreenModeAutoRefresh();

// Mobile Menu Toggle
const menuToggle = document.getElementById("menuToggle");
const navMenu = document.getElementById("navMenu");
let menuOverlay = document.getElementById("menuOverlay");
let menuClose = document.getElementById("menuClose");

if (menuToggle && navMenu) {
  if (!menuOverlay) {
    menuOverlay = document.createElement("div");
    menuOverlay.id = "menuOverlay";
    menuOverlay.className = "menu-overlay";
    document.body.appendChild(menuOverlay);
  }

  if (!menuClose) {
    menuClose = document.createElement("div");
    menuClose.id = "menuClose";
    menuClose.className = "menu-close";
    menuClose.innerHTML = "<i class='bx bx-x'></i>";
    navMenu.prepend(menuClose);
  }

  const isMobileMenu = () => window.matchMedia("(max-width: 768px)").matches;

  const openMenu = () => {
    if (!isMobileMenu()) return;
    navMenu.classList.add("active");
    menuOverlay.classList.add("active");
    document.body.classList.add("menu-open");
  };

  const closeMenu = () => {
    navMenu.classList.remove("active");
    menuOverlay.classList.remove("active");
    document.body.classList.remove("menu-open");
  };

  menuToggle.addEventListener("click", (e) => {
    e.stopPropagation();
    if (navMenu.classList.contains("active")) {
      closeMenu();
      return;
    }
    openMenu();
  });

  menuClose.addEventListener("click", closeMenu);
  menuOverlay.addEventListener("click", closeMenu);

  window.addEventListener("resize", () => {
    if (!isMobileMenu()) {
      closeMenu();
    }
  });

  // Close menu when clicking a link
  document.querySelectorAll('#navMenu a').forEach(link => {
    link.addEventListener('click', () => {
      closeMenu();
    });
  });
}

// ===============================
// AUTH GUARD – PROTECT PAGES
// ===============================
function requireAuth() {
  const token = getToken();
  const user = getStoredUser();

  if (!token || !user) {
    console.warn("Unauthorized access. Redirecting to connect wallet.");
    window.location.href = getAuthEntryPath();
  }
}
const storedUser = getStoredUser() || getStoredPiUser();
if (storedUser) {
  const el = document.getElementById("piUsername");
  if (el) {
    const address = storedUser.walletAddress || storedUser.wallet_address || storedUser.address || localStorage.getItem("pi_wallet_address") || "";
    const label = storedUser.username || (address ? formatWalletAddress(address) : "Wallet Connected");
    el.textContent = label;
  }
}

const logoutBtn = document.getElementById("logoutBtn");

if (logoutBtn) {
  logoutBtn.addEventListener("click", (e) => {
    e.preventDefault();
    disconnectWallet();
    window.location.href = getAuthEntryPath();
  });
}
// Service CTA routing helpers
function getAppPrefix() {
  const path = window.location.pathname.replace(/\\/g, '/');
  const host = window.location.hostname.toLowerCase();

  if (host.endsWith('github.io')) {
    const parts = path.split('/').filter(Boolean);
    if (parts.length > 0) return `/${parts[0]}/`;
  }

  return '/';
}

function appPath(target) {
  if (!target || /^https?:\/\//i.test(target)) {
    return target;
  }

  const normalized = target.replace(/^\/+/, '');
  return `${getAppPrefix()}${normalized}`;
}

function routeButton(button, target) {
  if (!button || !target) return;

  button.dataset.routeBound = "true";
  button.addEventListener('click', (e) => {
    e.preventDefault();
    window.location.href = appPath(target);
  });
}

// Service main CTA
Array.from(document.querySelectorAll('.cta-btn')).forEach((btn) => {
  if (btn.type && btn.type.toLowerCase() === 'submit') return;
  routeButton(btn, 'pages/dashboard/client.html');
});

function setupGlobalButtonRouting() {
  const path = window.location.pathname.replace(/\\/g, '/');
  if (path.includes('/pages/dashboard/')) return;

  const skipClasses = [
    'wallet-btn', 'menu-toggle', 'sidebar-open', 'sidebar-close', 'filter-btn',
    'category', 'faq-question', 'hub-open-btn', 'mark-read', 'nav-link',
    'icon-btn', 'cart-toggle', 'close'
  ];

  const skipIds = new Set([
    'piLoginBtn', 'piRegisterBtn', 'menuToggle', 'menuClose', 'sidebarOpen',
    'sidebarClose', 'openCartBtnTop', 'openCartBtn', 'closeCart', 'checkoutBtn',
    'closeModal', 'modalAddCart', 'modalBuyNow', 'connectWalletAction',
    'buyNow', 'addToCart', 'send-btn', 'receive-btn', 'deposit-btn', 'withdraw-btn'
  ]);

  const normalizeText = (text) => text.replace(/\s+/g, ' ').trim().toLowerCase();

  const resolveTarget = (label) => {
    if (label.includes('view project')) return 'pages/service-detail.html';
    if (label.includes('hire service')) return 'pages/contact.html';
    if (label.includes('subscribe')) return 'pages/dashboard/client.html';
    if (label.includes('start a project')) return 'pages/contact.html';
    if (label.includes('view pricing')) return 'pages/pricing.html';
    if (label.includes('contact support')) return 'pages/contact.html';
    return '';
  };

  Array.from(document.querySelectorAll('button')).forEach((btn) => {
    const type = (btn.getAttribute('type') || '').toLowerCase();
    const id = btn.id || '';

    if (type === 'submit' || type === 'reset') return;
    if (btn.disabled) return;
    if (skipIds.has(id)) return;
    if (btn.hasAttribute('onclick')) return;
    if (btn.closest('.dashboard-main')) return;
    if (skipClasses.some((cls) => btn.classList.contains(cls))) return;

    const label = normalizeText(btn.textContent || '');
    const target = resolveTarget(label);
    if (!target) return;

    routeButton(btn, target);
  });
}

setupGlobalButtonRouting();
function setupUniversalButtonFallback() {
  const path = window.location.pathname.replace(/\\/g, '/');
  if (path.includes('/pages/dashboard/')) return;

  const skipClasses = [
    'wallet-btn', 'menu-toggle', 'sidebar-open', 'sidebar-close', 'filter-btn',
    'category', 'faq-question', 'hub-open-btn', 'mark-read', 'nav-link',
    'icon-btn', 'cart-toggle', 'close'
  ];

  const skipIds = new Set([
    'piLoginBtn', 'piRegisterBtn', 'menuToggle', 'menuClose', 'sidebarOpen',
    'sidebarClose', 'openCartBtnTop', 'openCartBtn', 'closeCart', 'checkoutBtn',
    'closeModal', 'modalAddCart', 'modalBuyNow', 'connectWalletAction',
    'buyNow', 'addToCart', 'send-btn', 'receive-btn', 'deposit-btn', 'withdraw-btn'
  ]);

  const normalizeText = (text) => text.replace(/\s+/g, ' ').trim().toLowerCase();

  const resolveTarget = (label) => {
    if (label.includes('view project')) return 'pages/service-detail.html';
    if (label.includes('hire service')) return 'pages/contact.html';
    if (label.includes('subscribe')) return 'pages/dashboard/client.html';
    if (label.includes('join now')) return 'pages/dashboard/client.html';
    if (label.includes('continue with pi')) return 'pages/dashboard/client.html';
    if (label.includes('open dashboard')) return 'pages/dashboard/client.html';
    if (label.includes('unified dashboard')) return 'pages/dashboard/client.html';
    if (label.includes('start now')) return 'pages/service.html';
    if (label.includes('view pricing')) return 'pages/pricing.html';
    if (label.includes('contact support')) return 'pages/contact.html';
    if (label.includes('join community')) return 'pages/contact.html';
    if (label.includes('read updates')) return 'pages/blog.html';
    if (label.includes('become a partner')) return 'pages/collaborate.html';
    if (label.includes('request integration')) return 'pages/contact.html';
    if (label.includes('visit developers')) return 'pages/developers.html';
    if (label.includes('post your idea')) return 'pages/contact.html';
    if (label.includes('read featured story')) return 'pages/blog-post.html';
    return '';
  };

  Array.from(document.querySelectorAll('button')).forEach((btn) => {
    const type = (btn.getAttribute('type') || '').toLowerCase();
    const id = btn.id || '';

    if (type === 'submit' || type === 'reset') return;
    if (btn.disabled) return;
    if (btn.dataset.routeBound === 'true') return;
    if (skipIds.has(id)) return;
    if (btn.hasAttribute('onclick')) return;
    if (skipClasses.some((cls) => btn.classList.contains(cls))) return;

    btn.dataset.routeBound = 'true';
    btn.addEventListener('click', (e) => {
      if (e.defaultPrevented) return;

      const label = normalizeText(btn.textContent || '');
      const target = resolveTarget(label);

      e.preventDefault();
      if (target) {
        window.location.href = appPath(target);
        return;
      }

      const connectedUser = getWalletUser();
      if (connectedUser) {
        window.location.href = appPath("pages/dashboard/client.html");
        return;
      }

      appNotify("Please connect your wallet to continue.", "info");
      handleWalletButtonClick(document.querySelector(".wallet-btn"));
    });
  });
}
setupUniversalButtonFallback();
function setupPlaceholderLinks() {
  const socialMap = {
    twitter: 'https://x.com',
    telegram: 'https://t.me',
    facebook: 'https://facebook.com',
    instagram: 'https://instagram.com',
    youtube: 'https://youtube.com',
    tiktok: 'https://tiktok.com'
  };

  Array.from(document.querySelectorAll('a[href="#"]')).forEach((link) => {
    const label = ((link.getAttribute('aria-label') || '') + ' ' + (link.textContent || '')).toLowerCase();
    const key = Object.keys(socialMap).find((name) => label.includes(name));

    if (key) {
      link.setAttribute('href', socialMap[key]);
      link.setAttribute('target', '_blank');
      link.setAttribute('rel', 'noopener noreferrer');
      return;
    }

    link.addEventListener('click', (e) => {
      e.preventDefault();
      window.location.href = appPath('pages/contact.html');
    });
  });
}
setupPlaceholderLinks();
function getAuthEntryPath() {
  return appPath('index.html');
}

function removeEmailAuthEntrypoints() {
  const authSelectors = [
    'a[href*="auth/login"]',
    'a[href*="auth/register"]',
    'a[href*="auth/forget-password"]',
    'a[href*="auth/reset-password"]'
  ];

  authSelectors.forEach((selector) => {
    document.querySelectorAll(selector).forEach((el) => {
      el.setAttribute('href', '#');
      el.dataset.walletConnect = 'true';
      if (el.textContent && el.textContent.trim()) {
        el.textContent = 'Connect Wallet';
      }
    });
  });

  const path = window.location.pathname.replace(/\\/g, '/').toLowerCase();
  if (path.includes('/pages/auth/')) {
    window.location.replace(getAuthEntryPath());
  }
}

function setupDashboardGateLinks() {
  document.querySelectorAll('a[href*="dashboard/client.html"]').forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const connectedUser = getWalletUser();
      if (connectedUser) {
        window.location.href = appPath('pages/dashboard/client.html');
        return;
      }
      appNotify("Please connect your wallet to continue.", "info");
      handleWalletButtonClick(document.querySelector(".wallet-btn"));
    });
  });
}
removeEmailAuthEntrypoints();
setupDashboardGateLinks();

function ensureDesktopWalletButton() {
  const nav = document.getElementById("navMenu");
  if (!nav) return;
  if (nav.querySelector(".desktop-wallet-btn")) return;

  const desktopWalletBtn = document.createElement("button");
  desktopWalletBtn.type = "button";
  desktopWalletBtn.className = "wallet-btn desktop-wallet-btn";
  desktopWalletBtn.innerHTML = "<i class='bx bx-wallet'></i> Connect Wallet";

  nav.appendChild(desktopWalletBtn);
  updateWalletButtonsUI();
}

// Pi Wallet Button - Real Implementation
function getStoredPiUser() {
  const raw = localStorage.getItem("pi_user");
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch (_) {
    return null;
  }
}

function getWalletUser() {
  return getStoredUser() || getStoredPiUser();
}

function deriveWalletAddress(user) {
  if (!user) return "";
  const direct = user.wallet_address || user.walletAddress || user.address;
  if (direct) return String(direct);

  const uid = String(user.uid || user.username || "").replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
  if (!uid) return "";
  return `PI${uid.padEnd(24, "X").slice(0, 24)}`;
}

function persistWalletAddress(user) {
  const address = deriveWalletAddress(user);
  if (address) {
    localStorage.setItem("pi_wallet_address", address);
  }
}

function formatWalletAddress(address) {
  const text = String(address || "");
  if (text.length <= 10) return text;
  return `${text.slice(0, 6)}...${text.slice(-4)}`;
}

function ensureWalletShell(btn) {
  if (!btn || !btn.parentElement) return null;
  if (btn.parentElement.classList.contains("wallet-area")) return btn.parentElement;

  const wrapper = document.createElement("div");
  wrapper.className = "wallet-area";
  btn.parentElement.insertBefore(wrapper, btn);
  wrapper.appendChild(btn);
  return wrapper;
}

function ensureWalletDropdown(wrapper) {
  if (!wrapper) return null;
  let menu = wrapper.querySelector(".wallet-dropdown");
  if (menu) return menu;

  menu = document.createElement("div");
  menu.className = "wallet-dropdown";
  menu.innerHTML = `
    <a href="${appPath('pages/dashboard/client.html')}">Dashboard</a>
    <button type="button" data-wallet-action="disconnect">Disconnect</button>
  `;
  wrapper.appendChild(menu);
  return menu;
}

function closeAllWalletDropdowns() {
  document.querySelectorAll(".wallet-dropdown.open").forEach((menu) => {
    menu.classList.remove("open");
  });
}

function updateWalletButtonsUI() {
  const user = getWalletUser();
  const address = user ? (user.walletAddress || user.wallet_address || user.address || localStorage.getItem("pi_wallet_address")) : "";
  const label = address ? formatWalletAddress(address) : "";

  document.querySelectorAll(".wallet-btn").forEach((btn) => {
    btn.type = "button";
    const wrapper = ensureWalletShell(btn);
    const dropdown = ensureWalletDropdown(wrapper);

    if (user && label) {
      btn.innerHTML = `<i class='bx bx-wallet'></i> ${label} <i class='bx bx-chevron-down'></i>`;
      btn.classList.add("connected");
      dropdown.classList.add("ready");
    } else {
      btn.innerHTML = "<i class='bx bx-wallet'></i> Connect Wallet";
      btn.classList.remove("connected");
      dropdown.classList.remove("ready");
      dropdown.classList.remove("open");
    }
  });
}

let walletActionInFlight = false;

function setWalletButtonsBusy(isBusy) {
  document.querySelectorAll(".wallet-btn").forEach((btn) => {
    if (isBusy) {
      if (!btn.dataset.walletLabel) btn.dataset.walletLabel = btn.innerHTML;
      btn.disabled = true;
      btn.innerHTML = "<i class='bx bx-loader-alt bx-spin'></i> Connecting...";
      return;
    }

    btn.disabled = false;
    if (btn.dataset.walletLabel) {
      btn.innerHTML = btn.dataset.walletLabel;
      delete btn.dataset.walletLabel;
    }
  });
}

function disconnectWallet() {
  clearAuth();
  closeAllWalletDropdowns();
  updateWalletButtonsUI();
  appNotify("Disconnected from wallet.", "info");
}

async function connectWallet() {
  if (!window.Pi) {
    appNotify("Pi Wallet is only available in Pi Browser. Open this site inside Pi Browser to connect.", "warn");
    return null;
  }

  try {
    walletActionInFlight = true;
    setWalletButtonsBusy(true);
    setAppLoading(true, "Opening Pi Wallet...");

    const scopes = ["username", "payments"];
    const authResult = await Pi.authenticate(scopes, onIncompletePayment);
    localStorage.setItem("pi_user", JSON.stringify(authResult.user));

    const walletAddress = authResult.user?.wallets?.[0]?.address || deriveWalletAddress(authResult.user);
    if (!walletAddress) {
      throw new Error("Wallet address not available from Pi Wallet.");
    }

    const username = authResult.user?.username || "";
    const signature = "sandbox_signature";
    const message = `Connect wallet: ${walletAddress}`;

    const response = await fetch(`${API_BASE}/api/connect-wallet`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ walletAddress, signature, message, username })
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.success) {
      throw new Error(data.message || "Wallet connection failed.");
    }

    storeAuth(data.token, data.user);
    persistWalletAddress({ walletAddress });
    updateWalletButtonsUI();
    appNotify("Wallet connected successfully!", "success");
    return data;
  } catch (err) {
    console.error("Wallet connection failed:", err);
    if (err && err.message && err.message.includes("User canceled")) return null;
    appNotify(err.message || "Login failed. Please try again in Pi Browser.", "warn");
    return null;
  } finally {
    walletActionInFlight = false;
    setWalletButtonsBusy(false);
    setAppLoading(false);
    updateWalletButtonsUI();
  }
}

async function handleWalletButtonClick(btn) {
  if (!btn) return false;
  if (walletActionInFlight) {
    appNotify("Wallet connection is already in progress.", "info");
    return false;
  }

  const connectedUser = getWalletUser();
  if (connectedUser) {
    const wrapper = btn.closest(".wallet-area");
    if (wrapper) {
      const dropdown = wrapper.querySelector(".wallet-dropdown");
      if (dropdown) {
        dropdown.classList.toggle("open");
      }
    }
    return true;
  }

  const result = await connectWallet();
  if (result) {
    window.location.href = appPath("pages/dashboard/client.html");
    return true;
  }
  return false;
}

function bindWalletButtons() {
  updateWalletButtonsUI();
  document.querySelectorAll(".wallet-btn").forEach((btn) => {
    if (btn.dataset.walletBound === "true") return;
    btn.dataset.walletBound = "true";
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      handleWalletButtonClick(btn);
    });
  });

  document.querySelectorAll('[data-wallet-connect="true"]').forEach((link) => {
    if (link.dataset.walletBound === "true") return;
    link.dataset.walletBound = "true";
    link.addEventListener("click", (e) => {
      e.preventDefault();
      handleWalletButtonClick(document.querySelector(".wallet-btn"));
    });
  });

  const connectAction = document.getElementById("connectWalletAction");
  if (connectAction && connectAction.dataset.walletBound !== "true") {
    connectAction.dataset.walletBound = "true";
    connectAction.addEventListener("click", (e) => {
      e.preventDefault();
      handleWalletButtonClick(document.querySelector(".wallet-btn"));
    });
  }

  document.querySelectorAll('[data-wallet-action="disconnect"]').forEach((btn) => {
    if (btn.dataset.walletBound === "true") return;
    btn.dataset.walletBound = "true";
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      disconnectWallet();
    });
  });
}

document.addEventListener("click", (e) => {
  if (!e.target.closest(".wallet-area")) {
    closeAllWalletDropdowns();
  }
});

ensureDesktopWalletButton();
bindWalletButtons();

document.addEventListener("DOMContentLoaded", () => {
  ensureDesktopWalletButton();
  bindWalletButtons();
});

console.log("SMAJ PI HUB navigation loaded");




