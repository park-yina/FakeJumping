import { fetchTempSummary } from "../apis/common-apis.js";
import { fetchStoreSummary, fetchPendingStoreSummary } from "../apis/store-api.js";
import { navigate } from "../utils/utils.js";
import {
    renderMonthlySummary,
    renderRegionSummary, renderStatusPanel
} from "./store-uis.js";
import { renderMyStoreSummary } from "./myStore-uis.js";
import { renderStoreSummary } from "../summary/storeSummary.js";

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
    el.innerHTML = `<div id="my-store-summary"></div>`;
    await renderMyStoreSummary();
}

async function renderKpiBar() {
    try {
        const data = await fetchStoreSummary();
        const el = document.getElementById("kpi-bar");
        if (!el) return;

        const items = [
            { label: "전체 매장", value: data.total, icon: "fa-solid fa-store", cls: "total", status: null },
            { label: "운영 중", value: data.operating, icon: "fa-solid fa-circle-check", cls: "operating", status: "OPERATING" },
            { label: "오픈 예정", value: data.scheduled, icon: "fa-regular fa-clock", cls: "scheduled", status: "SCHEDULED" },
            { label: "오픈 미정", value: data.inactive, icon: "fa-solid fa-triangle-exclamation", cls: "pending", status: "NOT_OPENED" }
        ];

        el.innerHTML = `
            <div class="kpi-strip">
                ${items.map(item => `
                    <button class="kpi-cell kpi-${item.cls}" data-status="${item.status ?? ""}" type="button">
                        <span class="kpi-icon"><i class="${item.icon}"></i></span>
                        <span class="kpi-text">
                            <span class="kpi-label">${item.label}</span>
                            <strong>${item.value}</strong>
                        </span>
                        <i class="fa-solid fa-chevron-right kpi-arrow"></i>
                    </button>
                `).join("")}
            </div>
        `;

        el.querySelectorAll(".kpi-cell").forEach(btn => {
            btn.addEventListener("click", (e) => {
                const status = e.currentTarget.dataset.status;

                if (!status) {
                    // 전체 매장
                    navigate("store-list", null, {});
                } else {
                    // 상태별 이동
                    navigate("store-list", null, { status });
                }
            });
        });

    } catch (e) {
        console.error(e);
    }
}

async function renderPendingBanner() {
    try {
        const data = await fetchPendingStoreSummary();
        const el = document.getElementById("pending-banner");
        if (!el) return;

        if (!data.count) {
            el.innerHTML = `
                <div class="pending-banner resolved">
                    <div class="pending-content">
                        <span class="pending-icon"><i class="fa-solid fa-circle-check"></i></span>
                        <div>
                            <div class="pending-title">모든 매장의 오픈일이 설정되었습니다</div>
                            <div class="pending-desc">추가 조치가 필요한 매장이 없습니다.</div>
                        </div>
                    </div>
                </div>
            `;
            return;
        }

        el.innerHTML = `
            <div class="pending-banner">
                <div class="pending-content">
                    <span class="pending-icon"><i class="fa-solid fa-triangle-exclamation"></i></span>
                    <div>
                        <div class="pending-title">오픈 미정 매장 ${data.count}개</div>
                        <div class="pending-desc">설정이 필요한 매장이 있습니다. 지금 확인하고 설정해주세요.</div>
                    </div>
                </div>
                <button class="btn btn-warning-outline pending-action" type="button">
                    미정 매장 관리하기
                    <i class="fa-solid fa-arrow-right"></i>
                </button>
            </div>
        `;

        el.querySelector(".pending-action")?.addEventListener("click", (e) => {
            navigate("store-list", e.currentTarget);
        });
    } catch (e) {
        console.error(e);
    }
}

export async function renderHome() {
    document.getElementById("page-title").textContent = "대시보드";

    const role = localStorage.getItem("role");
    if (role === "STORE_ADMIN") {
        await renderMyStoreDashboard();
        return;
    }

    document.getElementById("main-content").innerHTML = `
        <section class="dashboard-shell">

            <div class="dashboard-head">
                <div>
                    <h1>대시보드</h1>
                    <p>전체 매장 운영 현황을 한눈에 확인하세요.</p>
                </div>
                <button class="dashboard-refresh" id="dashboardRefreshBtn">
                    <i class="fa-solid fa-arrows-rotate"></i>
                    새로고침
                </button>
            </div>

            <!-- KPI -->
            <div id="kpi-bar"></div>

            <!-- 미정 배너 -->
            <div id="pending-banner"></div>

            <!-- 핵심 영역 -->
         <div class="dashboard-main-section">
    <div id="store-summary"></div>
    <div id="monthly-summary"></div> 
</div>
        </section>
    `;

    document.getElementById("dashboardRefreshBtn")
        ?.addEventListener("click", () => renderHome());

    await Promise.all([
        renderKpiBar(),
        renderPendingBanner(),
        renderStoreSummary(),
        renderMonthlySummary()
    ]);
}
export async function renderTempSummary() {
    try {
        const data = await fetchTempSummary();
        const el = document.getElementById("temp-summary");
        if (!el) return;

        el.innerHTML = `
        <div class="card temp-card calm-summary-card" style="cursor:pointer">
            <div class="card-header">
                <div class="card-title">
                    <i class="fa-solid fa-user-group title-icon amber"></i>
                    관리자 현황
                </div>
                <i class="fa-solid fa-chevron-right muted-chevron"></i>
            </div>

            <div class="stat-value">${data.total}</div>
            <div class="stat-label">전체 관리자</div>

            <div class="badge-container">
                <span class="badge badge-amber">임시 계정 ${data.tempCount}</span>
            </div>
        </div>
        `;

        el.querySelector(".temp-card").addEventListener("click", (e) => {
            navigate("temp", e.currentTarget);
        });
    } catch (e) {
        const el = document.getElementById("temp-summary");
        if (!el) return;
        el.innerHTML = `
            <div class="card">
                <div class="error-card">
                    <i class="fa-solid fa-triangle-exclamation"></i>
                    관리자 데이터 불러오기 실패
                </div>
            </div>
        `;
    }
}
