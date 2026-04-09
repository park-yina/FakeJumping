import {resetPassword, sortByDateAsc, sortByDateDesc, sortByStore} from "./utils.js";

export async function renderTemp() {
    const res = await fetch("/api/admin/temp", {
        headers: {
            Authorization: "Bearer " + localStorage.getItem("accessToken")
        }
    });

    const data = await res.json();

    renderTempList(data, {
        onResetPassword: async (username) => {
            await resetPassword(username);
            alert("초기화 완료");
            await renderTemp(); // 🔥 다시 렌더
        }
    });
}
export function renderTempList(data, { onResetPassword }) {
    const el = document.getElementById("main-content");

    el.innerHTML = `
        <div class="card temp-list">

            <div style="margin-bottom:10px;">
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
            <div style="padding:10px; border-bottom:1px solid #333;">
                <b>#${i + 1} ${d.username}</b> - ${d.storeName}
                <div style="font-size:12px; color:#888;">
                    생성일: ${d.createdAt}
                </div>
                <button class="btn btn-danger btn-sm reset-btn" data-username="${d.username}">
                    비밀번호 초기화
                </button>
            </div>
        `).join("");
    }

    renderList(data);
    el.querySelector(".sort-desc").onclick = () => {
        renderList(sortByDateDesc(data));
    };

    el.querySelector(".sort-asc").onclick = () => {
        renderList(sortByDateAsc(data));
    };

    el.querySelector(".sort-store").onclick = () => {
        renderList(sortByStore(data));
    };

    // 🔥 reset 이벤트 (외부 함수 사용)
    container.addEventListener("click", (e) => {
        if (e.target.classList.contains("reset-btn")) {
            const username = e.target.dataset.username;
            onResetPassword(username);
        }
    });
}