import { fetchTempSummary } from "../apis/common-apis.js";
import { navigate,setActive } from "../utils/utils.js";
import {renderMonthlySummary, renderPendingStoreSummary, renderRegionSummary,renderStoreListPage} from "./store-uis.js";
import {renderMyStoreSummary} from "./myStore-uis.js";
import {renderStoreSummary} from "../summary/storeSummary.js";
export function renderCard({ title, content = "", clickable = false, className = "" }) {
    return `
        <div class="card ${className}" ${clickable ? 'style="cursor:pointer"' : ''}>
            <h3>${title}</h3>
            ${content}
        </div>
    `;
}
export async function renderMyStoreDashboard() {
    const el = document.getElementById("main-content");

    el.innerHTML = `
        <div id="my-store-summary"></div>
    `;

    await renderMyStoreSummary();
}
export async function renderHome() {
    document.getElementById("page-title").textContent = "대시보드";

    const role = localStorage.getItem("role");
    if (role === "STORE_ADMIN") {
        await renderMyStoreDashboard();
        return;
    }

    document.getElementById("main-content").innerHTML = `
<div id="dashboard-grid">
  <div id="store-summary"></div>
  <div id="region-summary"></div>
  <div id="temp-summary"></div>
  <div id="monthly-summary"></div>
  <div id="pendingStore-summary"></div>
</div>
    `;

    await Promise.all([
        renderStoreSummary(),
        renderRegionSummary(),
        renderTempSummary(),
        renderMonthlySummary(),
        renderPendingStoreSummary()
    ]);
}

export async function renderTempSummary() {
    try {
        const data = await fetchTempSummary();
        const el = document.getElementById("temp-summary");

        el.innerHTML = `
        <div class="card temp-card" style="cursor:pointer">
            <div class="card-header">
                <div class="card-title">
                    <span class="dot dot-amber"></span>
                    관리자
                </div>
                <button class="refresh-btn" title="새로고침">
                    <i class="fa-solid fa-arrows-rotate"></i>
                </button>
            </div>

            <div class="stat-value">${data.total}</div>
            <div class="stat-label">전체 관리자</div>

            <div class="badge-container">
                <span class="badge badge-amber">임시 ${data.tempCount}</span>
            </div>
        </div>
        `;

        el.querySelector(".temp-card").addEventListener("click", (e) => {
            navigate("temp", e.currentTarget);
        });
        el.querySelector(".refresh-btn").addEventListener("click", (e) => {
            e.stopPropagation();
            renderTempSummary();
        });

    } catch (e) {
        document.getElementById("temp-summary").innerHTML = `
            <div class="card">
                <div class="error-card">
                    <i class="fa-solid fa-triangle-exclamation"></i>
                    관리자 데이터 불러오기 실패
                </div>
            </div>
        `;
    }
}