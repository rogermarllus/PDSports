import { getAllProducts, deleteProduct } from "./products.js";


const ITEMS_PER_PAGE = 9;


let allProducts = [];
let currentPage = 1;
let pendingDeleteId = null;


const listContainer  = document.getElementById("products-list");
const listTitle      = document.getElementById("products-list-title");
const paginationEl   = document.getElementById("pagination");
const modalOverlay   = document.getElementById("modal-delete");
const btnModalCancel = document.getElementById("btn-modal-cancel");
const btnModalConfirm= document.getElementById("btn-modal-confirm");

async function init() {
    showLoading();
    try {
        allProducts = await getAllProducts();
        render();
    } catch (err) {
        showError();
        console.error("Erro ao carregar produtos:", err);
    }
}

function render() {
    const total     = allProducts.length;
    const totalPages = Math.ceil(total / ITEMS_PER_PAGE);
    const start     = (currentPage - 1) * ITEMS_PER_PAGE;
    const slice     = allProducts.slice(start, start + ITEMS_PER_PAGE);

    listTitle.textContent = `Estoque (${total} Produto${total !== 1 ? "s" : ""})`;

    listContainer.innerHTML = slice.length
        ? slice.map(renderRow).join("")
        : `<div class="list-feedback"><p>Nenhum produto encontrado.</p></div>`;

    renderPagination(totalPages);

    if (window.lucide) window.lucide.createIcons();
}

function renderRow(product) {
    const disponivel = Number(product.amount) > 0;
    const badgeClass = disponivel ? "badge-disponivel" : "badge-indisponivel";
    const badgeText  = disponivel ? "Disponível" : "Indisponível";

    return `
    <div class="product-row" data-id="${product.id}">
        <p class="product-name" title="${escapeHTML(product.name)}">${escapeHTML(product.name)}</p>

        <div class="product-row-actions">
            <span class="badge-status ${badgeClass}">${badgeText}</span>

            <div class="actions-group">
                <button class="btn-action btn-edit"
                        aria-label="Editar produto"
                        onclick="handleEdit('${product.id}')">
                    <i data-lucide="pencil"></i>
                </button>
                <button class="btn-action btn-delete"
                        aria-label="Excluir produto"
                        onclick="handleDeleteRequest('${product.id}')">
                    <i data-lucide="trash-2"></i>
                </button>
            </div>
        </div>
    </div>`;
}

function renderPagination(totalPages) {
    if (totalPages <= 1) {
        paginationEl.innerHTML = "";
        return;
    }

    const pages = getPageRange(currentPage, totalPages);
    let html = "";

    pages.forEach(p => {
        if (p === "...") {
            html += `<span class="page-ellipsis">…</span>`;
        } else {
            const active = p === currentPage ? " active" : "";
            html += `<button class="page-btn${active}" onclick="goToPage(${p})">${p}</button>`;
        }
    });

    paginationEl.innerHTML = html;
}

function getPageRange(current, total) {
    if (total <= 7) {
        return Array.from({ length: total }, (_, i) => i + 1);
    }

    const pages = [];
    const WINDOW = 2;

    pages.push(1);

    if (current - WINDOW > 2) pages.push("...");

    for (let p = Math.max(2, current - WINDOW); p <= Math.min(total - 1, current + WINDOW); p++) {
        pages.push(p);
    }

    if (current + WINDOW < total - 1) pages.push("...");

    pages.push(total);

    return pages;
}

window.goToPage = function (page) {
    currentPage = page;
    render();
    window.scrollTo({ top: 0, behavior: "smooth" });
};

window.handleEdit = function (id) {
    window.location.href = `editProduct.html?id=${id}`;
};

window.handleDeleteRequest = function (id) {
    pendingDeleteId = id;
    const product = allProducts.find(p => String(p.id) === String(id));
    const nameEl  = modalOverlay.querySelector(".modal-product-name");
    if (nameEl && product) nameEl.textContent = `"${product.name}"`;
    modalOverlay.classList.add("active");
};


btnModalCancel.addEventListener("click", closeModal);

modalOverlay.addEventListener("click", (e) => {
    if (e.target === modalOverlay) closeModal();
});

btnModalConfirm.addEventListener("click", async () => {
    if (!pendingDeleteId) return;

    btnModalConfirm.disabled = true;
    btnModalConfirm.textContent = "Excluindo…";

    try {
        await deleteProduct(pendingDeleteId);
        allProducts = allProducts.filter(p => String(p.id) !== String(pendingDeleteId));

        const totalPages = Math.ceil(allProducts.length / ITEMS_PER_PAGE);
        if (currentPage > totalPages) currentPage = Math.max(1, totalPages);

        render();
    } catch (err) {
        console.error("Erro ao excluir produto:", err);
        alert("Não foi possível excluir o produto. Tente novamente.");
    } finally {
        closeModal();
        btnModalConfirm.disabled = false;
        btnModalConfirm.textContent = "Excluir";
    }
});

function closeModal() {
    modalOverlay.classList.remove("active");
    pendingDeleteId = null;
}


function showLoading() {
    listTitle.textContent = "Estoque";
    listContainer.innerHTML = `
        <div class="list-feedback">
            <div class="spinner"></div>
            <p>Carregando produtos…</p>
        </div>`;
    paginationEl.innerHTML = "";
}

function showError() {
    listTitle.textContent = "Estoque";
    listContainer.innerHTML = `
        <div class="list-feedback">
            <p>Erro ao carregar produtos. Verifique a conexão e tente novamente.</p>
            <button class="botao" style="margin-top: 16px;" onclick="init()">Tentar novamente</button>
        </div>`;
}


function escapeHTML(str) {
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}

init();
