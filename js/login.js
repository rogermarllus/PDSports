import { login, isAuthenticated } from "./auth.js";

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

const form = document.getElementById("form-login");
const btn = document.getElementById("btn-login");

if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("input-email").value.trim();
    const password = document.getElementById("input-password").value.trim();

    if (!email || !password) {
      alert("Preencha todos os campos");
      return;
    }

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
}