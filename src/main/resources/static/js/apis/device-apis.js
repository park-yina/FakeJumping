import {fetchWithAuth} from "../utils/utils.js";

export async function createDevice(requestData) {
    const res = await fetchWithAuth("/api/devices/create/bulk", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(requestData)
    });

    if (!res.ok) throw res;

    return res.json();
}