import {fetchStoreSummary} from "../apis/store-api.js";
import {navigate} from "../utils/utils.js";

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