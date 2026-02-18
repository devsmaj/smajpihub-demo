(function () {
  const sidebar = document.getElementById("dashboardSidebar");
  const sidebarOpen = document.getElementById("sidebarOpen");
  const sidebarClose = document.getElementById("sidebarClose");
  const logoutBtn = document.getElementById("logoutBtn");
  const logoutModal = document.getElementById("logoutModal");
  const cancelLogout = document.getElementById("cancelLogout");
  const confirmLogout = document.getElementById("confirmLogout");
  const welcomeTitle = document.getElementById("welcomeTitle");

  const piUserRaw = localStorage.getItem("pi_user");
  if (piUserRaw && welcomeTitle) {
    try {
      const piUser = JSON.parse(piUserRaw);
      if (piUser && piUser.username) {
        welcomeTitle.textContent = `Welcome, ${piUser.username}`;
      }
    } catch (_) {}
  }

  if (sidebarOpen && sidebar) {
    sidebarOpen.addEventListener("click", () => sidebar.classList.add("open"));
  }

  if (sidebarClose && sidebar) {
    sidebarClose.addEventListener("click", () => sidebar.classList.remove("open"));
  }

  document.querySelectorAll(".filter-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".filter-btn").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      const filter = btn.dataset.filter;
      document.querySelectorAll("#ordersTableBody tr").forEach((row) => {
        const status = row.dataset.status;
        row.style.display = filter === "all" || status === filter ? "" : "none";
      });
    });
  });

  if (logoutBtn && logoutModal) {
    logoutBtn.addEventListener("click", (e) => {
      e.preventDefault();
      logoutModal.classList.add("show");
    });
  }

  if (cancelLogout && logoutModal) {
    cancelLogout.addEventListener("click", () => logoutModal.classList.remove("show"));
  }

  if (confirmLogout) {
    confirmLogout.addEventListener("click", () => {
      localStorage.removeItem("pi_user");
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "../../pages/auth/login.html";
    });
  }

  if (logoutModal) {
    logoutModal.addEventListener("click", (e) => {
      if (e.target === logoutModal) logoutModal.classList.remove("show");
    });
  }
})();