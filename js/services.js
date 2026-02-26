(function () {
  const walletState = document.getElementById("walletState");
  const walletHint = document.getElementById("walletHint");
  const sessionLog = document.getElementById("sessionLog");
  const connectWalletAction = document.getElementById("connectWalletAction");

  if (!walletState || !walletHint || !sessionLog || !connectWalletAction) {
    return;
  }

  const getState = () => {
    if (window.SmajWallet && typeof window.SmajWallet.getState === "function") {
      return window.SmajWallet.getState();
    }

    return { connected: !!localStorage.getItem("pi_user"), address: localStorage.getItem("pi_wallet_address") || "" };
  };

  const setWalletUI = () => {
    const state = getState();

    if (state.connected) {
      const short = window.SmajWallet && window.SmajWallet.shortenAddress
        ? window.SmajWallet.shortenAddress(state.address)
        : (state.address || "Connected");

      walletState.textContent = `Connected: ${short}`;
      walletState.classList.remove("disconnected");
      walletState.classList.add("connected");
      walletHint.textContent = "One-click access is enabled for connected platforms.";
      connectWalletAction.textContent = "Disconnect Wallet";
      connectWalletAction.disabled = false;
      sessionLog.textContent = "Hub session ready for cross-platform access.";
      return;
    }

    walletState.textContent = "Not Connected";
    walletState.classList.remove("connected");
    walletState.classList.add("disconnected");
    walletHint.textContent = "Connect wallet in header to enable direct platform entry.";
    connectWalletAction.textContent = "Connect Wallet";
    connectWalletAction.disabled = false;
    sessionLog.textContent = "Waiting for wallet connection.";
  };

  connectWalletAction.addEventListener("click", async (event) => {
    event.preventDefault();

    if (window.SmajWallet && typeof window.SmajWallet.toggleWallet === "function") {
      await window.SmajWallet.toggleWallet();
      setWalletUI();
      return;
    }

    const walletBtn = document.querySelector(".wallet-btn");
    if (walletBtn) {
      walletBtn.click();
      setTimeout(setWalletUI, 300);
      return;
    }

    sessionLog.textContent = "Connect wallet button is unavailable on this page.";
  });

  const redirectToSmajStore = async () => {
    const token = localStorage.getItem("smaj_token");
    const user = localStorage.getItem("smaj_user");

    if (token && user) {
      sessionLog.textContent = "SMAJ Store: Generating SSO token...";
      try {
        const response = await fetch("http://localhost:3000/api/sso-token?service=smajstore", {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        });

        const data = await response.json();

        if (data.success && data.redirectUrl) {
          sessionLog.textContent = "SMAJ Store: Redirecting with SSO...";
          window.location.href = data.redirectUrl;
          return true;
        }
      } catch (error) {
        console.error("SSO token error:", error);
      }
    }
    return false;
  };

  document.querySelectorAll(".hub-card").forEach((card) => {
    const actionBtn = card.querySelector(".hub-open-btn");
    if (!actionBtn) return;

    actionBtn.addEventListener("click", async () => {
      const platformName = card.dataset.platform || "Platform";
      const platformUrl = card.dataset.platformUrl || "#";
      const requiresWallet = card.dataset.requiresWallet === "true";
      const comingSoon = card.dataset.comingSoon === "true";
      const state = getState();
      const isSmajStore = platformName === "SMAJ Store";

      if (comingSoon) {
        sessionLog.textContent = `${platformName}: Added to waitlist placeholder.`;
        alert(`${platformName} is coming soon. You will be notified when access opens.`);
        return;
      }

      if (requiresWallet && !state.connected) {
        sessionLog.textContent = `${platformName}: Blocked until wallet connection.`;
        alert(`Please connect your Pi wallet first to open ${platformName}.`);
        return;
      }

      if (isSmajStore) {
        const ssoSuccess = await redirectToSmajStore();
        if (ssoSuccess) return;

        sessionLog.textContent = "SMAJ Store: Using fallback redirect...";
      }

      sessionLog.textContent = `${platformName}: Creating secure hub handoff...`;

      setTimeout(() => {
        const storedUser = localStorage.getItem("pi_user");
        let username = "guest";

        if (storedUser) {
          try {
            const parsed = JSON.parse(storedUser);
            username = parsed.username || "guest";
          } catch (_) {}
        }

        const encodedUser = encodeURIComponent(username);
        const separator = platformUrl.includes("?") ? "&" : "?";
        const target = `${platformUrl}${separator}hub_user=${encodedUser}&from=smajpihub`;
        window.location.href = target;
      }, 500);
    });
  });

  const comingSoonMessage = "This feature is coming soon.";
  const ecosystemGrid = document.querySelector(".ecosystem-grid");
  if (ecosystemGrid) {
    ecosystemGrid.addEventListener("click", (event) => {
      const card = event.target.closest(".eco-card");
      if (!card || card.dataset.comingSoon !== "true") return;
      event.preventDefault();
      alert(comingSoonMessage);
    });
  }

  window.addEventListener("storage", setWalletUI);
  window.addEventListener("smaj:wallet-changed", setWalletUI);
  setWalletUI();
})();
