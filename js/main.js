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

// Global Theme (all pages)
const SITE_THEME_KEY = "site_theme";

function applySiteTheme(theme) {
  const isDark = theme === "dark";
  document.body.classList.toggle("dark", isDark);
}

function getSiteTheme() {
  return localStorage.getItem(SITE_THEME_KEY) || "light";
}

function setSiteTheme(theme) {
  localStorage.setItem(SITE_THEME_KEY, theme);
  applySiteTheme(theme);
}

function toggleSiteTheme() {
  const next = document.body.classList.contains("dark") ? "light" : "dark";
  setSiteTheme(next);
}

function bindDashboardThemeToggle() {
  const btn = document.getElementById("themeToggle");
  if (!btn || btn.dataset.themeBound === "true") return;

  btn.dataset.themeBound = "true";
  btn.addEventListener("click", (e) => {
    e.preventDefault();
    toggleSiteTheme();
  });
}

// Expose for dashboard-specific scripts if needed.
window.toggleSiteTheme = toggleSiteTheme;

applySiteTheme(getSiteTheme());
bindDashboardThemeToggle();

document.addEventListener("DOMContentLoaded", () => {
  applySiteTheme(getSiteTheme());
  bindDashboardThemeToggle();
});
const piLoginBtn = document.getElementById("piLoginBtn");

if (piLoginBtn) {
  piLoginBtn.addEventListener("click", async () => {
    try {
      const scopes = ["username", "payments"];

      const authResult = await Pi.authenticate(scopes, onIncompletePayment);

      console.log("Pi Auth Success:", authResult);

      /*
        authResult contains:
        - accessToken
        - user.uid
        - user.username
      */

      // TEMP (frontend only – backend later)
      localStorage.setItem("pi_user", JSON.stringify(authResult.user));

      // Redirect to dashboard
      window.location.href = "/pages/dashboard/client.html";

    } catch (err) {
      console.error("Pi Login Failed:", err);
      alert("Login failed. Please try again.");
    }
  });
}

// Required callback (even if unused now)
function onIncompletePayment(payment) {
  console.log("Incomplete payment found:", payment);
}

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
  const token = localStorage.getItem("token");
  const piUser = localStorage.getItem("pi_user");

  if (!token && !piUser) {
    console.warn("Unauthorized access. Redirecting to login.");
    window.location.href = getAuthEntryPath();
  }
}

const piUserRaw = localStorage.getItem("pi_user");
if (piUserRaw) {
  try {
    const user = JSON.parse(piUserRaw);
    const el = document.getElementById("piUsername");
    if (el && user && user.username) el.textContent = user.username;
  } catch (err) {
    console.warn("Invalid pi_user data found. Resetting wallet session.");
    localStorage.removeItem("pi_user");
  }
}

const logoutBtn = document.getElementById("logoutBtn");

if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("pi_user");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = getAuthEntryPath();
  });
}

// Service CTA routing helpers
function getAppPrefix() {
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

      alert('This action is ready for backend integration and will be active soon.');
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
  return appPath('pages/auth/login.html');
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
      el.setAttribute('href', getAuthEntryPath());
      if (el.textContent && el.textContent.trim()) {
        el.textContent = 'Connect Pi';
      }
    });
  });

  const path = window.location.pathname.replace(/\\/g, '/').toLowerCase();
  const authEntry = getAuthEntryPath().toLowerCase();
  if ((path.endsWith('/pages/auth/login.html') || path.endsWith('/pages/auth/register.html') || path.endsWith('/pages/auth/forget-password.html') || path.endsWith('/pages/auth/reset-password.html')) && !path.endsWith(authEntry)) {
    window.location.replace(getAuthEntryPath());
  }
}

function setupDashboardGateLinks() {
  document.querySelectorAll('a[href*="dashboard/client.html"]').forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      window.location.href = appPath('pages/dashboard/client.html');
    });
  });
}
removeEmailAuthEntrypoints();
setupDashboardGateLinks();

function ensureMobileMenuWalletButton() {
  const nav = document.getElementById("navMenu");
  if (!nav) return;
  if (nav.querySelector(".menu-wallet-btn")) return;

  const menuWalletBtn = document.createElement("button");
  menuWalletBtn.type = "button";
  menuWalletBtn.className = "wallet-btn menu-wallet-btn";
  menuWalletBtn.innerHTML = "<i class='bx bx-wallet'></i> Connect Pi";

  nav.appendChild(menuWalletBtn);
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

function updateWalletButtonsUI() {
  const user = getStoredPiUser();

  document.querySelectorAll(".wallet-btn").forEach((btn) => {
    btn.type = "button";

    if (user && user.username) {
      btn.innerHTML = `<i class='bx bx-check'></i> ${user.username}`;
      btn.classList.add("connected");
    } else {
      btn.innerHTML = `<i class='bx bx-wallet'></i> Connect Pi`;
      btn.classList.remove("connected");
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

function isAuthOrDashboardPage() {
  const path = window.location.pathname.replace(/\\/g, "/").toLowerCase();
  return path.includes("/pages/auth/") || path.includes("/pages/dashboard/");
}

async function handleWalletButtonClick(btn) {
  if (!btn) return;
  if (walletActionInFlight) {
    alert("Wallet connection is already in progress.");
    return;
  }

  const connectedUser = getStoredPiUser();
  if (connectedUser && connectedUser.username) {
    const confirmLogout = confirm("You are connected. Would you like to disconnect?");
    if (!confirmLogout) return;

    localStorage.removeItem("pi_user");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    updateWalletButtonsUI();
    alert("Disconnected from Pi Wallet.");
    return;
  }

  if (!window.Pi) {
    alert("Pi Wallet is only available in Pi Browser. Open this site inside Pi Browser to connect.");
    return;
  }

  try {
    walletActionInFlight = true;
    setWalletButtonsBusy(true);
    alert("Opening Pi Wallet connection...");
    const scopes = ["username", "payments"];
    const authResult = await Pi.authenticate(scopes, onIncompletePayment);

    localStorage.setItem("pi_user", JSON.stringify(authResult.user));
    updateWalletButtonsUI();
    alert("Pi Wallet connected successfully!");
    if (!isAuthOrDashboardPage()) {
      window.location.href = `${getAuthEntryPath()}?wallet=connected`;
    }
  } catch (err) {
    console.error("Pi Login Failed:", err);
    if (err && err.message && err.message.includes("User canceled")) return;
    alert("Login failed. Please try again in Pi Browser.");
  } finally {
    walletActionInFlight = false;
    setWalletButtonsBusy(false);
    updateWalletButtonsUI();
  }
}

function bindWalletButtons() {
  document.querySelectorAll(".wallet-btn").forEach((btn) => {
    if (btn.dataset.walletBound === "true") return;
    btn.dataset.walletBound = "true";
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      handleWalletButtonClick(btn);
    });
  });
}

ensureMobileMenuWalletButton();
bindWalletButtons();
updateWalletButtonsUI();

document.addEventListener("DOMContentLoaded", () => {
  ensureMobileMenuWalletButton();
  bindWalletButtons();
  updateWalletButtonsUI();
});
const dropdownToggle = document.querySelector(".dropdown-toggle");

if (dropdownToggle) {
  dropdownToggle.addEventListener("click", (e) => {
    e.preventDefault();
    dropdownToggle.parentElement.classList.toggle("active");
  });
}

console.log("SMAJ PI HUB navigation loaded");

















