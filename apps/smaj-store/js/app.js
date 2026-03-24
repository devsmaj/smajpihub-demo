// SMAJ STORE - Main Application
// Part of SMAJ Ecosystem

// ============================================
// PI HUB Integration - One Login All Access
// ============================================

const PI_HUB_URL = 'https://officialsmaj.github.io/smajpihub/';
const SESSION_KEY = 'smaj_pihub_session';
const LEGACY_SESSION_KEY = 'smaj_ecosystem_session';

function safeParseSession(rawSession) {
    if (!rawSession) return null;
    try {
        return JSON.parse(rawSession);
    } catch (error) {
        return null;
    }
}

function normalizeSession(sessionData) {
    if (!sessionData || typeof sessionData !== 'object') {
        return null;
    }

    const walletAddress =
        sessionData.walletAddress ||
        sessionData.address ||
        sessionData.wallet?.address ||
        sessionData.user?.walletAddress ||
        sessionData.user?.address ||
        '';

    const displayName =
        sessionData.displayName ||
        sessionData.fullName ||
        sessionData.username ||
        sessionData.name ||
        sessionData.user?.displayName ||
        sessionData.user?.fullName ||
        sessionData.user?.username ||
        sessionData.user?.name ||
        '';

    const balanceValue =
        sessionData.balance ??
        sessionData.walletBalance ??
        sessionData.wallet?.balance ??
        sessionData.user?.balance ??
        '0.00';

    return {
        ...sessionData,
        connected: sessionData.connected !== false && Boolean(walletAddress),
        walletAddress,
        displayName,
        balance: typeof balanceValue === 'number' ? balanceValue.toFixed(2) : String(balanceValue)
    };
}

function getEcosystemSession() {
    const sessionSources = [
        localStorage.getItem(SESSION_KEY),
        sessionStorage.getItem(SESSION_KEY),
        localStorage.getItem(LEGACY_SESSION_KEY),
        sessionStorage.getItem(LEGACY_SESSION_KEY)
    ];

    for (const rawSession of sessionSources) {
        const sessionData = normalizeSession(safeParseSession(rawSession));
        if (sessionData && sessionData.connected) {
            return sessionData;
        }
    }

    return null;
}

function getWalletLabel(sessionData) {
    if (!sessionData) {
        return 'PI HUB Account';
    }

    if (sessionData.displayName) {
        return sessionData.displayName;
    }

    if (sessionData.walletAddress) {
        const address = sessionData.walletAddress;
        return address.substring(0, 8) + '...' + address.substring(address.length - 4);
    }

    return 'PI HUB Account';
}

function setWalletText(label) {
    const walletText = document.querySelector('.wallet-text');
    if (!walletText) return;
    walletText.innerHTML = '<i class="fas fa-wallet"></i><span class="wallet-text-label">' + label + '</span>';
}

function resetWalletUI() {
    const walletStatus = document.getElementById('walletStatus');
    const walletInfo = document.getElementById('walletInfo');
    const walletBalance = document.getElementById('walletBalance');
    const walletAddress = document.getElementById('walletAddress');
    const connectBtn = document.querySelector('.connect-btn');

    if (walletStatus) {
        walletStatus.classList.remove('wallet-connected');
    }

    setWalletText('PI HUB Account');

    if (walletInfo) {
        walletInfo.style.display = 'none';
    }

    if (walletBalance) {
        walletBalance.textContent = '0.00 Pi';
    }

    if (walletAddress) {
        walletAddress.textContent = 'No PI HUB session';
    }

    if (connectBtn) {
        connectBtn.textContent = 'Open PI HUB';
        connectBtn.style.display = 'block';
    }
}

// Check for PI HUB session on page load
function checkEcosystemSession() {
    const sessionData = getEcosystemSession();

    if (sessionData) {
        updateWalletUI(sessionData);
        return true;
    }

    resetWalletUI();
    return false;
}

// Update wallet UI based on PI HUB session
function updateWalletUI(sessionData) {
    const walletStatus = document.getElementById('walletStatus');
    const walletInfo = document.getElementById('walletInfo');
    const walletBalance = document.getElementById('walletBalance');
    const walletAddress = document.getElementById('walletAddress');
    const connectBtn = document.querySelector('.connect-btn');
    
    if (walletStatus) {
        walletStatus.classList.add('wallet-connected');
    }
    
    setWalletText(getWalletLabel(sessionData));
    
    if (walletInfo) {
        walletInfo.style.display = 'block';
    }
    
    if (walletBalance) {
        const balanceText = String(sessionData.balance || '0.00');
        walletBalance.textContent = balanceText.includes('Pi') ? balanceText : balanceText + ' Pi';
    }
    
    if (walletAddress && sessionData.walletAddress) {
        const address = sessionData.walletAddress;
        walletAddress.textContent = address.substring(0, 8) + '...' + address.substring(address.length - 6);
    }
    
    if (connectBtn) {
        connectBtn.style.display = 'none';
    }
}

