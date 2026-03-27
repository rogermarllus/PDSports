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

const listEl = document.getElementById("container-products-cart");
const quantityBadge = document.getElementById("quantity-product-buy-cart");
const subtotalEl = document.getElementById("title-price-total-buy-cart");
const totalEl = document.getElementById("footer-total-value");
const shippingListEl = document.getElementById("container-service-orders");
const btnCalc = document.getElementById("btn-calc-freight-product");
const inputCEP = document.getElementById("input-calc-freight-product");

let selectedShipping = null;

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

function render() {
    const items = loadItems();
    renderItems(items);
    updateSummary(items);
}

// ─lista de produtos 

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
                     onerror="this.src='/img/products/product-placeholder.avif'">
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


function updateSummary(items) {
    const subtotal = calculateSubtotal(items);
    const qty = totalQuantity(items);
    const shipping = selectedShipping ? selectedShipping.price : 0;
    const total = subtotal + shipping;

    if (quantityBadge) quantityBadge.textContent = `(${qty})`;
    if (subtotalEl) subtotalEl.textContent = formatBRL(subtotal);
    if (totalEl) totalEl.textContent = formatBRL(total);
}

// frete
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
            selectedShipping = { name: el.dataset.name, price: Number(el.dataset.price) };
            updateSummary(loadItems());
        });
    });
}

// CEP

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

function escapeHTML(str) {
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}

render();

