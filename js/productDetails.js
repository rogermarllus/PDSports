// ============================================================
// productDetails.js — Carregamento Dinâmico e Lógica de Carrinho
// ============================================================

import { getProductById } from "./products.js";
import { addToCart } from "./cart.js";

// ── Seleção de Elementos ──────────────────────────────────────
const btnCarrinho = document.querySelector(".detalhes-produto .botao");
const feedbackEl = document.createElement("p");

// ── Helper: Tradução de Modalidade para o Caminho da Imagem ──
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
    // Ajuste o caminho se necessário (ex: removendo o ../ se estiver na raiz)
    return `../img/products/${modalityEN}/${product.imageName}.avif`;
}

function formatBRL(value) {
    return Number(value).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

// ── Lógica Principal ─────────────────────────────────────────

async function init() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");

    if (!id) {
        showError("Produto não encontrado.");
        return;
    }

    try {
        const product = await getProductById(id);

        if (!product) {
            showError("Produto não encontrado no banco de dados.");
            return;
        }

        renderProduct(product);
        wireAddToCart(product);

    } catch (error) {
        console.error("Erro ao carregar:", error);
        showError("Erro de conexão ao carregar o produto.");
    }
}

function renderProduct(product) {
    // Título da Aba
    document.title = `PD Sports | ${product.name}`;

    // Textos Básicos
    document.querySelector(".detalhes-produto h1").textContent = product.name;
    document.querySelector(".produto-preco").textContent = formatBRL(product.price);
    document.querySelector(".descricao-produto p").textContent = product.description;

    // Lista de Info (Modalidade e Disponibilidade)
    const infoDds = document.querySelectorAll(".info-produto dl dd");
    if (infoDds.length >= 2) {
        infoDds[0].textContent = product.modality || "—";
        infoDds[1].textContent = Number(product.amount) > 0 ? "Disponível" : "Indisponível";
    }

    // Cor
    const article = document.querySelector(".detalhes-produto article");
    const colorElement = article.querySelector("p:first-of-type");
    if (colorElement) {
        colorElement.innerHTML = `<strong>Cor:</strong> ${product.color || "-"}`;
    }

    // Imagem
    const img = document.querySelector(".img-produto");
    if (img) {
        img.src = getImagePath(product);
        img.alt = product.name;
        // Fallback para erro de imagem
        img.onerror = () => { img.src = "/img/products/product-placeholder.avif"; };
    }

    // Renderização de Variações (Tamanhos)
    renderVariations(product, article);

    // Ícones Lucide (se houver)
    if (window.lucide) {
        lucide.createIcons();
    }
}

function renderVariations(product, container) {
    const sizeLabel = container.querySelector("p:nth-of-type(2)");
    const variationContainer = container.querySelector("div");

    if (product.variationType === "Nenhuma" || !product.variationType) {
        if (sizeLabel) sizeLabel.style.display = "none";
        if (variationContainer) variationContainer.style.display = "none";
    } else {
        if (sizeLabel) sizeLabel.style.display = "block";
        if (variationContainer) variationContainer.style.display = "flex";

        let sizes = [];
        if (product.variationType === "Numeração") sizes = [36, 37, 38, 39, 40];
        if (product.variationType === "Letra") sizes = ["PP", "P", "M", "G", "GG"];

        variationContainer.innerHTML = sizes
            .map(size => `<button class="btn-tamanho">${size}</button>`)
            .join("");

        const sizeButtons = variationContainer.querySelectorAll(".btn-tamanho");
        sizeButtons.forEach(btn => {
            btn.addEventListener("click", () => {
                sizeButtons.forEach(b => b.classList.remove("active"));
                btn.classList.add("active");
                // Armazena o tamanho selecionado no objeto do produto temporariamente
                product.selectedSize = btn.textContent;
            });
        });

        // Ativa o primeiro por padrão
        if (sizeButtons.length > 0) sizeButtons[0].click();
    }
}

// ── Lógica do Carrinho ───────────────────────────────────────

function wireAddToCart(product) {
    if (!btnCarrinho) return;

    // Estilização básica do feedback
    feedbackEl.style.cssText = "margin-top:8px;font-size:.85rem;font-family:var(--fonte-montserrat);font-weight:bold;";
    btnCarrinho.insertAdjacentElement("afterend", feedbackEl);

    btnCarrinho.addEventListener("click", () => {
        if (Number(product.amount) <= 0) {
            showFeedback("Produto indisponível no estoque.", "error");
            return;
        }

        // Adiciona ao carrinho (passando o produto com o tamanho selecionado se houver)
        addToCart({
            ...product,
            size: product.selectedSize || null
        });

        showFeedback("Produto adicionado ao carrinho!", "success");
    });
}

function showFeedback(msg, type) {
    feedbackEl.textContent = msg;
    feedbackEl.style.color = type === "success" ? "var(--cor-destaque, #28a745)" : "#FF6B6B";

    clearTimeout(feedbackEl._timer);
    feedbackEl._timer = setTimeout(() => { feedbackEl.textContent = ""; }, 3000);
}

function showError(msg) {
    const main = document.querySelector("main");
    if (main) {
        main.innerHTML = `<p style="color:#FF6B6B;font-family:var(--fonte-montserrat);padding:2rem;text-align:center;">${msg}</p>`;
    }
}

// Inicializa a página
init();