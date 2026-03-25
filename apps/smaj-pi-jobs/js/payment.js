// SMAJ PI JOBS - Complete Payment System
// All payments handled in PI (Pi Network Token)
// 1 PI = $314,159 USD

// PI to USD Conversion
const PI_USD_RATE = 314159;

// Convert USD to PI (e.g., $10 = 0.0000318 PI)
function usdToPi(usdAmount) {
    return usdAmount / PI_USD_RATE;
}

// Convert PI to USD
function piToUsd(piAmount) {
    return piAmount * PI_USD_RATE;
}

// Convert USD to PI formatted string (e.g., "$10 = 0.0000011 PI")
function convertUsdToPiString(usdAmount) {
    const piAmount = usdToPi(usdAmount);
    return formatPiAmount(piAmount, 8) + ' PI';
}

// Get formatted USD to PI conversion for display
function getUsdToPiConversion(usdAmount) {
    const piAmount = usdToPi(usdAmount);
    return {
        usd: formatUsdAmount(usdAmount),
        pi: formatPiAmount(piAmount, 8),
        rawPi: piAmount
    };
}

// Format PI amount for display
function formatPiAmount(piAmount, decimals = 4) {
    if (piAmount < 0.0001) {
        return piAmount.toFixed(8);
    }
    return parseFloat(piAmount.toFixed(decimals));
}

