// ============================================================
//  cart.js  —  módulo ES  (usado por cart.html e productDetails)
// ============================================================

const STORAGE_KEY = "cart";

const USE_MOCK = false;

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
            imageName: product.imageName || "product-placeholder.avif"
        });
    }

    saveItems(items);
    document.dispatchEvent(new Event("cartUpdated"));
}

export function removeFromCart(productId) {
    const items = loadItems().filter(i => String(i.id) !== String(productId));
    saveItems(items);
    document.dispatchEvent(new Event("cartUpdated"));
}

export function incrementItem(productId) {
    const items = loadItems();
    const item = items.find(i => String(i.id) === String(productId));
    if (item) { item.quantity += 1; saveItems(items); }
    document.dispatchEvent(new Event("cartUpdated"));
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
        document.dispatchEvent(new Event("cartUpdated"));
    }
}

export function calculateSubtotal(items ) {
    return items.reduce((sum, i) => sum + i.price * i.quantity, 0);
}

export function totalQuantity(items = loadItems()) {
    return items.reduce((sum, i) => sum + i.quantity, 0);
}

// ── formatação ───────────────────────────────────────────────

export function formatBRL(value) {
    return Number(value).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
}


export async function calcularFrete(cep) {

    // MOCK LOCAL (só para desenvolvimento)
    if (USE_MOCK) {
        await new Promise(r => setTimeout(r, 300));

        return [
            { name: "PAC", price: 36.49, delivery_time: 10 },
            { name: "SEDEX", price: 74.13, delivery_time: 5 },
            { name: "Econômico", price: 27.73, delivery_time: 9 },
            { name: "Express", price: 23.39, delivery_time: 12 },
            { name: "Super Econômico", price: 18.01, delivery_time: 10 }
        ];
    }

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