const STORAGE_KEY = "cart";

const cart = {
    items: []
}

function saveCart() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart.items));
}

function loadCart() {
    const data = localStorage.getItem(STORAGE_KEY);

    cart = data ? JSON.parse(data) : { item: [] };
}

function addToCart(product) {
    const existItem = cart.items.find(item => item.id === product.id);

    if (existItem) {
        existItem.quantity++;
        saveCart();
        return existItem;
    }

    const newItem = {
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: product.quantity,
        image: product.image || "product-placeholder.png"
    };

    cart.items.push(newItem);
    return newItem;
}

function removeFromCart(productId) {
    const removedItem = cart.items.find(item => item.id === productId);

    if (!removedItem) return null;

    cart.items = cart.items.filter(item => item.id !== productId);
    saveCart();

    return removedItem;
}

function incrementItem(productId) {
    const item = cart.items.find(item => item.id === productId);

    if (!item) {
        return null;
    }

    item.quantity++;
    saveCart();
    return item;
}

function decrementItem(productId) {
    const item = cart.items.find(item => item.id === productId);

    if (!item) {
        return null;
    }

    if (item.quantity === 1) {
        removeFromCart(productId);
        return null;
    }

    item.quantity--;
    saveCart();
    return item;
}

function updateQuantity(productId, newQuantity) {
    const item = cart.items.find(item => item.id === productId);

    if (!item) return null;

    if (newQuantity <= 0) {
        removeFromCart(productId);
    }

    item.quantity = newQuantity;
    saveCart();

    return item;
}

function calculateTotal() {
    return cart.items.reduce((total, item) => {
        return total + item.price * item.quantity;
    }, 0);
}

loadCart();