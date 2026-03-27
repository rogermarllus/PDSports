import { login, isAuthenticated } from "./auth.js";
import { initLoginForm } from "./formValidation.js";

function redirectIfAuthenticated() {
  if (!isAuthenticated()) return;
  const user = JSON.parse(localStorage.getItem("user"));
  if (user?.isAdmin) {
    window.location.href = "/pages/dashboardAdmin.html";
  } else {
    window.location.href = "/index.html";
  }
}

redirectIfAuthenticated();

const btn = document.getElementById("btn-login");

initLoginForm(async ({ email, password }) => {
  try {
    btn.disabled = true;
    btn.textContent = "Entrando...";

    const user = await login(email, password);

    if (user.isAdmin) {
      window.location.href = "/pages/dashboardAdmin.html";
    } else {
      window.location.href = "/index.html";
    }
  } catch (err) {
    alert(err.message);
  } finally {
    btn.disabled = false;
    btn.textContent = "Entrar";
  }
});
