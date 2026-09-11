/* =========================================================
  FasalBazaar — Buyer Marketplace Logic
   Product catalogue is what a Hub's AI-generated listings
   would look like (auto-created from farmer intake records).
   ========================================================= */

const CATEGORIES = ["All", "Vegetables", "Fruits", "Grains & Pulses", "Dairy & Others"];

const PRODUCTS = [
  { id: 1, name: "Tamatar (Tomato)", category: "Vegetables", price: 22, mrp: 30, unit: "kg", img: "🍅",
    hub: "Dewas Hub, MP", farmers: 14, rating: 4.3, stock: 340, freshDays: 1, assured: true },
  { id: 2, name: "Aloo (Potato)", category: "Vegetables", price: 18, mrp: 24, unit: "kg", img: "🥔",
    hub: "Indore Hub, MP", farmers: 22, rating: 4.5, stock: 620, freshDays: 6, assured: true },
  { id: 3, name: "Pyaz (Onion)", category: "Vegetables", price: 26, mrp: 34, unit: "kg", img: "assets/onion.png",
    hub: "Nashik Hub, MH", farmers: 31, rating: 4.4, stock: 480, freshDays: 10, assured: true },
  { id: 4, name: "Hari Mirch (Green Chilli)", category: "Vegetables", price: 40, mrp: 55, unit: "kg", img: "assets/michi.png",
    hub: "Dewas Hub, MP", farmers: 9, rating: 4.1, stock: 90, freshDays: 1, assured: false },
  { id: 5, name: "Palak (Spinach)", category: "Vegetables", price: 15, mrp: 20, unit: "bunch", img: "🥬",
    hub: "Ujjain Hub, MP", farmers: 6, rating: 4.0, stock: 45, freshDays: 1, assured: false },
  { id: 6, name: "Gajar (Carrot)", category: "Vegetables", price: 28, mrp: 35, unit: "kg", img: "assets/gajar.png",
    hub: "Indore Hub, MP", farmers: 11, rating: 4.2, stock: 210, freshDays: 4, assured: true },
  { id: 7, name: "Kela (Banana)", category: "Fruits", price: 45, mrp: 55, unit: "dozen", img: "assets/banana.png",
    hub: "Barwani Hub, MP", farmers: 8, rating: 4.6, stock: 150, freshDays: 3, assured: true },
  { id: 8, name: "Aam (Mango — Kesar)", category: "Fruits", price: 90, mrp: 120, unit: "kg", img: "🥭",
    hub: "Ratlam Hub, MP", farmers: 17, rating: 4.7, stock: 260, freshDays: 4, assured: true },
  { id: 9, name: "Anar (Pomegranate)", category: "Fruits", price: 110, mrp: 140, unit: "kg", img: "🍎",
    hub: "Nashik Hub, MH", farmers: 12, rating: 4.5, stock: 130, freshDays: 8, assured: true },
  { id: 10, name: "Santra (Orange)", category: "Fruits", price: 60, mrp: 80, unit: "kg", img: "🍊",
    hub: "Nagpur Hub, MH", farmers: 19, rating: 4.4, stock: 300, freshDays: 6, assured: false },
  { id: 11, name: "Gehu (Wheat)", category: "Grains & Pulses", price: 26, mrp: 30, unit: "kg", img: "🌾",
    hub: "Ujjain Hub, MP", farmers: 44, rating: 4.6, stock: 2400, freshDays: 60, assured: true },
  { id: 12, name: "Chawal (Basmati Rice)", category: "Grains & Pulses", price: 68, mrp: 85, unit: "kg", img: "🍚",
    hub: "Karnal Hub, HR", farmers: 27, rating: 4.7, stock: 1800, freshDays: 90, assured: true },
  { id: 13, name: "Arhar Dal (Toor Dal)", category: "Grains & Pulses", price: 130, mrp: 155, unit: "kg", img: "🫘",
    hub: "Indore Hub, MP", farmers: 20, rating: 4.5, stock: 700, freshDays: 120, assured: true },
  { id: 14, name: "Makka (Maize)", category: "Grains & Pulses", price: 20, mrp: 24, unit: "kg", img: "🌽",
    hub: "Dewas Hub, MP", farmers: 33, rating: 4.2, stock: 1500, freshDays: 60, assured: false },
  { id: 15, name: "Doodh (Farm Milk)", category: "Dairy & Others", price: 55, mrp: 60, unit: "litre", img: "🥛",
    hub: "Anand Hub, GJ", farmers: 25, rating: 4.8, stock: 220, freshDays: 1, assured: true },
  { id: 16, name: "Shahad (Raw Honey)", category: "Dairy & Others", price: 320, mrp: 400, unit: "500g", img: "🍯",
    hub: "Mandla Hub, MP", farmers: 5, rating: 4.6, stock: 60, freshDays: 365, assured: true },
];

