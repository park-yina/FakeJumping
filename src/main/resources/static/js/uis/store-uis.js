import {
    fetchStoreSummary,
    fetchRegionSummary,
    fetchPendingStoreSummary,
    fetchMonthlySummary, fetchStores, fetchRegions, fetchSubRegions, updateStoreOpenDate, closeStore, updateCloseDate,
    fetchStoreKpi
} from "../apis/store-api.js";
import {searchAddress, navigate, createStoreHandler} from "../utils/utils.js";
import {formatDateKo} from "./myStore-uis.js";
import {openModal, openReopenModal} from "../modal/openModal.js";
import {closeModal} from "../modal/closeModal.js";
import {updateCloseModal} from "../modal/updateCloseModal.js";
let fp;

export async function showStoreActionModal({ store, onOpen, onClose }) {
    await Swal.fire({
        html: buildModalHtml(store.name, store.status),
        showConfirmButton: false,
        background: "transparent",
        backdrop: "rgba(7,8,13,0.65)",
        customClass: {popup: "store-action-popup"},

        didOpen: (popup) => {

            popup.querySelector("#action-open")?.addEventListener("click", () => {
                Swal.close();
                openModal(store);
            });

            popup.querySelector("#action-close-store")?.addEventListener("click", () => {
                Swal.close();
                closeModal(store);
            });

            popup.querySelector("#action-update-close")?.addEventListener("click", () => {
                Swal.close();
                updateCloseModal(store);
            });

            popup.querySelector("#action-reopen")?.addEventListener("click", () => {
                Swal.close();
                openReopenModal(store);
            });

            popup.querySelectorAll(".action-cancel").forEach(btn => {
                btn.addEventListener("click", () => Swal.close());
            });
        }
    });
}
async function openStoreActionModal(store) {
    return showStoreActionModal({ store });
}
function buildModalHtml(storeName, status) {

    const isClosed = status === "CLOSED";

    return `
    <div class="sam-modal">

      <div class="sam-header">
        <div class="sam-store-badge">
          <div class="sam-icon">
            <i class="fa-solid fa-shop"></i>
          </div>
          <div class="sam-store-label">
            <span class="sam-store-name">${storeName}</span>
            <span class="sam-store-sub">작업을 선택하세요</span>
          </div>
        </div>
        <button class="sam-close action-cancel">
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>

      <div class="sam-divider"></div>

      <div class="sam-body">

        ${
        !isClosed ? `
            <button class="sam-action-btn sam-primary" id="action-open">
                <div class="sam-btn-icon sam-violet">
                    <i class="fa-solid fa-calendar-days"></i>
                </div>
                <div class="sam-btn-text">
                    <span class="sam-btn-label">오픈 변경</span>
                    <span class="sam-btn-desc">영업일 및 오픈 일정 수정</span>
                </div>
                <i class="fa-solid fa-chevron-right sam-btn-arrow"></i>
            </button>

            <button class="sam-action-btn sam-danger" id="action-close-store">
                <div class="sam-btn-icon sam-rose">
                    <i class="fa-solid fa-lock"></i>
                </div>
                <div class="sam-btn-text">
                    <span class="sam-btn-label">폐점 처리</span>
                    <span class="sam-btn-desc">매장을 폐점 또는 폐점 예정 상태로 전환</span>
                </div>
                <i class="fa-solid fa-chevron-right sam-btn-arrow"></i>
            </button>
            `
            :
            `
            <button class="sam-action-btn sam-primary" id="action-reopen">
                <div class="sam-btn-icon sam-teal">
                    <i class="fa-solid fa-rotate-left"></i>
                </div>
                <div class="sam-btn-text">
                    <span class="sam-btn-label">재오픈</span>
                    <span class="sam-btn-desc">매장을 다시 운영 상태로 전환</span>
                </div>
                <i class="fa-solid fa-chevron-right sam-btn-arrow"></i>
            </button>

            <button class="sam-action-btn sam-violet" id="action-update-close">
                <div class="sam-btn-icon sam-violet">
                    <i class="fa-solid fa-pen"></i>
                </div>
                <div class="sam-btn-text">
                    <span class="sam-btn-label">폐점일 수정</span>
                    <span class="sam-btn-desc">폐점 날짜를 변경합니다</span>
                </div>
                <i class="fa-solid fa-chevron-right sam-btn-arrow"></i>
            </button>
            `
    }

        <button class="sam-cancel-btn action-cancel">취소</button>

      </div>
    </div>`;
}
export async function renderStoreListPage(options = {}) {
    try {
        const el = document.getElementById("main-content");
        if (!el) return;

        el.innerHTML = `
            <div class="card store-list-card">

                <div class="card-header">
                    <div class="card-title">
                        <span class="dot dot-violet"></span>
                        매장 목록
                    </div>
                </div>

                <div class="store-filters">
                    <div class="custom-select-wrap">
                        <select id="regionFilter" class="custom-select"></select>
                        <i class="fa-solid fa-chevron-down custom-select-arrow"></i>
                    </div>

                    <div class="custom-select-wrap">
                        <select id="subRegionFilter" class="custom-select">
                            <option value="">세부 지역</option>
                        </select>
                        <i class="fa-solid fa-chevron-down custom-select-arrow"></i>
                    </div>

                    <div class="custom-select-wrap">
                        <select id="statusFilter" class="custom-select">
                            <option value="">전체 상태</option>
                            <option value="OPERATING">운영중</option>
                            <option value="SCHEDULED">오픈 예정</option>
                            <option value="NOT_OPENED">오픈 미정</option>
                            <option value="CLOSED">폐점</option>
                            <option value="CLOSING_SCHEDULED">폐점 예정</option>
                        </select>
                        <i class="fa-solid fa-chevron-down custom-select-arrow"></i>
                    </div>
                </div>

                <div id="store-list"></div>

                <div class="pagination-wrap">
                    <div id="pagination" class="pagination"></div>
                </div>
            </div>
        `;

        let currentPage = 0;
        const size = 10;
        let currentStores = [];

        const safeValue = (id) => document.getElementById(id)?.value || "";

        // 🔥 데이터 로딩
        async function load() {
            try {
                const region = safeValue("regionFilter");
                const subRegion = safeValue("subRegionFilter");
                const status = safeValue("statusFilter");

                const data = await fetchStores({
                    region,
                    subRegion,
                    status,
                    page: currentPage,
                    size
                });

                currentStores = data?.content || [];

                renderList(currentStores);
                renderPagination(data?.total || 0);

                window.scrollTo(0, 0); // UX 개선

            } catch (e) {
                console.error("load 실패", e);
                renderList([]);
                renderPagination(0);
            }
        }

        // 🔥 상태 badge
        function getStatusBadgeClass(status) {
            switch (status) {
                case "OPERATING": return "badge-teal";
                case "SCHEDULED": return "badge-violet";
                case "CLOSED": return "badge-rose";
                case "NOT_OPENED": return "badge-amber";
                case "CLOSING_SCHEDULED": return "badge-orange";
                default: return "badge-gray";
            }
        }

        // 🔥 리스트 렌더
        function renderList(stores = []) {
            const listEl = document.getElementById("store-list");
            if (!listEl) return;

            if (!stores.length) {
                listEl.innerHTML = `
                    <div class="store-empty">
                        <i class="fa-solid fa-store-slash"></i>
                        <span>해당 조건의 매장이 없습니다</span>
                        <span class="sub">조건을 변경해보세요</span>
                    </div>
                `;
                return;
            }

            listEl.innerHTML = stores.map((s, i) => `
                <div class="store-item" data-id="${s.id}">
                    <div class="store-item-left">
                        <div class="store-num">${(currentPage * size) + i + 1}</div>
                        <div>
                            <div class="store-name">${s.name || "-"}</div>
                            <div class="store-location">
                                <i class="fa-solid fa-location-dot"></i>
                                ${s.region || ""} ${s.city || ""} ${s.district || ""}
                            </div>
                            <div class="store-sub">${s.address || ""}</div>
                        </div>
                    </div>
                    <div class="store-item-right">
                        <span class="badge ${getStatusBadgeClass(s.status)}">
                            ${s.statusLabel || s.status}
                        </span>
                    </div>
                </div>
            `).join("");
        }

        // 🔥 페이지네이션
        function renderPagination(total = 0) {
            const totalPages = Math.ceil(total / size);
            const el = document.getElementById("pagination");
            if (!el) return;

            if (totalPages <= 1) {
                el.innerHTML = "";
                return;
            }

            let html = `
                <button class="page-btn" data-page="${currentPage - 1}" ${currentPage === 0 ? "disabled" : ""}>◀</button>
            `;

            for (let i = 0; i < totalPages; i++) {
                html += `
                    <button class="page-btn ${i === currentPage ? "active" : ""}" data-page="${i}">
                        ${i + 1}
                    </button>
                `;
            }

            html += `
                <button class="page-btn" data-page="${currentPage + 1}" ${currentPage === totalPages - 1 ? "disabled" : ""}>▶</button>
            `;

            el.innerHTML = html;
        }

        // 🔥 이벤트 (중복 방지)
        el.onclick = async (e) => {

            // 페이지 이동
            const btn = e.target.closest(".page-btn");
            if (btn && !btn.disabled) {
                currentPage = Number(btn.dataset.page) || 0;
                await load();
                return;
            }

            // 매장 클릭
            const item = e.target.closest(".store-item");
            if (item) {
                const storeId = item.dataset.id;
                const store = currentStores.find(s => s.id == storeId);
                if (store) openStoreActionModal(store);
                return;
            }
        };

        // 🔥 필터 이벤트
        document.getElementById("regionFilter")?.addEventListener("change", async () => {
            currentPage = 0;
            const region = safeValue("regionFilter");
            await renderSubRegions(region);
            await load();
        });

        document.getElementById("subRegionFilter")?.addEventListener("change", async () => {
            currentPage = 0;
            await load();
        });

        document.getElementById("statusFilter")?.addEventListener("change", async () => {
            currentPage = 0;
            await load();
        });

        // 🔥 초기 로딩
        await renderRegions();
        await renderSubRegions("");

        const initialStatus = options?.status || "";
        const statusEl = document.getElementById("statusFilter");
        if (statusEl) statusEl.value = initialStatus;

        await load();

    } catch (e) {
        console.error("renderStoreListPage 전체 실패", e);
    }
}
async function renderRegions() {
    const el = document.getElementById("regionFilter");

    const list = await fetchRegions();

    el.innerHTML = `
        <option value="">전체 지역</option>
        ${list.map(r => `<option value="${r}">${r}</option>`).join("")}
    `;
}
async function renderSubRegions(region) {
    const el = document.getElementById("subRegionFilter");

    if (!region) {
        el.innerHTML = `<option value="">세부 지역</option>`;
        return;
    }

    const list = await fetchSubRegions(region);

    const cleanList = list.filter(v => v && v.trim() !== "");

    el.innerHTML = `
        <option value="">세부 지역</option>
        ${cleanList.map(r => `<option value="${r}">${r}</option>`).join("")}
    `;
}
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
export async function renderStoreKpi() {
    try {
        const data = await fetchStoreKpi();
        const el = document.getElementById("store-kpi");

        el.innerHTML = `
        <div class="card store-card">
            <div class="card-header">
                <div class="card-title">
                    <span class="dot dot-gray"></span>
                    폐점 현황
                </div>
            </div>

            <div class="stat-value">${data.closed}</div>
            <div class="stat-label">전체 폐점</div>

            <div class="store-meta">
                이달 폐점 ${data.monthlyClosed}
            </div>

            <div class="store-hint">클릭하면 폐점 매장</div>
        </div>
        `;

        el.querySelector(".store-card").addEventListener("click", () => {
            navigate("store-list", null, { status: "CLOSED" });
        });

    } catch (e) {
        console.error(e);
    }
}
export async function renderPendingStoreSummary() {
    try {
        const data = await fetchPendingStoreSummary();
        const el = document.getElementById("pendingStore-summary");

        el.innerHTML = `
        <div class="card pending-card">
            <div class="card-header">
                <div class="card-title">
                    <span class="dot dot-rose"></span>
                    오픈 미정 매장
                </div>
            </div>

            <div class="stat-value">${data.count}</div>

            <div class="badge-container">
                ${
            data.stores.length === 0
                ? `<span>모든 매장이 오픈일 설정됨</span>`
                : data.stores.map(d => `
                            <span class="badge badge-rose">
                                ${d.name}
                            </span>
                        `).join("")
        }
            </div>
        </div>
        `;

        el.querySelector(".pending-card").addEventListener("click", () => {
            navigate("store-list", null, { status: "NOT_OPENED" });
        });

    } catch (e) {
        console.error(e);
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
export async function renderStatusPanel() {
    try {
        const data = await fetchStoreKpi();
        const el = document.getElementById("status-panel");

        el.innerHTML = `
        <div class="status-panel">

            <div class="status-item">
                <i class="fa-solid fa-circle-check text-green"></i>
                <span>운영 중</span>
                <strong>${data.operating}</strong>
            </div>

            <div class="status-item">
                <i class="fa-regular fa-clock text-blue"></i>
                <span>오픈 예정</span>
                <strong>${data.scheduled}</strong>
            </div>

            <div class="status-item warning">
                <i class="fa-solid fa-triangle-exclamation text-orange"></i>
                <span>오픈 미정</span>
                <strong>${data.notOpened}</strong>
            </div>

            <div class="status-item">
                <i class="fa-solid fa-circle-xmark text-gray"></i>
                <span>폐점</span>
                <strong>${data.closed}</strong>
            </div>

        </div>
        `;

    } catch (e) {
        console.error(e);
    }
}
export async function renderMonthlySummary() {
    try {
        const data = await fetchMonthlySummary();   // 오픈
        const kpi = await fetchStoreKpi();          // 폐점
        const el = document.getElementById("monthly-summary");

        el.innerHTML = `
<div class="card monthly-card-compact">

    <div class="card-header">
        <div class="card-title">
            <span class="dot dot-teal"></span>
            이달 매장 현황
        </div>
    </div>

    <div class="monthly-table">

        <div class="monthly-row">
            <div class="monthly-label">오픈</div>
            <div class="monthly-value">
                ${data.opened.length ? data.opened.map(s => s.name).join(", ") : "없음"}
            </div>
        </div>

        <div class="monthly-row">
            <div class="monthly-label">오픈 예정</div>
            <div class="monthly-value">
                ${data.upcoming.length ? data.upcoming.map(s => s.name).join(", ") : "없음"}
            </div>
        </div>

        <div class="monthly-row closing">
            <div class="monthly-label">폐점 예정</div>
            <div class="monthly-value">
                ${kpi.closingScheduled || 0}
            </div>
        </div>

        <div class="monthly-row">
            <div class="monthly-label">폐점 완료</div>
            <div class="monthly-value">
                ${kpi.monthlyClosed || 0}
            </div>
        </div>

    </div>

</div>
`;

    } catch (e) {
        console.error(e);
    }
}