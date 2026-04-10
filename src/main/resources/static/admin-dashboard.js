import { createStoreApi } from "./store-api.js";
import {renderHome, renderTempSummary} from "./common-uis.js";
import {renderStoreSummary,renderRegionSummary} from "./store-uis.js";
import {navigate, sortByDateAsc, sortByDateDesc, sortByStore} from "./utils.js";


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

    if (res.status === 401) {
        const refreshRes = await fetch("/auth/refresh", {
            method: "POST",
            credentials: "include"
        });

        if (!refreshRes.ok) {
            localStorage.clear();
            location.href = "/sign-inView";
            return false;
        }

        const newData = await refreshRes.json();
        localStorage.setItem("accessToken", newData.accessToken);

        res = await fetch("/auth/me", {
            headers: { Authorization: "Bearer " + newData.accessToken },
            credentials: "include"
        });
    }

    const data = await res.json();

    if (data.mustChangePassword === true) {
        location.href = "/change-password";
        return false;
    }

    localStorage.setItem("role", data.role);
    return true; // 🔥 핵심
}
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
async function logout() {
    try {
        const token = localStorage.getItem("accessToken");

        await fetch("/api/auth/sign-out", {
            method: "POST",
            headers: {
                "Authorization": "Bearer " + token
            }
        });
    } catch (e) {
        console.warn("로그아웃 요청 실패 (무시하고 진행)", e);
    }

    // 🔥 서버 실패해도 무조건 로그아웃 처리
    localStorage.clear();
    location.href = "/sign-inView";
}