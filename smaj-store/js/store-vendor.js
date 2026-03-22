(function () {
  const app = window.SMAJStore;

  if (!app) {
    return;
  }

  function productCard(product) {
    return [
      "<article class='product-card'>",
      "  <div class='product-card-media'><img src='" + product.image + "' alt='" + product.name + "'></div>",
      "  <div class='product-card-body'>",
      "    <span class='product-tag'>" + product.category + "</span>",
      "    <h3>" + product.name + "</h3>",
      "    <p>" + product.description + "</p>",
      "    <div class='product-price'>" + app.formatPi(product.pricePi) + "</div>",
      "    <div class='product-actions'>",
      "      <a class='btn-secondary' href='product.html?id=" + encodeURIComponent(product.id) + "'>View Product</a>",
      "      <button class='btn-primary' type='button' data-add-to-cart='" + product.id + "'>Add To Cart</button>",
      "    </div>",
      "  </div>",
      "</article>"
    ].join("");
  }

  function bindAddToCart() {
    document.querySelectorAll("[data-add-to-cart]").forEach((button) => {
      button.onclick = () => {
        app.addToCart(button.dataset.addToCart, 1);
        app.updateCartCount();
      };
    });
  }

  function renderWishlist() {
    const wrap = document.getElementById("wishlistGrid");
    if (!wrap) {
      return;
    }

    const items = app.getWishlistItems();
    wrap.innerHTML = items.length
      ? items.map(productCard).join("")
      : "<article class='empty-state'><i class='bx bx-heart'></i><h2>Your wishlist is empty.</h2><p>Save products from the marketplace to review them later.</p><a class='btn-primary' href='category.html'>Browse Products</a></article>";
    bindAddToCart();
  }

  function renderVendorPage() {
    const hero = document.getElementById("vendorHero");
    const grid = document.getElementById("vendorProductsGrid");
    if (!hero || !grid) {
      return;
    }

    const vendor = app.getCurrentVendor();
    const products = app.getProductsByVendor(vendor.id);

    hero.innerHTML = [
      "<div class='vendor-grid'>",
      "  <article class='vendor-panel'>",
      "    <span class='eyebrow'>Vendor Profile</span>",
      "    <h1>" + vendor.name + "</h1>",
      "    <p>" + vendor.description + "</p>",
      "    <div class='product-meta-row'>",
      "      <span><i class='bx bx-badge-check'></i> " + (vendor.verified ? "Verified seller" : "Verification in review") + "</span>",
      "      <span><i class='bx bx-star'></i> Rating: " + vendor.rating + "</span>",
      "      <span><i class='bx bx-world'></i> " + vendor.coverage + "</span>",
      "    </div>",
      "  </article>",
      "  <article class='vendor-panel'>",
      "    <span class='eyebrow'>Storefront</span>",
      "    <h2>Seller trust snapshot</h2>",
      "    <p>Joined " + vendor.joined + ". This vendor page exists to help buyers verify who they are purchasing from before checkout.</p>",
      "    <div class='vendor-actions'>",
      "      <a class='btn-primary' href='category.html'>Browse More Products</a>",
      "      <a class='btn-secondary' href='vendor-dashboard.html'>Open Vendor Dashboard</a>",
      "    </div>",
      "  </article>",
      "</div>"
    ].join("");

    grid.innerHTML = products.length
      ? products.map(productCard).join("")
      : "<article class='empty-state'><i class='bx bx-store-alt'></i><h2>No products yet.</h2><p>This seller has not added products in the current frontend demo.</p></article>";

    bindAddToCart();
  }

  function renderVendorDashboard() {
    const listingsCount = document.getElementById("vendorListingCount");
    const orderCount = document.getElementById("vendorOrderCount");
    const productsWrap = document.getElementById("vendorDashboardProducts");
    if (!productsWrap) {
      return;
    }

    const vendor = app.vendors[0];
    const products = app.getProductsByVendor(vendor.id);
    const orders = app.getOrders();

    if (listingsCount) {
      listingsCount.textContent = String(products.length);
    }

    if (orderCount) {
      orderCount.textContent = String(orders.length);
    }

    productsWrap.innerHTML = products.length
      ? products.map(productCard).join("")
      : "<article class='empty-state'><i class='bx bx-package'></i><h2>No listings yet.</h2><p>Add a product to start building the vendor storefront.</p></article>";

    bindAddToCart();
  }

  function bindAddProductForm() {
    const form = document.getElementById("addProductForm");
    if (!form) {
      return;
    }

    form.addEventListener("submit", (event) => {
      event.preventDefault();

      const name = document.getElementById("productName").value.trim();
      const category = document.getElementById("productCategory").value;
      const price = Number(document.getElementById("productPrice").value);
      const stock = Number(document.getElementById("productStock").value);
      const description = document.getElementById("productDescription").value.trim();
      const image = document.getElementById("productImage").value.trim();

      app.addProduct({
        id: "custom-" + Date.now(),
        vendorId: "vendor-1",
        name: name,
        category: category,
        pricePi: price,
        stock: stock,
        seller: "Verified Hub Gadgets",
        verified: true,
        description: description,
        image: image
      });

      window.location.href = "vendor-dashboard.html";
    });
  }

  renderWishlist();
  renderVendorPage();
  renderVendorDashboard();
  bindAddProductForm();
  app.updateCartCount();
  app.updateWishlistCount();
})();
