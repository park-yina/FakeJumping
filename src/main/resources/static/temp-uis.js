import {formatDate,resetPassword, sortByDateAsc, sortByDateDesc, sortByStore } from "./utils.js";


export async function renderTemp() {
    const res = await fetch("/api/admin/temp", {
        headers: { Authorization: "Bearer " + localStorage.getItem("accessToken") }
    });
    const data = await res.json();

    renderTempList(data, {
        onResetPassword: async (username) => {
            const ok = await resetPassword(username);
            if (!ok) return;
            await renderTemp();
        }
    });
}

export function renderTempList(data, { onResetPassword }) {
    const el = document.getElementById("main-content");

    el.innerHTML = `
        <div class="card">
            <div class="toolbar">
                <button class="btn btn-ghost sort-desc">최신순</button>
                <button class="btn btn-ghost sort-asc">오래된순</button>
                <button class="btn btn-ghost sort-store">지점명순</button>
            </div>
            <div class="list-container"></div>
        </div>
    `;

    const container = el.querySelector(".list-container");

    function renderList(list) {
        container.innerHTML = list.map((d, i) => `
            <div class="admin-item">
                <div class="admin-info">
                    <div class="admin-title">
                        <span style="color:var(--txt-3); font-size:12px; font-family:var(--mono)">#${i + 1}</span>
                        ${d.storeName}
                        <span class="admin-id">${d.username}</span>
                    </div>
                    <div class="admin-meta">생성일: ${formatDate(d.createdAt)}</div>
                </div>
                <button class="btn btn-danger reset-btn" data-username="${d.username}">
                    비밀번호 초기화
                </button>
            </div>
        `).join("");
    }

    renderList(data);

    el.querySelector(".sort-desc").onclick  = () => renderList(sortByDateDesc(data));
    el.querySelector(".sort-asc").onclick   = () => renderList(sortByDateAsc(data));
    el.querySelector(".sort-store").onclick = () => renderList(sortByStore(data));

    container.addEventListener("click", (e) => {
        const btn = e.target.closest(".reset-btn");
        if (btn) onResetPassword(btn.dataset.username);
    });
}