// SMAJ PI JOBS - Wallet Connection Module
// This module handles wallet connection to SMAJ PI HUB
// Using PI (Pi Network) as the native currency
// 1 PI = $314,159 USD

// SMAJ PI HUB URL
const SMAJ_PIHUB_URL = 'https://smajpihub.com';

// PI Network Configuration
const PI_NETWORK = {
    name: 'Pi Network',
    symbol: 'PI',
    decimals: 8,
    usdRate: 314159 // 1 PI = $314,159 USD
};

// Wallet State
const walletState = {
    isConnected: false,
    address: null,
    balance: 0, // Balance in PI
    network: 'SMAJ PI HUB',
    connectedAt: null
};

// Wallet Configuration - SMAJ PI HUB
const walletConfig = {
    chainId: '0xSMAJ',
    chainName: 'SMAJ PI HUB Network',
    nativeCurrency: {
        name: 'Pi Network',
        symbol: 'PI',
        decimals: 8
    },
    rpcUrls: ['https://api.smajpihub.com/rpc'],
    blockExplorerUrls: ['https://explorer.smajpihub.com']
};

// Generate PI wallet address (simulated)
function generateWalletAddress() {
    const chars = '0123456789abcdef';
    let address = '0x';
    for (let i = 0; i < 40; i++) {
        address += chars[Math.floor(Math.random() * chars.length)];
    }
    return address;
}

// Generate random PI balance for demo (0.1 to 10 PI)
function generatePIBalance() {
    // Generate between 0.1-10 PI for demo
    return (Math.random() * 9.9 + 0.1).toFixed(6);
}

// Convert PI balance to USD value
function getPIBalanceUSD() {
    const balancePI = parseFloat(walletState.balance);
    return (balancePI * PI_NETWORK.usdRate).toFixed(2);
}

// Format PI amount with proper decimals
function formatPIBalance(piAmount) {
    const amount = parseFloat(piAmount);
    if (amount < 0.0001) {
        return amount.toFixed(8);
    }
    return amount.toFixed(4);
}

// Connect to SMAJ PI HUB
async function connectWallet() {
    return new Promise((resolve, reject) => {
        // Simulate connection to SMAJ PI HUB
        setTimeout(() => {
            if (walletState.isConnected) {
                resolve(walletState);
                return;
            }
            
            walletState.isConnected = true;
            walletState.address = generateWalletAddress();
            walletState.balance = generatePIBalance();
            walletState.connectedAt = new Date().toISOString();
            
            // Save to localStorage
            localStorage.setItem('piWallet', JSON.stringify(walletState));
            
            resolve(walletState);
        }, 1500);
    });
}

// Connect via SMAJ PI HUB (external redirect)
function connectViaSMAJPIHub() {
    // In production, this would redirect to SMAJ PI HUB for authentication
    // For demo, we simulate the connection
    showToast('Redirecting to SMAJ PI HUB...', 'info');
    
    setTimeout(() => {
        connectWallet().then(wallet => {
            updateWalletButton();
            closeWalletModal();
            updateWalletDisplay();
            showToast('Successfully connected to SMAJ PI HUB!', 'success');
        });
    }, 1000);
}

// Disconnect Wallet
function disconnectWallet() {
    walletState.isConnected = false;
    walletState.address = null;
    walletState.balance = 0;
    walletState.connectedAt = null;
    localStorage.removeItem('piWallet');
    return walletState;
}

// Check if wallet is already connected
function checkWalletConnection() {
    const savedWallet = localStorage.getItem('piWallet');
    if (savedWallet) {
        const parsed = JSON.parse(savedWallet);
        walletState.isConnected = parsed.isConnected;
        walletState.address = parsed.address;
        walletState.balance = parsed.balance;
        walletState.connectedAt = parsed.connectedAt;
        return walletState;
    }
    return null;
}

// Format wallet address for display
function formatAddress(address) {
    if (!address) return '';
    if (address.length <= 12) return address;
    return address.substring(0, 6) + '...' + address.substring(address.length - 4);
}

// Copy address to clipboard
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showToast('Address copied to clipboard!', 'success');
    }).catch(err => {
        showToast('Failed to copy address', 'error');
    });
}

// Update wallet button UI
function updateWalletButton() {
    const walletBtn = document.getElementById('walletBtn');
    if (!walletBtn) return;

    if (walletState.isConnected) {
        const balanceUSD = getPIBalanceUSD();
        walletBtn.classList.add('connected');
        walletBtn.innerHTML = '<span class="wallet-icon">🪙</span><span>' + formatAddress(walletState.address) + '</span><span class="wallet-balance">' + formatPIBalance(walletState.balance) + ' PI</span>';
    } else {
        walletBtn.classList.remove('connected');
        walletBtn.innerHTML = '<span class="wallet-icon">🔗</span><span>Login with Pi</span>';
    }
}

