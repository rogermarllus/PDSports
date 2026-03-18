import { get, post, put, del } from "./api.js";

//  IDs de diferentes recursos no MockAPI
function getEndpointById(id) {
  return Number(id) <= 100 ? "products" : "products2";
}

// Listar todos os produtos
export async function getAllProducts() {
  const products1 = await get("products");
  const products2 = await get("products2");
  return [...products1, ...products2];
}

// Buscar por ID
export async function getProductById(id) {
  const endpoint = getEndpointById(id);
  return await get(`${endpoint}/${id}`);
}

// Filtrar por modalidade
export async function getProductsByModality(modality) {
  const products = await getAllProducts();
  return products.filter(p => p.modality === modality);
}

// Buscar por nome
export async function searchProductsByName(term) {
  const products = await getAllProducts();
  return products.filter(p =>
    p.name.toLowerCase().includes(term.toLowerCase())
  );
}

// Criar produto
export async function createProduct(productData) {
  return await post("products2", productData);
}

// Atualizar produto
export async function updateProduct(id, data) {
  const endpoint = getEndpointById(id);
  return await put(`${endpoint}/${id}`, data);
}

// Deletar produto
export async function deleteProduct(id) {
  const endpoint = getEndpointById(id);
  return await del(`${endpoint}/${id}`);
}