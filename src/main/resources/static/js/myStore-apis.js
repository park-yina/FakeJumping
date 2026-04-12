export async function fetchMyStoreMe() {
    const res = await fetch("/api/store/me", {
        headers: {
            Authorization: "Bearer " + localStorage.getItem("accessToken")
        }
    });
    if (!res.ok) throw res;
    return res.json();
}
