import { getCurrentUser } from "./auth.js";

function getFirstName(fullName) {
  if (!fullName) return "";
  return fullName.trim().split(" ")[0];
}

function setupNavbar() {
  const user = getCurrentUser();

  const link = document.getElementById("user-link");
  const icon = document.getElementById("user-icon");
  const nameSpan = document.getElementById("user-name");

  if (!link || !icon || !nameSpan) return;

  if (!user) {
    link.href = "pages/login.html";
    icon.setAttribute("data-lucide", "user");
    nameSpan.classList.add("d-none");
  } else {
    const firstName = getFirstName(user.name);
    nameSpan.textContent = firstName;
    nameSpan.classList.remove("d-none");

    if (user.isAdmin) {
      link.href = "pages/dashboardAdmin.html";
      icon.setAttribute("data-lucide", "bar-chart-3");
    } else {
      link.href = "pages/userDetails.html";
      icon.setAttribute("data-lucide", "user");
    }
  }

  if (window.lucide) {
    lucide.createIcons();
  }
}

setupNavbar();