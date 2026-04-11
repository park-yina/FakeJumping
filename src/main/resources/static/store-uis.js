import { fetchStoreSummary, fetchRegionSummary, fetchPendingStoreSummary } from "./store-api.js";
import {searchAddress, navigate, createStoreHandler} from "./utils.js";

export function renderCreateStore() {
    document.getElementById("page-title").textContent = "스토어 생성";

    const el = document.getElementById("main-content");

    el.innerHTML = `
        <div style="display:flex; gap:24px; align-items:flex-start">

            <!-- 왼쪽: 기존 폼 -->
            <div class="card" style="flex:1; max-width:540px">

                <h2 style="font-size:16px; font-weight:600; margin-bottom:20px; color:var(--txt-1)">
                    새 매장 등록
                </h2>

                <div class="field">
                    <label>스토어 이름</label>
                    <input id="storeName" placeholder="예: 강남점">
                </div>

                <div class="field">
                    <label>주소</label>
                    <div style="display:flex; gap:8px">
                        <input id="address" placeholder="주소 검색 버튼을 눌러주세요" readonly style="flex:1">
                        <button class="btn btn-ghost search-btn">검색</button>
                    </div>
                </div>

                <div class="field">
                    <label>지역</label>
                    <input id="region" placeholder="예: 경기" readonly>
                    <input id="city" placeholder="예: 안양시" readonly style="margin-top:6px">
                    <input id="district" placeholder="예: 만안구" readonly style="margin-top:6px">
                </div>

                <div style="display:flex; justify-content:flex-end; gap:8px; margin-top:8px">
                    <button class="btn btn-ghost cancel-btn">취소</button>
                    <button class="btn btn-primary create-btn">생성</button>
                </div>

            </div>

            <!-- 오른쪽: 보조 영역 -->
            <div style="width:260px; display:flex; flex-direction:column; gap:12px">

                <!-- 입력 가이드 -->
                <div class="card">
                    <div style="font-size:14px; font-weight:600;">입력 가이드</div>

                    <ul style="margin-top:10px; list-style-type: none; font-size:13px; color:var(--txt-2); line-height:1.6; display:flex; flex-direction:column; gap:6px;">

    <li style="display:flex; gap:6px; align-items:flex-start;">
        <i class="fa-solid fa-ban" style="color:var(--rose); margin-top:2px;"></i>
        <span>스토어 이름은 중복될 수 없습니다</span>
    </li>

    <li style="display:flex; gap:6px; align-items:flex-start;">
        <i class="fa-solid fa-magnifying-glass" style="color:var(--violet); margin-top:2px;"></i>
        <span>주소 검색을 통해 정확히 입력해주세요</span>
    </li>

    <li style="display:flex; gap:6px; align-items:flex-start;">
        <i class="fa-solid fa-gear" style="color:var(--teal); margin-top:2px;"></i>
        <span>지역은 자동으로 설정됩니다</span>
    </li>

</ul>
                </div>

                <!-- 상태 안내 -->
         <div class="card" style="background: var(--rose-dim);">
    <div style="font-size:13px; color:var(--rose); font-weight:500;">
        ⚠️ 생성된 매장은 승인 후 활성화됩니다
    </div>
</div>
            </div>

        </div>
    `;

    // 이벤트 연결
    el.querySelector(".search-btn").addEventListener("click", searchAddress);
    el.querySelector(".cancel-btn").addEventListener("click", async () => {
        const confirm = await Swal.fire({
            title: "입력 취소",
            text: "작성한 내용을 모두 초기화하시겠습니까?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "초기화",
            cancelButtonText: "취소"
        });

        if (confirm.isConfirmed) {
            resetCreateStoreForm();
        }
    });    el.querySelector(".create-btn").addEventListener("click", createStoreHandler);
}
function resetCreateStoreForm() {
    document.getElementById("storeName").value = "";
    document.getElementById("address").value = "";
    document.getElementById("region").value = "";
    document.getElementById("city").value = "";
    document.getElementById("district").value = "";
}
export async function renderPendingStoreSummary() {
    try {
        const data = await fetchPendingStoreSummary();
        const el = document.getElementById("pendingStore-summary");

        el.innerHTML = `
        <div class="card pending-card" style="cursor:pointer">
            <div class="card-header">
                <div class="card-title">
                    <span class="dot dot-rose"></span>
                    오픈 예정 스토어
                </div>
                <button class="refresh-btn" title="새로고침">
                    <i class="fa-solid fa-arrows-rotate"></i>
                </button>
            </div>

            <div class="stat-value">${data.count}</div>
            <div class="stat-label">오픈 예정 매장</div>

            <div class="badge-container">
                ${data.pendingStores.map(d => `
                    <span class="badge badge-rose">${d.name} (${d.region})</span>
                `).join("")}
            </div>
        </div>
        `;

        el.querySelector(".pending-card").addEventListener("click", (e) => {
            navigate("pending-store", e.currentTarget);
        });
        el.querySelector(".refresh-btn").addEventListener("click", (e) => {
            e.stopPropagation();
            renderPendingStoreSummary();
        });

    } catch (e) {
        console.error(e);
        document.getElementById("pendingStore-summary").innerHTML = `
            <div class="card">
                <div class="error-card">
                    <i class="fa-solid fa-triangle-exclamation"></i>
                    오픈 예정 데이터 불러오기 실패
                </div>
            </div>
        `;
    }
}

