import {fetchStoreKpi, fetchStoreSummary} from "../apis/store-api.js";
import {navigate} from "../utils/utils.js";

export async function renderStoreSummary() {
    try {
        const data = await fetchStoreSummary();
        const kpi = await fetchStoreKpi();
        const el = document.getElementById("store-summary");
        if (!el) return;

        el.innerHTML = `
            <div class="card store-card store-panel-calm">
                
                <div class="store-panel-head">
                    <div>
                        <div class="store-panel-title">매장 현황</div>
                        <div class="store-panel-sub">상태를 클릭하면 매장 목록으로 이동합니다.</div>
                    </div>
                    <button class="refresh-btn" title="새로고침">
                        <i class="fa-solid fa-arrows-rotate"></i>
                    </button>
                </div>

                <div class="store-chart-layout">

                    <!-- 도넛 -->
                    <div class="store-chart-wrap">
                        <canvas id="storeChart"></canvas>
                        <div class="chart-center-label">
                            <strong>${data.total}</strong>
                            <span>전체</span>
                        </div>
                    </div>

                    <!-- 🔥 상태 패널 -->
                    <div class="status-panel">

    <div class="status-item" data-status="OPERATING">
        <span><i class="fa-solid fa-circle-check text-teal"></i> 운영 중</span>
        <strong>${kpi.operating}</strong>
    </div>

<div class="status-item" data-status="SCHEDULED">
        <span><i class="fa-regular fa-clock text-blue"></i> 오픈 예정</span>
        <strong>${kpi.scheduled}</strong>
    </div>

<div class="status-item" data-status="NOT_OPENED">
        <span><i class="fa-solid fa-triangle-exclamation"></i> 오픈 미정</span>
        <strong>${kpi.notOpened}</strong>
    </div>

    <!-- 🔥 추가 -->
<div class="status-item" data-status="CLOSE_SCHEDULED">
        <span><i class="fa-solid fa-hourglass-half text-orange"></i> 폐점 예정</span>
        <strong>${kpi.closingScheduled}</strong>
    </div>

    <div class="status-item" data-status="CLOSED">
        <span><i class="fa-solid fa-circle-xmark text-gray"></i> 폐점 완료</span>
        <strong>${kpi.closed}</strong>
    </div>

</div>
                </div>
            </div>
        `;

        el.querySelectorAll(".status-item").forEach(item => {
            item.addEventListener("click", (e) => {
                const status = e.currentTarget.dataset.status;
                navigate('store-list', null, { status }); // 🔥 핵심
            });
        });

        // 새로고침
        el.querySelector(".refresh-btn").addEventListener("click", (e) => {
            e.stopPropagation();
            renderStoreSummary();
        });

        // 도넛 차트
        const ctx = document.getElementById("storeChart");

        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['운영 중', '오픈 예정', '오픈 미정', '폐점'],
                datasets: [{
                    data: [
                        data.operating,
                        data.scheduled,
                        data.inactive,
                        data.closed
                    ],
                    backgroundColor: [
                        'rgba(56,201,160,0.80)',
                        'rgba(59,130,246,0.72)',
                        'rgba(224,92,138,0.72)',
                        'rgba(111,118,132,0.48)'
                    ],
                    borderColor: 'rgba(19,22,31,1)',
                    borderWidth: 3
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '68%',
                plugins: {
                    legend: { display: false }
                }
            }
        });

    } catch (e) {
        console.error(e);

        const el = document.getElementById("store-summary");
        if (!el) return;

        el.innerHTML = `
            <div class="card">
                <div class="error-card">
                    <i class="fa-solid fa-triangle-exclamation"></i>
                    매장 데이터 불러오기 실패
                </div>
            </div>
        `;
    }
}

function percent(value, total) {
    if (!total) return 0;
    return ((value / total) * 100).toFixed(1);
}
