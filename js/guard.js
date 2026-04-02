import { isAuthenticated, isAdmin } from "./auth.js";

const route = document.body.dataset.route;

function redirectToLogin() {
  window.location.href = "/pages/login.html";
}

if (route === "user") {
  if (!isAuthenticated()) {
    redirectToLogin();
  }
}

if (route === "admin") {
  if (!isAuthenticated() || !isAdmin()) {
    redirectToLogin();
  }
}

// Se o usupario não estiver logado, emite um alerta de aviso que precisa logar para poder adicionar itens ao carrinho
export function requireAuth() {
  if (!isAuthenticated()) {
    alert("Para executar esta ação, você precisa estar logado!");
    
    return false;
  }
  return true;
}


