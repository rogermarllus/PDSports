import { isAuthenticated, isAdmin } from "./auth.js";

const route = document.body.dataset.route;

if (route === "private" && !isAuthenticated()) {
  window.location.href = "/pages/login.html";
}

if (route === "admin" && (!isAuthenticated() || !isAdmin())) {
  window.location.href = "/pages/login.html";
}

