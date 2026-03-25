// SMAJ PI JOBS - Main JavaScript File

// Toast Notification System
function showToast(message, type = 'info') {
    // Remove existing toast if any
    const existingToast = document.querySelector('.toast');
    if (existingToast) {
        existingToast.remove();
    }

    // Create toast element
    const toast = document.createElement('div');
    toast.className = 'toast toast-' + type;
    toast.innerHTML = '<span>' + message + '</span>';
    
    document.body.appendChild(toast);
    
    // Show toast
    setTimeout(() => {
        toast.classList.add('show');
    }, 100);
    
    // Hide and remove toast
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 3000);
}

// Mobile Navigation Toggle
function initMobileNav() {
    const navToggle = document.getElementById('navToggle');
    const navLinks = document.querySelector('.nav-links');
    
    if (navToggle && navLinks) {
        navToggle.addEventListener('click', function() {
            navLinks.classList.toggle('active');
            navToggle.classList.toggle('active');
        });
    }
}

// Active Navigation Link
function setActiveNavLink() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.nav-links a');
    
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPage || (currentPage === '' && href === 'index.html')) {
            link.classList.add('active');
        }
    });
}

// Initialize Header Component
function initHeader() {
    const headerHTML = `
        <header class="header">
            <div class="container">
                <a href="index.html" class="logo">
                    <div class="logo-icon">⚡</div>
                    <span>SMAJ PI JOBS</span>
                </a>
                <nav class="nav">
                    <ul class="nav-links">
                        <li><a href="index.html">Home</a></li>
                        <li><a href="jobs.html">Jobs</a></li>
                        <li><a href="post-job.html">Post Job</a></li>
                        <li><a href="dashboard.html">Dashboard</a></li>
                    </ul>
                </nav>
                <div class="header-actions">
                    <button id="walletBtn" class="wallet-btn">
                        <span class="wallet-icon">🔗</span>
                        <span>Connect Wallet</span>
                    </button>
                </div>
            </div>
        </header>
    `;
    
    // Insert header at the beginning of body
    document.body.insertAdjacentHTML('afterbegin', headerHTML);
}

// Initialize Footer Component
function initFooter() {
    const footerHTML = `
        <footer class="footer">
            <div class="container">
                <div class="footer-content">
                    <div class="footer-brand">
                        <div class="footer-logo">
                            <div class="logo-icon">⚡</div>
                            <span>SMAJ PI JOBS</span>
                        </div>
                        <p class="footer-description">The premier freelance marketplace powered by SMAJ PI HUB. Connect with clients, find jobs, and get paid in SMAJ Tokens.</p>
                        <div class="footer-social">
                            <a href="#" class="social-link">🐦</a>
                            <a href="#" class="social-link">📱</a>
                            <a href="#" class="social-link">💼</a>
                            <a href="#" class="social-link">📧</a>
                        </div>
                    </div>
                    <div class="footer-links">
                        <h4>Platform</h4>
                        <ul>
                            <li><a href="jobs.html">Browse Jobs</a></li>
                            <li><a href="post-job.html">Post a Job</a></li>
                            <li><a href="dashboard.html">Dashboard</a></li>
                            <li><a href="#">How It Works</a></li>
                        </ul>
                    </div>
                    <div class="footer-links">
                        <h4>Company</h4>
                        <ul>
                            <li><a href="#">About Us</a></li>
                            <li><a href="#">Careers</a></li>
                            <li><a href="#">Press</a></li>
                            <li><a href="#">Contact</a></li>
                        </ul>
                    </div>
                    <div class="footer-links">
                        <h4>Support</h4>
                        <ul>
                            <li><a href="#">Help Center</a></li>
                            <li><a href="#">Safety</a></li>
                            <li><a href="#">Terms of Service</a></li>
                            <li><a href="#">Privacy Policy</a></li>
                        </ul>
                    </div>
                </div>
                <div class="footer-bottom">
                    <p>© 2026 SMAJ PI JOBS. All rights reserved. Powered by SMAJ PI HUB</p>
                    <p>Built on Pi Network</p>
                </div>
            </div>
        </footer>
    `;
    
    // Insert footer at the end of body
    document.body.insertAdjacentHTML('beforeend', footerHTML);
}

