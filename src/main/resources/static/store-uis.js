import { fetchStoreSummary } from "./store-api.js";

export async function renderStoreSummary() {
    try {
        const data = await fetchStoreSummary();

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