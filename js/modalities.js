import { getProductsByModality } from "./products.js";

let allProducts = [];
let currentModality = "";
let currentSort = null;
let currentRange = "all";

// Tradução de modalidade
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
  return `../img/products/${modalityEN}/${product.imageName}.avif`;
}

function formatBRL(value) {
  return Number(value).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

// Card de produto
function createProductCard(product) {
  return `
    <div class="col">
      <article class="card" onclick="window.location.href='/pages/productDetails.html?id=${product.id}'">
        <img src="${getImagePath(product)}" alt="${product.name}" onerror="this.onerror=null;this.src='/img/products/product-placeholder.avif';">
        <h3>${product.name}</h3>
        <div>
          <p>R$ ${formatBRL(product.price)}</p>
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

  // Se não tiver produtos
  if (!products.length) {
    container.innerHTML = `
      <div class="col-12">
        <p>Nenhum produto encontrado nesta faixa de preço.</p>
      </div>
    `;

    updateTitle(0);
    return;
  }

  container.innerHTML = products
    .map(createProductCard)
    .join("");

  updateTitle(products.length);

  if (window.lucide) {
    lucide.createIcons();
  }
}

// Atualizar títulos
function updateTitle(count) {
  const titles = document.querySelectorAll("h2");

  titles[0].textContent = `${currentModality} | (${count}) Produtos`;
  titles[1].textContent = `${currentModality} | Popular`;
}

// Embaralhar (Fisher-Yates)
function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Renderizar populares
function renderPopular(products) {
  const container = document.getElementById("products-popular-container");

  const randomProducts = shuffle(products).slice(0, 4);

  container.innerHTML = randomProducts
    .map(createProductCard)
    .join("");

  if (window.lucide) {
    lucide.createIcons();
  }
}

// Filtro por preço
function filterByPrice(range) {
  if (range === "all") return allProducts;

  const [min, max] = range.split("-").map(Number);

  return allProducts.filter(product => {
    const price = Number(product.price);

    if (max) {
      return price >= min && price <= max;
    }

    return price >= min;
  });
}

// Carregar produtos
async function loadProducts() {
  const params = new URLSearchParams(window.location.search);
  const modality = params.get("modality");

  const container = document.getElementById("products-container");

  if (!modality) {
    container.innerHTML = "<p>Modalidade não informada.</p>";
    return;
  }

  currentModality = modality;

  container.innerHTML = "<p>Carregando...</p>";

  try {
    const products = await getProductsByModality(modality);

    if (!products.length) {
      container.innerHTML = "<p>Nenhum produto encontrado.</p>";
      return;
    }

    allProducts = products;

    renderProducts(products);
    renderPopular(products);

  } catch (error) {
    console.error(error);
    container.innerHTML = "<p>Erro ao carregar produtos.</p>";
  }
}

// Evento do filtro
function setupFilter() {
  document.addEventListener("click", (e) => {
    const item = e.target.closest(".dropdown-item");
    if (!item) return;

    if (item.dataset.range) {
      currentRange = item.dataset.range;
      applyFiltersAndSort(currentRange);
      updatePriceButton();
    }

    if (item.dataset.sort) {
      if (item.dataset.sort === "none") {
        currentSort = null;
      } else {
        currentSort = item.dataset.sort;
      }

      applyFiltersAndSort(currentRange);
      updateSortButton(); 
    }
  });
}

function updatePriceButton() {
  const priceText = document.getElementById("price-text");

  const labels = {
    "all": "Preço",
    "0-50": "Até R$ 50",
    "50-100": "R$ 50 - 100",
    "100-300": "R$ 100 - 300",
    "300-1000": "R$ 300+"
  };

  priceText.textContent = labels[currentRange] || "Preço";
}

function sortProducts(products, order) {
  const sorted = [...products];

  if (order === "asc") {
    sorted.sort((a, b) => a.price - b.price);
  } else if (order === "desc") {
    sorted.sort((a, b) => b.price - a.price);
  }

  return sorted;
}

function applyFiltersAndSort(range) {
  let result = filterByPrice(range);

  if (currentSort) {
    result = sortProducts(result, currentSort);
  }

  renderProducts(result);
}

function updateSortButton() {
  const sortText = document.getElementById("sort-text");

  if (!currentSort) {
    sortText.textContent = "Ordenar";
    return;
  }

  if (currentSort === "asc") {
    sortText.textContent = "Menor preço";
  } else if (currentSort === "desc") {
    sortText.textContent = "Maior preço";
  }
}



// Inicialização
loadProducts();
setupFilter();