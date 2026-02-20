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
      window.location.href = "../dashboard/client.html";

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
    window.location.href = "../../pages/auth/login.html";
  }
}

const piUser = localStorage.getItem("pi_user");
if (piUser) {
  const user = JSON.parse(piUser);
  const el = document.getElementById("piUsername");
  if (el) el.textContent = user.username;
}

const logoutBtn = document.getElementById("logoutBtn");

if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("pi_user");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "../../pages/auth/login.html";
  });
}

// Service CTA routing helpers
function getAppPrefix() {
  const path = window.location.pathname.replace(/\\/g, '/');
  const idx = path.lastIndexOf('/pages/');

  if (idx === -1) {
    return '';
  }

  const afterPages = path.slice(idx + '/pages/'.length);
  const depth = afterPages.split('/').length - 1;

  return depth <= 1 ? '../' : '../../';
}

function appPath(target) {
  if (!target || /^https?:\/\//i.test(target)) {
    return target;
  }

  return `${getAppPrefix()}${target}`;
}

function routeButton(button, target) {
  if (!button || !target) return;

  button.addEventListener('click', (e) => {
    e.preventDefault();
    window.location.href = appPath(target);
  });
}

// Service main CTA
Array.from(document.querySelectorAll('.cta-btn')).forEach((btn) => {
  if (btn.type && btn.type.toLowerCase() === 'submit') return;
  routeButton(btn, 'pages/auth/login.html');
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
    if (label.includes('subscribe')) return 'pages/auth/register.html';
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
// Pi Wallet Button - Real Implementation
const walletBtn = document.querySelector(".wallet-btn");
if (walletBtn) {
  // Check if already connected
  const storedPiUser = localStorage.getItem("pi_user");
  if (storedPiUser) {
    try {
      const user = JSON.parse(storedPiUser);
      walletBtn.innerHTML = `<i class='bx bx-check'></i> ${user.username}`;
      walletBtn.classList.add("connected");
    } catch (e) {
      console.error("Error parsing stored user:", e);
    }
  }
  
  walletBtn.addEventListener("click", async () => {
    // If already connected, show options
    if (walletBtn.classList.contains("connected")) {
      const confirmLogout = confirm("You are connected. Would you like to disconnect?");
      if (confirmLogout) {
        localStorage.removeItem("pi_user");
        walletBtn.innerHTML = `<i class='bx bx-wallet'></i> Connect Pi`;
        walletBtn.classList.remove("connected");
        alert("Disconnected from Pi Wallet.");
      }
      return;
    }
    
    // Check if Pi SDK is available
    if (window.Pi) {
      try {
        const scopes = ["username", "payments"];
        const authResult = await Pi.authenticate(scopes, onIncompletePayment);
        
        console.log("Pi Auth Success:", authResult);
        
        // Store user data
        localStorage.setItem("pi_user", JSON.stringify(authResult.user));
        
        // Update button to show connected state
        walletBtn.innerHTML = `<i class='bx bx-check'></i> ${authResult.user.username}`;
        walletBtn.classList.add("connected");
        
        // Show success message
        alert("Pi Wallet connected successfully! You can now use Pi Coin for transactions.");
        
      } catch (err) {
        console.error("Pi Login Failed:", err);
        if (err.message && err.message.includes("Network error")) {
          alert("Network error. Please check your connection and try again.");
        } else if (err.message && err.message.includes("User canceled")) {
          // User cancelled, no need to show error
          console.log("User cancelled authentication");
        } else {
          alert("Login failed. Please try again or open in Pi Browser.");
        }
      }
    } else {
      // Pi SDK not available - suggest opening in Pi Browser
      alert("Pi Wallet is only available in the Pi Browser. Please open this site in the Pi Network mobile app or Pi Browser to connect your wallet.");
    }
  });
}

const dropdownToggle = document.querySelector(".dropdown-toggle");

if (dropdownToggle) {
  dropdownToggle.addEventListener("click", (e) => {
    e.preventDefault();
    dropdownToggle.parentElement.classList.toggle("active");
  });
}

console.log("SMAJ PI HUB navigation loaded");


