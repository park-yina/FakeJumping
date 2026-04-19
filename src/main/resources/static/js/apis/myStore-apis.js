export async function fetchMyStoreMe() {
    const res = await fetch("/api/store/me", {
        headers: {
            Authorization: "Bearer " + localStorage.getItem("accessToken")
        }
    });
    if (!res.ok) throw res;
    return res.json();
}

export async function updateOpenDate(openAt, force = false) {
    try {
        const res = await fetch("/api/store/me/open-date", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + localStorage.getItem("accessToken")
            },
            body: JSON.stringify({
                openAt: openAt,
                force: force
            })
        });

        if (!res.ok) {
            const err = await res.json();

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

        if (e.code === "OPERATING_TO_FUTURE") {
            return Promise.reject(e);
        }

        await Swal.fire({
            icon: "error",
            title: "오픈 날짜 설정 실패",
            text: e.message || "다시 시도해주세요."
        });

        throw e;
    }
}