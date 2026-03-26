import { register, isAuthenticated } from "./auth.js";

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

const form = document.getElementById("form-register");
const btn = document.getElementById("btn-login");

if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("input-name").value.trim();
    const email = document.getElementById("input-email").value.trim();
    const phone = document.getElementById("input-phone").value.trim();
    const birthDate = document.getElementById("input-date-of-birth").value;
    const password = document.getElementById("input-password").value.trim();
    const confirmPassword = document.getElementById("input-confirm-password").value.trim();
    const termsAccepted = document.getElementById("input-checkbox").checked;

    // Validações
    if (!name || !email || !phone || !birthDate || !password || !confirmPassword) {
      alert("Preencha todos os campos");
      return;
    }

    if (password !== confirmPassword) {
      alert("As senhas não coincidem");
      return;
    }

    if (!termsAccepted) {
      alert("Você precisa aceitar os termos de uso");
      return;
    }

    try {
      btn.disabled = true;
      btn.textContent = "Cadastrando...";

      const user = await register({
        name,
        email,
        phone,
        birthDate,
        password
      });

      // Redirecionamento (igual ao login)
      if (user.isAdmin) {
        window.location.href = "/pages/dashboardAdmin.html";
      } else {
        window.location.href = "/index.html";
      }

    } catch (err) {
      alert(err.message);
    } finally {
      btn.disabled = false;
      btn.textContent = "Cadastrar";
    }
  });
}