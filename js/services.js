(function () {
  const walletState = document.getElementById("walletState");
  const walletHint = document.getElementById("walletHint");
  const sessionLog = document.getElementById("sessionLog");
  const connectWalletAction = document.getElementById("connectWalletAction");

  if (!walletState || !walletHint || !sessionLog || !connectWalletAction) {
    return;
  }

  const getPiUser = () => {
    const raw = localStorage.getItem("pi_user");
    if (!raw) return null;

    try {
      return JSON.parse(raw);
    } catch (err) {
      return null;
    }
  };

  const setWalletUI = () => {
    const piUser = getPiUser();

    if (piUser && piUser.username) {
      walletState.textContent = `Connected: ${piUser.username}`;
      walletState.classList.remove("disconnected");
      walletState.classList.add("connected");
      walletHint.textContent = "One-click access is enabled for connected platforms.";
      connectWalletAction.textContent = "Wallet Connected";
      connectWalletAction.disabled = true;
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

  connectWalletAction.addEventListener("click", () => {
    const walletBtn = document.querySelector(".wallet-btn");

    if (walletBtn) {
      walletBtn.click();
      setTimeout(setWalletUI, 500);
      return;
    }

    sessionLog.textContent = "Connect wallet button is unavailable on this page.";
  });

  document.querySelectorAll(".hub-card").forEach((card) => {
    const actionBtn = card.querySelector(".hub-open-btn");
    if (!actionBtn) return;

    actionBtn.addEventListener("click", () => {
      const platformName = card.dataset.platform || "Platform";
      const platformUrl = card.dataset.platformUrl || "#";
      const requiresWallet = card.dataset.requiresWallet === "true";
      const comingSoon = card.dataset.comingSoon === "true";
      const piUser = getPiUser();

      if (comingSoon) {
        sessionLog.textContent = `${platformName}: Added to waitlist placeholder.`;
        alert(`${platformName} is coming soon. You will be notified when access opens.`);
        return;
      }

      if (requiresWallet && !piUser) {
        sessionLog.textContent = `${platformName}: Blocked until wallet connection.`;
        alert(`Please connect your Pi wallet first to open ${platformName}.`);
        return;
      }

      sessionLog.textContent = `${platformName}: Creating secure hub handoff placeholder...`;

      setTimeout(() => {
        const encodedUser = encodeURIComponent((piUser && piUser.username) || "guest");
        const separator = platformUrl.includes("?") ? "&" : "?";
        const target = `${platformUrl}${separator}hub_user=${encodedUser}&from=smajpihub`;
        window.location.href = target;
      }, 500);
    });
  });

  window.addEventListener("storage", setWalletUI);
  setWalletUI();
})();