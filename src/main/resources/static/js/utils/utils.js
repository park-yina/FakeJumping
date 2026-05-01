import {renderHome} from "../uis/common-uis.js";
import {renderTemp, renderTempList, renderTest} from "../uis/temp-uis.js";
import {renderCreateStore, renderStoreListPage} from "../uis/store-uis.js";
import {createStoreApi, fetchRegions} from "../apis/store-api.js";
import {logout} from "../admin-dashboard.js";
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
export function buildStepHeader(step, labels = []) {
    return `
        <div class="swal-step-bar">
            ${labels.map((label, i) => {
        const index = i + 1;

        return `
                    <div class="swal-step-node">
                        <div class="swal-step-circle 
                            ${index === step ? 'active' : ''}
                            ${index < step ? 'done' : ''}
                        ">
                            ${index}
                        </div>
                        <div class="swal-step-label 
                            ${index === step ? 'active' : ''}
                        ">
                            ${label}
                        </div>
                    </div>

                    ${i < labels.length - 1 ? `
                        <div class="swal-step-line 
                            ${index < step ? 'done' : ''}
                        "></div>
                    ` : ''}
                `;
    }).join('')}
        </div>
    `;
}
export async function openContactModal() {
    const defaultMsg = "과거 날짜로 오픈일 변경 요청";

    const { value } = await Swal.fire({
        title: "관리자 문의",
        input: "textarea",
        inputValue: defaultMsg, // 🔥 기본값
        inputLabel: "문의 내용을 입력해주세요",
        showCancelButton: true,
        confirmButtonText: "문의 보내기",
        cancelButtonText: "취소",
        buttonsStyling: false,
        customClass: {
            confirmButton: "btn btn-primary",
            cancelButton: "btn btn-ghost"
        }
    });

    if (!value) return;

    if (!value) return;

    try {
        const res = await fetch("/api/store/contact", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + localStorage.getItem("accessToken")
            },
            body: JSON.stringify({
                content: value
            })
        });

        if (!res.ok) {
            throw new Error("문의 전송 실패");
        }

        await Swal.fire({
            icon: "success",
            title: "문의가 접수되었습니다",
            timer: 1200,
            showConfirmButton: false
        });

    } catch (e) {
        await Swal.fire({
            icon: "error",
            title: "문의 실패",
            text: "다시 시도해주세요"
        });
    }
}
export async function createStoreHandler() {
    const storeName = document.getElementById("storeName").value;
    const address = document.getElementById("address").value;
    const region = document.getElementById("region").value;

    if (!storeName) {
        Swal.fire("스토어 명을 입력하세요");
        return;
    }

    if (!address || !region) {
        Swal.fire("주소를 선택하세요");
        return;
    }

    try {
        const data = await createStoreApi({
            storeName,
            address,
            region
        });

        await Swal.fire({
            title: "생성 완료 🎉",
            html: `
                <b>매장명:</b> ${data.storeName}<br>
                <b>계정:</b> ${data.username}<br>
                <b>임시 비밀번호:</b> ${data.tempPassword}
            `,
            icon: "success"
        });

    } catch (e) {
        console.error(e);

        let msg = "스토어 생성 실패";

        if (e instanceof Response) {
            try {
                const err = await e.json();
                msg = err.message || msg;
            } catch {}
        }

        Swal.fire("에러 발생", msg, "error");
    }
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

    if (!confirm.isConfirmed) return false; // 🔥 변경

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
                <b>지점명:</b> ${data.storeName}<br>
                <b>아이디:</b> ${data.username}<br>
                <b>임시 비밀번호:</b> ${data.tempPassword}<br><br>
                <small style="color:red;">
                    ※ 로그인 후 반드시 변경해야 합니다.
                </small>
            `,
            icon: "success"
        });

        return true; // 🔥 성공 시

    } catch (e) {
        await Swal.fire("오류", "비밀번호 초기화 실패", "error");
        return false; // 🔥 실패 시
    }
}
export function formatDate(str) {
    return new Date(str).toLocaleString('ko-KR', {
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', hour12: false
    });
}

export function navigate(page, el, options = {}) {

    if (!el) {
        el = document.querySelector(`[data-page="${page}"]`);
    }

    if (el) setActive(el);

    // 🔥 상태 저장 (페이지 + 옵션)
    const navState = {
        page,
        options
    };

    window.__NAV_STATE__ = navState;
    localStorage.setItem("navState", JSON.stringify(navState));

    // 🔥 렌더
    if (page === 'home') renderHome();
    if (page === 'create-store') renderCreateStore();
    if (page === 'store-list') renderStoreListPage(options);
    if (page === 'temp') renderTemp();
}
export function setActive(el) {
    document.querySelectorAll('.nav-item, .dashboard-card')
        .forEach(e => e.classList.remove('active'));

    el.classList.add('active');
}
export async function fetchWithAuth(url, options = {}) {
    let token = localStorage.getItem("accessToken");

    options.headers = {
        ...options.headers,
        Authorization: "Bearer " + token
    };

    let res = await fetch(url, {
        ...options,
        credentials: "include"
    });

    // 🔥 access 만료
    if (res.status === 401) {
        const refreshRes = await fetch("/auth/refresh", {
            method: "POST",
            credentials: "include"
        });

        if (!refreshRes.ok) {
            logout();
            return;
        }

        const data = await refreshRes.json();
        localStorage.setItem("accessToken", data.accessToken);

        // 🔥 재요청
        options.headers.Authorization = "Bearer " + data.accessToken;

        res = await fetch(url, {
            ...options,
            credentials: "include"
        });

        if (res.status === 401) {
            logout();
            return;
        }
    }

    return res;
}