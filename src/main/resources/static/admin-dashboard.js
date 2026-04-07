import { createStoreApi } from "./store-api.js";
import {renderTempSummary} from "./common-uis.js";
import {renderStoreSummary} from "./store-uis.js";
import {sortByDateAsc,sortByDateDesc,sortByStore} from "./utils.js";

let tempData = [];

// ✅ 카드 HTML 생성 헬퍼
const renderCard = ({ title, content, onclick = "" }) => `
  <div class="card" ${onclick ? `style="cursor:pointer" onclick="${onclick}"` : ""}>
    <h3>${title}</h3>
    ${content}
  </div>
`;

// ✅ 에러 카드 래퍼
const withErrorCard = (targetId, label) =>
    (err) => {
        document.getElementById(targetId).innerHTML = renderCard({
            title: `⚠️ ${label} 불러오기 실패`
        });
    };
function setActive(el) {
    document.querySelectorAll('.nav-item').forEach(e => e.classList.remove('active'));
    el.classList.add('active');
}

function navigate(page, el) {
    setActive(el);

    if (page === 'home') renderHome();
    if (page === 'create-store') renderCreateStore();
    // if(page==='admin-list')renderTemp();
    if (page === 'store-list') renderTest();
    if (page === 'temp') renderTemp();
}

async function checkLogin() {
    let token = localStorage.getItem("accessToken");

    if (!token) {
        location.href = "/sign-inView";
        return false;
    }

    let res = await fetch("/auth/me", {
        headers: { Authorization: "Bearer " + token },
        credentials: "include"
    });

    if (res.status === 401) {
        const refreshRes = await fetch("/auth/refresh", {
            method: "POST",
            credentials: "include"
        });

        if (!refreshRes.ok) {
            localStorage.clear();
            location.href = "/sign-inView";
            return false;
        }

        const newData = await refreshRes.json();
        localStorage.setItem("accessToken", newData.accessToken);

        res = await fetch("/auth/me", {
            headers: { Authorization: "Bearer " + newData.accessToken },
            credentials: "include"
        });
    }

    const data = await res.json();

    if (data.mustChangePassword === true) {
        location.href = "/change-password";
        return false;
    }

    localStorage.setItem("role", data.role);
    return true; // 🔥 핵심
}
function applyRole() {
    const role = localStorage.getItem("role");
    const logo = document.getElementById("logo-text");
    if (role === "SUPER_ADMIN") {
        document.getElementById("super-admin-menu").style.display = "block";
        logo.textContent = "SUPER ADMIN";
        logo.classList.add("text-red-500");
    } else {
        document.getElementById("store-admin-menu").style.display = "block";
        logo.textContent = "STORE ADMIN";
        logo.classList.add("text-blue-500");
    }
}

async function init() {
    const isValid = await checkLogin();

    if (!isValid) return; // 🔥 여기 추가

    applyRole();
    await renderHome();
}
init();

async function renderHome() {
    document.getElementById("page-title").textContent = "대시보드";

    const role = localStorage.getItem("role");

    if (role === "STORE_ADMIN") {
        const storeName = localStorage.getItem("storeName") ?? "매장";
        document.getElementById("main-content").innerHTML = renderCard({
            title: `🏪 ${storeName} 관리 페이지`,
            content: `<p class="text-gray-500">매장 운영을 관리할 수 있습니다.</p>`
        });
        return;
    }

    document.getElementById("main-content").innerHTML = `
    <div id="dashboard-grid" style="display:grid; gap:16px;">
      <div id="store-summary"></div>
      <div id="temp-summary"></div>
    </div>
  `;

    // 병렬 실행으로 성능 개선
    await Promise.all([
        renderStoreSummary(),
        renderTempSummary()
    ]);
}


