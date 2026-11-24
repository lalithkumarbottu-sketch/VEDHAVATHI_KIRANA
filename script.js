
/* ==========================================
   VEDHAVATHI KIRANA
   MAIN JAVASCRIPT
========================================== */

// EDIT: Replace with actual WhatsApp number.
// Format: country code + number, without + or spaces.
const BUSINESS_WHATSAPP = "919951057247";

// Catalogue settings
const PAGE_SIZE = 12;

let allProducts = [];
let filteredProducts = [];
let cart = [];

// DOM ELEMENTS
const productGrid = document.getElementById("productGrid");
const searchInput = document.getElementById("searchInput");
const categoryFilter = document.getElementById("categoryFilter");
const brandFilter = document.getElementById("brandFilter");
const productCount = document.getElementById("productCount");
const loadMoreButton = document.getElementById("loadMore");

const cartButton = document.getElementById("cartButton");
const cartPanel = document.getElementById("cartPanel");
const cartOverlay = document.getElementById("cartOverlay");
const closeCartButton = document.getElementById("closeCart");
const cartItemsContainer = document.getElementById("cartItems");
const cartCount = document.getElementById("cartCount");

let displayedCount = 0;


// PRODUCT PLACEHOLDER COLOURS
const productColours = [
    "#e8f3df",
    "#fff3d5",
    "#f5e8d8",
    "#e4f1ed",
    "#f4e6e6",
    "#e9e8f5"
];

const categoryEmojis = {
    "Rice and Flour": "🌾",
    "Dals and Pulses": "🫘",
    "Oils": "🫒",
    "Spices": "🌶️",
    "Sugar and Salt": "🧂",
    "Snacks and Biscuits": "🍪",
    "Beverages": "☕",
    "Household and Cleaning": "🧹",
    "Personal Care": "🧴"
};


// ==========================================
// LOAD PRODUCTS
// ==========================================

async function loadProducts() {

    try {

        const response = await fetch("products.json");

        if (!response.ok) {
            throw new Error("Could not load products.json");
        }

        const data = await response.json();

        if (!Array.isArray(data)) {
            throw new Error("Invalid product data");
        }

        allProducts = data.map((product, index) => ({
            ...product,
            id: index + 1
        }));

        populateFilters();

        applyFilters();

    } catch (error) {

        console.error(error);

        productGrid.innerHTML = `
            <div class="no-products">
                Unable to load catalogue.
                Please check products.json and run the website using Live Server.
            </div>
        `;

        productCount.textContent = "Catalogue unavailable.";

    }

}


// ==========================================
// POPULATE FILTERS
// ==========================================

function populateFilters() {

    const categories = [
        ...new Set(allProducts.map(p => p.category).filter(Boolean))
    ].sort();

    const brands = [
        ...new Set(allProducts.map(p => p.brand).filter(Boolean))
    ].sort();

    categoryFilter.innerHTML =
        '<option value="">All Categories</option>';

    brandFilter.innerHTML =
        '<option value="">All Brands</option>';

    categories.forEach(category => {

        const option = document.createElement("option");

        option.value = category;
        option.textContent = category;

        categoryFilter.appendChild(option);

    });

    brands.forEach(brand => {

        const option = document.createElement("option");

        option.value = brand;
        option.textContent = brand;

        brandFilter.appendChild(option);

    });

}


// ==========================================
// FILTER PRODUCTS
// ==========================================

function applyFilters() {

    const search = searchInput.value.toLowerCase().trim();
    const category = categoryFilter.value;
    const brand = brandFilter.value;

    filteredProducts = allProducts.filter(product => {

        const matchesSearch =
            (product.name || "").toLowerCase().includes(search) ||
            (product.brand || "").toLowerCase().includes(search) ||
            (product.category || "").toLowerCase().includes(search);

        const matchesCategory =
            !category || product.category === category;

        const matchesBrand =
            !brand || product.brand === brand;

        return matchesSearch && matchesCategory && matchesBrand;

    });

    displayedCount = 0;

    renderProducts();

}


// ==========================================
// RENDER PRODUCTS
// ==========================================

