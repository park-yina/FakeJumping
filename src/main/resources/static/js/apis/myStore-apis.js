export async function fetchMyStoreMe() {
    const res = await fetch("/api/store/me", {
        headers: {
            Authorization: "Bearer " + localStorage.getItem("accessToken")
        }
    });
    if (!res.ok) throw res;
    return res.json();
}
export async function updateOpenDate(openAt) {
    try {
        const res = await fetch("/api/store/me/open-date", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + localStorage.getItem("accessToken")
            },
            body: JSON.stringify({
                openAt: openAt
            })
        });

        if (!res.ok) {
            throw new Error("오픈 날짜 수정 실패");
        }

        const data = await res.json();

        // 성공 알림
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
            text: "다시 시도해주세요."
        });

        throw e;
    }
}