(function initPaymentModal() {

    const btnFinish = document.getElementById("btn-finish-buy");
    if (!btnFinish) return;

    let chosenMethod = "pix";

    const METHOD_TITLES = {
        pix: "Pagamento via PIX",
        credit: "Cartão de Crédito",
        boleto: "Boleto Bancário"
    };

    function retriggerAnimation(el) {
        if (!el) return;
        el.style.animation = "none";
        void el.offsetWidth;
        el.style.animation = "";
    }

    function goToStep(n) {
        document.querySelectorAll(".modal-step")
            .forEach(s => s.classList.remove("active"));
        document.getElementById(`modal-step-${n}`)?.classList.add("active");

        if (n === 3) {
            setTimeout(() => {
                retriggerAnimation(document.querySelector(".checkmark-circle"));
                retriggerAnimation(document.querySelector(".checkmark-check"));
            }, 30);
        }
    }

    function showMethodContent(method) {
        const titleEl = document.getElementById("modal-step2-title");
        if (titleEl) titleEl.textContent = METHOD_TITLES[method] ?? "";

        document.querySelectorAll(".modal-method-panel")
            .forEach(p => p.classList.remove("active"));
        document.getElementById(`modal-method-${method}`)?.classList.add("active");
    }

    function openModal() {
        const items = loadItems();
        if (items.length === 0) {
            alert("Seu carrinho está vazio.");
            return;
        }

        buildStep1(items);

        chosenMethod = "pix";
        document.querySelectorAll(".modal-pay-method-btn").forEach(b => {
            const active = b.dataset.method === "pix";
            b.classList.toggle("selected", active);
            b.setAttribute("aria-pressed", String(active));
        });

        goToStep(1);
        const overlay = document.getElementById("modal-payment-overlay");
        overlay?.classList.add("active");
        overlay?.removeAttribute("aria-hidden");
        document.body.style.overflow = "hidden";
    }

    function closeModal() {
        const overlay = document.getElementById("modal-payment-overlay");
        overlay?.classList.remove("active");
        overlay?.setAttribute("aria-hidden", "true");
        document.body.style.overflow = "";
    }

    function buildStep1(items) {
        const itemsEl = document.getElementById("modal-order-items");
        if (itemsEl) {
            itemsEl.innerHTML = items.map(it => `
                <div class="modal-order-item">
                    <p class="modal-order-item-name">${escapeHTML(it.name)}</p>
                    <p class="modal-order-item-qty">× ${it.quantity}</p>
                    <p class="modal-order-item-price">${formatBRL(it.price * it.quantity)}</p>
                </div>
            `).join("");
        }

        const valEl = document.getElementById("modal-summary-values");
        if (valEl) {
            const subtotal = calculateSubtotal(items);
            const shipping = selectedShipping ? selectedShipping.price : 0;
            const label = selectedShipping ? selectedShipping.name : "Não calculado";
            const total = subtotal + shipping;

            valEl.innerHTML = `
                <div class="modal-summary-row">
                    <p class="modal-summary-label">Subtotal</p>
                    <p class="modal-summary-value">${formatBRL(subtotal)}</p>
                </div>
                <div class="modal-summary-row">
                    <p class="modal-summary-label">Frete (${escapeHTML(label)})</p>
                    <p class="modal-summary-value">${shipping > 0 ? formatBRL(shipping) : "—"}</p>
                </div>
                <div class="modal-summary-row total">
                    <p class="modal-summary-label">Total</p>
                    <p class="modal-summary-value">${formatBRL(total)}</p>
                </div>
            `;
        }
    }

    function confirmPayment() {
        if (chosenMethod === "credit") {
            const num = (document.getElementById("card-num")?.value ?? "").replace(/\s/g, "");
            const holder = (document.getElementById("card-holder")?.value ?? "").trim();
            const exp = (document.getElementById("card-exp")?.value ?? "");
            const cvv = (document.getElementById("card-cvv")?.value ?? "");

            if (num.length < 16 || !holder || exp.length < 5 || cvv.length < 3) {
                alert("Preencha todos os dados do cartão corretamente.");
                return;
            }
        }

        const orderNum = "PD-" + Math.random().toString(36).slice(2, 8).toUpperCase();
        const orderEl = document.getElementById("modal-order-number");
        if (orderEl) orderEl.textContent = `Pedido nº ${orderNum}`;

        goToStep(3);
    }

    function bindModalEvents() {
        const overlay = document.getElementById("modal-payment-overlay");
        if (!overlay) return;

        overlay.addEventListener("click", e => {
            if (
                e.target === overlay ||
                e.target.closest("#modal-close-1") ||
                e.target.closest("#modal-close-2")
            ) closeModal();
        });

        overlay.querySelectorAll(".modal-pay-method-btn").forEach(btn => {
            btn.addEventListener("click", () => {
                overlay.querySelectorAll(".modal-pay-method-btn").forEach(b => {
                    b.classList.remove("selected");
                    b.setAttribute("aria-pressed", "false");
                });
                btn.classList.add("selected");
                btn.setAttribute("aria-pressed", "true");
                chosenMethod = btn.dataset.method;
            });
        });

        // step 1 → 2
        document.getElementById("btn-step1-next")?.addEventListener("click", () => {
            showMethodContent(chosenMethod);
            goToStep(2);
        });

        // step 2 → 1
        document.getElementById("btn-step2-back")?.addEventListener("click", () => goToStep(1));

        // confirmar pagamento
        document.getElementById("btn-step2-confirm")?.addEventListener("click", confirmPayment);

        // step 3 → voltar às compras
        document.getElementById("btn-step3-done")?.addEventListener("click", () => {
            localStorage.removeItem("cart");
            closeModal();
            window.location.href = "/index.html";
        });

        document.addEventListener("keydown", e => {
            if (e.key === "Escape") closeModal();
        });

        // máscaras do formulário de cartão
        document.getElementById("card-num")?.addEventListener("input", e => {
            let v = e.target.value.replace(/\D/g, "").slice(0, 16);
            e.target.value = v.replace(/(.{4})/g, "$1 ").trim();
        });
        document.getElementById("card-exp")?.addEventListener("input", e => {
            let v = e.target.value.replace(/\D/g, "").slice(0, 4);
            e.target.value = v.length > 2 ? `${v.slice(0, 2)}/${v.slice(2)}` : v;
        });

        document.getElementById("btn-copy-pix")?.addEventListener("click", function () {
            const text = document.getElementById("pix-key-val")?.textContent ?? "";
            navigator.clipboard.writeText(text).catch(() => { });
            this.textContent = "Copiado!";
            setTimeout(() => { this.textContent = "Copiar"; }, 2000);
        });
        document.getElementById("btn-copy-boleto")?.addEventListener("click", function () {
            const text = document.getElementById("boleto-line-val")?.textContent ?? "";
            navigator.clipboard.writeText(text).catch(() => { });
            this.textContent = "Copiado!";
            setTimeout(() => { this.textContent = "Copiar"; }, 2000);
        });
    }

    // Inicializar 
    bindModalEvents();
    btnFinish.addEventListener("click", openModal);

})();