// ---------------------------------------------------------
// State
// ---------------------------------------------------------
let state = {
  query: "",
  category: "All",
  sort: "relevance",
  cart: {},        // { productId: qty }
};

// ---------------------------------------------------------
// Helpers
// ---------------------------------------------------------
const rupee = (n) => `₹${n.toLocaleString("en-IN")}`;

function renderProductImage(product) {
  const isAsset = product.img.startsWith("assets/");
  if (isAsset) {
    return `<img src="${product.img}" alt="${product.name}" loading="lazy" class="product-photo">`;
  }
  return `<span class="product-emoji" aria-hidden="true">${product.img}</span>`;
}

function getFiltered() {
  let list = PRODUCTS.filter((p) => {
    const matchesQuery = p.name.toLowerCase().includes(state.query.toLowerCase());
    const matchesCategory = state.category === "All" || p.category === state.category;
    return matchesQuery && matchesCategory;
  });

  if (state.sort === "price-low") list = [...list].sort((a, b) => a.price - b.price);
  if (state.sort === "price-high") list = [...list].sort((a, b) => b.price - a.price);
  if (state.sort === "fresh") list = [...list].sort((a, b) => a.freshDays - b.freshDays);

  return list;
}

function cartCount() {
  return Object.values(state.cart).reduce((sum, qty) => sum + qty, 0);
}

function cartSubtotal() {
  return Object.entries(state.cart).reduce((sum, [id, qty]) => {
    const p = PRODUCTS.find((x) => x.id === Number(id));
    return sum + (p ? p.price * qty : 0);
  }, 0);
}

// ---------------------------------------------------------
// Rendering: Category strip
// ---------------------------------------------------------
function renderCategories() {
  const strip = document.getElementById("categoryStrip");
  strip.innerHTML = CATEGORIES.map(
    (c) => `<button class="category-chip ${c === state.category ? "active" : ""}" data-cat="${c}">${c}</button>`
  ).join("");

  strip.querySelectorAll(".category-chip").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.category = btn.dataset.cat;
      renderCategories();
      renderGrid();
    });
  });
}

// ---------------------------------------------------------
// Rendering: Product grid
// ---------------------------------------------------------
function renderGrid() {
  const grid = document.getElementById("productGrid");
  const emptyState = document.getElementById("emptyState");
  const resultsCount = document.getElementById("resultsCount");
  const list = getFiltered();

  resultsCount.textContent =
    state.query || state.category !== "All"
      ? `${list.length} result${list.length !== 1 ? "s" : ""} found`
      : "Showing all upaj";

  if (list.length === 0) {
    grid.innerHTML = "";
    emptyState.hidden = false;
    return;
  }
  emptyState.hidden = true;

  grid.innerHTML = list
    .map((p) => {
      const discount = Math.round(((p.mrp - p.price) / p.mrp) * 100);
      const inCart = !!state.cart[p.id];
      const lowStock = p.stock < 100;
      return `
      <div class="product-card" data-id="${p.id}">
        <div class="product-badges">
          ${p.assured ? '<span class="badge badge-assured">Hub Assured</span>' : ""}
          ${p.freshDays <= 2 ? '<span class="badge badge-fresh">Fresh Today</span>' : ""}
        </div>
        <div class="product-img">${renderProductImage(p)}</div>
        <div class="product-name">${p.name}</div>
        <div class="product-sub">${p.hub} · ${p.farmers} farmers</div>
        <div class="product-rating">${p.rating.toFixed(1)} ★</div>
        <div class="price-row">
          <span class="price-now">${rupee(p.price)}/${p.unit}</span>
          <span class="price-was">${rupee(p.mrp)}</span>
          <span class="price-off">${discount}% off</span>
        </div>
        <div class="stock-note ${lowStock ? "low" : ""}">${lowStock ? `Only ${p.stock}${p.unit} left in hub` : `${p.stock}${p.unit} available`}</div>
        <button class="add-cart-btn ${inCart ? "in-cart" : ""}" data-add="${p.id}">
          ${inCart ? `IN CART (${state.cart[p.id]})` : "ADD TO CART"}
        </button>
      </div>`;
    })
    .join("");

  grid.querySelectorAll(".product-card").forEach((card) => {
    card.addEventListener("click", (e) => {
      if (e.target.closest(".add-cart-btn")) return;
      openModal(Number(card.dataset.id));
    });
  });

  grid.querySelectorAll("[data-add]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      addToCart(Number(btn.dataset.add), 1);
      renderGrid();
    });
  });
}