// Format USD amount for display
function formatUsdAmount(usdAmount) {
    return '$' + usdAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// Payment State
const paymentState = {
    transactions: [],
    escrowJobs: {},
    pendingPayments: []
};

// Payment Configuration
const paymentConfig = {
    platformFeePercent: 5, // 5% platform fee
    minWithdrawAmount: 0.0001, // Minimum 0.0001 PI
    maxWithdrawAmount: 10000,
    piUsdRate: PI_USD_RATE
};

// Initialize Payment System
function initPaymentSystem() {
    loadTransactions();
    updatePaymentUI();
}

// Load transactions from localStorage
function loadTransactions() {
    const saved = localStorage.getItem('piTransactions');
    if (saved) {
        paymentState.transactions = JSON.parse(saved);
    } else {
        // Add sample transactions
        paymentState.transactions = [
            {
                id: 'txn_001',
                type: 'job_payment',
                amount: 0.5,
                usdValue: 157079.50,
                jobTitle: 'Logo Design',
                from: 'TechStore Inc.',
                to: 'Freelancer',
                status: 'completed',
                date: 'Dec 1, 2026',
                txHash: '0x' + generateTxHash()
            },
            {
                id: 'txn_002',
                type: 'platform_fee',
                amount: 0.025,
                usdValue: 7853.98,
                jobTitle: 'Logo Design',
                status: 'completed',
                date: 'Dec 1, 2026',
                txHash: '0x' + generateTxHash()
            },
            {
                id: 'txn_003',
                type: 'job_payment',
                amount: 0.8,
                usdValue: 251327.20,
                jobTitle: 'React Project',
                from: 'FitLife App',
                to: 'Freelancer',
                status: 'completed',
                date: 'Nov 28, 2026',
                txHash: '0x' + generateTxHash()
            },
            {
                id: 'txn_004',
                type: 'withdrawal',
                amount: 1.0,
                usdValue: 314159.00,
                status: 'completed',
                date: 'Nov 25, 2026',
                txHash: '0x' + generateTxHash()
            }
        ];
    }
    saveTransactions();
}

// Save transactions to localStorage
function saveTransactions() {
    localStorage.setItem('piTransactions', JSON.stringify(paymentState.transactions));
}

// Generate transaction hash
function generateTxHash() {
    const chars = '0123456789abcdef';
    let hash = '';
    for (let i = 0; i < 64; i++) {
        hash += chars[Math.floor(Math.random() * chars.length)];
    }
    return hash;
}

// Calculate platform fee in PI
function calculatePlatformFee(piAmount) {
    return (piAmount * paymentConfig.platformFeePercent / 100);
}

// Get net amount after fee in PI
function getNetAmount(piAmount) {
    const fee = calculatePlatformFee(piAmount);
    return piAmount - fee;
}

// Fund Job - Client pays PI to escrow
async function fundJob(jobId, piAmount) {
    return new Promise((resolve, reject) => {
        // Check wallet balance
        const wallet = window.walletModule.getWalletState();
        if (!wallet.isConnected) {
            reject(new Error('Please connect your wallet first'));
            return;
        }

        const balancePi = parseFloat(wallet.balance);
        if (balancePi < piAmount) {
            const neededUsd = piToUsd(piAmount - balancePi);
            reject(new Error('Insufficient PI balance. Need ' + formatPiAmount(piAmount - balancePi) + ' more PI (~$' + formatUsdAmount(neededUsd) + ')'));
            return;
        }

        // Simulate payment processing
        setTimeout(() => {
            // Deduct from wallet
            wallet.balance = (balancePi - piAmount).toFixed(6);
            localStorage.setItem('piWallet', JSON.stringify(wallet));
            window.walletModule.updateWalletButton();
            window.walletModule.updateWalletDisplay();

            // Create escrow record
            paymentState.escrowJobs[jobId] = {
                amount: piAmount,
                usdValue: piToUsd(piAmount),
                fundedAt: new Date().toISOString(),
                status: 'escrow'
            };

            // Create transaction record
            const transaction = {
                id: 'txn_' + Date.now(),
                type: 'job_funding',
                amount: piAmount,
                usdValue: piToUsd(piAmount),
                jobId: jobId,
                status: 'completed',
                date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                txHash: '0x' + generateTxHash()
            };
            paymentState.transactions.unshift(transaction);
            saveTransactions();

            updatePaymentUI();
            resolve(transaction);
        }, 1500);
    });
}

// Release Payment - Pay freelancer from escrow
async function releasePayment(jobId, freelancerWallet) {
    return new Promise((resolve, reject) => {
        const escrow = paymentState.escrowJobs[jobId];
        if (!escrow) {
            reject(new Error('No escrow found for this job'));
            return;
        }

        setTimeout(() => {
            const grossAmount = escrow.amount;
            const fee = calculatePlatformFee(grossAmount);
            const netAmount = getNetAmount(grossAmount);

            // Create payment transaction
            const transaction = {
                id: 'txn_' + Date.now(),
                type: 'job_payment',
                amount: netAmount,
                usdValue: piToUsd(netAmount),
                jobId: jobId,
                from: 'Escrow',
                to: freelancerWallet || 'Freelancer',
                status: 'completed',
                date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                txHash: '0x' + generateTxHash()
            };
            paymentState.transactions.unshift(transaction);

            // Create platform fee transaction
            const feeTransaction = {
                id: 'txn_' + Date.now(),
                type: 'platform_fee',
                amount: fee,
                usdValue: piToUsd(fee),
                jobId: jobId,
                status: 'completed',
                date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                txHash: '0x' + generateTxHash()
            };
            paymentState.transactions.unshift(feeTransaction);

            // Update escrow status
            paymentState.escrowJobs[jobId].status = 'released';
            paymentState.escrowJobs[jobId].releasedAt = new Date().toISOString();

            saveTransactions();
            updatePaymentUI();
            resolve({ transaction, feeTransaction, netAmount });
        }, 1500);
    });
}

// Withdraw PI to external wallet
async function withdrawPI(piAmount) {
    return new Promise((resolve, reject) => {
        const wallet = window.walletModule.getWalletState();
        if (!wallet.isConnected) {
            reject(new Error('Please connect your wallet first'));
            return;
        }

        if (piAmount < paymentConfig.minWithdrawAmount) {
            reject(new Error('Minimum withdrawal amount is ' + paymentConfig.minWithdrawAmount + ' PI'));
            return;
        }

        if (piAmount > paymentConfig.maxWithdrawAmount) {
            reject(new Error('Maximum withdrawal amount is ' + paymentConfig.maxWithdrawAmount + ' PI'));
            return;
        }

        const balancePi = parseFloat(wallet.balance);
        if (balancePi < piAmount) {
            reject(new Error('Insufficient balance'));
            return;
        }

        setTimeout(() => {
            // Deduct from wallet
            wallet.balance = (balancePi - piAmount).toFixed(6);
            localStorage.setItem('piWallet', JSON.stringify(wallet));
            window.walletModule.updateWalletButton();
            window.walletModule.updateWalletDisplay();

            // Create transaction
            const transaction = {
                id: 'txn_' + Date.now(),
                type: 'withdrawal',
                amount: piAmount,
                usdValue: piToUsd(piAmount),
                status: 'completed',
                date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                txHash: '0x' + generateTxHash()
            };
            paymentState.transactions.unshift(transaction);
            saveTransactions();

            updatePaymentUI();
            resolve(transaction);
        }, 2000);
    });
}

// Get transaction icon
function getTransactionIcon(type) {
    const icons = {
        'job_payment': '💰',
        'job_funding': '💳',
        'platform_fee': '📋',
        'withdrawal': '🏧',
        'bonus': '🎁',
        'refund': '↩️'
    };
    return icons[type] || '🪙';
}

// Get transaction type label
function getTransactionLabel(type) {
    const labels = {
        'job_payment': 'Job Payment Received',
        'job_funding': 'Job Funded',
        'platform_fee': 'Platform Fee',
        'withdrawal': 'Withdrawal',
        'bonus': 'Bonus Reward',
        'refund': 'Refund'
    };
    return labels[type] || type;
}

// Render transactions list
function renderTransactions(containerId, limit = 10) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const transactions = paymentState.transactions.slice(0, limit);
    
    if (transactions.length === 0) {
        container.innerHTML = '<tr><td colspan="3" style="text-align: center; padding: 40px; color: var(--text-muted);">No transactions yet</td></tr>';
        return;
    }

    container.innerHTML = transactions.map(txn => `
        <tr style="border-bottom: 1px solid rgba(108, 92, 231, 0.1);">
            <td style="padding: var(--space-md);">
                <div style="display: flex; align-items: center; gap: var(--space-md);">
                    <div style="width: 40px; height: 40px; background: var(--bg-tertiary); border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                        ${getTransactionIcon(txn.type)}
                    </div>
                    <div>
                        <p style="font-weight: 600; font-size: var(--font-size-sm);">${getTransactionLabel(txn.type)}</p>
                        <p style="color: var(--text-muted); font-size: var(--font-size-xs);">${txn.jobTitle || txn.date}</p>
                    </div>
                </div>
            </td>
            <td style="padding: var(--space-md);">
                <span class="badge badge-${txn.status === 'completed' ? 'success' : txn.status === 'pending' ? 'warning' : 'error'}">${txn.status}</span>
            </td>
            <td style="padding: var(--space-md); text-align: right;">
                <div style="color: ${txn.type === 'withdrawal' || txn.type === 'platform_fee' ? 'var(--error)' : 'var(--success)'}; font-weight: 600;">
                    ${txn.type === 'withdrawal' || txn.type === 'platform_fee' ? '-' : '+'}${formatPiAmount(txn.amount)} PI
                </div>
                <div style="font-size: var(--font-size-xs); color: var(--text-muted);">
                    ~${formatUsdAmount(txn.usdValue || piToUsd(txn.amount))}
                </div>
            </td>
        </tr>
    `).join('');
}

