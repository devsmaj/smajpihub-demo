// SMAJ PI HUB - Auth Integration with Backend
document.addEventListener("DOMContentLoaded", () => {
  const API_BASE = "http://localhost:3000";
  const TOKEN_KEY = "smaj_token";
  const USER_KEY = "smaj_user";

  // Get stored token
  const getToken = () => localStorage.getItem(TOKEN_KEY);

  // Get stored user
  const getStoredUser = () => {
    try {
      const user = localStorage.getItem(USER_KEY);
      return user ? JSON.parse(user) : null;
    } catch (_) {
      return null;
    }
  };

  // Store token and user
  const storeAuth = (token, user) => {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  };

  // Clear auth data (logout)
  const clearAuth = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  };

  // Check if user is logged in
  const isLoggedIn = () => !!getToken() && !!getStoredUser();

  // API request helper with auth
  const apiRequest = async (endpoint, options = {}) => {
    const token = getToken();
    const headers = { 'Content-Type': 'application/json', ...options.headers };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const response = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });
    const data = await response.json();
    return { response, data };
  };

  // ==========================================
  // Pi Wallet Connection Handler
  // ==========================================
  const connectWallet = async () => {
    if (!window.Pi) {
      alert("Pi SDK not loaded. Please refresh the page.");
      return null;
    }

    try {
      const auth = await Pi.authenticate(['username', 'payments'], onIncompletePaymentFound);
      const walletAddress = auth.user.wallets?.[0]?.address || auth.user.username;
      const username = auth.user.username;
      const signature = "sandbox_signature_" + Date.now();
      const message = `Connect wallet: ${walletAddress}`;

      const { response, data } = await apiRequest('/api/connect-wallet', {
        method: 'POST',
        body: JSON.stringify({ walletAddress, signature, message, username })
      });

      if (response.ok && data.success) {
        storeAuth(data.token, data.user);
        console.log('Wallet connected:', data.user);
        return data;
      } else {
        alert(data.message || 'Failed to connect wallet');
        return null;
      }
    } catch (error) {
      console.error('Wallet connection error:', error);
      alert('Failed to connect wallet. Please try again.');
      return null;
    }
  };

  // ==========================================
  // SSO Token for SMAJ STORE
  // ==========================================
  const getSSOToken = async () => {
    if (!isLoggedIn()) {
      alert('Please connect your wallet first');
      return null;
    }
    try {
      const { response, data } = await apiRequest('/api/sso-token?service=smajstore');
      if (response.ok && data.success) return data;
      alert(data.message || 'Failed to generate SSO token');
      return null;
    } catch (error) {
      alert('Failed to generate SSO token');
      return null;
    }
  };

  // ==========================================
  // Redirect to SMAJ STORE with SSO
  // ==========================================
  const redirectToSmajStore = async () => {
    const ssoData = await getSSOToken();
    if (ssoData && ssoData.redirectUrl) {
      window.location.href = ssoData.redirectUrl;
    }
  };

  // ==========================================
  // Logout Handler
  // ==========================================
  const logout = async () => {
    try {
      await apiRequest('/api/logout', { method: 'POST' });
    } catch (_) {}
    clearAuth();
    window.location.href = '../index.html';
  };

  // ==========================================
  // Check for SSO token in URL
  // ==========================================
  const handleSSOCallback = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    if (token) {
      storeAuth(token, { walletAddress: 'sso_user', role: 'buyer' });
      window.location.href = window.location.pathname;
    }
  };
  handleSSOCallback();

  // Initialize Pi SDK
  if (window.Pi) {
    Pi.init({ version: "2.0", sandbox: true });
  }

  // ==========================================
  // Register Form Handler
  // ==========================================
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
        const { response, data } = await apiRequest('/api/register', {
          method: 'POST',
          body: JSON.stringify({ fullName, email, username, password })
        });
        alert(data.message || (response.ok ? "Registration successful" : "Registration failed"));
        if (response.ok) window.location.href = 'login.html';
      } catch (error) {
        alert("Registration failed. Please try again.");
      }
    });
  }

  // ==========================================
  // Login Form Handler
  // ==========================================
  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const identifier = document.querySelector('input[placeholder="Username or Email"]').value;
      const password = document.querySelector('input[placeholder="Password"]').value;

      try {
        const { response, data } = await apiRequest('/api/login', {
          method: 'POST',
          body: JSON.stringify({ identifier, password })
        });
        alert(data.message || (response.ok ? "Login successful" : "Login failed"));
        if (response.ok && data.token) {
          storeAuth(data.token, data.user);
          window.location.href = '../dashboard/client.html';
        }
      } catch (error) {
        alert("Login failed. Please try again.");
      }
    });
  }

  // ==========================================
  // Pi Wallet Login Button
  // ==========================================
  const piLoginBtn = document.getElementById("piLoginBtn");
  if (piLoginBtn) {
    piLoginBtn.addEventListener("click", async () => {
      piLoginBtn.disabled = true;
      piLoginBtn.textContent = 'Connecting...';
      try {
        const result = await connectWallet();
        if (result) {
          alert('Wallet connected successfully!');
          window.location.href = '../dashboard/client.html';
        }
      } catch (error) {
        console.error('Pi login error:', error);
        alert('Pi Wallet login failed.');
      } finally {
        piLoginBtn.disabled = false;
        piLoginBtn.textContent = 'Login with Pi';
      }
    });
  }

  // ==========================================
  // Pi Wallet Register Button
  // ==========================================
  const piRegisterBtn = document.getElementById("piRegisterBtn");
  if (piRegisterBtn) {
    piRegisterBtn.addEventListener("click", async () => {
      piRegisterBtn.disabled = true;
      piRegisterBtn.textContent = 'Connecting...';
      try {
        const result = await connectWallet();
        if (result) {
          alert('Wallet connected! Welcome to SMAJ PI HUB!');
          window.location.href = '../dashboard/client.html';
        }
      } catch (error) {
        console.error('Pi register error:', error);
        alert('Pi Wallet registration failed.');
      } finally {
        piRegisterBtn.disabled = false;
        piRegisterBtn.textContent = 'Register with Pi';
      }
    });
  }

  // ==========================================
  // Forgot Password Form
  // ==========================================
  const forgotForm = document.getElementById("forgotForm");
  if (forgotForm) {
    forgotForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = document.getElementById("email").value;
      try {
        const { data } = await apiRequest('/api/forgot-password', {
          method: 'POST',
          body: JSON.stringify({ email })
        });
        alert(data.message || "If an account exists, a reset link has been sent.");
      } catch (error) {
        alert("If an account exists, a reset link has been sent.");
      }
    });
  }

  // ==========================================
  // Reset Password Form
  // ==========================================
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
        alert("Password reset successful. You can now log in.");
        window.location.href = 'login.html';
        return;
      }

      try {
        const { response, data } = await apiRequest('/api/reset-password', {
          method: 'POST',
          body: JSON.stringify({ token, newPassword: password })
        });
        alert(data.message || (response.ok ? "Password reset successful" : "Password reset failed"));
        if (response.ok) window.location.href = 'login.html';
      } catch (error) {
        alert("Password reset successful. You can now log in.");
        window.location.href = 'login.html';
      }
    });
  }

  // ==========================================
  // SSO Button for SMAJ STORE
  // ==========================================
  const smajStoreBtn = document.getElementById("smajStoreBtn") || document.getElementById("goToSmajStore");
  if (smajStoreBtn) {
    smajStoreBtn.addEventListener("click", async (e) => {
      e.preventDefault();
      if (!isLoggedIn()) {
        alert('Please connect your wallet first');
        return;
      }
      smajStoreBtn.disabled = true;
      smajStoreBtn.textContent = 'Redirecting...';
      await redirectToSmajStore();
      smajStoreBtn.disabled = false;
      smajStoreBtn.textContent = 'Go to SMAJ STORE';
    });
  }

  // ==========================================
  // Logout Button
  // ==========================================
  const logoutBtn = document.getElementById("logoutBtn") || document.querySelector('.logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener("click", (e) => {
      e.preventDefault();
      logout();
    });
  }

  // ==========================================
  // Incomplete Payment Handler
  // ==========================================
  function onIncompletePaymentFound(payment) {
    console.log('Incomplete payment found:', payment);
  }

  // ==========================================
  // Expose functions globally
  // ==========================================
  window.SMAJAuth = {
    connectWallet,
    logout,
    getSSOToken,
    redirectToSmajStore,
    getStoredUser,
    isLoggedIn,
    apiRequest
  };

  console.log("Auth page loaded - SMAJ PI HUB Backend Integration");
});
