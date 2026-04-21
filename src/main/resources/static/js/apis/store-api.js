export async function createStoreApi(requestData) {
    const res = await fetch("/api/stores", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + localStorage.getItem("accessToken")
        },
        body: JSON.stringify(requestData)
    });

    if (!res.ok) {
        throw res;
    }

    return res.json();
}

export async function fetchMonthlySummary() {
    const res = await fetch("/api/stores/monthly-summary", {
        headers: {
            Authorization: "Bearer " + localStorage.getItem("accessToken")
        }
    });

    if (!res.ok) throw res;

    return res.json();
}

export async function fetchStoreSummary() {
    const res = await fetch("/api/admin/summary-store", {
        headers: {
            Authorization: "Bearer " + localStorage.getItem("accessToken")
        }
    });

    if (!res.ok) throw res;

    return res.json();
}

export async function fetchRegionSummary() {
    const res = await fetch("/api/stores/region-summary", {
        headers: {
            Authorization: "Bearer " + localStorage.getItem("accessToken")
        }
    });

    if (!res.ok) throw res;

    return res.json();
}

export async function fetchPendingStoreSummary() {
    const res = await fetch("/api/stores/pending-summary", {
        headers: {
            Authorization: "Bearer " + localStorage.getItem("accessToken")
        }
    });
    if (!res.ok) throw res;
    return res.json();
}
export async function fetchRegions() {
    const res = await fetch("/api/stores/regions", {
        headers: {
            Authorization: "Bearer " + localStorage.getItem("accessToken")
        }
    });

    if (!res.ok) throw new Error("지역 조회 실패");

    return res.json();
}
export async function fetchSubRegions(region) {
    const res = await fetch(`/api/stores/sub-regions?region=${region}`, {
        headers: {
            Authorization: "Bearer " + localStorage.getItem("accessToken")
        }
    });

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

    const res = await fetch(`/api/stores?${params.toString()}`, {
        headers: {
            Authorization: "Bearer " + localStorage.getItem("accessToken")
        }
    });

    if (!res.ok) {
        throw new Error("스토어 조회 실패");
    }

    return res.json();
}