// Render transaction for dashboard
function renderDashboardTransactions(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const transactions = paymentState.transactions.slice(0, 5);
    
    if (transactions.length === 0) {
        container.innerHTML = '<p style="color: var(--text-muted); text-align: center; padding: var(--space-lg);">No transactions yet</p>';
        return;
    }

    container.innerHTML = transactions.map(txn => `
        <tr style="border-bottom: 1px solid rgba(108, 92, 231, 0.1);">
            <td style="padding: var(--space-md); font-size: var(--font-size-sm);">${txn.jobTitle || getTransactionLabel(txn.type)}</td>
            <td style="padding: var(--space-md); font-size: var(--font-size-sm); color: var(--text-muted);">${txn.date}</td>
            <td style="padding: var(--space-md);"><span class="badge badge-success">Completed</span></td>
            <td style="padding: var(--space-md); text-align: right; color: ${txn.type === 'withdrawal' || txn.type === 'platform_fee' ? 'var(--error)' : 'var(--success)'}; font-weight: 600;">
                ${txn.type === 'withdrawal' || txn.type === 'platform_fee' ? '-' : '+'}${formatPiAmount(txn.amount)} PI
            </td>
        </tr>
    `).join('');
}

// Update payment UI elements
function updatePaymentUI() {
    // Update wallet balance display
    const balanceDisplay = document.getElementById('paymentBalance');
    if (balanceDisplay) {
        const wallet = window.walletModule.getWalletState();
        balanceDisplay.textContent = formatPiAmount(parseFloat(wallet.balance)) + ' PI';
    }

    // Update transactions if on page
    if (document.getElementById('transactionsList')) {
        renderTransactions('transactionsList');
    }

    if (document.getElementById('dashboardTransactions')) {
        renderDashboardTransactions('dashboardTransactions');
    }
}

// Open Payment Modal
function openPaymentModal(type, data = {}) {
    const modalHTML = `
        <div id="paymentModal" class="modal-overlay">
            <div class="modal" style="max-width: 500px;">
                <div class="modal-header">
                    <h3 class="modal-title">${type === 'fund' ? 'Fund Job' : type === 'withdraw' ? 'Withdraw PI' : 'Payment'}</h3>
                    <button class="modal-close" onclick="closePaymentModal()">✕</button>
                </div>
                <div class="modal-body">
                    ${renderPaymentModalContent(type, data)}
                </div>
            </div>
        </div>
    `;
    
    // Remove existing modal if any
    const existing = document.getElementById('paymentModal');
    if (existing) existing.remove();

    document.body.insertAdjacentHTML('beforeend', modalHTML);
    setTimeout(() => {
        document.getElementById('paymentModal').classList.add('active');
    }, 100);
}

