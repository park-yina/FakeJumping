import { fetchTempSummary } from "./common-apis.js";
import { navigate,setActive } from "./utils.js";
import {renderRegionSummary, renderStoreSummary} from "./store-uis.js";
export function renderCard({ title, content = "", clickable = false, className = "" }) {
    return `
        <div class="card ${className}" ${clickable ? 'style="cursor:pointer"' : ''}>
            <h3>${title}</h3>
            ${content}
        </div>
    `;
}

export async function renderHome() {
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
<div id="dashboard-grid">
  <div id="store-summary"></div>
  <div id="region-summary"></div>
  <div id="temp-summary"></div>
</div>
  `;

    // 병렬 실행으로 성능 개선
    await Promise.all([
        renderStoreSummary(),
        renderRegionSummary(),
        renderTempSummary()
    ]);
}

export async function renderTempSummary() {
    try {
        const data = await fetchTempSummary();

        const el = document.getElementById("temp-summary");

        el.innerHTML = `
        <div class="card dashboard-card small-card temp-card">

            <div style="display:flex; justify-content:space-between; align-items:center;">
                
                <h3 style="display:flex; align-items:center; gap:8px;">
                    <span class="dot"></span>
                    관리자
                </h3>

                <button class="refresh-btn">
                    <i class="fa-solid fa-arrows-rotate"></i>
                </button>
            </div>

            <div style="margin-top:12px;">
                <div style="font-size:26px; font-weight:700;">
                    ${data.total}
                </div>

                <div class="text-gray-500" style="margin-top:4px;">
                    전체 관리자
                </div>
            </div>

            <div style="margin-top:10px;">
                <span class="badge-warning">
                    임시 ${data.tempCount}
                </span>
            </div>
        </div>
        `;

        // 🔥 카드 클릭
        el.querySelector(".temp-card").addEventListener("click", (e) => {
            navigate("temp", e.currentTarget);
        });

        // 🔥 새로고침 버튼
        el.querySelector(".refresh-btn").addEventListener("click", (e) => {
            e.stopPropagation();
            renderTempSummary();
        });

    } catch (e) {
        document.getElementById("temp-summary").innerHTML = `
            <div class="card">
                <h3>⚠️ 관리자 데이터 불러오기 실패</h3>
            </div>
        `;
    }
}