// ---------------------------------------------------------
// Product quick-view modal
// ---------------------------------------------------------
let modalQty = 1;

function openModal(id) {
  const p = PRODUCTS.find((x) => x.id === id);
  modalQty = state.cart[id] || 1;
  const overlay = document.getElementById("modalOverlay");
  const modal = document.getElementById("productModal");

  const discount = Math.round(((p.mrp - p.price) / p.mrp) * 100);

  modal.innerHTML = `
    <button class="modal-close" id="modalClose">&times;</button>
    <div class="modal-img">${renderProductImage(p)}</div>
    <div class="modal-title">${p.name}</div>
    <div class="modal-source">Sourced from ${p.hub} · ${p.farmers} farmers · ${p.rating.toFixed(1)} ★</div>
    <div class="modal-price-row">
      <span class="modal-price-now">${rupee(p.price)}/${p.unit}</span>
      <span class="price-was">${rupee(p.mrp)}</span>
      <span class="price-off">${discount}% off</span>
    </div>
    <div class="modal-info-grid">
      <div><span>Category</span>${p.category}</div>
      <div><span>Assured Grade</span>${p.assured ? "Grade A" : "Standard"}</div>
      <div><span>Available Stock</span>${p.stock} ${p.unit}</div>
      <div><span>Best Before</span>${p.freshDays} day(s)</div>
    </div>
    <div class="qty-row">
      <span>Quantity (${p.unit})</span>
      <div class="qty-control">
        <button id="qtyMinus">−</button>
        <span id="qtyValue">${modalQty}</span>
        <button id="qtyPlus">+</button>
      </div>
    </div>
    <div class="modal-actions">
      <button class="btn-outline" id="modalAddCart">ADD TO CART</button>
      <button class="btn-solid" id="modalBuyNow">BUY NOW</button>
    </div>
  `;

  overlay.hidden = false;

  document.getElementById("modalClose").onclick = closeModal;
  overlay.onclick = (e) => { if (e.target === overlay) closeModal(); };

  document.getElementById("qtyMinus").onclick = () => {
    modalQty = Math.max(1, modalQty - 1);
    document.getElementById("qtyValue").textContent = modalQty;
  };
  document.getElementById("qtyPlus").onclick = () => {
    modalQty = Math.min(p.stock, modalQty + 1);
    document.getElementById("qtyValue").textContent = modalQty;
  };

  document.getElementById("modalAddCart").onclick = () => {
    addToCart(id, modalQty);
    renderGrid();
    closeModal();
    showToast(`${p.name} added to cart`);
  };

  document.getElementById("modalBuyNow").onclick = () => {
    addToCart(id, modalQty);
    renderGrid();
    closeModal();
    openCart();
  };
}

function closeModal() {
  document.getElementById("modalOverlay").hidden = true;
}

// ---------------------------------------------------------
// Cart logic
// ---------------------------------------------------------
function addToCart(id, qty) {
  state.cart[id] = (state.cart[id] || 0) + qty;
  renderCartCount();
}

function updateCartQty(id, delta) {
  const p = PRODUCTS.find((x) => x.id === id);
  const newQty = (state.cart[id] || 0) + delta;
  if (newQty <= 0) {
    delete state.cart[id];
  } else {
    state.cart[id] = Math.min(newQty, p.stock);
  }
  renderCartCount();
  renderCartDrawer();
  renderGrid();
}