// Render payment modal content
function renderPaymentModalContent(type, data) {
    const wallet = window.walletModule.getWalletState();
    const walletPi = parseFloat(wallet.balance);
    const walletUsd = piToUsd(walletPi);
    
    if (type === 'fund') {
        const piAmount = data.budget;
        const usdAmount = piToUsd(piAmount);
        const fee = calculatePlatformFee(piAmount);
        
        return `
            <div style="text-align: center; margin-bottom: var(--space-lg);">
                <div style="width: 80px; height: 80px; background: var(--gradient-primary); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 36px; margin: 0 auto var(--space-md);">🪙</div>
                <h4 style="margin-bottom: var(--space-sm);">Fund Job: ${data.jobTitle}</h4>
                <p style="color: var(--text-secondary); font-size: var(--font-size-sm);">Budget: <strong>${formatPiAmount(piAmount)} PI</strong> (~${formatUsdAmount(usdAmount)})</p>
            </div>
            <div style="background: var(--bg-tertiary); border-radius: var(--radius-md); padding: var(--space-lg); margin-bottom: var(--space-lg);">
                <div style="display: flex; justify-content: space-between; margin-bottom: var(--space-sm);">
                    <span style="color: var(--text-secondary);">Job Budget</span>
                    <span style="font-weight: 600;">${formatPiAmount(piAmount)} PI</span>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: var(--space-sm);">
                    <span style="color: var(--text-secondary);">USD Value</span>
                    <span style="font-weight: 600;">${formatUsdAmount(usdAmount)}</span>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: var(--space-sm);">
                    <span style="color: var(--text-secondary);">Platform Fee (${paymentConfig.platformFeePercent}%)</span>
                    <span style="font-weight: 600;">${formatPiAmount(fee)} PI</span>
                </div>
                <hr style="border: none; border-top: 1px solid rgba(108, 92, 231, 0.2); margin: var(--space-md) 0;">
                <div style="display: flex; justify-content: space-between;">
                    <span style="font-weight: 600;">Total</span>
                    <span style="font-weight: 700; color: var(--secondary-color); font-size: var(--font-size-lg);">${formatPiAmount(piAmount)} PI</span>
                </div>
            </div>
            <div style="background: rgba(108, 92, 231, 0.1); border-radius: var(--radius-md); padding: var(--space-md); margin-bottom: var(--space-lg);">
                <p style="font-size: var(--font-size-sm); color: var(--text-secondary);">🔒 Payment will be held in secure escrow until job is completed and approved.</p>
            </div>
            <div style="margin-bottom: var(--space-md);">
                <p style="font-size: var(--font-size-sm); color: var(--text-muted);">Your Balance: <strong style="color: var(--secondary-color);">${formatPiAmount(walletPi)} PI</strong> (~${formatUsdAmount(walletUsd)})</p>
            </div>
            <button id="confirmFundBtn" class="btn btn-primary btn-lg" style="width: 100%;" onclick="confirmFundJob(${data.jobId}, ${piAmount})">
                Confirm Payment
            </button>
        `;
    }
    
    if (type === 'withdraw') {
        return `
            <div style="text-center: center; margin-bottom: var(--space-lg);">
                <div style="width: 80px; height: 80px; background: var(--gradient-secondary); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 36px; margin: 0 auto var(--space-md);">🏧</div>
                <h4 style="margin-bottom: var(--space-sm);">Withdraw PI Tokens</h4>
                <p style="color: var(--text-secondary); font-size: var(--font-size-sm);">Transfer to your external wallet</p>
            </div>
            <div class="form-group">
                <label class="form-label">Amount (PI)</label>
                <input type="number" id="withdrawAmount" class="form-input" placeholder="Enter amount" step="0.0001" min="${paymentConfig.minWithdrawAmount}">
                <p style="color: var(--text-muted); font-size: var(--font-size-xs); margin-top: var(--space-xs);">≈ $0.00 USD</p>
            </div>
            <div style="background: var(--bg-tertiary); border-radius: var(--radius-md); padding: var(--space-md); margin-bottom: var(--space-lg);">
                <div style="display: flex; justify-content: space-between; margin-bottom: var(--space-sm);">
                    <span style="color: var(--text-secondary);">Available Balance</span>
                    <span style="font-weight: 600;">${formatPiAmount(walletPi)} PI</span>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: var(--space-sm);">
                    <span style="color: var(--text-secondary);">USD Value</span>
                    <span style="font-weight: 600;">${formatUsdAmount(walletUsd)}</span>
                </div>
                <div style="display: flex; justify-content: space-between;">
                    <span style="color: var(--text-secondary);">Min Withdrawal</span>
                    <span style="font-weight: 600;">${paymentConfig.minWithdrawAmount} PI</span>
                </div>
            </div>
            <button id="confirmWithdrawBtn" class="btn btn-primary btn-lg" style="width: 100%;" onclick="confirmWithdraw()">
                Withdraw PI
            </button>
        `;
    }

    return '<p>Unknown payment type</p>';
}

