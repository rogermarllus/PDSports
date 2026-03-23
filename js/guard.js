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