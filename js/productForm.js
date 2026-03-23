import { getProductById, createProduct, updateProduct } from "./products.js";

const MOBILE_BREAKPOINT = 576;

const MODALITIES = [
    "Futebol", "Basquete", "Futsal", "Vôlei", "Corrida",
    "Musculação", "Crossfit", "Ciclismo", "Natação", "Tênis",
    "Artes Marciais", "Skate", "Surf", "Yoga", "Caminhada",
];

const DEFAULT_IMAGE = "product-placeholder.png";

export function isMobile() {
    return window.innerWidth < MOBILE_BREAKPOINT;
}

function buildModalitySelect(selectEl, selected = "") {
    selectEl.innerHTML = `<option value="" disabled ${!selected ? "selected" : ""}>Selecione</option>`;
    MODALITIES.forEach(m => {
        const opt = document.createElement("option");
        opt.value = m;
        opt.textContent = m;
        if (m === selected) opt.selected = true;
        selectEl.appendChild(opt);
    });
}

function parseCurrency(value) {
    return parseFloat(String(value).replace(",", "."));
}

function formatCurrency(value) {
    return Number(value).toFixed(2).replace(".", ",");
}

function validateForm(form) {
    let valid = true;

    const required = form.querySelectorAll("[data-required]");
    required.forEach(input => {
        const field = input.closest(".form-field");
        const errorEl = field?.querySelector(".field-error");

        if (!input.value.trim()) {
            field?.classList.add("has-error");
            if (errorEl) errorEl.textContent = "Campo obrigatório.";
            valid = false;
        } else {
            field?.classList.remove("has-error");
        }
    });

    const priceInput = form.querySelector("[name='price']");
    if (priceInput) {
        const val = parseCurrency(priceInput.value);
        const field = priceInput.closest(".form-field");
        const errorEl = field?.querySelector(".field-error");

        if (isNaN(val) || val <= 0) {
            field?.classList.add("has-error");
            if (errorEl) errorEl.textContent = "Informe um preço válido.";
            valid = false;
        } else {
            field?.classList.remove("has-error");
        }
    }

    const variationInput = form.querySelector("[name='variationType']");
    if (variationInput && !variationInput.value) {
        const field = variationInput.closest(".form-field");
        const errorEl = field?.querySelector(".field-error");

        field?.classList.add("has-error");
        if (errorEl) errorEl.textContent = "Selecione uma variação.";
        valid = false;
    }

    return valid;
}

function buildFormFields(gridClass = "form-grid") {
    return `
    <form id="product-form" novalidate>
        <div class="${gridClass}">

            <div class="form-field">
                <label>Nome</label>
                <input name="name" type="text" data-required>
                <span class="field-error"></span>
            </div>

            <div class="form-field">
                <label>Modalidade</label>
                <select name="modality" data-required></select>
                <span class="field-error"></span>
            </div>

            <div class="form-field form-field-descricao">
                <label>Descrição</label>
                <textarea name="description" data-required></textarea>
                <span class="field-error"></span>
            </div>

            <div class="form-field">
                <label>Preço</label>
                <input name="price" type="text" data-required>
                <span class="field-error"></span>
            </div>

            <div class="form-field">
                <label>Quantidade</label>
                <input name="amount" type="number" min="0" data-required>
                <span class="field-error"></span>
            </div>

            <div class="form-field">
                <label>Cor</label>
                <input name="color" type="text">
            </div>

            <div class="form-field">
                <label>Tipo de variação</label>
                <select name="variationType" data-required>
                    <option value="" disabled selected>Selecione</option>
                    <option value="Nenhuma">Nenhuma</option>
                    <option value="Letra">Letra</option>
                    <option value="Numeração">Numeração</option>
                </select>
                <span class="field-error"></span>
            </div>

            <!-- Mantido só visual -->
            <div class="form-field form-field-imagem">
                <label>Imagem (não utilizada no MVP)</label>
                <input type="file" disabled>
            </div>

        </div>

        <div id="form-feedback" class="form-feedback"></div>
    </form>`;
}

function fillForm(form, product) {
    form.name.value = product.name ?? "";
    form.price.value = product.price ? formatCurrency(product.price) : "";
    form.amount.value = product.amount ?? "";
    form.color.value = product.color ?? "";
    form.description.value = product.description ?? "";

    buildModalitySelect(form.modality, product.modality ?? "");
    form.variationType.value = product.variationType ?? "";
}

function clearForm(form) {
    form.reset();
    buildModalitySelect(form.modality);
}

