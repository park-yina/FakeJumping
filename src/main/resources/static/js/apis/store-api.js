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
export async function closeStore(storeId, closedAt, force = false) {
    try {
        const res = await fetchWithAuth(`/api/stores/${storeId}/close`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                closedAt,
                force
            })
        });

        if (!res.ok) {
            let err;
            try {
                err = await res.json();
            } catch {
                err = { message: "서버 오류" };
            }
            throw err;
        }

        const data = await res.json();

        return data;

    } catch (e) {
        console.error(e);
        throw e;
    }
}
export async function updateCloseDate(storeId, closedAt, force = false) {
    const res = await fetchWithAuth(`/api/stores/${storeId}/closed-date`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            closedAt,
            force
        })
    });

    if (!res.ok) {
        const err = await res.json().catch(() => ({
            message: "서버 오류"
        }));
        throw err;
    }

    return res.json();
}
export async function updateStoreOpenDate(storeId, openAt, force = false) {
    try {
        const res = await fetchWithAuth(`/api/stores/${storeId}/open-date`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                openAt,
                force
            })
        });

        if (!res.ok) {
            let err;
            try {
                err = await res.json();
            } catch {
                err = {message: "서버 오류"};
            }
            throw err;
        }

        const data = await res.json();

        await Swal.fire({
            icon: "success",
            title: "오픈 날짜 설정 완료",
            timer: 1200,
            showConfirmButton: false
        });

        return data;

    } catch (e) {
        console.error(e);

        await Swal.fire({
            icon: "error",
            title: "오픈 날짜 설정 실패",
            text: e.message || "다시 시도해주세요."
        });

        throw e;
    }
}
export async function reopenStore(storeId) {
    const res = await fetchWithAuth(`/api/stores/${storeId}/reopen`, {
        method: "PUT"
    });
    if (!res.ok) throw res;

    return res.json();
}