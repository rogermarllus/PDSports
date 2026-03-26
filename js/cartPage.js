// ============================================================
//  cartPage.js  —  lógica dinâmica da página cart.html
// ============================================================

import {
    loadItems,
    removeFromCart,
    incrementItem,
    decrementItem,
    calculateSubtotal,
    totalQuantity,
    formatBRL,
    calcularFrete
} from "./cart.js";

// ── elementos fixos ──────────────────────────────────────────

const listEl = document.getElementById("container-products-cart");
const quantityBadge = document.getElementById("quantity-product-buy-cart");
const subtotalEl = document.getElementById("title-price-total-buy-cart");
const totalEl = document.getElementById("footer-total-value");
const shippingListEl = document.getElementById("container-service-orders");
const btnCalc = document.getElementById("btn-calc-freight-product");
const inputCEP = document.getElementById("input-calc-freight-product");

// frete selecionado
let selectedShipping = null;   // { name, price }

// ── Helper: Tradução de Modalidade ───────────────────────────

function translateModality(modality) {
    if (!modality) return "geral";

    const normalized = modality
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim();

    const map = {
        "artes marciais": "martialArts",
        "basquete": "basketball",
        "caminhada": "trekking",
        "ciclismo": "cycling",
        "corrida": "running",
        "crossfit": "crossfit",
        "futebol": "soccer",
        "futsal": "futsal",
        "musculacao": "weightlifting",
        "natacao": "swimming",
        "skate": "skateboarding",
        "surf": "surfing",
        "tenis": "tennis",
        "volei": "volleyball",
        "yoga": "yoga"
    };

    return map[normalized] || normalized;
}

function getImagePath(product) {
    const modalityEN = translateModality(product.modality);

    return `/img/products/${modalityEN}/${product.imageName}.avif`;
}

// ── render principal ─────────────────────────────────────────

function render() {
    const items = loadItems();

    renderItems(items);
    updateSummary(items);
}

// ── lista de produtos ────────────────────────────────────────

function renderItems(items) {
    if (!listEl) return;

    if (items.length === 0) {
        listEl.innerHTML = `
            <div style="
                text-align:center;
                padding:40px 20px;
                font-family:var(--fonte-montserrat);
                color:var(--fundo-inputs);
            ">
                <p>Seu carrinho está vazio.</p>
                <a href="/index.html" style="color:var(--cor-destaque);font-weight:600;">
                    Continuar comprando
                </a>
            </div>`;
        return;
    }

    listEl.innerHTML = items.map(item => buildItemHTML(item)).join("");

    if (window.lucide) window.lucide.createIcons();

    listEl.querySelectorAll(".js-remove").forEach(btn => {
        btn.addEventListener("click", () => {
            removeFromCart(btn.dataset.id);
            selectedShipping = null;
            render();
        });
    });

    listEl.querySelectorAll(".js-decrement").forEach(btn => {
        btn.addEventListener("click", () => {
            decrementItem(btn.dataset.id);
            render();
        });
    });

    listEl.querySelectorAll(".js-increment").forEach(btn => {
        btn.addEventListener("click", () => {
            incrementItem(btn.dataset.id);
            render();
        });
    });
}

function buildItemHTML(item) {
    const imgSrc = getImagePath(item);

    return `
    <div class="product-cart" data-id="${item.id}">
        <div id="container-img-info-product">
            <figure>
                <img src="${imgSrc}" 
                     alt="${escapeHTML(item.name)}" 
                     id="img-product-cart"
                     onerror="this.src='/img/products/product-placeholder.png'">
                <figcaption>produto do carrinho</figcaption>
            </figure>

            <div id="container-info-about-product">
                <h3 id="name-product-cart">${escapeHTML(item.name)}</h3>
                <h3 id="price-product-cart">${formatBRL(item.price)}</h3>

                <div id="quantity-product-cart">
                    <p id="txt-quantity">Quantidade:</p>
                    <div id="increment-decrement-product">
                        <i data-lucide="circle-minus"
                        id="icon-circle-minus"
                        class="js-decrement"
                        data-id="${item.id}"
                        style="cursor:pointer;"></i>
                        <p id="quantity-product">${item.quantity}</p>
                        <i data-lucide="circle-plus"
                        id="icon-circle-plus"
                        class="js-increment"
                        data-id="${item.id}"
                        style="cursor:pointer;"></i>
                    </div>
                </div>
            </div>
        </div>

        <i data-lucide="trash-2"
        id="icon-trash-2"
        class="js-remove"
        data-id="${item.id}"
        style="cursor:pointer;"></i>
    </div>`;
}