function renderProducts() {

    if (displayedCount === 0) {
        productGrid.innerHTML = "";
    }

    if (filteredProducts.length === 0) {

        productGrid.innerHTML = `
            <div class="no-products">
                No products found. Try another search.
            </div>
        `;

        productCount.textContent = "0 products found";
        loadMoreButton.hidden = true;

        return;

    }

    const nextProducts = filteredProducts.slice(
        displayedCount,
        displayedCount + PAGE_SIZE
    );

    nextProducts.forEach((product, index) => {

        const card = document.createElement("article");

        card.className = "product-card";

        const colour =
            productColours[(product.id - 1) % productColours.length];

        const emoji =
            categoryEmojis[product.category] || "🛍️";

        const price = product.price
            ? `₹${product.price}`
            : "Price on request";

        const size = [product.packSize, product.unit]
            .filter(Boolean)
            .join(" ");

        card.innerHTML = `
            <div class="product-image"
                 style="--product-color: ${colour}">
                <span>${emoji}</span>
            </div>

            <div class="product-info">

                <span class="product-brand"></span>

                <h3></h3>

                <p class="product-size"></p>

                <p class="product-price"></p>

                <div class="product-actions">

                    <input
                        type="number"
                        class="product-qty"
                        value="1"
                        min="1"
                        max="9999"
                        aria-label="Quantity"
                    >

                    <button class="add-button">
                        + Add to list
                    </button>

                </div>

            </div>
        `;

        card.querySelector(".product-brand").textContent =
            product.brand || "Unbranded";

        card.querySelector("h3").textContent =
            product.name || "Unnamed Product";

        card.querySelector(".product-size").textContent =
            size || "Size on enquiry";

        card.querySelector(".product-price").textContent =
            price;

        const quantityInput = card.querySelector(".product-qty");

        card.querySelector(".add-button").addEventListener("click", () => {

            const quantity = Number(quantityInput.value);

            if (!Number.isInteger(quantity) || quantity < 1 || quantity > 9999) {
                alert("Please enter a valid quantity.");
                return;
            }

            addToCart(product.id, quantity);

        });

        productGrid.appendChild(card);

    });

    displayedCount += nextProducts.length;

    productCount.textContent =
        `Showing ${displayedCount} of ${filteredProducts.length} products`;

    loadMoreButton.hidden =
        displayedCount >= filteredProducts.length;

}


// ==========================================
// LOAD MORE
// ==========================================

loadMoreButton.addEventListener("click", renderProducts);


// ==========================================
// CATEGORY AND BRAND FILTERS
// ==========================================

searchInput.addEventListener("input", applyFilters);

categoryFilter.addEventListener("change", applyFilters);

brandFilter.addEventListener("change", applyFilters);


document.getElementById("clearFilters").addEventListener("click", () => {

    searchInput.value = "";
    categoryFilter.value = "";
    brandFilter.value = "";

    document.querySelectorAll(".category-card").forEach(card => {
        card.classList.remove("active");
    });

    applyFilters();

});


// CATEGORY CARD CLICK

document.querySelectorAll(".category-card").forEach(card => {

    card.addEventListener("click", () => {

        const category = card.dataset.category;

        categoryFilter.value =
            categoryFilter.value === category ? "" : category;

        document.querySelectorAll(".category-card").forEach(item => {
            item.classList.toggle(
                "active",
                item.dataset.category === categoryFilter.value
            );
        });

        applyFilters();

        document.getElementById("catalogue").scrollIntoView({
            behavior: "smooth"
        });

    });

});


// ==========================================
// CART MANAGEMENT
// ==========================================

function addToCart(productId, quantity) {

    const product = allProducts.find(p => p.id === productId);

    if (!product) return;

    const existingItem = cart.find(
        item => item.id === productId
    );

    if (existingItem) {

        existingItem.quantity += quantity;

    } else {

        cart.push({
            ...product,
            quantity: quantity
        });

    }

    updateCart();

    cartButton.animate(
        [
            { transform: "scale(1)" },
            { transform: "scale(1.08)" },
            { transform: "scale(1)" }
        ],
        { duration: 250 }
    );

}


// ==========================================
// UPDATE CART
// ==========================================

function updateCart() {

    const totalItems = cart.reduce(
        (total, item) => total + item.quantity,
        0
    );

    cartCount.textContent = totalItems;

    if (cart.length === 0) {

        cartItemsContainer.innerHTML = `
            <p class="empty-cart">
                Your list is empty.
                Browse the catalogue to add products.
            </p>
        `;

        return;

    }

    cartItemsContainer.innerHTML = "";

    cart.forEach(item => {

        const cartItem = document.createElement("div");

        cartItem.className = "cart-item";

        const details = document.createElement("div");

        const title = document.createElement("h4");
        title.textContent = item.name;

        const description = document.createElement("p");

        description.textContent =
            `${item.brand || "Unbranded"} • ${item.packSize || ""} ${item.unit || ""}`;

        details.append(title, description);

        const actions = document.createElement("div");

        actions.className = "cart-item-actions";

        const decrease = document.createElement("button");
        decrease.textContent = "−";
        decrease.setAttribute("aria-label", "Decrease quantity");

        decrease.addEventListener("click", () => {
            changeQuantity(item.id, -1);
        });

        const quantity = document.createElement("strong");
        quantity.textContent = item.quantity;

        const increase = document.createElement("button");
        increase.textContent = "+";
        increase.setAttribute("aria-label", "Increase quantity");

        increase.addEventListener("click", () => {
            changeQuantity(item.id, 1);
        });

        const remove = document.createElement("button");
        remove.textContent = "✕";
        remove.className = "remove-item";
        remove.setAttribute("aria-label", "Remove item");

        remove.addEventListener("click", () => {
            removeFromCart(item.id);
        });

        actions.append(
            decrease,
            quantity,
            increase,
            remove
        );

        cartItem.append(details, actions);

        cartItemsContainer.appendChild(cartItem);

    });

}


