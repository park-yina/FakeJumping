import {resetPassword, sortByDateAsc, sortByDateDesc, sortByStore} from "./utils.js";
function formatDate(str) {
    return new Date(str).toLocaleString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    });
}
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

            <div class="toolbar">
                <button class="btn btn-ghost sort-desc">최신순</button>
                <button class="btn btn-ghost sort-asc">오래된순</button>
                <button class="btn btn-ghost sort-store">지점명순</button>
            </div>

            <div class="list-container"></div>
        </div>
    `;

    const container = el.querySelector(".list-container");

    function formatDate(str) {
        return new Date(str).toLocaleString("ko-KR", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            hour12: false
        });
    }

    function renderList(list) {
        container.innerHTML = list.map((d, i) => `
            <div class="admin-item">
                
                <div class="admin-info">
                    <div class="admin-title">
                        #${i + 1} ${d.storeName}
                        <span class="admin-id">${d.username}</span>
                    </div>

                    <div class="admin-meta">
                        생성일: ${formatDate(d.createdAt)}
                    </div>
                </div>

                <button class="btn-danger reset-btn" data-username="${d.username}">
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

    container.addEventListener("click", (e) => {
        if (e.target.classList.contains("reset-btn")) {
            const username = e.target.dataset.username;
            onResetPassword(username);
        }
    });
}