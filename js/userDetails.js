import { getCurrentUser, logout } from "./auth.js";

function formatDate(dateStr) {
    if (!dateStr) return "—";
    if (dateStr.includes("-")) {
        const [year, month, day] = dateStr.split("-");
        return `${day}/${month}/${year}`;
    }
    return dateStr;
}

function fillUserData(user) {
    const set = (id, value) => {
        const el = document.getElementById(id);
        if (el) el.textContent = value || "—";
    };

    set("user-fullname", user.name);
    set("user-phone", user.phone);
    set("user-email", user.email);
    set("user-birth", formatDate(user.birthDate));
}

function setupLogout() {
    const btn = document.getElementById("btn-sair");
    if (!btn) return;

    btn.addEventListener("click", logout);
}

function init() {
    const user = getCurrentUser();

    if (!user) {
        window.location.href = "/pages/login.html";
        return;
    }

    fillUserData(user);
    setupLogout();
}

init();