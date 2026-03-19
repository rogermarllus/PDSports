const BASE_URLS = {
    products: "https://69b83d23ffbcd02860979f9b.mockapi.io/api",
    users: "https://69b83d57ffbcd0286097a0a9.mockapi.io/api"
};

export async function get(resource, endpoint) {
    const response = await fetch(`${BASE_URLS[resource]}/${endpoint}`);

    if (!response.ok) {
        throw new Error(`GET erro: ${response.status}`);
    }

    return await response.json();
}

export async function post(resource, endpoint, data) {
    const response = await fetch(`${BASE_URLS[resource]}/${endpoint}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    });

    if (!response.ok) {
        throw new Error(`POST erro: ${response.status}`);
    }

    return await response.json();
}

export async function put(resource, endpoint, data) {
    const response = await fetch(`${BASE_URLS[resource]}/${endpoint}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    });

    if (!response.ok) {
        throw new Error(`PUT erro: ${response.status}`);
    }

    return await response.json();
}

export async function del(resource, endpoint) {
    const response = await fetch(`${BASE_URLS[resource]}/${endpoint}`, {
        method: "DELETE"
    });

    if (!response.ok) {
        throw new Error(`DELETE erro: ${response.status}`);
    }
}