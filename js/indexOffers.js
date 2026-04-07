import { getProductById } from "./products.js";
import { addToCart } from "./cart.js";
import { isAuthenticated } from "./auth.js";

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
      <article class="card" data-id="${product.id}">
        <div class="img-card">
          <img src="${getImagePath(product)}" alt="${product.name}" onerror="this.onerror=null;this.src='/img/products/product-placeholder.avif';">
          <span>EM OFERTA</span>
        </div>
          <h3>${product.name}</h3>
        <div>
          <p> ${formatBRL(product.price)}</p>
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

  wireProductCards(products, container);
}

function wireProductCards(products, container) {
  // Seleciona todos os cards dentro do container específico
  const cards = container.querySelectorAll(".card");

  cards.forEach((card) => {
    // Recupera o id do produto armazenado no atributo data-id do HTML
    const productId = card.dataset.id;

    // Busca o objeto completo do produto correspondente a esse card
    // Conversão para string evita problemas de comparação (number vs string)
    const product = products.find(
      p => String(p.id) === String(productId)
    );

    // Se não encontrar o produto, interrompe para esse card
    if (!product) return;

    // ── Evento de clique no card inteiro ────────────────────
    // Redireciona para a página de detalhes do produto
    card.addEventListener("click", () => {
      window.location.href = `/pages/productDetails.html?id=${product.id}`;
    });

    // Seleciona o botão de adicionar ao carrinho dentro do card
    const btn = card.querySelector(".btn-add-cart");

    // Se o botão não existir, evita erro no código
    if (!btn) return;

    // ── Evento de clique no botão de adicionar ao carrinho ─
    btn.addEventListener("click", (e) => {
      // Impede que o clique do botão dispare também o clique do card
      // (sem isso, o usuário seria redirecionado para outra página)
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

      // Adiciona o produto ao carrinho (persistido no localStorage)
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
loadFeaturedProducts();