// Initialize Wallet Modal
function initWalletModal() {
    const modalHTML = `
        <div id="walletModal" class="modal-overlay">
            <div class="modal">
                <div class="modal-header">
                    <h3 class="modal-title">Connect Your PI Wallet</h3>
                    <button id="walletModalClose" class="modal-close">✕</button>
                </div>
                <div class="modal-body">
                    <div id="walletOptions">
                        <button id="walletConnectBtn" class="wallet-option">
                            <div class="wallet-option-icon">🪙</div>
                            <div class="wallet-option-info">
                                <h4>Pi Network Wallet</h4>
                                <p>Connect to Pi Network (1 PI = $314,159 USD)</p>
                            </div>
                        </button>
                    </div>
                    <div id="connectedWallet" style="display: none;">
                        <div class="connected-wallet">
                            <div class="wallet-address">
                                <span id="walletAddress">0x0000...0000</span>
                                <button id="copyAddressBtn" class="copy-btn">Copy</button>
                            </div>
                            <div class="wallet-balance-detail">
                                <span>Balance</span>
                                <span id="walletBalanceDisplay">0 PI</span>
                            </div>
                        </div>
                        <button id="walletDisconnectBtn" class="btn btn-secondary" style="width: 100%;">
                            Disconnect Wallet
                        </button>
                    </div>
                </div>
                <div class="modal-footer">
                    <p>1 PI = $314,159 USD • Secure Pi Network Transactions</p>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

// Initialize Dashboard Sidebar
function initDashboardSidebar() {
    const sidebarHTML = `
        <div class="dashboard-sidebar">
            <div class="sidebar-user">
                <div class="user-avatar" style="width: 80px; height: 80px; background: var(--gradient-primary); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 32px; margin: 0 auto var(--space-md);">👤</div>
                <h3 style="text-align: center; margin-bottom: var(--space-xs);">Freelancer</h3>
                <p style="text-align: center; color: var(--text-muted); font-size: var(--font-size-sm);">Member since 2026</p>
            </div>
            <hr style="border: none; border-top: 1px solid rgba(108, 92, 231, 0.1); margin: var(--space-lg) 0;">
            <nav class="sidebar-menu">
                <a href="dashboard.html" class="active">📊 Dashboard</a>
                <a href="dashboard.html">💼 My Jobs</a>
                <a href="dashboard.html">📁 Proposals</a>
                <a href="dashboard.html">💰 Earnings</a>
                <a href="dashboard.html">👤 Profile</a>
                <a href="dashboard.html">⚙️ Settings</a>
            </nav>
        </div>
    `;
    
    const sidebarContainer = document.getElementById('dashboardSidebar');
    if (sidebarContainer) {
        sidebarContainer.innerHTML = sidebarHTML;
    }
}

// Initialize Dashboard Stats
function initDashboardStats() {
    const statsHTML = `
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-card-icon">💰</div>
                <div class="stat-card-value" id="dashboardBalance">0 SMAJ</div>
                <div class="stat-card-label">Wallet Balance</div>
            </div>
            <div class="stat-card">
                <div class="stat-card-icon">📋</div>
                <div class="stat-card-value">12</div>
                <div class="stat-card-label">Active Jobs</div>
            </div>
            <div class="stat-card">
                <div class="stat-card-icon">✅</div>
                <div class="stat-card-value">45</div>
                <div class="stat-card-label">Completed Jobs</div>
            </div>
            <div class="stat-card">
                <div class="stat-card-icon">⭐</div>
                <div class="stat-card-value">4.9</div>
                <div class="stat-card-label">Average Rating</div>
            </div>
        </div>
    `;
    
    const statsContainer = document.getElementById('dashboardStats');
    if (statsContainer) {
        statsContainer.innerHTML = statsHTML;
    }
}

// Page-specific initializations
function initPage() {
    const page = document.body.dataset.page || 'home';
    
    // Common initializations
    initMobileNav();
    setActiveNavLink();
    
    // Page-specific
    switch(page) {
        case 'home':
            // Home page specific
            break;
        case 'jobs':
            if (window.jobsModule) {
                window.jobsModule.initJobsPage();
            }
            break;
        case 'job-details':
            if (window.jobsModule) {
                window.jobsModule.initJobDetailsPage();
            }
            break;
        case 'dashboard':
            initDashboardSidebar();
            initDashboardStats();
            break;
        case 'post-job':
            initPostJobForm();
            break;
    }
}

// Initialize Post Job Form
function initPostJobForm() {
    const form = document.getElementById('postJobForm');
    const budgetInput = document.getElementById('jobBudget');
    const budgetConversion = document.getElementById('budgetConversion');
    const quickUsdInput = document.getElementById('quickUsdInput');
    const convertBtn = document.getElementById('convertUsdToPi');
    const quickResult = document.getElementById('quickConversionResult');
    
    // Budget input conversion (PI to USD)
    if (budgetInput && budgetConversion && window.paymentModule) {
        budgetInput.addEventListener('input', function() {
            const piAmount = parseFloat(this.value) || 0;
            const usdAmount = window.paymentModule.piToUsd(piAmount);
            budgetConversion.innerHTML = `<span style="font-weight: 600; color: var(--secondary-color);">${window.paymentModule.formatUsdAmount(usdAmount)}</span> = <span style="font-weight: 600;">${window.paymentModule.formatPiAmount(piAmount, 8)} PI</span>`;
        });
    }
    
    // Quick USD to PI converter
    if (convertBtn && quickUsdInput && quickResult && window.paymentModule) {
        convertBtn.addEventListener('click', function() {
            const usdAmount = parseFloat(quickUsdInput.value);
            if (usdAmount && usdAmount > 0) {
                const conversion = window.paymentModule.getUsdToPiConversion(usdAmount);
                quickResult.innerHTML = `<span style="color: var(--success); font-weight: 600;">$${usdAmount} USD = ${conversion.pi} PI</span>`;
            } else {
                quickResult.innerHTML = '<span style="color: var(--error);">Please enter a valid USD amount</span>';
            }
        });
        
        // Also convert on Enter key
        quickUsdInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                convertBtn.click();
            }
        });
    }
    
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Check wallet connection
            if (!window.walletModule || !window.walletModule.getWalletState().isConnected) {
                window.walletModule.openWalletModal();
                showToast('Please connect your wallet to post a job', 'info');
                return;
            }
            
            // Get form values
            const title = document.getElementById('jobTitle').value;
            const description = document.getElementById('jobDescription').value;
            const category = document.getElementById('jobCategory').value;
            const budget = document.getElementById('jobBudget').value;
            const duration = document.getElementById('jobDuration').value;
            
            // Validate
            if (!title || !description || !category || !budget || !duration) {
                showToast('Please fill in all required fields', 'error');
                return;
            }
            
            // Show success
            showToast('Job posted successfully!', 'success');
            
            // Reset form
            form.reset();
            
            // Reset conversion display
            if (budgetConversion) {
                budgetConversion.innerHTML = '<span style="font-weight: 600; color: var(--secondary-color);">$0.00 USD</span> = <span style="font-weight: 600;">0.00000000 PI</span>';
            }
            
            // Redirect after delay
            setTimeout(() => {
                window.location.href = 'jobs.html';
            }, 2000);
        });
    }
}

// Smooth scroll for anchor links
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Add loading class to buttons
function initButtonLoaders() {
    document.querySelectorAll('.btn').forEach(btn => {
        btn.addEventListener('click', function() {
            if (this.dataset.loading === 'true') {
                return;
            }
        });
    });
}

// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize components
    initHeader();
    initFooter();
    initWalletModal();
    
    // Initialize wallet
    if (window.walletModule) {
        window.walletModule.initWallet();
    }
    
    // Initialize payment system
    if (window.paymentModule) {
        window.paymentModule.initPaymentSystem();
    }
    
    // Initialize page-specific features
    initPage();
    
    // Initialize smooth scroll
    initSmoothScroll();
    
    // Add fade-in animation to main content
    const main = document.querySelector('main');
    if (main) {
        main.classList.add('fade-in');
    }
});

// Export main functions
window.mainModule = {
    showToast: showToast,
    initHeader: initHeader,
    initFooter: initFooter,
    initWalletModal: initWalletModal,
    initPage: initPage
};
