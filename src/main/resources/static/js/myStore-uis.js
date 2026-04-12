import {fetchMyStoreMe} from "./myStore-apis.js";
import {formatDate, navigate} from "./utils.js";

function getStatusHtml(store) {
    if (!store.openAt) {
        return `
            <span class="status-item">
                <span class="dot" style="background:gray"></span>
                미정
            </span>
        `;
    }

    const now = new Date();
    const open = new Date(store.openAt);

    if (open > now) {
        return `
            <span class="status-item">
                <span class="dot dot-violet"></span>
                오픈 예정
            </span>
        `;
    }

    return `
        <span class="status-item">
            <span class="dot dot-teal"></span>
            운영중
        </span>
    `;
}
function getDDay(openAt) {
    if (!openAt) return "";

    const now = new Date();
    const open = new Date(openAt);

    const diff = Math.ceil((open - now) / (1000 * 60 * 60 * 24));

    if (diff > 0) return `D-${diff}`;
    if (diff === 0) return "D-Day";
    return `D+${Math.abs(diff)}`;
}
export async function renderMyStoreSummary() {
    try {
        const data = await fetchMyStoreMe();
        const el = document.getElementById("my-store-summary");

        const status = getStatusHtml(data);
        const dday = getDDay(data.openAt);

        el.innerHTML = `
        <div class="card my-store-card" style="cursor:pointer">
            <div class="card-header">
                <div class="card-title">
                    <span class="dot dot-teal"></span>
                    내 매장
                </div>
                <button class="refresh-btn" title="새로고침">
                    <i class="fa-solid fa-arrows-rotate"></i>
                </button>
            </div>

            <div class="stat-value">${status}</div>
            <div class="stat-label">
                ${data.openAt
            ? `오픈일: ${formatDate(data.openAt)} (${dday})`
            : "오픈일 미정"}
            </div>

            <div class="badge-container">
                <span class="badge badge-teal">
                    생성일 ${formatDate(data.createdAt)}
                </span>
            </div>
        </div>
        `;

        // 카드 클릭 → 캘린더 이동
        el.querySelector(".my-store-card").addEventListener("click", (e) => {
            navigate("store-calendar", e.currentTarget);
        });

        // 새로고침
        el.querySelector(".refresh-btn").addEventListener("click", (e) => {
            e.stopPropagation();
            renderMyStoreSummary();
        });

    } catch (e) {
        console.error(e);
        document.getElementById("my-store-summary").innerHTML = `
            <div class="card">
                <div class="error-card">
                    <i class="fa-solid fa-triangle-exclamation"></i>
                    매장 데이터 불러오기 실패
                </div>
            </div>
        `;
    }
}