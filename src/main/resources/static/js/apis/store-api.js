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