// ── resumo / totais ──────────────────────────────────────────

function updateSummary(items) {
    const subtotal = calculateSubtotal(items);
    const qty = totalQuantity(items);
    const shipping = selectedShipping ? selectedShipping.price : 0;
    const total = subtotal + shipping;

    if (quantityBadge) quantityBadge.textContent = `(${qty})`;
    if (subtotalEl) subtotalEl.textContent = formatBRL(subtotal);
    if (totalEl) totalEl.textContent = formatBRL(total);
}

// ── frete ────────────────────────────────────────────────────

function renderShipping(options) {
    if (!shippingListEl) return;

    if (!options || options.length === 0) {
        shippingListEl.innerHTML =
            `<p style="font-family:var(--fonte-montserrat);color:var(--fundo-inputs);font-size:.9rem;">
                Nenhuma opção de frete disponível para este CEP.
            </p>`;
        return;
    }

    shippingListEl.innerHTML = options.map((opt, idx) => `
        <div class="service-order js-shipping-option ${idx === 0 ? "selected" : ""}"
            data-price="${opt.price}"
            data-name="${escapeHTML(opt.name)}"
            style="cursor:pointer;">
            <div class="info-service-order">
                <p class="title-service-order">${escapeHTML(opt.name)}</p>
                <p class="business-day">${opt.delivery_time ?? "?"}</p>
                <p>dias úteis</p>
            </div>
            <p class="service-order-value-total">${formatBRL(opt.price)}</p>
        </div>
    `).join("");

    const first = options[0];
    selectedShipping = { name: first.name, price: Number(first.price) };
    updateSummary(loadItems());

    shippingListEl.querySelectorAll(".js-shipping-option").forEach(el => {
        el.addEventListener("click", () => {
            shippingListEl.querySelectorAll(".js-shipping-option")
                .forEach(o => o.classList.remove("selected"));
            el.classList.add("selected");

            selectedShipping = {
                name: el.dataset.name,
                price: Number(el.dataset.price)
            };
            updateSummary(loadItems());
        });
    });
}

// ── CEP mask + botão calcular ────────────────────────────────

if (inputCEP) {
    inputCEP.addEventListener("input", e => {
        let n = e.target.value.replace(/\D/g, "").substring(0, 8);
        e.target.value = n.length > 5 ? `${n.slice(0, 5)}-${n.slice(5)}` : n;
    });
}

if (btnCalc) {
    btnCalc.addEventListener("click", async () => {
        const cep = inputCEP?.value ?? "";
        const clean = cep.replace(/\D/g, "");

        if (clean.length !== 8) {
            alert("Informe um CEP válido com 8 dígitos.");
            return;
        }

        btnCalc.textContent = "Calculando…";
        btnCalc.disabled = true;
        if (shippingListEl) shippingListEl.innerHTML = "";
        selectedShipping = null;
        updateSummary(loadItems());

        try {
            const options = await calcularFrete(cep);
            renderShipping(options);
        } catch (err) {
            console.error(err);
            if (shippingListEl) {
                shippingListEl.innerHTML =
                    `<p style="color:#FF6B6B;font-family:var(--fonte-montserrat);font-size:.9rem;">
                        Erro ao calcular o frete. Tente novamente.
                    </p>`;
            }
        } finally {
            btnCalc.textContent = "Calcular";
            btnCalc.disabled = false;
        }
    });
}

// ── utilitário ───────────────────────────────────────────────

function escapeHTML(str) {
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}

// ── boot ─────────────────────────────────────────────────────

render();