import { get, post, put, del } from "./api.js";

const STORAGE_KEY = "user";

// Registro do usuário
export async function register(userData) {
    const users = await get("users", "users");
    const exists = users.find(u => u.email === userData.email);

    if (exists) {
        throw new Error("Email já cadastrado");
    }

    const newUser = {
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        birthDate: userData.birthDate,
        password: userData.password,
        isAdmin: false
    };

    const createdUser = await post("users", "users", newUser);

    saveUserSession(createdUser);
    return createdUser;
}

// Login do usuário
export async function login(email, password) {
    const users = await get("users", "users");
    const user = users.find(u => u.email === email && u.password === password);

    if (!user) {
        throw new Error("Email ou senha inválidos");
    }

    saveUserSession(user);
    return user;
}

// Logout do usuário
export function logout() {
    localStorage.removeItem(STORAGE_KEY);
    window.location.href = "/pages/login.html";
}

// Salvamento de dados do usuários inseridos no sistema
export function saveUserSession(user) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
}

// Pega os dados do usuário atual em objeto JSON
export function getCurrentUser() {
    const data = localStorage.getItem(STORAGE_KEY);

    return data ? JSON.parse(data) : null;
}

// Verifica se está autenticado, se não, retorna o fluxo do sistema
export function isAuthenticated() {
    return !!getCurrentUser();
}

// Verifica se é Admin
export function isAdmin() {
    const user = getCurrentUser();
    return user?.isAdmin === true;
}

// Protege a rota para os não autenticados
export function protectRoute() {
    if (!isAuthenticated()) {
        window.location.href = "/pages/login.html";
        return false;
    }

    return true;
}

// Protege a rota para os não administradores
export function protectAdminRoute() {
    if (!isAuthenticated() || !isAdmin()) {
        window.location.href = "/pages/login.html";
        return false;
    }

    return true;
}

// Redireciona a rota para a página de usuário se for autenticado
export function redirectedAuthenticated() {
    if (isAuthenticated()) {
        window.location.href = "/pages/userDetails.html";
        return false;
    }

    return true;
}

// Redireciona a rota para o dashboard admin se for admin
export function redirectedAdmin() {
    if (isAuthenticated()) {
        window.location.href = "/pages/dashboardAdmin.html";
        return false;
    }

    return true;
}