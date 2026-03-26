import { getCurrentUser } from "./auth.js";

function getFirstName(fullName) {
  if (!fullName) return "";
  return fullName.trim().split(" ")[0];
}

function getBasePath() {
  return window.location.pathname.includes("/pages/") ? ".." : ".";
}

function applyNavbar(user, base, ids) {
  const link     = document.getElementById(ids.link);
  const icon     = document.getElementById(ids.icon);
  const nameSpan = document.getElementById(ids.name);

  if (!link || !icon || !nameSpan) return;

  if (!user) {
    link.href = `${base}/pages/login.html`;
    icon.setAttribute("data-lucide", "user");
    nameSpan.classList.add("d-none");
  } else {
    const firstName = getFirstName(user.name);
    nameSpan.textContent = firstName;
    nameSpan.classList.remove("d-none");

    if (user.isAdmin) {
      link.href = `${base}/pages/dashboardAdmin.html`;
      icon.setAttribute("data-lucide", "bar-chart-3");
    } else {
      link.href = `${base}/pages/userDetails.html`;
      icon.setAttribute("data-lucide", "user");
    }
  }
}

function setupNavbar() {
  const user = getCurrentUser();
  const base = getBasePath();

  // Desktop
  applyNavbar(user, base, {
    link: "user-link",
    icon: "user-icon",
    name: "user-name"
  });

  // Mobile
  applyNavbar(user, base, {
    link: "user-link-mobile",
    icon: "user-icon-mobile",
    name: "user-name-mobile"
  });

  if (window.lucide) {
    lucide.createIcons();
  }
}

setupNavbar();