// ==========================================
// CHANGE QUANTITY
// ==========================================

function changeQuantity(productId, amount) {

    const item = cart.find(p => p.id === productId);

    if (!item) return;

    item.quantity += amount;

    if (item.quantity <= 0) {

        removeFromCart(productId);

        return;

    }

    updateCart();

}


// ==========================================
// REMOVE PRODUCT
// ==========================================

function removeFromCart(productId) {

    cart = cart.filter(item => item.id !== productId);

    updateCart();

}


// ==========================================
// OPEN AND CLOSE CART
// ==========================================

function openCart() {

    cartPanel.classList.add("open");
    cartOverlay.classList.add("open");

    document.body.style.overflow = "hidden";

}

function closeCart() {

    cartPanel.classList.remove("open");
    cartOverlay.classList.remove("open");

    document.body.style.overflow = "";

}

cartButton.addEventListener("click", openCart);

closeCartButton.addEventListener("click", closeCart);

cartOverlay.addEventListener("click", closeCart);


// ==========================================
// SEND WHATSAPP ENQUIRY
// ==========================================

document.getElementById("sendWhatsApp").addEventListener("click", () => {

    const customerName =
        document.getElementById("customerName").value.trim();

    const shopName =
        document.getElementById("shopName").value.trim();

    const customerType =
        document.getElementById("customerType").value;

    if (!cart.length) {

        alert("Please add products to your enquiry list.");

        return;

    }

    if (!customerName) {

        alert("Please enter your name.");

        return;

    }

    // Check that the placeholder has been replaced.
    if (!/^91\d{10}$/.test(BUSINESS_WHATSAPP)) {

        alert("Please configure the actual business WhatsApp number in script.js.");

        return;

    }

    let message =
        "Hello Vedhavathi Kirana!%0A%0A" +
        "*NEW PRODUCT ENQUIRY*%0A%0A";

    message +=
        "*Customer Name:* " + encodeURIComponent(customerName) + "%0A";

    if (shopName) {

        message +=
            "*Shop / Business:* " + encodeURIComponent(shopName) + "%0A";

    }

    message +=
        "*Customer Type:* " + encodeURIComponent(customerType) + "%0A%0A";

    message += "*PRODUCT REQUIREMENTS*%0A";

    cart.forEach((item, index) => {

        message +=
            "%0A" + (index + 1) + ". " +
            encodeURIComponent(item.name) +
            "%0A   Brand: " + encodeURIComponent(item.brand || "Not specified") +
            "%0A   Pack: " + encodeURIComponent(
                `${item.packSize || ""} ${item.unit || ""}`.trim() || "Not specified"
            ) +
            "%0A   Quantity: " + item.quantity +
            "%0A   Price: " + encodeURIComponent(
                item.price ? `₹${item.price}` : "Price on request"
            ) +
            "%0A";

    });

    message +=
        "%0APlease confirm product availability and pricing. Thank you!";

    const whatsappURL =
        `https://wa.me/${BUSINESS_WHATSAPP}?text=${message}`;

    window.open(whatsappURL, "_blank", "noopener,noreferrer");

});


// ==========================================
// HEADER WHATSAPP LINKS
// ==========================================

document.querySelectorAll(".whatsapp-link").forEach(link => {

    link.addEventListener("click", event => {

        event.preventDefault();

        if (!/^91\d{10}$/.test(BUSINESS_WHATSAPP)) {

            alert("Please configure the business WhatsApp number in script.js.");

            return;

        }

        const message =
            encodeURIComponent("Hello Vedhavathi Kirana! I would like to enquire about your grocery products.");

        window.open(
            `https://wa.me/${BUSINESS_WHATSAPP}?text=${message}`,
            "_blank",
            "noopener,noreferrer"
        );

    });

});


// ==========================================
// FOOTER YEAR
// ==========================================

document.getElementById("currentYear").textContent =
    new Date().getFullYear();


// ==========================================
// START WEBSITE
// ==========================================

updateCart();

loadProducts();
