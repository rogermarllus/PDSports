async function usersMockAPI() {
    const useruUrlBase = "https://69b83d57ffbcd0286097a0a9.mockapi.io/api/users";
    const fetchAPI = await fetch(useruUrlBase).then(response => response.json());
}
