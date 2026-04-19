import {formatDate, navigate, resetPassword, sortByDateAsc, sortByDateDesc, sortByStore} from "../utils/utils.js";

export function renderTest(title = "기능 준비중") {
    document.getElementById("page-title").textContent = title;

    const el = document.getElementById("main-content");

    el.innerHTML = `
        <div style="display:flex; justify-content:center; align-items:center; height:60vh;">

            <div class="card" style="width:360px; text-align:center; padding:28px;">

                <!-- 아이콘 -->
                <div style="font-size:42px; color:var(--amber); margin-bottom:16px;">
                    <i class="fa-solid fa-person-digging"></i>
                </div>

                <!-- 제목 -->
                <div style="font-size:16px; font-weight:600; color:var(--txt-1);">
                    ${title}
                </div>

                <!-- 설명 -->
                <div style="font-size:13px; color:var(--txt-2); margin-top:8px; line-height:1.5;">
                    현재 기능을 개발 중입니다.<br>
                    빠른 시일 내에 제공될 예정입니다.
                </div>

                <!-- 상태 배지 -->
                <div style="margin-top:14px;">
                    <span style="
                        background: var(--amber-dim);
                        color: var(--amber);
                        padding: 4px 10px;
                        border-radius: 999px;
                        font-size: 12px;
                    ">
                        개발 진행중
                    </span>
                </div>

                <!-- 버튼 -->
                <div style="margin-top:18px;">
                    <button class="btn btn-ghost back-btn">뒤로가기</button>
                </div>

            </div>

        </div>
    `;

    el.querySelector(".back-btn").addEventListener("click", () => navigate("home"));
}
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