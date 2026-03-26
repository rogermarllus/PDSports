// ============================================================
//  cart.js  —  módulo ES  (usado por cart.html e productDetails)
// ============================================================

const STORAGE_KEY = "cart";

// ── helpers de persistência ──────────────────────────────────

export function loadItems() {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch {
        return [];
    }
}

function saveItems(items) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

// ── operações do carrinho ────────────────────────────────────

export function addToCart(product) {
    const items = loadItems();
    const existing = items.find(i => i.id === product.id);

    if (existing) {
        existing.quantity += 1;
    } else {
        items.push({
            id: product.id,
            name: product.name,
            modality: product.modality,
            price: Number(product.price),
            quantity: 1,
            imageName: product.imageName || "product-placeholder.png"
        });
    }

    saveItems(items);
}

export function removeFromCart(productId) {
    const items = loadItems().filter(i => String(i.id) !== String(productId));
    saveItems(items);
}

export function incrementItem(productId) {
    const items = loadItems();
    const item = items.find(i => String(i.id) === String(productId));
    if (item) { item.quantity += 1; saveItems(items); }
}

export function decrementItem(productId) {
    const items = loadItems();
    const item = items.find(i => String(i.id) === String(productId));
    if (!item) return;

    if (item.quantity <= 1) {
        saveItems(items.filter(i => String(i.id) !== String(productId)));
    } else {
        item.quantity -= 1;
        saveItems(items);
    }
}

export function calculateSubtotal(items) {
    return items.reduce((sum, i) => sum + i.price * i.quantity, 0);
}

export function totalQuantity(items) {
    return items.reduce((sum, i) => sum + i.quantity, 0);
}

// ── formatação ───────────────────────────────────────────────

export function formatBRL(value) {
    return Number(value).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
}

// ── frete ────────────────────────────────────────────────────

export async function calcularFrete(cep) {
    const res = await fetch("/api/frete", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ cep })
    });

    let text;
    try {
        text = await res.text();
    } catch {
        throw new Error("Erro ao ler resposta do servidor");
    }

    if (!text || text.trim() === "") {
        throw new Error("Resposta vazia do servidor");
    }

    let data;
    try {
        data = JSON.parse(text);
    } catch {
        console.error("Resposta inválida:", text);
        throw new Error("Resposta inválida do servidor");
    }

    if (!res.ok) {
        throw new Error(data.erro || "Erro ao calcular frete");
    }

    if (!Array.isArray(data)) {
        throw new Error("Formato inesperado da resposta");
    }

    return data;
}