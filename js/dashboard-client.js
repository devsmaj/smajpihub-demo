(function () {

  const sidebar = document.getElementById("dashboardSidebar");
  const sidebarOpen = document.getElementById("sidebarOpen");
  const sidebarClose = document.getElementById("sidebarClose");
  const sidebarOverlay = document.getElementById("sidebarOverlay");
  const navLinks = document.querySelectorAll(".nav-link[data-section]");
  const sections = document.querySelectorAll(".dashboard-section");
  const logoutBtn = document.getElementById("logoutBtn");
  const welcomeTitle = document.getElementById("welcomeTitle");
  const sidebarUsername = document.getElementById("sidebarUsername");
  const profileUsername = document.getElementById("profileUsername");
  const profileAvatar = document.getElementById("profileAvatar");
  const walletStatus = document.getElementById("walletStatus");
  const financeWalletStatus = document.getElementById("financeWalletStatus");
  const downloadReportBtn = document.getElementById("downloadReportBtn");
  const sendBtn = document.getElementById("sendBtn");
  const receiveBtn = document.getElementById("receiveBtn");
  const profileEditBtn = document.getElementById("profileEditBtn");
  const profileActionRow = document.querySelector(".profile-action-row");
  const themeToggle = document.getElementById("themeToggle");

  const handledButtons = new WeakSet();
  let isProfileEditing = false;
  let profileOriginal = {};

  const profileFieldIds = [
    "profileFullName",
    "profileUsername",
    "profileEmail",
    "profilePhone",
    "profileCountry",
    "profileWalletAddress",
    "profileMemberSince"
  ];

  const profileStorageKey = "dashboard_profile_data";

  const sectionMap = {
    "Pi Balance": "finance",
    "Active Orders": "orders",
    "Active Jobs": "jobs",
    "Enrolled Courses": "ecosystem",
    "Health Appointments": "ecosystem",
    "Energy Payments": "finance",
    "Housing Bookings": "orders",
    "Swap Trades": "ecosystem"
  };

  const DASHBOARD_THEME_KEY = "dashboard_theme";

  function applyDashboardTheme(theme) {
    const isDark = theme === "dark";
    document.body.classList.toggle("dark", isDark);

    if (themeToggle) {
      themeToggle.innerHTML = isDark
        ? "<i class='bx bx-sun'></i>"
        : "<i class='bx bx-moon'></i>";
      themeToggle.setAttribute("aria-label", isDark ? "Switch to light mode" : "Switch to dark mode");
    }
  }

  function loadDashboardTheme() {
    const stored = localStorage.getItem(DASHBOARD_THEME_KEY);
    applyDashboardTheme(stored === "dark" ? "dark" : "light");
  }

  function toggleDashboardTheme() {
    const next = document.body.classList.contains("dark") ? "light" : "dark";
    localStorage.setItem(DASHBOARD_THEME_KEY, next);
    applyDashboardTheme(next);
    toast(next === "dark" ? "Dashboard dark mode enabled" : "Dashboard light mode enabled", "info");
  }

  function buttonLabel(el) {
    return (el.textContent || "Action").replace(/\s+/g, " ").trim();
  }

  function toast(message, type = "info") {
    const el = document.createElement("div");
    el.className = `dashboard-toast ${type}`;
    el.textContent = message;
    document.body.appendChild(el);

    requestAnimationFrame(() => el.classList.add("show"));

    setTimeout(() => {
      el.classList.remove("show");
      setTimeout(() => el.remove(), 220);
    }, 2400);
  }

  function bindClick(element, handler) {
    if (!element) return;
    handledButtons.add(element);
    element.addEventListener("click", handler);
  }

  function openSidebar() {
    if (!sidebar || !sidebarOverlay) return;
    sidebar.classList.add("open");
    sidebarOverlay.classList.add("show");
  }

  function closeSidebar() {
    if (!sidebar || !sidebarOverlay) return;
    sidebar.classList.remove("open");
    sidebarOverlay.classList.remove("show");
  }

  function activateSection(target) {
    navLinks.forEach((item) => {
      item.classList.toggle("active", item.dataset.section === target);
    });

    sections.forEach((section) => {
      section.classList.toggle("active", section.id === `section-${target}`);
    });

    closeSidebar();
  }

  loadDashboardTheme();
  bindClick(sidebarOpen, openSidebar);
  bindClick(sidebarClose, closeSidebar);
  bindClick(sidebarOverlay, closeSidebar);

  navLinks.forEach((button) => {
    bindClick(button, () => {
      const target = button.dataset.section;
      activateSection(target);
    });
  });

  function setWalletConnected(isConnected) {
    const label = isConnected ? "Connected" : "Not Connected";
    [walletStatus, financeWalletStatus].forEach((el) => {
      if (!el) return;
      el.textContent = label;
      el.classList.toggle("connected", isConnected);
      el.classList.toggle("disconnected", !isConnected);
    });
  }

  function toUsername(value) {
    return (value || "").replace(/^@/, "").trim() || "smaj_user";
  }

  function getProfileText(fieldId) {
    const el = document.getElementById(fieldId);
    return el ? el.textContent.trim() : "";
  }
  function collectProfileData() {
    return {
      profileFullName: getProfileText("profileFullName"),
      profileUsername: getProfileText("profileUsername"),
      profileEmail: getProfileText("profileEmail"),
      profilePhone: getProfileText("profilePhone"),
      profileCountry: getProfileText("profileCountry"),
      profileWalletAddress: getProfileText("profileWalletAddress"),
      profileMemberSince: getProfileText("profileMemberSince")
    };
  }

  function applyProfileData(data) {
    if (!data) return;

    Object.entries(data).forEach(([fieldId, value]) => {
      const field = document.getElementById(fieldId);
      if (!field || typeof value !== "string") return;
      field.textContent = value;
    });

    const username = toUsername(getProfileText("profileUsername"));
    if (sidebarUsername) sidebarUsername.textContent = username;
    if (welcomeTitle) welcomeTitle.textContent = `Welcome back, ${username}`;
    if (profileAvatar) profileAvatar.textContent = username.slice(0, 1).toUpperCase() + "P";
  }

  function persistProfileData() {
    const data = collectProfileData();
    localStorage.setItem(profileStorageKey, JSON.stringify(data));
  }

  function loadPersistedProfile() {
    const raw = localStorage.getItem(profileStorageKey);
    if (!raw) return;

    try {
      const data = JSON.parse(raw);
      applyProfileData(data);
    } catch (_) {
      localStorage.removeItem(profileStorageKey);
    }
  }
  function enterProfileEdit() {
    if (isProfileEditing) return;

    profileOriginal = {};
    profileFieldIds.forEach((fieldId) => {
      const field = document.getElementById(fieldId);
      if (!field) return;

      const value = field.textContent.trim();
      profileOriginal[fieldId] = value;

      const input = document.createElement("input");
      input.className = "profile-edit-input";
      input.value = value;
      input.type = fieldId === "profileEmail" ? "email" : "text";
      input.setAttribute("data-field", fieldId);

      field.innerHTML = "";
      field.appendChild(input);
    });

    const cancelBtn = document.createElement("button");
    cancelBtn.className = "btn-soft";
    cancelBtn.id = "profileCancelBtn";
    cancelBtn.textContent = "Cancel";
    bindClick(cancelBtn, cancelProfileEdit);

    if (profileActionRow) {
      profileActionRow.appendChild(cancelBtn);
    }

    if (profileEditBtn) profileEditBtn.textContent = "Save Profile";
    isProfileEditing = true;
  }

  function saveProfileEdit() {
    profileFieldIds.forEach((fieldId) => {
      const field = document.getElementById(fieldId);
      if (!field) return;

      const input = field.querySelector(".profile-edit-input");
      if (!input) return;

      let value = input.value.trim();
      if (!value) value = profileOriginal[fieldId] || "";
      if (fieldId === "profileUsername") value = `@${toUsername(value)}`;

      field.textContent = value;
    });

    const usernameRaw = getProfileText("profileUsername");
    const username = toUsername(usernameRaw);
    if (sidebarUsername) sidebarUsername.textContent = username;
    if (welcomeTitle) welcomeTitle.textContent = `Welcome back, ${username}`;

    const initials = username.slice(0, 1).toUpperCase() + "P";
    if (profileAvatar) profileAvatar.textContent = initials;

    const cancelBtn = document.getElementById("profileCancelBtn");
    if (cancelBtn) cancelBtn.remove();
    if (profileEditBtn) profileEditBtn.textContent = "Edit Profile";

    isProfileEditing = false;
    persistProfileData();
    toast("Profile updated successfully", "success");
  }

  function cancelProfileEdit() {
    profileFieldIds.forEach((fieldId) => {
      const field = document.getElementById(fieldId);
      if (!field) return;
      field.textContent = profileOriginal[fieldId] || field.textContent.trim();
    });

    const cancelBtn = document.getElementById("profileCancelBtn");
    if (cancelBtn) cancelBtn.remove();
    if (profileEditBtn) profileEditBtn.textContent = "Edit Profile";

    isProfileEditing = false;
    toast("Profile edit canceled", "info");
  }

  bindClick(profileEditBtn, () => {
    if (!isProfileEditing) {
      enterProfileEdit();
      return;
    }
    saveProfileEdit();
  });

  const piUserRaw = localStorage.getItem("pi_user");
  if (piUserRaw) {
    try {
      const piUser = JSON.parse(piUserRaw);
      const username = piUser && piUser.username ? piUser.username : "smaj_user";
      const initial = username.charAt(0).toUpperCase() + "P";

      if (welcomeTitle) welcomeTitle.textContent = `Welcome back, ${username}`;
      if (sidebarUsername) sidebarUsername.textContent = username;
      if (profileUsername) profileUsername.textContent = `@${username}`;
      if (profileAvatar) profileAvatar.textContent = initial;

      setWalletConnected(true);
    } catch (_) {
      setWalletConnected(false);
    }
  } else {
    setWalletConnected(false);
  }

  loadPersistedProfile();

  document.querySelectorAll(".filter-btn").forEach((btn) => {
    bindClick(btn, () => {
      const group = btn.dataset.filterGroup;
      const filter = btn.dataset.filter;

      document
        .querySelectorAll(`.filter-btn[data-filter-group="${group}"]`)
        .forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      if (group === "tx") {
        document.querySelectorAll("#transactionsTable tr").forEach((row) => {
          const type = row.dataset.type;
          row.style.display = filter === "all" || type === filter ? "" : "none";
        });
      }

      if (group === "notice") {
        document.querySelectorAll("#noticeList .notice-item").forEach((item) => {
          const project = item.dataset.project;
          item.style.display = filter === "all" || project === filter ? "" : "none";
        });
      }
    });
  });

  document.querySelectorAll(".mark-read").forEach((btn) => {
    bindClick(btn, () => {
      const card = btn.closest(".notice-item");
      if (!card) return;
      card.classList.add("read");
      btn.textContent = "Read";
      btn.disabled = true;
      toast("Notification marked as read", "success");
    });
  });

  bindClick(sendBtn, () => toast("Send flow is a frontend mock", "info"));
  bindClick(receiveBtn, () => toast("Receive flow is a frontend mock", "info"));

  if (downloadReportBtn) {
    bindClick(downloadReportBtn, () => {
      toast("Report export will be available after backend integration", "info");
    });
  }

  document.querySelectorAll("#section-overview .stat-card").forEach((card) => {
    const title = card.querySelector("h3") ? card.querySelector("h3").textContent.trim() : "";
    const action = card.querySelector(".btn-soft");
    if (!action) return;

    bindClick(action, () => {
      const target = sectionMap[title] || "analytics";
      activateSection(target);
      toast(`${title} opened in ${target.charAt(0).toUpperCase()}${target.slice(1)}`, "success");
    });
  });

  document.querySelectorAll(".eco-card .btn-soft").forEach((btn) => {
    bindClick(btn, () => {
      const card = btn.closest(".eco-card");
      if (!card) return;

      const project = card.querySelector("h3") ? card.querySelector("h3").textContent.trim() : "Module";
      const statusBadge = card.querySelector(".status-badge");
      const isReady = statusBadge && statusBadge.classList.contains("ready");

      if (isReady) {
        toast(`${project} module opened`, "success");
        activateSection("orders");
      } else {
        toast(`${project} is coming soon`, "warn");
      }
    });
  });

  function hookButtonByLabel(sectionId, label, handler) {
    const section = document.getElementById(sectionId);
    if (!section) return;

    const button = Array.from(section.querySelectorAll("button")).find((el) =>
      buttonLabel(el).toLowerCase() === label.toLowerCase()
    );

    if (button) bindClick(button, handler);
  }

  hookButtonByLabel("section-jobs", "Manage Jobs", () => {
    activateSection("jobs");
    toast("Jobs workspace opened", "success");
  });

  hookButtonByLabel("section-jobs", "View Requests", () => {
    activateSection("orders");
    toast("Service requests redirected to Orders & Bookings", "info");
  });

  hookButtonByLabel("section-security", "Update Password", () => {
    toast("Password update is a frontend mock", "info");
  });

  hookButtonByLabel("section-security", "Wallet Reconnect", () => {
    setWalletConnected(true);
    toast("Wallet reconnected successfully", "success");
  });

  hookButtonByLabel("section-security", "Delete Account", () => {
    const confirmed = window.confirm("This is a frontend mock. Simulate delete account action?");
    if (confirmed) {
      toast("Delete request submitted (mock)", "warn");
    }
  });

  bindClick(themeToggle, toggleDashboardTheme);
document.querySelectorAll("button").forEach((btn) => {
    if (handledButtons.has(btn)) return;
    const label = buttonLabel(btn);
    bindClick(btn, () => {
      toast(`${label} clicked`, "info");
    });
  });

  if (logoutBtn) {
    bindClick(logoutBtn, () => {
      localStorage.removeItem("pi_user");
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "../../pages/auth/login.html";
    });
  }
})();






