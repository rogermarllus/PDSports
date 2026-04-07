import { getProductsByModality } from "./products.js";
import { addToCart } from "./cart.js";
import { isAuthenticated } from "./auth.js";

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
      <article class="card" data-id="${product.id}">
        <img src="${getImagePath(product)}" alt="${product.name}" onerror="this.onerror=null;this.src='/img/products/product-placeholder.avif';">
        <h3>${product.name}</h3>
        <div>
          <p>${formatBRL(product.price)}</p>
          <button class="btn-add-cart" aria-label="Adicionar ao carrinho">
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

  wireProductCards(products, container);
}

function wireProductCards(products, container) {
  // Seleciona todos os cards dentro do container específico
  const cards = container.querySelectorAll(".card");

  cards.forEach((card) => {
    // Pega o id do produto armazenado no HTML (data-id)
    const productId = card.dataset.id;

    // Encontra o objeto completo do produto com base no id
    // Conversão para string evita problemas de tipo (number vs string)
    const product = products.find(
      p => String(p.id) === String(productId)
    );

    // Se não encontrar o produto correspondente, ignora esse card
    if (!product) return;

    // ===== Clique no card inteiro ======
    // Redireciona para a página de detalhes do produto
    card.addEventListener("click", () => {
      window.location.href = `/pages/productDetails.html?id=${product.id}`;
    });

    // Seleciona o botão de adicionar ao carrinho dentro do card
    const btn = card.querySelector(".btn-add-cart");

    // Se por algum motivo o botão não existir, evita erro
    if (!btn) return;

    //===== Clique no botão de adicionar ao carrinho ======
    btn.addEventListener("click", (e) => {
      // Impede que o clique "suba" para o card
      // (evita redirecionar ao clicar no botão)
      e.stopPropagation();

      // Verifica se o produto tem estoque disponível
      if (Number(product.amount) <= 0) {
        alert("Produto indisponível");
        return;
      }

      // Verifica se o usuário está autenticado
      if (!isAuthenticated()) {
        alert("Para executar esta ação, você precisa estar logado !");
        return;
      }

      // Adiciona o produto ao carrinho (localStorage + evento global)
      addToCart(product);

      // Feedbackpara o usuário
      updateModal({
        title: "Produto adicionado !",
        message: "Seu produto foi adicionado à sacola.",
        subMessage: "Adicione mais produtos ou finalize sua compra ."
      });

      // Abre o modal
      openModal()
    });
  });
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

  wireProductCards(randomProducts, container);
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

// Atualiza dinamicamente o conteúdo do modal de feedback para quando um produto for adicionado no carrinho
function updateModal({ title, message, subMessage }) {
  // Atualiza o título do modal
  document.getElementById("modal-pedido-titulo").textContent = title;

  // Atualiza o corpo do modal com mensagem e submensagem
  const body = document.querySelector(".modal-pedido-body");
  body.innerHTML = `
    <p>${message}</p>
    <p class="modal-pedido-sub">${subMessage}</p>
  `;
}

// Abre o modal utilizando o Bootstrap
function openModal() {
  // Seleciona o elemento do modal
  const modalElement = document.getElementById("modal-pedido-indisponivel");

  // Cria uma instância do modal Bootstrap
  const modal = new bootstrap.Modal(modalElement);

  // Exibe o modal na tela
  modal.show();
}


// Inicialização
loadProducts();
setupFilter();