import {fetchWithAuth} from "../utils/utils.js";

export async function createStoreApi(requestData) {
    const res = await fetchWithAuth("/api/stores", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(requestData)
    });

    if (!res.ok) throw res;

    return res.json();
}

export async function fetchMonthlySummary() {
    const res = await fetchWithAuth("/api/stores/monthly-summary");

    if (!res.ok) throw res;

    return res.json();
}

export async function fetchStoreSummary() {
    const res = await fetchWithAuth("/api/admin/summary-store");

    if (!res.ok) throw res;

    return res.json();
}

export async function fetchRegionSummary() {
    const res = await fetchWithAuth("/api/stores/region-summary");

    if (!res.ok) throw res;

    return res.json();
}

export async function fetchPendingStoreSummary() {
    const res = await fetchWithAuth("/api/stores/pending-summary");

    if (!res.ok) throw res;

    return res.json();
}

export async function fetchRegions() {
    const res = await fetchWithAuth("/api/stores/regions");

    if (!res.ok) throw new Error("지역 조회 실패");

    return res.json();
}

export async function fetchSubRegions(region) {
    const res = await fetchWithAuth(`/api/stores/sub-regions?region=${region}`);

    if (!res.ok) throw new Error("하위 지역 조회 실패");

    return res.json();
}

export async function fetchStores({
                                      region = "",
                                      subRegion = "",
                                      status = "",
                                      page = 0,
                                      size = 10
                                  }) {
    const params = new URLSearchParams();

    if (region) params.append("region", region);
    if (subRegion) params.append("subRegion", subRegion);
    if (status) params.append("status", status);

    params.append("page", page);
    params.append("size", size);

    const res = await fetchWithAuth(`/api/stores?${params.toString()}`);

    if (!res.ok) {
        throw new Error("스토어 조회 실패");
    }

    return res.json();
}