function renderCreateStore() {
    document.getElementById("page-title").textContent = "스토어 생성";

    document.getElementById("main-content").innerHTML = `
        <div class="card p-6 max-w-2xl mx-auto">

            <h2 class="text-xl font-semibold mb-6">새 매장 등록</h2>

            <!-- 스토어 이름 -->
            <div class="mb-4">
                <label class="block text-sm mb-1 text-gray-400">스토어 이름</label>
                <input id="storeName"
                       class="w-full p-3 rounded-lg bg-gray-900 border border-gray-700 focus:outline-none focus:border-blue-500"
                       placeholder="예: 강남점">
            </div>

            <!-- 주소 -->
            <div class="mb-4">
                <label class="block text-sm mb-1 text-gray-400">주소</label>
                <div class="flex gap-2">
                    <input id="address"
                           class="flex-1 p-3 rounded-lg bg-gray-900 border border-gray-700"
                           placeholder="주소 검색 버튼을 눌러주세요"
                           readonly onclick="searchAddress()">
                    <button onclick="searchAddress()"
                            class="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg">
                        검색
                    </button>
                </div>
            </div>

            <!-- 지역 -->
            <div class="mb-6">
                <label class="block text-sm mb-1 text-gray-400">지역</label>
                <input id="region"
                       class="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 text-gray-400"
                       placeholder="예: 경기"
                       readonly>
                       <input id="city"
       class="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 text-gray-400 mt-2"
       placeholder="예: 안양시"
       readonly>
       <input id="district"
       class="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 text-gray-400 mt-2"
       placeholder="예: 만안구"
       readonly>
            </div>

            <!-- 버튼 영역 -->
            <div class="flex justify-end gap-2">
                <button onclick="goHome()"
                        class="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg">
                    취소
                </button>
                <button class="px-5 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg font-semibold"
                        onclick="createStore()">
                    생성
                </button>
            </div>

        </div>
    `;
}

function searchAddress() {
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


export async function createStore() {
    const storeName = document.getElementById("storeName").value;
    const address = document.getElementById("address").value;
    const region = document.getElementById("region").value;
    const city = document.getElementById("city").value;
    const district = document.getElementById("district").value;

    if (!storeName) {
        Swal.fire("스토어 명을 입력하세요");
        return;
    }

    if (!address || !region) {
        Swal.fire("주소를 선택하세요");
        return;
    }

    const requestData = {
        storeName,
        address,
        region,
        city,
        district
    };

    try {
        const data = await createStoreApi(requestData);

        Swal.fire({
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

        let errorMessage = "스토어 생성 실패";

        if (e instanceof Response) {
            try {
                const errorData = await e.json();
                errorMessage = errorData.message || errorMessage;
            } catch {}
        }

        Swal.fire("에러 발생", errorMessage, "error");
    }
}

function renderTempList(data) {
    let html = `
        <div class="card">

            <div style="margin-bottom:10px;">
                <button class="btn btn-ghost" onclick="sortByDateDesc(data)">최신순</button>
                <button class="btn btn-ghost" onclick="sortByDateAsc(data)">오래된순</button>
                <button class="btn btn-ghost" onclick="sortByStore(data)">지점명순</button>
            </div>

    `;

    data.forEach((d, i) => {
        html += `
            <div style="padding:10px; border-bottom:1px solid #333;">
                <b>#${i + 1} ${d.username}</b> - ${d.storeName}
                <div style="font-size:12px; color:#888;">
                    생성일: ${d.createdAt}
                </div>
                    <button class="btn btn-danger btn-sm"
                onclick="resetPassword('${d.username}')">
                비밀번호 초기화
            </button>
            </div>

        `;
    });;

    html += `</div>`;

    document.getElementById("main-content").innerHTML = html;
}

async function resetPassword(username) {

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
document.addEventListener("DOMContentLoaded", () => {
    const logoutBtn = document.getElementById("logout-btn");

    if (logoutBtn) {
        logoutBtn.addEventListener("click", logout);
    }
});
async function logout() {
    try {
        const token = localStorage.getItem("accessToken");

        await fetch("/api/auth/sign-out", {
            method: "POST",
            headers: {
                "Authorization": "Bearer " + token
            }
        });
    } catch (e) {
        console.warn("로그아웃 요청 실패 (무시하고 진행)", e);
    }

    // 🔥 서버 실패해도 무조건 로그아웃 처리
    localStorage.clear();
    location.href = "/sign-inView";
}