(function () {
  const app = window.SMAJStore;

  if (!app) {
    return;
  }

  function getProducts() {
    return app.getAllProducts();
  }

  function setSessionState() {
    const chip = document.getElementById("storeSessionChip");
    const banner = document.getElementById("storeSessionMessage");
    const session = app.getSession();

    if (chip) {
      chip.textContent = session.connected
        ? "Connected: " + app.shortenWallet(session.walletAddress)
        : "Preview Session: " + app.shortenWallet(session.walletAddress);
    }

    if (banner) {
      banner.textContent = session.connected
        ? "Connected through SMAJ PI HUB as " + session.username + ". No second login is required to use SMAJ STORE."
        : "No active SMAJ PI HUB wallet session was found, so this module is in preview mode. The frontend still follows the single-login ecosystem model.";
    }
  }

  function getVendorMarkup(product) {
    const vendor = app.getVendorById(product.vendorId);
    if (!vendor) {
      return "<span><i class='bx bx-store'></i> Ecosystem seller</span>";
    }
    return "<a class='inline-link' href='vendor.html?id=" + encodeURIComponent(vendor.id) + "'><i class='bx bx-store'></i> " + vendor.name + "</a>";
  }

  function productCard(product) {
    const wishlisted = app.isWishlisted(product.id);
    return [
      "<article class='product-card'>",
      "  <div class='product-card-media'><img src='" + product.image + "' alt='" + product.name + "'></div>",
      "  <div class='product-card-body'>",
      "    <span class='product-tag'>" + product.category + "</span>",
      "    <h3>" + product.name + "</h3>",
      "    <p>" + product.description + "</p>",
      "    <div class='product-meta-row'>",
      "      " + getVendorMarkup(product),
      product.verified ? "      <span><i class='bx bx-badge-check'></i> Verified seller</span>" : "      <span><i class='bx bx-time-five'></i> Pending verification</span>",
      "    </div>",
      "    <div class='product-price'>" + app.formatPi(product.pricePi) + "</div>",
      "    <div class='product-actions'>",
      "      <a class='btn-secondary' href='product.html?id=" + encodeURIComponent(product.id) + "'>View Product</a>",
      "      <button class='btn-primary' type='button' data-add-to-cart='" + product.id + "'>Add To Cart</button>",
      "      <button class='btn-secondary' type='button' data-toggle-wishlist='" + product.id + "'>" + (wishlisted ? "Remove Saved" : "Save Item") + "</button>",
      "    </div>",
      "  </div>",
      "</article>"
    ].join("");
  }

  function renderCategories() {
    const grid = document.getElementById("featuredCategoryGrid");
    if (!grid) {
      return;
    }

    grid.innerHTML = app.categories.map((category) => [
      "<article class='category-card'>",
      "  <span class='eyebrow'>Category</span>",
      "  <h3>" + category + "</h3>",
      "  <p>Browse " + category.toLowerCase() + " listings connected to the unified SMAJ STORE flow.</p>",
      "  <a class='btn-secondary' href='category.html?category=" + encodeURIComponent(category) + "'>Open Category</a>",
      "</article>"
    ].join("")).join("");
  }

  function renderFeaturedProducts() {
    const grid = document.getElementById("featuredProductsGrid");
    if (!grid) {
      return;
    }

    grid.innerHTML = getProducts().slice(0, 6).map(productCard).join("");
  }

  function renderCategoryPage() {
    const grid = document.getElementById("categoryProductsGrid");
    if (!grid) {
      return;
    }

    const url = new URL(window.location.href);
    const activeCategory = url.searchParams.get("category") || "All";
    const filterWrap = document.getElementById("storeCategoryFilters");

    if (filterWrap) {
      filterWrap.innerHTML = ["All"].concat(app.categories).map((category) => (
        "<button type='button' class='filter-chip " + (category === activeCategory ? "active" : "") + "' data-category-filter='" + category + "'>" + category + "</button>"
      )).join("");

      filterWrap.querySelectorAll("[data-category-filter]").forEach((button) => {
        button.addEventListener("click", () => {
          const nextUrl = new URL(window.location.href);
          const target = button.dataset.categoryFilter;
          if (target === "All") {
            nextUrl.searchParams.delete("category");
          } else {
            nextUrl.searchParams.set("category", target);
          }
          window.location.href = nextUrl.toString();
        });
      });
    }

    const render = (searchText) => {
      const query = String(searchText || "").trim().toLowerCase();
      const products = getProducts().filter((product) => {
        const categoryMatch = activeCategory === "All" || product.category === activeCategory;
        const searchMatch = !query || (product.name + " " + product.description + " " + product.seller).toLowerCase().includes(query);
        return categoryMatch && searchMatch;
      });

      grid.innerHTML = products.length
        ? products.map(productCard).join("")
        : "<article class='empty-state'><i class='bx bx-search-alt'></i><h2>No products found.</h2><p>Try another category or search keyword.</p></article>";

      bindStoreActions();
    };

    const searchInput = document.getElementById("storeSearchInput");
    if (searchInput) {
      searchInput.addEventListener("input", () => render(searchInput.value));
    }
    render("");
  }

  function renderProductPage() {
    const wrap = document.getElementById("productDetailWrap");
    if (!wrap) {
      return;
    }

    const product = app.getCurrentProduct();
    const vendor = app.getVendorById(product.vendorId);
    const wishlisted = app.isWishlisted(product.id);

    wrap.innerHTML = [
      "<div class='product-detail-layout'>",
      "  <article class='product-detail-card'>",
      "    <div class='product-visual'><img src='" + product.image + "' alt='" + product.name + "'></div>",
      "  </article>",
      "  <div class='product-copy'>",
      "    <span class='product-tag'>" + product.category + "</span>",
      "    <h1>" + product.name + "</h1>",
      "    <div class='product-price'>" + app.formatPi(product.pricePi) + "</div>",
      "    <p>" + product.description + "</p>",
      "    <div class='product-meta-row'>",
      "      <span><i class='bx bx-package'></i> Stock: " + product.stock + "</span>",
      "      <span><i class='bx bx-shield-quarter'></i> " + (product.verified ? "Verified listing" : "Verification in review") + "</span>",
      "    </div>",
      "    <div class='product-actions'>",
      "      <button class='btn-primary' type='button' data-add-to-cart='" + product.id + "'>Add To Cart</button>",
      "      <button class='btn-secondary' type='button' data-toggle-wishlist='" + product.id + "'>" + (wishlisted ? "Remove Saved" : "Save Item") + "</button>",
      "      <a class='btn-secondary' href='cart.html'>Go To Cart</a>",
      "    </div>",
      "    <article class='seller-card'>",
      "      <span class='eyebrow'>Seller</span>",
      "      <h3>" + (vendor ? vendor.name : product.seller) + "</h3>",
      "      <p>" + (vendor ? vendor.description : "Ecosystem marketplace seller.") + "</p>",
      "      <div class='product-meta-row'>",
      "        <span><i class='bx bx-star'></i> Rating: " + (vendor ? vendor.rating : "4.5") + "</span>",
      "        <span><i class='bx bx-map'></i> " + (vendor ? vendor.coverage : "Marketplace delivery") + "</span>",
      "      </div>",
      vendor ? "      <a class='inline-link' href='vendor.html?id=" + encodeURIComponent(vendor.id) + "'>Open vendor storefront</a>" : "",
      "    </article>",
      "  </div>",
      "</div>"
    ].join("");
  }

  function renderOrdersPage() {
    const wrap = document.getElementById("ordersList");
    if (!wrap) {
      return;
    }

    const orders = app.getOrders();
    wrap.innerHTML = orders.length
      ? orders.map((order) => [
          "<article class='order-card'>",
          "  <div class='summary-row'>",
          "    <div class='status-row'><span class='status-pill " + order.statusClass + "'>" + order.status + "</span></div>",
          "    <strong>" + order.id + "</strong>",
          "  </div>",
          "  <h3>" + order.items.length + " item(s) ordered</h3>",
          "  <p>Placed on " + order.date + ". Total: " + app.formatPi(order.totalPi) + "</p>",
          "  <div class='order-line-items'>" + order.items.map((item) => "<span>" + item.title + " x" + item.quantity + "</span>").join("") + "</div>",
          "  <div class='product-actions'>",
          "    <a class='btn-secondary' href='category.html'>Order Again</a>",
          "    <a class='btn-secondary' href='../pages/dashboard/client.html'>Open Dashboard</a>",
          "  </div>",
          "</article>"
        ].join(""))
      : "<article class='empty-state'><i class='bx bx-package'></i><h2>No orders yet.</h2><p>Orders placed through SMAJ STORE will appear here.</p><a class='btn-primary' href='category.html'>Browse Products</a></article>";
  }

  function bindStoreActions() {
    document.querySelectorAll("[data-add-to-cart]").forEach((button) => {
      button.onclick = () => {
        app.addToCart(button.dataset.addToCart, 1);
        app.updateCartCount();
      };
    });

    document.querySelectorAll("[data-toggle-wishlist]").forEach((button) => {
      button.onclick = () => {
        app.toggleWishlist(button.dataset.toggleWishlist);
        app.updateWishlistCount();
        window.location.reload();
      };
    });
  }

  setSessionState();
  renderCategories();
  renderFeaturedProducts();
  renderCategoryPage();
  renderProductPage();
  renderOrdersPage();
  bindStoreActions();
  app.updateCartCount();
  app.updateWishlistCount();
})();
