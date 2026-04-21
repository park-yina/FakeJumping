import {fetchWithAuth} from "../utils/utils.js";

export async function fetchTempSummary() {
    const res = await fetchWithAuth("/api/admin/temp/count");

    if (!res.ok) throw res;

    return res.json();
}
