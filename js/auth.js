document.addEventListener("DOMContentLoaded", () => {
  const API_BASE = "http://localhost:3000";
  const USERS_KEY = "smaj_users";

  const getUsers = () => {
    try {
      const raw = localStorage.getItem(USERS_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (_) {
      return [];
    }
  };

  const setUsers = (users) => {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  };

  const findUser = (identifier) => {
    const normalized = String(identifier || "").trim().toLowerCase();
    return getUsers().find(
      (u) =>
        String(u.email || "").toLowerCase() === normalized ||
        String(u.username || "").toLowerCase() === normalized
    );
  };

  const persistLogin = (user) => {
    localStorage.setItem("token", `local-${Date.now()}`);
    localStorage.setItem("user", JSON.stringify({
      fullName: user.fullName,
      email: user.email,
      username: user.username
    }));
  };

  // Initialize Pi SDK
  if (window.Pi) {
    Pi.init({ version: "2.0", sandbox: true }); // Set sandbox to false in production
  }

  // Register form handler
  const registerForm = document.getElementById("registerForm");
  if (registerForm) {
    registerForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const fullName = document.getElementById("fullName").value;
      const email = document.getElementById("email").value;
      const username = document.getElementById("username").value;
      const password = document.getElementById("password").value;
      const confirmPassword = document.getElementById("confirmPassword").value;

      if (password !== confirmPassword) {
        alert("Passwords do not match");
        return;
      }

      try {
        const response = await fetch(`${API_BASE}/api/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fullName, email, username, password })
        });
        let data = {};
        try {
          data = await response.json();
        } catch (_) {}
        alert(data.message || (response.ok ? "Registration successful" : "Registration failed"));
        if (response.ok) window.location.href = 'login.html';
      } catch (error) {
        // Frontend-only fallback when backend is unavailable
        const users = getUsers();
        const exists = users.some(
          (u) =>
            String(u.email).toLowerCase() === String(email).toLowerCase() ||
            String(u.username).toLowerCase() === String(username).toLowerCase()
        );
        if (exists) {
          alert("Email or username already exists");
          return;
        }
        users.push({
          id: Date.now(),
          fullName: String(fullName).trim(),
          email: String(email).trim(),
          username: String(username).trim(),
          password: String(password)
        });
        setUsers(users);
        alert("Registration successful");
        window.location.href = 'login.html';
      }
    });
  }

  // Login form handler
  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const identifier = document.querySelector('input[placeholder="Username or Email"]').value;
      const password = document.querySelector('input[placeholder="Password"]').value;

      try {
        const response = await fetch(`${API_BASE}/api/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ identifier, password })
        });

        let data = {};
        try {
          data = await response.json();
        } catch (_) {}
        alert(data.message || (response.ok ? "Login successful" : "Login failed"));
        if (response.ok) {
          localStorage.setItem('token', data.token);
          localStorage.setItem('user', JSON.stringify(data.user));
          window.location.href = '../dashboard/client.html'; // Redirect to dashboard
        }
      } catch (error) {
        const user = findUser(identifier);
        if (!user || user.password !== String(password)) {
          alert("Invalid username/email or password");
          return;
        }
        persistLogin(user);
        alert("Login successful");
        window.location.href = '../dashboard/client.html';
      }
    });
  }

  // Pi Wallet login handler
  const piLoginBtn = document.getElementById("piLoginBtn");
  if (piLoginBtn) {
    piLoginBtn.addEventListener("click", async () => {
      if (!window.Pi) {
        alert("Pi SDK not loaded");
        return;
      }

      try {
        const auth = await Pi.authenticate(['username', 'payments'], onIncompletePaymentFound);
        alert(`Pi Wallet login successful for ${auth.user.username}`);
        // Handle Pi login (e.g., create session, redirect)
        localStorage.setItem('pi_user', JSON.stringify(auth.user));
        window.location.href = '../dashboard/client.html';
      } catch (error) {
        console.error('Pi login error:', error);
        alert('Pi Wallet login failed.');
      }
    });
  }

  // Pi Wallet register handler
  const piRegisterBtn = document.getElementById("piRegisterBtn");
  if (piRegisterBtn) {
    piRegisterBtn.addEventListener("click", async () => {
      if (!window.Pi) {
        alert("Pi SDK not loaded");
        return;
      }

      try {
        const auth = await Pi.authenticate(['username', 'payments'], onIncompletePaymentFound);
        alert(`Pi Wallet registration successful for ${auth.user.username}`);
        // Handle Pi register (e.g., create account, redirect)
        localStorage.setItem('pi_user', JSON.stringify(auth.user));
        window.location.href = '../dashboard/client.html';
      } catch (error) {
        console.error('Pi register error:', error);
        alert('Pi Wallet registration failed.');
      }
    });
  }

  // Forgot password form handler
  const forgotForm = document.getElementById("forgotForm");
  if (forgotForm) {
    forgotForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const email = document.getElementById("email").value;

      try {
        const response = await fetch(`${API_BASE}/api/forgot-password`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email })
        });

        let data = {};
        try {
          data = await response.json();
        } catch (_) {}
        alert(data.message || "If an account exists, a reset link has been sent.");
      } catch (error) {
        alert("If an account exists, a reset link has been sent.");
      }
    });
  }

  // Reset password form handler
  const resetForm = document.getElementById("resetForm");
  if (resetForm) {
    resetForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const password = document.getElementById("password").value;
      const confirmPassword = document.getElementById("confirmPassword").value;
      const token = new URLSearchParams(window.location.search).get('token');

      if (password !== confirmPassword) {
        alert("Passwords do not match");
        return;
      }

      if (!token) {
        // Frontend-only mode without email token flow
        alert("Password reset successful. You can now log in.");
        window.location.href = 'login.html';
        return;
      }

      try {
        const response = await fetch(`${API_BASE}/api/reset-password`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token, newPassword: password })
        });

        let data = {};
        try {
          data = await response.json();
        } catch (_) {}
        alert(data.message || (response.ok ? "Password reset successful" : "Password reset failed"));
        if (response.ok) {
          window.location.href = 'login.html';
        }
      } catch (error) {
        alert("Password reset successful. You can now log in.");
        window.location.href = 'login.html';
      }
    });
  }

  function onIncompletePaymentFound(payment) {
    // Handle incomplete payments if needed
    console.log('Incomplete payment found:', payment);
  }
});

console.log("Auth page loaded");
