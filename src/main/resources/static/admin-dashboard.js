let tempData = [];
const API_BASE = "/api/admin";

const getAuthHeaders = () => ({
    Authorization: `Bearer ${localStorage.getItem("accessToken")}`
});

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
        return;
    }

    let res = await fetch("/auth/me", {
        headers: {Authorization: "Bearer " + token},
        credentials: "include"
    });

    if (res.status === 401) {

        // refresh 시도
        const refreshRes = await fetch("/auth/refresh", {
            method: "POST",
            credentials: "include"
        });

        if (!refreshRes.ok) {
            localStorage.clear();
            location.href = "/sign-inView";
            return;
        }

        const newData = await refreshRes.json();
        localStorage.setItem("accessToken", newData.accessToken);

        // 🔥 다시 요청
        res = await fetch("/auth/me", {
            headers: {Authorization: "Bearer " + newData.accessToken},
            credentials: "include"
        });
    }

    const data = await res.json();
    if (data.mustChangePassword === true) {
        if (window.location.pathname !== "/change-password") {
            window.location.href = "/change-password";
        }
        return;
    }

    localStorage.setItem("role", data.role);
    applyRole(data.role);
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
    await checkLogin();
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
async function renderTempSummary() {
    try {
        const res = await fetch("/api/admin/temp/count", {
            headers: {
                Authorization: "Bearer " + localStorage.getItem("accessToken")
            }
        });

        if (!res.ok) throw new Error();

        const data = await res.json();

        document.getElementById("temp-summary").innerHTML = `
        <div class="card dashboard-card" onclick="navigate('temp',this)">

            <!-- 🔥 헤더 개선 -->
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
                <h3 style="font-weight:600;">👤 관리자 현황</h3>

                <!-- 🔥 새로고침 버튼 -->
                <button onclick="event.stopPropagation(); renderTempSummary();" 
                        style="background:transparent; border:none; color:#8892a4; cursor:pointer;">
                    <i class="fa-solid fa-rotate"></i>
                </button>
            </div>

            <!-- 🔥 통계 -->
          <div class="stats">
    <div class="stat">
        <div class="stat-value total">${data.total}</div>
        <div class="stat-label">전체</div>
    </div>
    <div class="stat">
        <div class="stat-value success">${data.normalCount}</div>
        <div class="stat-label">정상</div>
    </div>
    <div class="stat">
        <div class="stat-value warning">${data.tempCount}</div>
        <div class="stat-label">임시</div>
    </div>
</div>

            <!-- 🔥 차트 + 비율 -->
            <div style="display:flex; align-items:center; justify-content:space-between; margin-top:16px;">

                <div class="chart-wrapper">
                    <canvas id="adminChart"></canvas>
                </div>

                <!-- 🔥 비율 텍스트 추가 -->
                <div style="text-align:right; font-size:13px; color:#8892a4;">
                    <div>정상 ${(data.normalCount / data.total * 100 || 0).toFixed(0)}%</div>
                    <div>임시 ${(data.tempCount / data.total * 100 || 0).toFixed(0)}%</div>
                </div>

            </div>

        </div>
        `;

        const ctx = document.getElementById("adminChart");

        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['정상', '임시'],
                datasets: [{
                    data: [data.normalCount, data.tempCount],
                    borderWidth: 0
                }]
            },
            options: {
                cutout: '70%',
                plugins: {
                    legend: { display: false }
                }
            }
        });

    } catch (e) {
        console.error(e);
        document.getElementById("temp-summary").innerHTML = `
        <div class="card">
            <h3>⚠️ 관리자 데이터 불러오기 실패</h3>
        </div>
        `;
    }
}
async function renderStoreSummary() {

    try {
        const res = await fetch("/api/admin/summary-store", {
            headers: {
                Authorization: "Bearer " + localStorage.getItem("accessToken")
            }
        });

        if (!res.ok) throw new Error();

        const data = await res.json();

        document.getElementById("store-summary").innerHTML = `
    <div class="card" style="cursor:pointer"
         onclick="navigate('store-list',this)">

        <h3>🏪 매장 현황</h3>

        <canvas id="storeChart" height="200"></canvas>

        <p style="margin-top:10px;">
            전체 ${data.total} / 운영 ${data.active} / 폐점 ${data.inactive}
        </p>

        <p class="text-gray-500">클릭하면 매장 목록</p>
    </div>
`;

        const ctx = document.getElementById("storeChart");

        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['운영중', '폐점'],
                datasets: [{
                    data: [data.active, data.inactive],
                }]
            },
            options: {
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });

    } catch (e) {
        console.error(e);
        document.getElementById("main-content").innerHTML = `
        <div class="card">
            <h3>⚠️ 매장 데이터 불러오기 실패</h3>
        </div>
        `;
    }
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
                       placeholder="예: 서울"
                       readonly>
                       <input id="city"
       class="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 text-gray-400 mt-2"
       placeholder="예: 강서구"
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
            document.getElementById("city").value=data.sigungu
        }
    }).open();
}

async function createStore() {
    const storeName = document.getElementById("storeName").value;
    const address = document.getElementById("address").value;
    const region = document.getElementById("region").value;
    const city=document.getElementById("city").value;
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
        city
    };

    try {
        const res = await fetch("/api/stores", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + localStorage.getItem("accessToken")
            },
            body: JSON.stringify(requestData) // ✅ 여기 중요
        });

        if (!res.ok) {
            throw new Error("서버 오류");
        }

        const data = await res.json();

        Swal.fire({
            title: "생성 완료 🎉",
            html: `
                <b>매장명:</b> ${data.storeName}<br>
                <b>계정:</b> ${data.username}<br>
                <b>임시 비밀번호:</b> ${data.tempPassword}
            `,
            icon: "success"
        });

        console.log(data);

    } catch (e) {
        console.error(e);
        Swal.fire("에러 발생", "스토어 생성 실패", "error");
    }
}

async function renderTest() {
    document.getElementById("page-title").textContent = "테스트중";

    document.getElementById("main-content").innerHTML = `
        <div class="card flex flex-col items-center justify-center py-16 text-center">
            <div class="text-5xl mb-4">🚧</div>
            <h2 class="text-xl font-semibold mb-2">준비중입니다</h2>
            <p class="text-gray-500">위 기능은 곧 추가될 예정입니다.</p>
        </div>
    `;
}

async function renderTemp() {
    document.getElementById("page-title").textContent = "임시 계정";

    const res = await fetch("/api/admin/temp", {
        headers: {
            Authorization: "Bearer " + localStorage.getItem("accessToken")
        }
    });

    tempData = await res.json();

    renderTempList(tempData);
}

function renderTempList(data) {
    let html = `
        <div class="card">

            <div style="margin-bottom:10px;">
                <button class="btn btn-ghost" onclick="sortByDateDesc()">최신순</button>
                <button class="btn btn-ghost" onclick="sortByDateAsc()">오래된순</button>
                <button class="btn btn-ghost" onclick="sortByStore()">지점명순</button>
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
    });

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

function sortByDateDesc() {
    tempData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    renderTempList(tempData);
}

function sortByDateAsc() {
    tempData.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    renderTempList(tempData);
}

function sortByStore() {
    tempData.sort((a, b) => a.storeName.localeCompare(b.storeName, 'ko'));
    renderTempList(tempData);
}

async function logout() {
    const token = localStorage.getItem("accessToken");

    await fetch("/api/auth/sign-out", {
        method: "POST", // 🔥 중요
        headers: {
            "Authorization": "Bearer " + token
        }
    });

    localStorage.clear();
    location.href = "/sign-inView";
}