// Connect wallet - Redirect to PI HUB
function connectWallet() {
    // Redirect to PI HUB to connect wallet
    window.location.href = PI_HUB_URL + '?redirect=' + encodeURIComponent(window.location.href);
}

// Disconnect wallet - Return to PI HUB
function disconnectWallet() {
    // Clear local session
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(LEGACY_SESSION_KEY);
    sessionStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem(LEGACY_SESSION_KEY);

    resetWalletUI();
    
    // Redirect to PI HUB
    window.location.href = PI_HUB_URL;
}

// Copy wallet address
function copyAddress() {
    const sessionData = getEcosystemSession();

    if (sessionData && sessionData.walletAddress) {
        navigator.clipboard.writeText(sessionData.walletAddress);
        showNotification('Address copied to clipboard!', 'success');
    }
}

// Return to SMAJ PI HUB
function returnToHub() {
    window.location.href = PI_HUB_URL;
}

// Toggle profile menu
function toggleProfileMenu() {
    const dropdown = document.getElementById('profileDropdown');
    if (dropdown) {
        dropdown.classList.toggle('show');
    }
}

// Logout - Clear session and return to PI HUB
function logout() {
    // Clear all session data
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(LEGACY_SESSION_KEY);
    sessionStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem(LEGACY_SESSION_KEY);
    
    // Clear cart
    clearCart();
    
    // Redirect to PI HUB
    window.location.href = PI_HUB_URL;
}

// ============================================
// Product Rendering
// ============================================

// Render categories
function renderCategories() {
    const container = document.getElementById('categoriesGrid');
    if (!container) return;
    
    container.innerHTML = categories.map(cat => `
        <div class="category-card" onclick="navigateToCategory(${cat.id}, '${cat.name}')">
            <i class="fas ${cat.icon}"></i>
            <span>${cat.name}</span>
            <span class="product-count">${cat.count} items</span>
        </div>
    `).join('');
}

// Render featured products
function renderFeaturedProducts() {
    const container = document.getElementById('featuredGrid');
    if (!container) return;
    
    const featured = getFeaturedProducts();
    container.innerHTML = featured.map(product => createProductCard(product)).join('');
}

// Render trending products
function renderTrendingProducts() {
    const container = document.getElementById('trendingGrid');
    if (!container) return;
    
    const trending = getTrendingProducts();
    container.innerHTML = trending.map(product => createProductCard(product)).join('');
}

// Render recently added products
function renderRecentProducts() {
    const container = document.getElementById('recentGrid');
    if (!container) return;
    
    const recent = getNewProducts();
    container.innerHTML = recent.map(product => createProductCard(product)).join('');
}

// Render vendors
function renderVendors() {
    const container = document.getElementById('vendorsGrid');
    if (!container) return;
    
    container.innerHTML = vendors.map(vendor => `
        <div class="vendor-card">
            <div class="vendor-header">
                <div class="vendor-avatar">${vendor.initials}</div>
                <div class="vendor-info">
                    <h3>${vendor.name} ${vendor.verified ? '<i class="fas fa-check-circle text-success"></i>' : ''}</h3>
                    <div class="vendor-rating">
                        <i class="fas fa-star"></i>
                        <span>${vendor.rating}</span>
                        <span>(${vendor.totalSales} sales)</span>
                    </div>
                </div>
            </div>
            <div class="vendor-stats">
                <div class="vendor-stat">
                    <span>${vendor.products}</span>
                    <small>Products</small>
                </div>
                <div class="vendor-stat">
                    <span>${vendor.responseTime}</span>
                    <small>Response</small>
                </div>
                <div class="vendor-stat">
                    <span>${vendor.totalSales}</span>
                    <small>Sales</small>
                </div>
            </div>
            <div class="vendor-actions">
                <a href="vendor.html?id=${vendor.id}" class="visit-store-btn">Visit Store</a>
            </div>
        </div>
    `).join('');
}

// Create product card HTML
function createProductCard(product) {
    return `
        <div class="product-card">
            <div class="product-image">
                <img src="${product.image}" alt="${product.name}" onerror="this.src='https://via.placeholder.com/400x300?text=Product+Image'">
                <div class="product-badges">
                    ${product.isNew ? '<span class="badge-new">NEW</span>' : ''}
                    ${product.isSale ? '<span class="badge-sale">SALE</span>' : ''}
                </div>
                <div class="product-actions">
                    <button class="product-action-btn" onclick="toggleWishlist(${product.id})" title="Add to Wishlist">
                        <i class="far fa-heart"></i>
                    </button>
                    <button class="product-action-btn" onclick="quickView(${product.id})" title="Quick View">
                        <i class="fas fa-eye"></i>
                    </button>
                </div>
            </div>
            <div class="product-info">
                <div class="product-category">${product.category}</div>
                <h3 class="product-title">
                    <a href="product-detail.html?id=${product.id}">${product.name}</a>
                </h3>
                <div class="product-seller">
                    ${product.seller.verified ? '<span class="verified-badge"><i class="fas fa-check"></i> Verified</span>' : ''}
                    <span class="seller-name">${product.seller.name}</span>
                </div>
                <div class="product-price">
                    <span class="current-price">${product.price.toFixed(2)} Pi</span>
                    ${product.originalPrice ? `<span class="original-price">${product.originalPrice.toFixed(2)} Pi</span>` : ''}
                </div>
                <div class="product-rating">
                    <span class="rating-stars">${getStarRating(product.rating)}</span>
                    <span class="rating-count">(${product.reviews})</span>
                </div>
                <div class="product-footer">
                    <button class="add-to-cart-btn" onclick="addToCartFromCard(${product.id})">
                        <i class="fas fa-shopping-cart"></i> Add to Cart
                    </button>
                </div>
            </div>
        </div>
    `;
}

