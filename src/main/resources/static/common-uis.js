import { fetchTempSummary } from "./common-apis.js";

export async function renderTempSummary() {
    try {
        const data = await fetchTempSummary();

        document.getElementById("temp-summary").innerHTML = `
        <div class="card dashboard-card" onclick="navigate('temp',this)">
            <div style="display:flex; justify-content:space-between;">
                <h3>👤 관리자 현황</h3>
                <button onclick="event.stopPropagation(); renderTempSummary();">
                    🔄
                </button>
            </div>

            <div class="stats">
                <div>${data.total}</div>
                <div>${data.normalCount}</div>
                <div>${data.tempCount}</div>
            </div>

            <canvas id="adminChart"></canvas>
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
            }
        });

    } catch (e) {
        document.getElementById("temp-summary").innerHTML = `
            <div class="card">
                <h3>⚠️ 관리자 데이터 불러오기 실패</h3>
            </div>
        `;
    }
}