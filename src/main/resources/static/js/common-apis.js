export async function fetchTempSummary() {
    const res = await fetch("/api/admin/temp/count", {
        headers: {
            Authorization: "Bearer " + localStorage.getItem("accessToken")
        }
    });

    if (!res.ok) throw res;

    return res.json();
}
