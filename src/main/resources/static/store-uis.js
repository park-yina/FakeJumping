import { fetchStoreSummary,fetchRegionSummary } from "./store-api.js";
import {navigate} from "./utils.js";
export function renderCreateStore() {
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
export async function renderRegionSummary() {
    try {
        const data = await fetchRegionSummary();
        const el = document.getElementById("region-summary");

        el.innerHTML = `
        <div class="card dashboard-card small-card region-card">

            <div style="display:flex; justify-content:space-between; align-items:center;">
                
                <h3 style="display:flex; align-items:center; gap:8px;">
                    <span class="dot"></span>
                    지역 분포
                </h3>

                <button class="refresh-btn">
                    <i class="fa-solid fa-arrows-rotate"></i>
                </button>
            </div>

            <div style="margin-top:12px;">
                <div style="font-size:26px; font-weight:700;">
                    ${data.length}
                </div>

                <div class="text-gray-500" style="margin-top:4px;">
                    전체 지역 수
                </div>
            </div>

            <div style="margin-top:10px;">
                ${data.slice(0, 3).map(d => `
                    <span class="badge-primary">
                        ${d.region} ${d.count}
                    </span>
                `).join("")}

                ${data.length > 3 ? `<span class="text-gray-500">+${data.length - 3} more</span>` : ""}
            </div>
        </div>
        `;

        // 🔥 카드 클릭
        el.querySelector(".region-card").addEventListener("click", (e) => {
            navigate("store", e.currentTarget);
        });

        // 🔥 새로고침 버튼
        el.querySelector(".refresh-btn").addEventListener("click", (e) => {
            e.stopPropagation();
            renderRegionSummary();
        });

    } catch (e) {
        console.error(e);
        document.getElementById("region-summary").innerHTML = `
            <div class="card">
                <h3>
                    <i class="fa-solid fa-triangle-exclamation"></i> 지역 데이터를 가져오는 데에 실패했습니다.
                </h3>
            </div>
        `;
    }
}
export async function renderStoreSummary() {
    try {
        const data = await fetchStoreSummary();
        const el = document.getElementById("store-summary");

        el.innerHTML = `
            <div class="card store-card" style="cursor:pointer">

                <h3>
                    <i class="fa-solid fa-store"></i> 매장 현황
                </h3>

                <canvas id="storeChart" height="200"></canvas>

                <p style="margin-top:10px;">
                    전체 ${data.total} / 운영 ${data.active} / 폐점 ${data.inactive}
                </p>

                <p class="text-gray-500">
                    <i class="fa-solid fa-arrow-pointer"></i> 클릭하면 매장 목록
                </p>
            </div>
        `;

        // 🔥 카드 클릭
        el.querySelector(".store-card").addEventListener("click", (e) => {
            navigate("store-list", e.currentTarget);
        });

        // 🔥 차트
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
        document.getElementById("store-summary").innerHTML = `
            <div class="card">
                <h3>
                    <i class="fa-solid fa-triangle-exclamation"></i> 매장 데이터 불러오기 실패
                </h3>
            </div>
        `;
    }
}