export async function renderRegionSummary() {
    try {
        const data = await fetchRegionSummary();
        const el = document.getElementById("region-summary");

        el.innerHTML = `
        <div class="card region-card" style="cursor:pointer">
            <div class="card-header">
                <div class="card-title">
                    <span class="dot dot-violet"></span>
                    지역 분포
                </div>
                <button class="refresh-btn" title="새로고침">
                    <i class="fa-solid fa-arrows-rotate"></i>
                </button>
            </div>

            <div class="stat-value">${data.length}</div>
            <div class="stat-label">전체 지역 수</div>

            <div class="badge-container">
                ${data.slice(0, 3).map(d => `
                    <span class="badge badge-violet">${d.region} ${d.count}</span>
                `).join("")}
                ${data.length > 3 ? `<span style="font-size:11.5px;color:var(--txt-3);align-self:center">+${data.length - 3} more</span>` : ""}
            </div>
        </div>
        `;

        el.querySelector(".region-card").addEventListener("click", (e) => {
            navigate("store", e.currentTarget);
        });
        el.querySelector(".refresh-btn").addEventListener("click", (e) => {
            e.stopPropagation();
            renderRegionSummary();
        });

    } catch (e) {
        console.error(e);
        document.getElementById("region-summary").innerHTML = `
            <div class="card">
                <div class="error-card">
                    <i class="fa-solid fa-triangle-exclamation"></i>
                    지역 데이터 불러오기 실패
                </div>
            </div>
        `;
    }
}

export async function renderStoreSummary() {
    try {
        const data = await fetchStoreSummary();
        const el = document.getElementById("store-summary");

        el.innerHTML = `
            <div class="card store-card">
                <div class="card-header">
                    <div class="card-title">
                        <span class="dot dot-teal"></span>
                        매장 현황
                    </div>
                      <button class="refresh-btn" title="새로고침">
                    <i class="fa-solid fa-arrows-rotate"></i>
                </button>
                </div>
                <canvas id="storeChart"></canvas>
                <div class="store-meta">전체 ${data.total} &nbsp;·&nbsp; 운영 ${data.active} &nbsp;·&nbsp; 폐점 ${data.inactive}</div>
                <div class="store-hint"><i class="fa-solid fa-arrow-pointer"></i> 클릭하면 매장 목록으로 이동</div>
            </div>
        `;

        el.querySelector(".store-card").addEventListener("click", (e) => {
            navigate("store-list", e.currentTarget);
        });
        el.querySelector(".refresh-btn").addEventListener("click", (e) => {
            e.stopPropagation();
            renderStoreSummary();
        });

        const ctx = document.getElementById("storeChart");
        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['운영중', '폐점'],
                datasets: [{
                    data: [data.active, data.inactive],
                    backgroundColor: ['rgba(56,201,160,0.8)', 'rgba(224,92,138,0.6)'],
                    borderColor: ['rgba(56,201,160,1)', 'rgba(224,92,138,1)'],
                    borderWidth: 1,
                    hoverOffset: 4
                }]
            },
            options: {
                maintainAspectRatio: false,
                cutout: '70%',
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: '#7e8799',
                            font: { size: 12, family: "'IBM Plex Sans KR', sans-serif" },
                            padding: 16,
                            boxWidth: 10,
                            boxHeight: 10
                        }
                    }
                }
            }
        });

    } catch (e) {
        console.error(e);
        document.getElementById("store-summary").innerHTML = `
            <div class="card">
                <div class="error-card">
                    <i class="fa-solid fa-triangle-exclamation"></i>
                    매장 데이터 불러오기 실패
                </div>
            </div>
        `;
    }
}