// Open wallet modal
function openWalletModal() {
    const modal = document.getElementById('walletModal');
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

// Close wallet modal
function closeWalletModal() {
    const modal = document.getElementById('walletModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// Handle wallet connection from modal
async function handleWalletConnect() {
    const connectBtn = document.getElementById('walletConnectBtn');
    const spinner = document.getElementById('walletSpinner');
    
    if (connectBtn) {
        connectBtn.disabled = true;
        connectBtn.innerHTML = '<span class="spinner"></span> Connecting to SMAJ PI HUB...';
        
        try {
            const wallet = await connectWallet();
            updateWalletButton();
            closeWalletModal();
            updateWalletDisplay();
            showToast('Wallet connected to SMAJ PI HUB successfully!', 'success');
        } catch (error) {
            showToast('Failed to connect wallet', 'error');
        } finally {
            connectBtn.disabled = false;
            connectBtn.innerHTML = '<div class="wallet-option-icon">🪙</div>' +
                '<div class="wallet-option-info">' +
                    '<h4>Pi Network Wallet</h4>' +
                    '<p>Connect to Pi Network (1 PI = $314,159 USD)</p>' +
                '</div>';
        }
    }
}

// Handle SMAJ PI HUB redirect
function handleSMAJPIHubRedirect() {
    // Show toast message about redirect
    showToast('Redirecting to SMAJ PI HUB...', 'info');
    
    // In production, redirect to SMAJ PI HUB
    // window.location.href = SMAJ_PIHUB_URL + '/connect?app=smaj-pi-jobs';
    
    // For demo, simulate connection
    setTimeout(() => {
        handleWalletConnect();
    }, 1500);
}

// Handle wallet disconnection
function handleWalletDisconnect() {
    disconnectWallet();
    updateWalletButton();
    updateWalletDisplay();
    showToast('Wallet disconnected from SMAJ PI HUB', 'info');
}

// Update wallet display in dashboard and modal
function updateWalletDisplay() {
    const connectedWallet = document.getElementById('connectedWallet');
    const walletAddress = document.getElementById('walletAddress');
    const walletBalance = document.getElementById('walletBalanceDisplay');
    const dashboardBalance = document.getElementById('dashboardBalance');
    const profileEarnings = document.getElementById('profileEarnings');
    
    // Get stats elements
    const statsBalance = document.querySelectorAll('[id*="Balance"]');

    if (walletState.isConnected) {
        const balanceUSD = getPIBalanceUSD();
        
        if (connectedWallet) connectedWallet.style.display = 'block';
        if (walletAddress) walletAddress.textContent = walletState.address;
        if (walletBalance) walletBalance.textContent = formatPIBalance(walletState.balance) + ' PI';
        if (dashboardBalance) dashboardBalance.textContent = formatPIBalance(walletState.balance) + ' PI';
        if (profileEarnings) profileEarnings.textContent = formatPIBalance(walletState.balance) + ' PI';
        
        // Update all balance displays
        statsBalance.forEach(el => {
            if (el && el.textContent.includes('PI')) {
                el.textContent = formatPIBalance(walletState.balance) + ' PI';
            }
        });
    } else {
        if (connectedWallet) connectedWallet.style.display = 'none';
        if (dashboardBalance) dashboardBalance.textContent = '0 PI';
        if (profileEarnings) profileEarnings.textContent = '0 PI';
        
        statsBalance.forEach(el => {
            if (el && el.textContent.includes('PI')) {
                el.textContent = '0 PI';
            }
        });
    }
}

// Get wallet state
function getWalletState() {
    return walletState;
}

// Initialize wallet functionality
function initWallet() {
    checkWalletConnection();
    updateWalletButton();
    updateWalletDisplay();

    const walletBtn = document.getElementById('walletBtn');
    const modalClose = document.getElementById('walletModalClose');
    const modalOverlay = document.getElementById('walletModal');
    const connectBtn = document.getElementById('walletConnectBtn');
    const disconnectBtn = document.getElementById('walletDisconnectBtn');
    const copyBtn = document.getElementById('copyAddressBtn');
    const smajHubBtn = document.getElementById('smajHubConnectBtn');

    if (walletBtn) {
        walletBtn.addEventListener('click', function() {
            openWalletModal();
        });
    }

    if (modalClose) {
        modalClose.addEventListener('click', closeWalletModal);
    }

    if (modalOverlay) {
        modalOverlay.addEventListener('click', function(e) {
            if (e.target === modalOverlay) {
                closeWalletModal();
            }
        });
    }

    if (connectBtn) {
        connectBtn.addEventListener('click', handleWalletConnect);
    }

    // Handle SMAJ PI HUB specific button
    if (smajHubBtn) {
        smajHubBtn.addEventListener('click', handleSMAJPIHubRedirect);
    }

    if (disconnectBtn) {
        disconnectBtn.addEventListener('click', handleWalletDisconnect);
    }

    if (copyBtn && walletState.address) {
        copyBtn.addEventListener('click', function() {
            copyToClipboard(walletState.address);
        });
    }
    
    // Update copy button when wallet connects
    const updateCopyBtn = () => {
        const newCopyBtn = document.getElementById('copyAddressBtn');
        if (newCopyBtn && walletState.address) {
            newCopyBtn.removeEventListener('click', copyBtn?.onclick || function(){});
            newCopyBtn.addEventListener('click', function() {
                copyToClipboard(walletState.address);
            });
        }
    };
    
    // Listen for wallet changes
    setTimeout(updateCopyBtn, 500);
}

// Export functions
window.walletModule = {
    connectWallet: connectWallet,
    connectViaSMAJPIHub: connectViaSMAJPIHub,
    disconnectWallet: disconnectWallet,
    checkWalletConnection: checkWalletConnection,
    getWalletState: getWalletState,
    openWalletModal: openWalletModal,
    closeWalletModal: closeWalletModal,
    formatAddress: formatAddress,
    copyToClipboard: copyToClipboard,
    initWallet: initWallet,
    updateWalletButton: updateWalletButton,
    updateWalletDisplay: updateWalletDisplay,
    formatPIBalance: formatPIBalance,
    getPIBalanceUSD: getPIBalanceUSD,
    SMAJ_PIHUB_URL: SMAJ_PIHUB_URL,
    PI_NETWORK: PI_NETWORK
};