// Close payment modal
function closePaymentModal() {
    const modal = document.getElementById('paymentModal');
    if (modal) {
        modal.classList.remove('active');
        setTimeout(() => modal.remove(), 300);
    }
}

// Confirm fund job
async function confirmFundJob(jobId, piAmount) {
    const btn = document.getElementById('confirmFundBtn');
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner"></span> Processing...';

    try {
        const result = await fundJob(jobId, piAmount);
        closePaymentModal();
        showToast('Job funded successfully! ' + formatPiAmount(piAmount) + ' PI held in escrow (~' + formatUsdAmount(piToUsd(piAmount)) + ')', 'success');
        
        // Update job status if on job details page
        if (window.jobsModule) {
            window.location.href = 'jobs.html';
        }
    } catch (error) {
        showToast(error.message, 'error');
        btn.disabled = false;
        btn.innerHTML = 'Confirm Payment';
    }
}

// Confirm withdrawal
async function confirmWithdraw() {
    const amountInput = document.getElementById('withdrawAmount');
    const piAmount = parseFloat(amountInput.value);
    const btn = document.getElementById('confirmWithdrawBtn');
    
    if (!piAmount || piAmount < paymentConfig.minWithdrawAmount) {
        showToast('Minimum withdrawal amount is ' + paymentConfig.minWithdrawAmount + ' PI', 'error');
        return;
    }

    btn.disabled = true;
    btn.innerHTML = '<span class="spinner"></span> Processing...';

    try {
        const result = await withdrawPI(piAmount);
        closePaymentModal();
        showToast('Successfully withdrawn ' + formatPiAmount(piAmount) + ' PI! (~' + formatUsdAmount(piToUsd(piAmount)) + ')', 'success');
    } catch (error) {
        showToast(error.message, 'error');
        btn.disabled = false;
        btn.innerHTML = 'Withdraw PI';
    }
}

// Apply for job
async function applyForJob(jobId, proposal) {
    return new Promise((resolve, reject) => {
        const wallet = window.walletModule.getWalletState();
        if (!wallet.isConnected) {
            reject(new Error('Please connect your wallet first'));
            return;
        }

        setTimeout(() => {
            // Save application
            const applications = JSON.parse(localStorage.getItem('piApplications') || '[]');
            applications.push({
                id: 'app_' + Date.now(),
                jobId: jobId,
                proposal: proposal,
                appliedAt: new Date().toISOString(),
                status: 'pending'
            });
            localStorage.setItem('piApplications', JSON.stringify(applications));

            resolve({ success: true, applicationId: 'app_' + Date.now() });
        }, 1000);
    });
}

// Export all functions
window.paymentModule = {
    initPaymentSystem: initPaymentSystem,
    fundJob: fundJob,
    releasePayment: releasePayment,
    withdrawPI: withdrawPI,
    calculatePlatformFee: calculatePlatformFee,
    getNetAmount: getNetAmount,
    usdToPi: usdToPi,
    piToUsd: piToUsd,
    convertUsdToPiString: convertUsdToPiString,
    getUsdToPiConversion: getUsdToPiConversion,
    formatPiAmount: formatPiAmount,
    formatUsdAmount: formatUsdAmount,
    renderTransactions: renderTransactions,
    renderDashboardTransactions: renderDashboardTransactions,
    openPaymentModal: openPaymentModal,
    closePaymentModal: closePaymentModal,
    confirmFundJob: confirmFundJob,
    confirmWithdraw: confirmWithdraw,
    applyForJob: applyForJob,
    getTransactionIcon: getTransactionIcon,
    getTransactionLabel: getTransactionLabel,
    getConfig: function() { return paymentConfig; },
    getTransactions: function() { return paymentState.transactions; },
    PI_USD_RATE: PI_USD_RATE
};

