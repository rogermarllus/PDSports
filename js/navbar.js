import { getCurrentUser } from "./auth.js";

// ── Badge do Carrinho ─────────────────────────────────────────

const CART_KEY = "cart";

function injectBadgeStyles() {
  if (document.getElementById("cart-badge-style")) return;

  const style = document.createElement("style");
  style.id = "cart-badge-style";
  style.textContent = `
    .cart-link-wrapper {
      position: relative;
      display: inline-flex;
    }
    .cart-badge {
      position: absolute;
      top: 2px;
      right: 2px;
      transform: translate(40%, -40%);
      background-color: #1D0F28;
      color: #fff;
      font-size: 0.65rem;
      font-weight: 700;
      line-height: 1;
      min-width: 17px;
      height: 17px;
      padding: 0 4px;
      border-radius: 999px;
      display: flex;
      align-items: center;
      justify-content: center;
      pointer-events: none;
      border: 1.5px solid #fff;
      opacity: 0;
      transition: opacity 0.2s;
    }
    .cart-badge.visible {
      opacity: 1;
    }
  `;
  document.head.appendChild(style);
}

function getCartCount() {
  try {
    const items = JSON.parse(localStorage.getItem(CART_KEY)) || [];
    return items.reduce((sum, i) => sum + (i.quantity || 1), 0);
  } catch {
    return 0;
  }
}

function updateBadges() {
  const count = getCartCount();
  document.querySelectorAll(".cart-badge").forEach(badge => {
    badge.textContent = count > 99 ? "99+" : String(count);
    badge.classList.toggle("visible", count > 0);
  });
}

function setupCartBadges() {
  injectBadgeStyles();

  // Envolve cada link do carrinho num wrapper relativo e injeta o badge
  document.querySelectorAll('a[aria-label="Carrinho"]').forEach(link => {
    if (link.querySelector(".cart-badge")) return; // já inicializado

    link.classList.add("cart-link-wrapper");

    const badge = document.createElement("span");
    badge.className = "cart-badge";
    badge.setAttribute("aria-hidden", "true");
    link.appendChild(badge);
  });

  updateBadges();

  // Atualiza ao navegar entre abas ou quando cart.js salva no localStorage
  window.addEventListener("storage", (e) => {
    if (e.key === CART_KEY) updateBadges();
  });

  // Quando acontecer um evento chamado cartUpdated, executa a função updateBadges
  document.addEventListener("cartUpdated", updateBadges);
}


function getFirstName(fullName) {
  if (!fullName) return "";
  return fullName.trim().split(" ")[0];
}

function getBasePath() {
  return window.location.pathname.includes("/pages/") ? ".." : ".";
}

function applyNavbar(user, base, ids) {
  const link = document.getElementById(ids.link);
  const icon = document.getElementById(ids.icon);
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

  setupCartBadges();
}



setupNavbar();