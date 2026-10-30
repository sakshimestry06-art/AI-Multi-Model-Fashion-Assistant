const FashionApi = (() => {
    const API_BASE = "../Backend/api";

    async function request(endpoint, options = {}) {
        const response = await fetch(`${API_BASE}/${endpoint}`, {
            headers: {
                "Content-Type": "application/json",
                ...(options.headers || {})
            },
            ...options
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok || data.success === false) {
            throw new Error(data.message || "Server request failed.");
        }

        return data;
    }

    function currentUser() {
        return JSON.parse(localStorage.getItem("currentUser") || "null");
    }

    async function saveItems(type, items) {
        const user = currentUser();

        if (!user || !user.id) {
            return null;
        }

        return request("save-items.php", {
            method: "POST",
            body: JSON.stringify({
                user_id: user.id,
                type,
                items
            })
        });
    }

    return {
        request,
        currentUser,
        saveItems
    };
})();
