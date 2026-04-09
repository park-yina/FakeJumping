import {renderHome} from "./common-uis.js";
import {renderTemp, renderTempList} from "./temp-uis.js";
import {renderCreateStore} from "./store-uis.js";
export function sortByDateDesc(data) {
    return [...data].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

export function sortByDateAsc(data) {
    return [...data].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
}
export function sortByStore(data) {
    return [...data].sort((a, b) =>
        a.storeName.localeCompare(b.storeName, 'ko')
    );
}
export function searchAddress() {
    new daum.Postcode({
        oncomplete: function (data) {

            // 전체 주소
            document.getElementById("address").value = data.address;

            // region (시/도)
            document.getElementById("region").value = data.sido;

            const sigungu = data.sigungu; // ex: "안양시 만안구", "양천구", "군포시"

            let city = null;
            let district = null;

            const parts = sigungu.split(" ");

            if (parts.length === 2) {
                // 성남시 분당구
                city = parts[0];
                district = parts[1];
            } else if (parts.length === 1) {
                if (parts[0].endsWith("구")) {
                    // 서울 (양천구)
                    district = parts[0];
                } else {
                    // 군포시
                    city = parts[0];
                }
            }

            document.getElementById("city").value = city || "";
            document.getElementById("district").value = district || "";
        }
    }).open();
}

export async function resetPassword(username) {

    const confirm = await Swal.fire({
        title: "비밀번호 강제 초기화",
        text: `${username}의 비밀번호를 초기화하시겠습니까?`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "초기화",
        cancelButtonText: "취소"
    });

    if (!confirm.isConfirmed) return;

    try {
        const res = await fetch("/api/admin/reset-password", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + localStorage.getItem("accessToken")
            },
            body: JSON.stringify({
                username: username
            })
        });

        if (!res.ok) throw new Error();

        const data = await res.json();

        await Swal.fire({
            title: "비밀번호 강제 초기화 완료",
            html: `
<b>지점명:</b>${data.storeName}<br>
                <b>아이디:</b> ${data.username}<br>
                <b>임시 비밀번호:</b> ${data.tempPassword}<br><br>
                <small style="color:red;">
                    ※ 로그인 후 반드시 변경해야 합니다.
                </small>
            `,
            icon: "success"
        });

    } catch (e) {
        Swal.fire("오류", "비밀번호 초기화 실패", "error");
    }
}

export function navigate(page, el) {
    setActive(el);

    if (page === 'home') renderHome();
    if (page === 'create-store') renderCreateStore();
    // if(page==='admin-list')renderTemp();
    if (page === 'store-list') renderTest();
    if (page === 'temp') renderTemp();
}
export function setActive(el) {
    document.querySelectorAll('.nav-item, .dashboard-card')
        .forEach(e => e.classList.remove('active'));

    el.classList.add('active');
}