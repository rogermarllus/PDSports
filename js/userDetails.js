import { getCurrentUser, logout, saveUserSession } from "./auth.js";
import { put } from "./api.js";

const inputUserBirth = document.getElementById('user-birth');
const today = new Date();
const yesterday = new Date(today)
yesterday.setDate(today.getDate() - 1);

const formatted = yesterday.toISOString().split("T")[0];
inputUserBirth.max = formatted;

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
        if (!el) return;

        if (el.tagName === "INPUT") {
            el.value = value || "";
        } else {
            el.textContent = value || "—";
        }
    };

    set("user-fullname", user.name);
    set("user-phone", user.phone);
    set("user-email", user.email);
    set("user-birth", user.birthDate);
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

    setupEdit();
}

// Habilita os campos de input para edição
function enableEdit() {
    // Percorre todos os inputs com a classe "campo-input"
    // e remove o atributo "disabled", permitindo edição
    document.querySelectorAll(".campo-input").forEach(input => {
        input.removeAttribute("disabled");
    });

    // Esconde o botão "Editar"
    document.getElementById("btn-editar").classList.add("d-none");

    // Mostra o botão "Salvar"
    document.getElementById("btn-salvar").classList.remove("d-none");
}

// Função responsável por salvar os dados do usuário
async function saveUserData() {
    // Obtém o usuário atual (sessão/localStorage)
    const user = getCurrentUser();

    // Cria um novo objeto com os dados atualizados
    const updatedUser = {
        ...user, // mantém os dados antigos
        name: document.getElementById("user-fullname").value,
        phone: document.getElementById("user-phone").value,
        email: document.getElementById("user-email").value,
        birthDate: document.getElementById("user-birth").value
    };

    try {
        // Envia os dados atualizados para a API (PUT)
        await put("users", "users", user.id, updatedUser);

        // Atualiza os dados do usuário na sessão local
        saveUserSession(updatedUser);

        // Atualiza o conteúdo do modal com mensagem de sucesso
        updateModal({
            title: "Dados atualizados !",
            message: "Seus dados foram salvos com sucesso.",
            subMessage: "As informações já estão atualizadas na sua conta."
        });

        // Abre o modal
        openModal()

        // Quando o modal for fechado, recarrega a página
        const modalEl = document.getElementById("modal-pedido-indisponivel");
        modalEl.addEventListener("hidden.bs.modal", () => {
            location.reload();
        });

    } catch (err) {
        // Em caso de erro, atualiza o modal com mensagem de falha
        updateModal({
            title: "Erro ao salvar",
            message: "Não foi possível atualizar seus dados.",
            subMessage: "Tente novamente mais tarde."
        });

        // Abre o modal com mensagem de erro
        openModal();

        // Loga o erro no console para debug
        console.error(err);
    }
}

// Configura os eventos de clique dos botões "Editar" e "Salvar"
function setupEdit() {
    const editBtn = document.getElementById("btn-editar");
    const saveBtn = document.getElementById("btn-salvar");

    // Ao clicar em "Editar", habilita os campos
    if (editBtn) editBtn.addEventListener("click", enableEdit);

    // Ao clicar em "Salvar", executa a função de salvar dados
    if (saveBtn) saveBtn.addEventListener("click", saveUserData);
}

// Atualiza dinamicamente o conteúdo do modal
function updateModal({ title, message, subMessage }) {
    // Atualiza o título do modal
    document.getElementById("modal-pedido-titulo").textContent = title;

    // Atualiza o corpo do modal com mensagem e submensagem
    const body = document.querySelector(".modal-pedido-body");
    body.innerHTML = `
    <p>${message}</p>
    <p class="modal-pedido-sub">${subMessage}</p>
  `;
}

// Abre o modal utilizando o Bootstrap
function openModal() {
    // Seleciona o elemento do modal
    const modalElement = document.getElementById("modal-pedido-indisponivel");

    // Cria uma instância do modal Bootstrap
    const modal = new bootstrap.Modal(modalElement);

    // Exibe o modal na tela
    modal.show();
}


init();