function collectFormData(form) {
    const raw = Object.fromEntries(new FormData(form));

    return {
        name: raw.name.trim(),
        modality: raw.modality,
        price: parseCurrency(raw.price),
        amount: Number(raw.amount),
        color: raw.color ?? "",
        variationType: raw.variationType,
        description: raw.description ?? "",
        image: DEFAULT_IMAGE
    };
}

async function submitForm(form, productId, onSuccess) {
    if (!validateForm(form)) return;

    const payload = collectFormData(form);
    const feedbackEl = form.querySelector("#form-feedback") ?? document.getElementById("form-feedback");

    try {
        let savedId = productId;

        if (productId) {
            await updateProduct(productId, payload);
        } else {
            const created = await createProduct(payload);
            savedId = created?.id ?? null;
        }

        if (feedbackEl) {
            feedbackEl.textContent = "Salvo com sucesso!";
            feedbackEl.classList.add("success");
            feedbackEl.classList.remove("error");
        }

        if (onSuccess) onSuccess(savedId, payload);

    } catch (err) {
        console.error("Erro ao salvar produto:", err);
        if (feedbackEl) {
            feedbackEl.textContent = "Erro ao salvar. Tente novamente.";
            feedbackEl.classList.add("error");
            feedbackEl.classList.remove("success");
        }
    }
}

let modalProductId = null;

export function initProductFormModal(onSaved) {
    const overlay   = document.getElementById("modal-product-form");
    const content   = overlay?.querySelector(".modal-form-content");
    const titleEl   = overlay?.querySelector("#modal-form-title");
    const btnSave   = overlay?.querySelector(".btn-save");
    const btnCancel = overlay?.querySelector(".btn-cancel");

    if (!overlay || !content) return;

    content.innerHTML = buildFormFields("form-grid");
    buildModalitySelect(content.querySelector("[name='modality']"));

    overlay.addEventListener("click", (e) => {
        if (e.target === overlay) closeModal();
    });

    btnCancel?.addEventListener("click", closeModal);

    btnSave?.addEventListener("click", () => {
        const form = overlay.querySelector("#product-form");
        submitForm(form, modalProductId, (id, payload) => {
            setTimeout(() => {
                closeModal();
                if (onSaved) onSaved(id, payload);
            }, 800);
        });
    });

    function closeModal() {
        overlay.classList.remove("active");
        modalProductId = null;
    }
}

export function openCreateModal() {
    const overlay  = document.getElementById("modal-product-form");
    const titleEl  = overlay?.querySelector("#modal-form-title");
    const form     = overlay?.querySelector("#product-form");

    if (!overlay || !form) return;

    modalProductId = null;
    if (titleEl) titleEl.textContent = "Novo produto";
    clearForm(form);

    const feedbackEl = form.querySelector("#form-feedback");
    if (feedbackEl) { feedbackEl.textContent = ""; feedbackEl.className = "form-feedback"; }

    overlay.classList.add("active");
}

export function openEditModal(id) {
    const overlay  = document.getElementById("modal-product-form");
    const titleEl  = overlay?.querySelector("#modal-form-title");
    const form     = overlay?.querySelector("#product-form");

    if (!overlay || !form) return;

    modalProductId = id;
    if (titleEl) titleEl.textContent = "Edição de produto";

    const feedbackEl = form.querySelector("#form-feedback");
    if (feedbackEl) { feedbackEl.textContent = ""; feedbackEl.className = "form-feedback"; }

    overlay.classList.add("active");

    getProductById(id)
        .then(product => fillForm(form, product))
        .catch(err => {
            console.error("Erro ao carregar produto:", err);
            if (feedbackEl) {
                feedbackEl.textContent = "Erro ao carregar dados do produto.";
                feedbackEl.classList.add("error");
            }
        });
}

export function initFormPage(mode) {
    const container = document.getElementById("form-page-container");
    if (!container) return;

    container.innerHTML = buildFormFields("form-grid-page");
    buildModalitySelect(container.querySelector("[name='modality']"));

    let pageProductId = null;

    if (mode === "edit") {
        const params = new URLSearchParams(window.location.search);
        pageProductId = params.get("id");

        if (pageProductId) {
            getProductById(pageProductId)
                .then(product => {
                    const form = document.querySelector("#product-form");
                    if (form) fillForm(form, product);
                })
                .catch(err => {
                    console.error("Erro ao carregar produto:", err);
                    const feedbackEl = document.getElementById("form-feedback");
                    if (feedbackEl) {
                        feedbackEl.textContent = "Erro ao carregar dados do produto.";
                        feedbackEl.classList.add("error");
                    }
                });
        }
    }

    document.getElementById("btn-page-save")?.addEventListener("click", () => {
        const form = document.querySelector("#product-form");
        submitForm(form, pageProductId, () => {
            setTimeout(() => window.history.back(), 800);
        });
    });
}
