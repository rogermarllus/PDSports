import { getProductById } from "./products.js";

// IDs dos produtos em destaque
const FEATURED_IDS = [7, 34, 128, 132, 96, 23, 86, 88];

// Tradução de modalidade (reaproveitada)
function translateModality(modality) {
  if (!modality) return "";

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

// Caminho da imagem
function getImagePath(product) {
  const modalityEN = translateModality(product.modality);
  return `/img/products/${modalityEN}/${product.imageName}.avif`;
}

function formatBRL(value) {
    return Number(value).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

// Card de produto (igual ao modality.js)
function createProductCard(product) {
  return `
    <div class="col">
      <article class="card" onclick="window.location.href='/pages/productDetails.html?id=${product.id}'">
        <div class="img-card">
          <img src="${getImagePath(product)}" alt="${product.name}" onerror="this.onerror=null;this.src='/img/products/product-placeholder.avif';">
          <span>EM OFERTA</span>
        </div>
          <h3>${product.name}</h3>
        <div>
          <p> ${formatBRL(product.price)}</p>
          <button aria-label="Adicionar ao carrinho">
            <i data-lucide="handbag" class="icon icon-card"></i>
          </button>
        </div>
      </article>
    </div>
  `;
}

// Renderizar produtos
function renderProducts(products) {
  const container = document.getElementById("products-container");

  if (!products.length) {
    container.innerHTML = "<p>Nenhum produto encontrado.</p>";
    return;
  }

  container.innerHTML = products
    .map(createProductCard)
    .join("");

  if (window.lucide) {
    lucide.createIcons();
  }
}

// Carregar produtos em destaque
async function loadFeaturedProducts() {
  const container = document.getElementById("products-container");

  container.innerHTML = "<p>Carregando...</p>";

  try {
    // Busca todos os produtos pelos IDs
    const products = await Promise.all(
      FEATURED_IDS.map(id => getProductById(id))
    );

    // Remove possíveis null/undefined (caso algum ID falhe)
    const validProducts = products.filter(Boolean);

    renderProducts(validProducts);

  } catch (error) {
    console.error(error);
    container.innerHTML = "<p>Erro ao carregar produtos.</p>";
  }
}

// Inicialização
loadFeaturedProducts();