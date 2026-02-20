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
  const sidebarAvatar = document.getElementById("sidebarAvatar");
  const profileUsername = document.getElementById("profileUsername");
  const profileAvatar = document.getElementById("profileAvatar");
  const walletStatus = document.getElementById("walletStatus");
  const financeWalletStatus = document.getElementById("financeWalletStatus");
  const downloadReportBtn = document.getElementById("downloadReportBtn");
  const sendBtn = document.getElementById("sendBtn");
  const receiveBtn = document.getElementById("receiveBtn");
  const profileEditBtn = document.getElementById("profileEditBtn");
  const profilePhotoBtn = document.getElementById("profilePhotoBtn");
  const profilePhotoSaveBtn = document.getElementById("profilePhotoSaveBtn");
  const profilePhotoRemoveBtn = document.getElementById("profilePhotoRemoveBtn");
  const profilePhotoInput = document.getElementById("profilePhotoInput");
  const profileAvatarTrigger = document.getElementById("profileAvatarTrigger");
  const profileActionRow = document.querySelector(".profile-action-row");
  const themeToggle = document.getElementById("themeToggle");

  const handledButtons = new WeakSet();
  let isProfileEditing = false;
  let profileOriginal = {};
  let pendingPhotoDataUrl = "";

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
  const profilePhotoStorageKey = "dashboard_profile_photo";

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

  function resolveWalletAddress(piUser) {
    const stored = localStorage.getItem("pi_wallet_address");
    if (stored) return stored;

    if (!piUser) return "";
    const direct = piUser.wallet_address || piUser.walletAddress || piUser.address;
    if (direct) return String(direct);

    const uid = String(piUser.uid || piUser.username || "").replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
    if (!uid) return "";
    const generated = `PI${uid.padEnd(24, "X").slice(0, 24)}`;
    localStorage.setItem("pi_wallet_address", generated);
    return generated;
  }

  function shortenWalletAddress(address) {
    const value = String(address || "").trim();
    if (!value) return "Not Connected";
    if (value.length <= 10) return value;
    return `${value.slice(0, 4)}...${value.slice(-4)}`;
  }

  function getInitials(username) {
    return username.slice(0, 1).toUpperCase() + "P";
  }

  function applyAvatarInitials(username) {
    if (profileAvatar && !profileAvatar.classList.contains("has-photo")) {
      profileAvatar.textContent = getInitials(username);
    }
    if (sidebarAvatar && !sidebarAvatar.classList.contains("has-photo")) {
      sidebarAvatar.textContent = getInitials(username);
    }
  }

  function setAvatarPhoto(photoDataUrl) {
    [profileAvatar, sidebarAvatar].forEach((avatarEl) => {
      if (!avatarEl) return;
      avatarEl.style.backgroundImage = `url("${photoDataUrl}")`;
      avatarEl.classList.add("has-photo");
      avatarEl.textContent = "";
    });
  }

  function clearAvatarPhoto(username) {
    const initials = getInitials(toUsername(username || getProfileText("profileUsername")));
    [profileAvatar, sidebarAvatar].forEach((avatarEl) => {
      if (!avatarEl) return;
      avatarEl.style.backgroundImage = "";
      avatarEl.classList.remove("has-photo");
      avatarEl.textContent = initials;
    });
  }

  function loadPersistedAvatarPhoto() {
    const photoDataUrl = localStorage.getItem(profilePhotoStorageKey);
    if (!photoDataUrl) return;
    setAvatarPhoto(photoDataUrl);
  }

  function setPhotoSaveVisible(show) {
    if (!profilePhotoSaveBtn) return;
    profilePhotoSaveBtn.classList.toggle("show", show);
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
    applyAvatarInitials(username);
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

    applyAvatarInitials(username);

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
      if (welcomeTitle) welcomeTitle.textContent = `Welcome back, ${username}`;
      if (sidebarUsername) sidebarUsername.textContent = username;
      if (profileUsername) profileUsername.textContent = `@${username}`;
      applyAvatarInitials(username);
      const walletAddressEl = document.getElementById("profileWalletAddress");
      if (walletAddressEl) {
        walletAddressEl.textContent = shortenWalletAddress(resolveWalletAddress(piUser));
      }

      setWalletConnected(true);
    } catch (_) {
      setWalletConnected(false);
    }
  } else {
    setWalletConnected(false);
    const walletAddressEl = document.getElementById("profileWalletAddress");
    if (walletAddressEl) {
      walletAddressEl.textContent = "Not Connected";
    }
  }

  loadPersistedProfile();
  loadPersistedAvatarPhoto();

  bindClick(profileAvatarTrigger, () => {
    if (!profilePhotoInput) return;
    profilePhotoInput.click();
  });

  bindClick(profilePhotoBtn, () => {
    if (!profilePhotoInput) return;
    profilePhotoInput.click();
  });

  bindClick(profilePhotoSaveBtn, () => {
    if (!pendingPhotoDataUrl) {
      toast("No new photo selected", "info");
      return;
    }
    localStorage.setItem(profilePhotoStorageKey, pendingPhotoDataUrl);
    pendingPhotoDataUrl = "";
    setPhotoSaveVisible(false);
    toast("Profile photo saved", "success");
  });

  bindClick(profilePhotoRemoveBtn, () => {
    localStorage.removeItem(profilePhotoStorageKey);
    pendingPhotoDataUrl = "";
    setPhotoSaveVisible(false);
    clearAvatarPhoto(getProfileText("profileUsername"));
    toast("Profile photo removed", "info");
  });

  if (profilePhotoInput) {
    profilePhotoInput.addEventListener("change", () => {
      const file = profilePhotoInput.files && profilePhotoInput.files[0];
      if (!file) return;

      if (!file.type.startsWith("image/")) {
        toast("Please choose a valid image file", "warn");
        profilePhotoInput.value = "";
        return;
      }

      if (file.size > 2 * 1024 * 1024) {
        toast("Image is too large (max 2MB)", "warn");
        profilePhotoInput.value = "";
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = String(reader.result || "");
        if (!dataUrl) return;
        pendingPhotoDataUrl = dataUrl;
        setAvatarPhoto(dataUrl);
        setPhotoSaveVisible(true);
        toast("Photo selected. Click Save Photo to confirm.", "info");
        profilePhotoInput.value = "";
      };
      reader.readAsDataURL(file);
    });
  }

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






