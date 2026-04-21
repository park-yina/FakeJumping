import {fetchWithAuth} from "../utils/utils.js";

export async function fetchMyStoreMe() {
    const res = await fetchWithAuth("/api/store/me");

    if (!res.ok) throw res;

    return res.json();
}

export async function updateOpenDate(openAt, force = false) {
    try {
        const res = await fetchWithAuth("/api/store/me/open-date", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                openAt,
                force
            })
        });

        // 🔥 에러 처리
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

        await Swal.fire({
            icon: "success",
            title: "오픈 날짜 설정 완료",
            timer: 1200,
            showConfirmButton: false
        });

        return data;

    } catch (e) {
        console.error(e);

        // 🔥 특정 에러는 상위에서 처리
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