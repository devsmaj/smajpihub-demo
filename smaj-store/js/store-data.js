(function () {
  const VENDORS = [
    {
      id: "vendor-1",
      name: "Verified Hub Gadgets",
      verified: true,
      rating: 4.9,
      joined: "January 2026",
      coverage: "Global shipping",
      description: "Consumer electronics storefront focused on verified products inside the SMAJ ecosystem."
    },
    {
      id: "vendor-2",
      name: "Urban Carry Co.",
      verified: true,
      rating: 4.7,
      joined: "February 2026",
      coverage: "Regional shipping",
      description: "Travel and daily carry products built for marketplace delivery and verified order handling."
    },
    {
      id: "vendor-3",
      name: "SMAJ Agro Supply",
      verified: true,
      rating: 4.8,
      joined: "February 2026",
      coverage: "Domestic delivery",
      description: "Agro seller connecting direct goods from producers to ecosystem buyers."
    },
    {
      id: "vendor-4",
      name: "Focus Workspace",
      verified: false,
      rating: 4.3,
      joined: "March 2026",
      coverage: "Domestic delivery",
      description: "Workspace accessories and practical office items for daily productivity."
    }
  ];

  const STORE_PRODUCTS = [
    {
      id: "store-1",
      vendorId: "vendor-1",
      name: "SMAJ Smart Watch",
      category: "Electronics",
      pricePi: 42,
      stock: 18,
      seller: "Verified Hub Gadgets",
      verified: true,
      description: "Compact smartwatch with health tracking, notifications, and battery-efficient design.",
      image: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=900&q=80"
    },
    {
      id: "store-2",
      vendorId: "vendor-2",
      name: "Pi Traveler Backpack",
      category: "Fashion",
      pricePi: 18,
      stock: 34,
      seller: "Urban Carry Co.",
      verified: true,
      description: "Water-resistant backpack built for daily commuting, travel, and lightweight storage.",
      image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80"
    },
    {
      id: "store-3",
      vendorId: "vendor-3",
      name: "Organic Honey Pack",
      category: "Agro",
      pricePi: 12,
      stock: 44,
      seller: "SMAJ Agro Supply",
      verified: true,
      description: "Farm-sourced honey pack prepared for direct-to-buyer ecosystem delivery.",
      image: "https://images.unsplash.com/photo-1587049352851-8d4e89133924?auto=format&fit=crop&w=900&q=80"
    },
    {
      id: "store-4",
      vendorId: "vendor-1",
      name: "Home Light Kit",
      category: "Home",
      pricePi: 23,
      stock: 12,
      seller: "Verified Hub Gadgets",
      verified: true,
      description: "Energy-saving smart light kit with a simple setup for living spaces.",
      image: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=900&q=80"
    },
    {
      id: "store-5",
      vendorId: "vendor-1",
      name: "Wireless Earbuds",
      category: "Electronics",
      pricePi: 27,
      stock: 29,
      seller: "Verified Hub Gadgets",
      verified: true,
      description: "Noise-reduced wireless earbuds for work, study, and mobile use.",
      image: "https://images.unsplash.com/photo-1588423771073-b8903fbb85b5?auto=format&fit=crop&w=900&q=80"
    },
    {
      id: "store-6",
      vendorId: "vendor-4",
      name: "Desk Organizer Set",
      category: "Office",
      pricePi: 9,
      stock: 51,
      seller: "Focus Workspace",
      verified: false,
      description: "Minimal organizer kit for a cleaner desk setup and better daily workflow.",
      image: "https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=900&q=80"
    }
  ];

  const STORE_CATEGORIES = ["Electronics", "Fashion", "Agro", "Home", "Office"];
  const CART_KEY = "smaj_store_cart";
  const ORDERS_KEY = "smaj_store_orders";
  const WISHLIST_KEY = "smaj_store_wishlist";
  const CUSTOM_PRODUCTS_KEY = "smaj_store_custom_products";

  function getSession() {
    let username = "Pioneer";
    let email = "pioneer@smajhub.com";
    let walletAddress = localStorage.getItem("pi_wallet_address") || "";
    let connected = false;

    try {
      const raw = localStorage.getItem("pi_user");
      if (raw) {
        const user = JSON.parse(raw);
        username = user.username || user.name || username;
        email = user.email || email;
        walletAddress = walletAddress || user.walletAddress || user.wallet_address || user.address || "";
        connected = true;
      }
    } catch (_) {
      connected = !!walletAddress;
    }

    if (!walletAddress) {
      walletAddress = "MDA4...SMAJ";
    }

    return { username, email, walletAddress, connected };
  }

  function shortenWallet(value) {
    const wallet = String(value || "");
    if (!wallet) return "Not Connected";
    if (wallet.length <= 12) return wallet;
    return wallet.slice(0, 4) + "..." + wallet.slice(-4);
  }

  function formatPi(value) {
    return Number(value).toFixed(2) + " Pi";
  }

  function getCustomProducts() {
    try {
      return JSON.parse(localStorage.getItem(CUSTOM_PRODUCTS_KEY) || "[]");
    } catch (_) {
      return [];
    }
  }

  function getAllProducts() {
    return STORE_PRODUCTS.concat(getCustomProducts());
  }

  function getProductById(productId) {
    return getAllProducts().find((product) => product.id === productId);
  }

  function getCurrentProduct() {
    const url = new URL(window.location.href);
    return getProductById(url.searchParams.get("id")) || getAllProducts()[0];
  }

  function getVendorById(vendorId) {
    return VENDORS.find((vendor) => vendor.id === vendorId);
  }

  function getCurrentVendor() {
    const url = new URL(window.location.href);
    return getVendorById(url.searchParams.get("id")) || VENDORS[0];
  }

  function getProductsByVendor(vendorId) {
    return getAllProducts().filter((product) => product.vendorId === vendorId);
  }

  function getCartRaw() {
    try {
      return JSON.parse(localStorage.getItem(CART_KEY) || "[]");
    } catch (_) {
      return [];
    }
  }

  function saveCartRaw(items) {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
  }

  function addToCart(productId, quantity) {
    const items = getCartRaw();
    const existing = items.find((item) => item.productId === productId);
    if (existing) {
      existing.quantity += quantity;
    } else {
      items.push({ productId, quantity });
    }
    saveCartRaw(items);
    window.alert("Added to cart.");
  }

  function getCartItems() {
    return getCartRaw().map((entry) => {
      const product = getProductById(entry.productId);
      return product ? Object.assign({}, product, { quantity: entry.quantity }) : null;
    }).filter(Boolean);
  }

  function updateCartCount() {
    const count = getCartItems().reduce((sum, item) => sum + item.quantity, 0);
    document.querySelectorAll("#storeCartCount").forEach((node) => {
      node.textContent = String(count);
    });
  }

  function changeCartQty(productId, delta) {
    const items = getCartRaw();
    const target = items.find((item) => item.productId === productId);
    if (!target) {
      return;
    }

    target.quantity += delta;
    if (target.quantity <= 0) {
      saveCartRaw(items.filter((item) => item.productId !== productId));
      return;
    }
    saveCartRaw(items);
  }

  function removeFromCart(productId) {
    saveCartRaw(getCartRaw().filter((item) => item.productId !== productId));
  }

  function clearCart() {
    localStorage.removeItem(CART_KEY);
  }

  function getCartTotals() {
    const items = getCartItems();
    const subtotal = items.reduce((sum, item) => sum + item.pricePi * item.quantity, 0);
    const delivery = items.length ? 4 : 0;
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
    return { subtotal, delivery, total: subtotal + delivery, itemCount };
  }

  function getOrders() {
    try {
      return JSON.parse(localStorage.getItem(ORDERS_KEY) || "[]");
    } catch (_) {
      return [];
    }
  }

  function saveOrder(order) {
    const orders = getOrders();
    orders.unshift(order);
    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
  }

  function getWishlistIds() {
    try {
      return JSON.parse(localStorage.getItem(WISHLIST_KEY) || "[]");
    } catch (_) {
      return [];
    }
  }

  function saveWishlistIds(ids) {
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(ids));
  }

  function isWishlisted(productId) {
    return getWishlistIds().includes(productId);
  }

  function toggleWishlist(productId) {
    const ids = getWishlistIds();
    if (ids.includes(productId)) {
      saveWishlistIds(ids.filter((id) => id !== productId));
      return false;
    }
    ids.push(productId);
    saveWishlistIds(ids);
    return true;
  }

  function getWishlistItems() {
    return getWishlistIds().map((id) => getProductById(id)).filter(Boolean);
  }

  function updateWishlistCount() {
    const count = getWishlistIds().length;
    document.querySelectorAll("#storeWishlistCount").forEach((node) => {
      node.textContent = String(count);
    });
  }

  function addProduct(product) {
    const items = getCustomProducts();
    items.unshift(product);
    localStorage.setItem(CUSTOM_PRODUCTS_KEY, JSON.stringify(items));
  }

  window.SMAJStore = {
    products: getAllProducts(),
    categories: STORE_CATEGORIES,
    vendors: VENDORS,
    getAllProducts,
    getSession,
    shortenWallet,
    formatPi,
    getProductById,
    getCurrentProduct,
    getVendorById,
    getCurrentVendor,
    getProductsByVendor,
    addToCart,
    getCartItems,
    updateCartCount,
    changeCartQty,
    removeFromCart,
    clearCart,
    getCartTotals,
    getOrders,
    saveOrder,
    isWishlisted,
    toggleWishlist,
    getWishlistItems,
    updateWishlistCount,
    addProduct
  };
})();
