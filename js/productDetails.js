import { getProductById } from "./products.js";

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

// Carregar produto
async function loadProduct() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  if (!id) {
    document.body.innerHTML = "<p>Produto não encontrado.</p>";
    return;
  }

  try {
    const product = await getProductById(id);

    if (!product) {
      document.body.innerHTML = "<p>Produto não encontrado.</p>";
      return;
    }

    fillProductData(product);

  } catch (error) {
    console.error(error);
    document.body.innerHTML = "<p>Erro ao carregar produto.</p>";
  }
}

function fillProductData(product) {
  // Nome
  document.querySelector(".detalhes-produto h1").textContent = product.name;

  // Preço
  document.querySelector(".produto-preco").textContent =
    `R$ ${Number(product.price).toFixed(2)}`;

  // Descrição
  document.querySelector(".descricao-produto p").textContent =
    product.description;

  // Modalidade
  document.querySelector("dl dd").textContent = product.modality;

  // Disponibilidade
  const stockText = product.amount > 0 ? "Em estoque" : "Indisponível";
  document.querySelectorAll("dl dd")[1].textContent = stockText;

  // Cor
  const article = document.querySelector(".detalhes-produto article");
  const colorElement = article.querySelector("p:first-of-type");

  if (colorElement) {
    colorElement.innerHTML = `<strong>Cor:</strong> ${product.color || "-"}`;
  }

  // Imagem
  const img = document.querySelector(".img-produto");
  img.src = getImagePath(product);
  img.alt = product.name;

  // Variação
  const sizeLabel = article.querySelector("p:nth-of-type(2)");
  const variationContainer = article.querySelector("div");

  if (product.variationType === "Nenhuma") {
    if (sizeLabel) sizeLabel.style.display = "none";
    if (variationContainer) variationContainer.style.display = "none";
  } else {
    if (sizeLabel) sizeLabel.style.display = "block";
    if (variationContainer) variationContainer.style.display = "block";

    let sizes = [];

    if (product.variationType === "Numeração") {
      sizes = [36, 37, 38, 39, 40];
    }

    if (product.variationType === "Letra") {
      sizes = ["PP", "P", "M", "G", "GG"];
    }

    variationContainer.innerHTML = sizes
      .map(size => `<button class="btn-tamanho">${size}</button>`)
      .join("");

    const sizeButtons = variationContainer.querySelectorAll(".btn-tamanho");
    if (sizeButtons.length > 0) {
      sizeButtons[0].classList.add("active");

      sizeButtons.forEach(btn => {
        btn.addEventListener("click", () => {
          sizeButtons.forEach(b => b.classList.remove("active"));
          btn.classList.add("active");
        });
      });
    }
  }

  if (window.lucide) {
    lucide.createIcons();
  }
}

loadProduct();