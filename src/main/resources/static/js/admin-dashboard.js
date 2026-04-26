import { createStoreApi } from "./apis/store-api.js";
import { renderHome, renderTempSummary } from "./uis/common-uis.js";
import {renderRegionSummary} from "./uis/store-uis.js";
import {navigate, sortByDateAsc, sortByDateDesc, sortByStore} from "./utils/utils.js";


function applyRole() {
    const role = localStorage.getItem("role");
    const logo = document.getElementById("logo-text");
    if (role === "SUPER_ADMIN") {
        document.getElementById("super-admin-menu").style.display = "block";
        logo.textContent = "SUPER ADMIN";
        logo.classList.add("text-red-500");
    } else {
        document.getElementById("store-admin-menu").style.display = "block";
        logo.textContent = "STORE ADMIN";
        logo.classList.add("text-blue-500");
    }
}
async function checkLogin() {
    let token = localStorage.getItem("accessToken");

    if (!token) {
        location.href = "/sign-inView";
        return false;
    }

    let res = await fetch("/auth/me", {
        headers: { Authorization: "Bearer " + token },
        credentials: "include"
    });

    // 🔥 1차 401 → refresh 시도
    if (res.status === 401) {
        const refreshRes = await fetch("/auth/refresh", {
            method: "POST",
            credentials: "include"
        });

        if (!refreshRes.ok) {
            logout();
            return false;
        }

        const newData = await refreshRes.json();
        localStorage.setItem("accessToken", newData.accessToken);

        res = await fetch("/auth/me", {
            headers: { Authorization: "Bearer " + newData.accessToken },
            credentials: "include"
        });

        // 🔥 핵심: 재요청도 실패하면 그냥 로그아웃
        if (res.status === 401) {
            await logout();
            return false;
        }
    }

    const data = await res.json();

    if (data.mustChangePassword === true) {
        location.href = "/change-password";
        return false;
    }

    localStorage.setItem("role", data.role);
    return true;
}

async function init() {
    const isValid = await checkLogin();

    if (!isValid) return; // 🔥 여기 추가

    applyRole();
    await renderHome();
}
init();



document.querySelectorAll('.nav-item').forEach(el => {
    el.addEventListener('click', () => {
        navigate(el.dataset.page, el);
    });
});
document.addEventListener("DOMContentLoaded", () => {
    const logoutBtn = document.getElementById("logout-btn");

    if (logoutBtn) {
        logoutBtn.addEventListener("click", logout);
    }
});
let isLoggingOut = false;

export async function logout() {
    if (isLoggingOut) return; // 🔥 중복 방지
    isLoggingOut = true;

    try {
        const token = localStorage.getItem("accessToken");

        await fetch("/api/auth/sign-out", {
            method: "POST",
            headers: {
                "Authorization": "Bearer " + token
            },
            credentials: "include"
        });

    } catch (e) {
        console.warn("로그아웃 요청 실패 (무시하고 진행)", e);
    }


    // 🔥 클라이언트 상태 무조건 정리
    localStorage.clear();
    sessionStorage.clear();

    // 🔥 뒤로가기 방지 (중요)
    location.replace("/sign-inView");
}