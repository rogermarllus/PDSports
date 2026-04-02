import { get, post } from "./api.js";

const STORAGE_KEY = "user";

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

export async function login(email, password) {
    const users = await get("users", "users");

    const user = users.find(u => u.email === email && u.password === password);

    if (!user) {
        throw new Error("Email ou senha inválidos");
    }

    saveUserSession(user);

    return user;
}

export function logout() {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem("cart"); 
    window.location.href = "/pages/login.html";
}

export function saveUserSession(user) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
}

export function getCurrentUser() {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : null;
}

export function isAuthenticated() {
    return !!getCurrentUser();
}

export function isAdmin() {
    const user = getCurrentUser();
    return user?.isAdmin === true;
}