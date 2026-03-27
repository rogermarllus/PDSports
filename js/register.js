import { register, isAuthenticated } from "./auth.js";
import { initRegisterForm } from "./formValidation.js";

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

initRegisterForm(async ({ name, email, phone, birthDate, password }) => {
  const termsAccepted = document.getElementById("input-checkbox").checked;

  if (!termsAccepted) {
    alert("Você precisa aceitar os termos de uso");
    return;
  }

  try {
    btn.disabled = true;
    btn.textContent = "Cadastrando...";

    const user = await register({ name, email, phone, birthDate, password });

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