// Get star rating HTML
function getStarRating(rating) {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    let stars = '';
    
    for (let i = 0; i < fullStars; i++) {
        stars += '<i class="fas fa-star"></i>';
    }
    if (halfStar) {
        stars += '<i class="fas fa-star-half-alt"></i>';
    }
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
    for (let i = 0; i < emptyStars; i++) {
        stars += '<i class="far fa-star"></i>';
    }
    
    return stars;
}

// Add to cart from product card
function addToCartFromCard(productId) {
    const product = products.find(p => p.id === productId);
    if (product) {
        addToCart(product);
    }
}

// Toggle wishlist
function toggleWishlist(productId) {
    let wishlist = JSON.parse(localStorage.getItem('smaj_wishlist') || '[]');
    const product = products.find(p => p.id === productId);
    
    if (!product) return;
    
    const existingIndex = wishlist.findIndex(item => item.id === productId);
    
    if (existingIndex >= 0) {
        wishlist.splice(existingIndex, 1);
        showNotification('Removed from wishlist', 'info');
    } else {
        wishlist.push(product);
        showNotification('Added to wishlist!', 'success');
    }
    
    localStorage.setItem('smaj_wishlist', JSON.stringify(wishlist));
}

// Quick view
function quickView(productId) {
    showNotification('Quick view coming soon!', 'info');
}

// Navigate to category
function navigateToCategory(categoryId, categoryName) {
    window.location.href = 'listing.html?category=' + categoryId + '&name=' + encodeURIComponent(categoryName);
}

// Search functionality
function handleSearch(event) {
    if (event.key === 'Enter') {
        const query = document.getElementById('searchInput').value;
        if (query.trim()) {
            window.location.href = 'listing.html?search=' + encodeURIComponent(query);
        }
    }
}

// ============================================
// Notification System
// ============================================

function showNotification(message, type) {
    type = type || 'success';
    
    // Remove existing notifications
    const existing = document.querySelector('.smaj-notification');
    if (existing) existing.remove();
    
    const notification = document.createElement('div');
    notification.className = 'smaj-notification notification-' + type;
    
    let icon = 'check-circle';
    if (type === 'warning') icon = 'exclamation-triangle';
    else if (type === 'info') icon = 'info-circle';
    
    notification.innerHTML = '<div class="notification-content"><i class="fas fa-' + icon + '"></i><span>' + message + '</span></div><button onclick="this.parentElement.remove()"><i class="fas fa-times"></i></button>';
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(function() {
        notification.classList.add('show');
    }, 10);
    
    // Auto remove
    setTimeout(function() {
        notification.classList.remove('show');
        setTimeout(function() { notification.remove(); }, 300);
    }, 4000);
}

// ============================================
// Initialize Application
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    // Check for PI HUB session
    checkEcosystemSession();
    
    // Render homepage components
    renderCategories();
    renderFeaturedProducts();
    renderTrendingProducts();
    renderRecentProducts();
    renderVendors();
    
    // Setup search
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('keypress', handleSearch);
    }
    
    // Close profile dropdown when clicking outside
    document.addEventListener('click', function(e) {
        const profile = document.getElementById('userProfile');
        const dropdown = document.getElementById('profileDropdown');
        if (profile && !profile.contains(e.target) && dropdown) {
            dropdown.classList.remove('show');
        }
    });

    window.addEventListener('storage', function(event) {
        if (event.key === SESSION_KEY || event.key === LEGACY_SESSION_KEY) {
            checkEcosystemSession();
        }
    });
});

// Make functions available globally
window.connectWallet = connectWallet;
window.disconnectWallet = disconnectWallet;
window.copyAddress = copyAddress;
window.returnToHub = returnToHub;
window.toggleProfileMenu = toggleProfileMenu;
window.logout = logout;
window.navigateToCategory = navigateToCategory;
window.addToCartFromCard = addToCartFromCard;
window.toggleWishlist = toggleWishlist;
window.quickView = quickView;
window.showNotification = showNotification;
window.getEcosystemSession = getEcosystemSession;