function removeFromCart(id) {
  delete state.cart[id];
  renderCartCount();
  renderCartDrawer();
  renderGrid();
}

function renderCartCount() {
  document.getElementById("cartCount").textContent = cartCount();
}

function renderCartDrawer() {
  const container = document.getElementById("cartItems");
  const entries = Object.entries(state.cart);
  const placeBtn = document.getElementById("placeOrderBtn");

  if (entries.length === 0) {
    container.innerHTML = `<div class="cart-empty">Your cart is empty.<br>Add fresh upaj to get started.</div>`;
    placeBtn.disabled = true;
  } else {
    placeBtn.disabled = false;
    container.innerHTML = entries
      .map(([id, qty]) => {
        const p = PRODUCTS.find((x) => x.id === Number(id));
        return `
        <div class="cart-item">
          <div class="cart-item-img">${renderProductImage(p)}</div>
          <div class="cart-item-info">
            <div class="cart-item-name">${p.name}</div>
            <div class="cart-item-hub">${p.hub}</div>
            <div class="cart-item-row">
              <div class="cart-item-qty">
                <button data-minus="${p.id}">−</button>
                <span>${qty}</span>
                <button data-plus="${p.id}">+</button>
              </div>
              <div class="cart-item-price">${rupee(p.price * qty)}</div>
            </div>
            <div class="remove-btn" data-remove="${p.id}">Remove</div>
          </div>
        </div>`;
      })
      .join("");

    container.querySelectorAll("[data-plus]").forEach((b) => (b.onclick = () => updateCartQty(Number(b.dataset.plus), 1)));
    container.querySelectorAll("[data-minus]").forEach((b) => (b.onclick = () => updateCartQty(Number(b.dataset.minus), -1)));
    container.querySelectorAll("[data-remove]").forEach((b) => (b.onclick = () => removeFromCart(Number(b.dataset.remove))));
  }

  const subtotal = cartSubtotal();
  const delivery = entries.length === 0 ? 0 : subtotal > 500 ? 0 : 40;
  document.getElementById("cartSubtotal").textContent = rupee(subtotal);
  document.getElementById("cartDelivery").textContent = delivery === 0 ? "FREE" : rupee(delivery);
  document.getElementById("cartTotal").textContent = rupee(subtotal + delivery);
}

function openCart() {
  document.getElementById("cartDrawer").classList.add("open");
  document.getElementById("cartOverlay").hidden = false;
  renderCartDrawer();
}

function closeCartFn() {
  document.getElementById("cartDrawer").classList.remove("open");
  document.getElementById("cartOverlay").hidden = true;
}

// ---------------------------------------------------------
// Order placement
// ---------------------------------------------------------
function placeOrder() {
  const orderId = "TM" + Math.floor(100000 + Math.random() * 900000);
  state.cart = {};
  renderCartCount();
  renderCartDrawer();
  renderGrid();
  closeCartFn();
  showToast(`Order ${orderId} placed! Your hub will dispatch it shortly.`);
}

// ---------------------------------------------------------
// Toast
// ---------------------------------------------------------
let toastTimer;
function showToast(msg) {
  const toast = document.getElementById("toast");
  toast.textContent = msg;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 3000);
}

// ---------------------------------------------------------
// Init
// ---------------------------------------------------------
function init() {
  renderCategories();
  renderGrid();

  
  
  document.getElementById("searchInput").addEventListener("input", (e) => {
    state.query = e.target.value;
    renderGrid();
  });

  document.getElementById("sortSelect").addEventListener("change", (e) => {
    state.sort = e.target.value;
    renderGrid();
  });

  document.getElementById("cartBtn").addEventListener("click", openCart);
  document.getElementById("closeCart").addEventListener("click", closeCartFn);
  document.getElementById("cartOverlay").addEventListener("click", closeCartFn);
  document.getElementById("placeOrderBtn").addEventListener("click", placeOrder);

  document.getElementById("ordersBtn").addEventListener("click", () => {
    showToast("No past orders yet — place your first one!");
  });
}

document.addEventListener("DOMContentLoaded", init);