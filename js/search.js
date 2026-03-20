import { getAllProducts } from "./products.js";

// Normalizar texto
function normalize(text) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

// Tradução de modalidade
function translateModality(modality) {
  if (!modality) return "";

  const normalized = normalize(modality).trim();

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
  return `../img/products/${modalityEN}/${product.imageName}.avif`;
}

// Card
function createProductCard(product) {
  return `
    <div class="col">
      <article class="card" onclick="window.location.href='/pages/productDetails.html?id=${product.id}'>
        <img src="${getImagePath(product)}" alt="${product.name}">
        <h3>${product.name}</h3>
        <div>
          <p>R$ ${Number(product.price).toFixed(2)}</p>
          <button aria-label="Adicionar ao carrinho">
            <i data-lucide="handbag" class="icon icon-card"></i>
          </button>
        </div>
      </article>
    </div>
  `;
}

// Busca
function searchProducts(products, term) {
  const normalizedTerm = normalize(term);

  return products
    .map(product => {
      let score = 0;

      if (normalize(product.name).includes(normalizedTerm)) score += 3;
      if (normalize(product.modality).includes(normalizedTerm)) score += 2;
      if (normalize(product.description).includes(normalizedTerm)) score += 1;

      return { ...product, score };
    })
    .filter(p => p.score > 0)
    .sort((a, b) => b.score - a.score);
}

// Renderizar resultados
function renderResults(products, term) {
  const container = document.getElementById("search-results");
  const title = document.getElementById("search-title");

  if (!container || !title) return;

  title.textContent = `Resultados para "${term}" (${products.length})`;

  if (!products.length) {
    container.innerHTML = `
      <div class="col-12 text-center">
        <p>Nenhum produto encontrado.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = products.map(createProductCard).join("");

  if (window.lucide) {
    lucide.createIcons();
  }
}

// Redirecionamento
function handleSearchRedirect(term) {
  const formatted = term.trim().replace(/\s+/g, "+");
  window.location.href = `/pages/searchResult.html?query=${formatted}`;
}

// Captura do formulário
function setupSearch() {
  const form = document.getElementById("search-form");
  const input = document.getElementById("search-input");

  if (!form || !input) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const term = input.value.trim();
    if (!term) return;

    handleSearchRedirect(term);
  });
}

// Inicialização da página de resultados
async function initSearchPage() {
  const params = new URLSearchParams(window.location.search);
  const rawQuery = params.get("query");

  const query = rawQuery ? rawQuery.replace(/\+/g, " ") : null;

  const container = document.getElementById("search-results");

  if (!query || !container) return;

  container.innerHTML = "<p>Carregando...</p>";

  try {
    const products = await getAllProducts();

    const results = searchProducts(products, query);

    renderResults(results, query);

  } catch (err) {
    console.error(err);
    container.innerHTML = "<p>Erro ao buscar produtos.</p>";
  }
}

setupSearch();
initSearchPage();