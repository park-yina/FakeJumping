import {
    fetchStoreSummary,
    fetchRegionSummary,
    fetchPendingStoreSummary,
    fetchMonthlySummary, fetchStores, fetchRegions, fetchSubRegions, updateStoreOpenDate
} from "../apis/store-api.js";
import {searchAddress, navigate, createStoreHandler} from "../utils/utils.js";
import {formatDateKo} from "./myStore-uis.js";
let fp;

async function openStoreModal(store) {
    let selectedDate = store.openAt ? store.openAt.split("T")[0] : null;

    const step1 = await Swal.fire({
        width: 470,
        showCancelButton: true,
        confirmButtonText: "다음 →",
        cancelButtonText: "취소",
        buttonsStyling: false,
        customClass: {
            popup: "swal-custom",
            confirmButton: "btn btn-primary",
            cancelButton: "btn btn-ghost"
        },
        html: `
        <div class="swal-modal-header">
            <h3>${store.name}</h3>
            <p>오픈일을 변경합니다</p>
        </div>

        <div class="date-input-wrapper">
            <input id="flatpickrInput" 
                   class="custom-date-input"
                   placeholder="날짜 선택">
        </div>

        <div class="swal-guide-box">
            <div class="swal-guide-text">
                운영 정책에 따라 일부 변경은 제한될 수 있습니다.
            </div>
        </div>
        `,
        didOpen: () => {
            const input = document.getElementById("flatpickrInput");

            fp = flatpickr(input, {
                locale: flatpickr.l10ns.ko,
                defaultDate: selectedDate,
                dateFormat: "Y-m-d",
                allowInput: true,
                clickOpens: false,
                minDate: null,
                onChange(selectedDates, dateStr, instance) {
                    if (!selectedDates.length) return;
                    selectedDate = dateStr;
                    instance.close();
                }
            });

            input.onclick = (e) => {
                e.stopPropagation();
                fp.isOpen ? fp.close() : fp.open();
            };
        },
        willClose: () => {
            fp?.destroy();
            fp = null;
        },
        preConfirm() {
            if (!selectedDate) {
                Swal.showValidationMessage("날짜를 선택해주세요");
                return false;
            }
            return selectedDate;
        }
    });

    if (!step1.isConfirmed) return;

    const date = step1.value;

    const step2 = await Swal.fire({
        width: 420,
        showCancelButton: true,
        confirmButtonText: "저장하기",
        cancelButtonText: "← 이전",
        buttonsStyling: false,
        customClass: {
            popup: "swal-custom",
            confirmButton: "btn btn-primary",
            cancelButton: "btn btn-ghost"
        },
        html: `
        <div class="swal-modal-header">
            <h3>오픈일 확인</h3>
            <p>${store.name}</p>
        </div>

        <div class="swal-confirm-card">
            <div class="swal-confirm-icon">
                <i class="fa-regular fa-calendar-check"></i>
            </div>
            <div>
                <div class="swal-confirm-date">
                    ${formatDateKo(date)}
                </div>
                <div class="swal-confirm-meta">
                    변경 예정
                </div>
            </div>
        </div>
        `
    });

    if (step2.dismiss === Swal.DismissReason.cancel) {
        return openStoreModal(store);
    }
    if (!step2.isConfirmed) return;

    let force = false;

    const today = new Date();
    const selected = new Date(date);

    // 🔥 과거 날짜 → 요청 전에 처리
    if (selected < today) {
        const confirm = await Swal.fire({
            icon: "warning",
            title: "과거 날짜 선택",
            text: "과거 날짜로 변경하시겠습니까?",
            showCancelButton: true,
            confirmButtonText: "강제 변경",
            cancelButtonText: "취소",
            buttonsStyling: false,
            customClass: {
                popup: "swal-custom",
                confirmButton: "btn btn-danger",
                cancelButton: "btn btn-ghost"
            }
        });

        if (!confirm.isConfirmed) return;
        force = true;
    }

    try {
        await updateStoreOpenDate(store.id, date + "T00:00:00", force);

    } catch (e) {
        console.error(e);

        // 🔥 운영중 → 미래 변경 (서버에서만 판단)
        if (e.code === "OPERATING_TO_FUTURE") {
            const confirm = await Swal.fire({
                icon: "warning",
                title: "강제 변경",
                html: `
                운영 중 매장의 오픈일을 변경하면<br>
                데이터에 영향을 줄 수 있습니다.<br><br>
                계속 진행하시겠습니까?
            `,
                showCancelButton: true,
                confirmButtonText: "강제 변경",
                cancelButtonText: "취소",
                buttonsStyling: false,
                customClass: {
                    popup: "swal-custom",
                    confirmButton: "btn btn-danger",
                    cancelButton: "btn btn-ghost"
                }
            });

            if (!confirm.isConfirmed) return;

            await updateStoreOpenDate(store.id, date + "T00:00:00", true);
        } else {
            await Swal.fire({
                icon: "error",
                title: "오픈 날짜 설정 실패",
                text: e.message || "다시 시도해주세요."
            });
            return;
        }
    }

    await renderStoreListPage();

    await Swal.fire({
        icon: "success",
        title: "설정 완료",
        text: `${store.name} 오픈일이 변경되었습니다`,
        timer: 1200,
        showConfirmButton: false
    });
}
export async function renderStoreListPage() {
    try {
        const el = document.getElementById("main-content");

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
                            <option value="CLOSED">폐점</option>
                            <option value="NOT_OPENED">오픈 미정</option>
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
        async function load() {
            const region = document.getElementById("regionFilter").value;
            const subRegion = document.getElementById("subRegionFilter").value;
            const status = document.getElementById("statusFilter").value;
            console.log("🔥 요청값", { region, subRegion, status });

            const data = await fetchStores({
                region,
                subRegion,   // 🔥 변경
                status,
                page: currentPage,
                size
            });
            currentStores = data.content; // 🔥 이거 필수

            renderList(data.content);
            renderPagination(data.total);
        }
        const listEl = document.getElementById("store-list");

        listEl.addEventListener("click", (e) => {
            const item = e.target.closest(".store-item");
            if (!item) return;

            const storeId = item.dataset.id;
            const store = currentStores.find(s => s.id == storeId);

            openStoreModal(store);
        });
        function getStatusBadgeClass(status) {
            switch (status) {
                case "OPERATING": return "badge-teal";
                case "SCHEDULED": return "badge-violet";
                case "CLOSED": return "badge-rose";
                case "NOT_OPENED": return "badge-amber";
                default: return "badge-amber";
            }
        }

        function renderList(stores) {
            const listEl = document.getElementById("store-list");

            if (!stores.length) {
                listEl.innerHTML = `
                    <div class="store-empty">
                        <i class="fa-solid fa-store-slash"></i>
                        <span>해당 조건의 매장이 없습니다</span>
                    </div>
                `;
                return;
            }

            listEl.innerHTML = stores.map((s, i) => `
                <div class="store-item" data-id="${s.id}">
                    <div class="store-item-left">
                        <div class="store-num">${(currentPage * size) + i + 1}</div>
                        <div>
                            <div class="store-name">${s.name}</div>
                            <div class="store-location">
                                <i class="fa-solid fa-location-dot"></i>
                                ${s.region} ${s.city} ${s.district}
                            </div>
                            <div class="store-sub">
        ${s.address}
    </div>
                        </div>
                    </div>
                    <div class="store-item-right">
                        <span class="badge ${getStatusBadgeClass(s.status)}">${s.statusLabel}</span>
                    </div>
                </div>
            `).join("");
        }

        function renderPagination(total) {
            const totalPages = Math.ceil(total / size);
            const el = document.getElementById("pagination");

            if (totalPages <= 1) {
                el.innerHTML = "";
                return;
            }

            let html = `
                <button class="page-btn" data-page="${currentPage - 1}" ${currentPage === 0 ? "disabled" : ""}>
                    ◀
                </button>
            `;

            for (let i = 0; i < totalPages; i++) {
                html += `
                    <button class="page-btn ${i === currentPage ? "active" : ""}" data-page="${i}">
                        ${i + 1}
                    </button>
                `;
            }

            html += `
                <button class="page-btn" data-page="${currentPage + 1}" ${currentPage === totalPages - 1 ? "disabled" : ""}>
                    ▶
                </button>
            `;

            el.innerHTML = html;
        }

        // 페이지 이동
        el.addEventListener("click", async (e) => {
            const btn = e.target.closest(".page-btn");
            if (btn && !btn.disabled) {
                currentPage = Number(btn.dataset.page);
                await load();
            }
        });

        // 🔥 region 변경 → subRegion 갱신
        document.getElementById("regionFilter").addEventListener("change", async () => {
            currentPage = 0;
            const region = document.getElementById("regionFilter").value;

            await renderSubRegions(region); // 🔥 핵심
            await load();
        });

        document.getElementById("subRegionFilter").addEventListener("change", async () => {
            currentPage = 0;
            await load();
        });

        document.getElementById("statusFilter").addEventListener("change", async () => {
            currentPage = 0;
            await load();
        });

        await renderRegions();
        await renderSubRegions(""); // 초기화
        await load();

    } catch (e) {
        console.error(e);
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
export async function renderPendingStoreSummary() {
    try {
        const data = await fetchPendingStoreSummary();
        const el = document.getElementById("pendingStore-summary");

        el.innerHTML = `
        <div class="card pending-card" style="cursor:pointer">
            <div class="card-header">
                <div class="card-title">
                    <span class="dot dot-rose"></span>
                    오픈 미정 매장
                </div>
                <button class="refresh-btn" title="새로고침">
                    <i class="fa-solid fa-arrows-rotate"></i>
                </button>
            </div>

            <div class="stat-value">${data.count}</div>
            <div class="stat-label">오픈일 미정</div>

            <div class="badge-container">
                ${data.pendingStores.length === 0
            ? `<span class="text-muted">모든 매장이 오픈일이 설정되었습니다</span>`
            : data.pendingStores.map(d => `
                        <span class="badge badge-rose">
                            ${d.name} (${d.region})
                        </span>
                    `).join("")
        }
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
                    오픈 미정 데이터 불러오기 실패
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
export async function renderMonthlySummary() {
    try {
        const data = await fetchMonthlySummary();
        const el = document.getElementById("monthly-summary");
        const openedNames = (data.opened || []).map(s => s.name);
        const upcomingNames = (data.upcoming || []).map(s => s.name);

        const openedPreview = openedNames.slice(0, 3).join(" / ");
        const upcomingPreview = upcomingNames.slice(0, 3).join(" / ");

        const openedMore = openedNames.length - 3;
        const upcomingMore = upcomingNames.length - 3;

        el.innerHTML = `
        <div class="card monthly-card">

            <div class="card-header">
                <div class="card-title">
                    <span class="dot dot-teal"></span>
                    이달 매장 현황
                </div>
                <button class="refresh-btn" title="새로고침">
                    <i class="fa-solid fa-arrows-rotate"></i>
                </button>
            </div>

            <div class="monthly-grid">

                <!-- 이달 오픈 -->
                <div class="monthly-box">
                    <div class="label">이달 오픈</div>
                    <div class="value text-teal">${data.openedCount}</div>
                    <div class="tags">
                        ${openedNames.length === 0
            ? `<span class="text-muted">없음</span>`
            : `
                                ${openedPreview}
                                ${openedMore > 0 ? `<span class="more">+${openedMore}</span>` : ""}
                              `
        }
                    </div>
                </div>

                <!-- 오픈 예정 -->
                <div class="monthly-box">
                    <div class="label">오픈 예정</div>
                    <div class="value text-violet">${data.upcomingCount}</div>
                    <div class="tags">
                        ${upcomingNames.length === 0
            ? `<span class="text-muted">없음</span>`
            : `
                                ${upcomingPreview}
                                ${upcomingMore > 0 ? `<span class="more">+${upcomingMore}</span>` : ""}
                              `
        }
                    </div>
                </div>

            </div>
        </div>
        `;

        // 새로고침 버튼
        el.querySelector(".refresh-btn").addEventListener("click", (e) => {
            e.stopPropagation();
            renderMonthlySummary();
        });

    } catch (e) {
        console.error(e);
        document.getElementById("monthly-summary").innerHTML = `
            <div class="card">
                <div class="error-card">
                    <i class="fa-solid fa-triangle-exclamation"></i>
                    이달 매장 데이터 불러오기 실패
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
                <div class="store-meta">  전체 ${data.total} &nbsp;·&nbsp;
  운영 ${data.operating} &nbsp;·&nbsp;
  예정 ${data.scheduled} &nbsp;·&nbsp;
  폐점 ${data.closed}</div>
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
                labels: ['운영중', '오픈 예정', '폐점', '오픈 미정'],
                datasets: [{
                    data: [
                        data.operating,
                        data.scheduled,
                        data.closed,
                        data.inactive
                    ],
                    backgroundColor: [
                        'rgba(56,201,160,0.8)',   // 운영중
                        'rgba(59,130,246,0.7)',   // 예정
                        'rgba(224,92,138,0.6)',   // 폐점
                        'rgba(120,120,120,0.4)'   // 테스트/비활성
                    ],
                    borderColor: [
                        'rgba(56,201,160,1)',
                        'rgba(59,130,246,1)',
                        'rgba(224,92,138,1)',
                        'rgba(120,120,120,1)'
                    ],
                    borderWidth: 1,
                    hoverOffset: 6
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