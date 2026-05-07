import {createDevice} from "../apis/device-apis.js";
import {buildStepHeader, fetchWithAuth} from "../utils/utils.js";

const deviceTypeMeta = {
    CAM: {
        label: "카메라",
        badge: "badge-violet"
    },
    SCORE: {
        label: "스코어보드",
        badge: "badge-amber"
    },
    CONTROLLER: {
        label: "게임 컨트롤러",
        badge: "badge-teal"
    },
    LED: {
        label: "LED 컨트롤러",
        badge: "badge-rose"
    }
};

let cachedDeviceTypes = [];

export function renderCreateDevice() {

    document.getElementById("page-title").textContent = "장비 등록";

    const el = document.getElementById("main-content");

    el.innerHTML = `
        <div style="display:flex; gap:24px; align-items:flex-start">

            <!-- LEFT -->
            <div class="card" style="flex:1">

                <h2 style="
                    font-size:16px;
                    font-weight:600;
                    margin-bottom:16px;
                ">
                    장비 등록 (다중)
                </h2>

                <div 
                    id="device-list"
                    style="
                        display:flex;
                        flex-direction:column;
                        gap:10px;
                    "
                ></div>

                <button 
                    class="btn btn-ghost add-btn"
                    style="margin-top:10px;"
                >
                    + 장비 추가
                </button>

                <div style="
                    display:flex;
                    justify-content:flex-end;
                    gap:8px;
                    margin-top:16px;
                ">
                    <button class="btn btn-ghost cancel-btn">
                        취소
                    </button>

                    <button class="btn btn-primary create-btn">
                        등록
                    </button>
                </div>

            </div>

            <!-- RIGHT -->
            <div style="
                width:260px;
                display:flex;
                flex-direction:column;
                gap:12px;
            ">

                <div class="card">

                    <div style="
                        font-weight:600;
                        font-size:14px;
                    ">
                        입력 가이드
                    </div>

                    <ul style="
                        margin-top:10px;
                        font-size:13px;
                        color:var(--txt-2);
                        line-height:1.6;

                        display:flex;
                        flex-direction:column;
                        gap:6px;
                    ">

                        <li>
                            • 여러 장비를 한 번에 등록할 수 있습니다
                        </li>

                        <li>
                            • 장비 타입은 반드시 선택해야 합니다
                        </li>

                        <li>
                            • 등록 후 시리얼 번호가 자동 생성됩니다
                        </li>

                    </ul>

                </div>

                <div class="card" style="background: var(--rose-dim);">

                    <div style="
                        font-size:13px;
                        color:var(--rose);
                        font-weight:500;
                    ">
                        ⚠️ 등록된 장비는 즉시 활성화됩니다
                    </div>

                </div>

            </div>

        </div>
    `;

    addDeviceRow();

    el.querySelector(".add-btn").onclick = addDeviceRow;
    el.querySelector(".create-btn").onclick = openCreateDeviceModal;
    el.querySelector(".cancel-btn").onclick = resetDeviceForm;
}

async function loadDeviceTypes() {

    if (cachedDeviceTypes.length) {
        return cachedDeviceTypes;
    }

    const res = await fetchWithAuth("/api/devices/device-types");

    cachedDeviceTypes = await res.json();

    return cachedDeviceTypes;
}

async function addDeviceRow() {

    const list = document.getElementById("device-list");

    const types = await loadDeviceTypes();

    const row = document.createElement("div");

    row.className = "device-row";

    row.style = `
        display:flex;
        gap:8px;
        align-items:center;

        padding:10px;

        border:1px solid var(--border-1);
        border-radius:var(--radius-sm);

        background:var(--surface-2);
    `;

    row.innerHTML = `
    
        <div class="field" style="
            flex:1;
            margin-bottom:0;
        ">

            <input 
                class="device-name"
                placeholder="장비 이름"
            >

        </div>

        <div class="custom-select-wrap" style="width:180px;">

            <select class="custom-select device-type">

                ${types.map(t => `
                    <option value="${t}">
                        ${deviceTypeMeta[t]?.label || t}
                    </option>
                `).join("")}

            </select>

            <span class="custom-select-arrow">
                <i class="fa-solid fa-chevron-down"></i>
            </span>

        </div>

        <button class="btn btn-ghost remove-btn">
            삭제
        </button>
    `;

    row.querySelector(".remove-btn").onclick = () => {

        const count = document.querySelectorAll(".device-row").length;

        if (count === 1) {

            Swal.fire({
                icon: "info",
                title: "안내",
                text: "최소 1개의 장비는 필요합니다."
            });

            return;
        }

        row.remove();
    };

    list.appendChild(row);
}

function collectDevices() {

    const rows = document.querySelectorAll(".device-row");

    return Array.from(rows).map(r => {

        const select = r.querySelector(".device-type");

        const originalType = Object.keys(deviceTypeMeta)
            .find(key => deviceTypeMeta[key].label === select.value);

        return {
            deviceName: r.querySelector(".device-name").value.trim(),
            deviceType: originalType || select.value,
            storeId: null
        };
    });
}

async function openCreateDeviceModal() {

    const devices = collectDevices();

    console.log("보내는 데이터:", devices);

    if (!devices.length) {

        await Swal.fire({
            icon: "warning",
            title: "장비 없음",
            text: "장비를 하나 이상 추가해주세요."
        });

        return;
    }

    if (devices.some(d => !d.deviceName)) {

        await Swal.fire({
            icon: "warning",
            title: "입력 필요",
            text: "장비 이름을 모두 입력해주세요."
        });

        return;
    }

    // STEP 1
    const step1 = await Swal.fire({

        width: 480,

        showCancelButton: true,

        confirmButtonText: "다음 →",
        cancelButtonText: "취소",

        buttonsStyling: false,

        customClass: {
            popup: "swal-custom",
            confirmButton: "btn btn-primary",
            cancelButton: "btn btn-ghost"
        },

        html: `

            ${buildStepHeader(1, ["확인", "등록"])}

            <div class="swal-modal-header">
                <h3>장비 등록 확인</h3>
                <p>
                    총 ${devices.length}개의 장비를 등록합니다
                </p>
            </div>

            <div style="
    display:flex;
    flex-direction:column;
    gap:8px;
    margin-top:16px;
">

    ${devices.map(d => {

            const meta = deviceTypeMeta[d.deviceType];

            return `
            <div style="
                display:flex;
                align-items:center;
                justify-content:space-between;

                padding:10px 12px;

                border:1px solid var(--border-1);
                border-radius:var(--radius-sm);

                background:var(--surface-2);
            ">

                <span style="
                    font-size:13px;
                    color:var(--txt-1);
                    font-weight:500;
                ">
                    ${d.deviceName}
                </span>

                <span class="badge ${meta.badge}">
                    ${meta.label}
                </span>

            </div>
        `;
        }).join("")}

</div>
        `
    });

    if (!step1.isConfirmed) {
        return;
    }

    // STEP 2
    const step2 = await Swal.fire({

        width: 480,

        showCancelButton: true,

        confirmButtonText: "등록",
        cancelButtonText: "← 이전",

        buttonsStyling: false,

        customClass: {
            popup: "swal-custom",
            confirmButton: "btn btn-primary",
            cancelButton: "btn btn-ghost"
        },

        html: `

            ${buildStepHeader(2, ["확인", "등록"])}

            <div class="swal-modal-header">
                <h3>등록 진행</h3>
            </div>

            <p style="text-align:center;">
                등록 후 시리얼 번호가 자동 생성됩니다.
            </p>

        `
    });

    if (step2.dismiss === Swal.DismissReason.cancel) {
        return openCreateDeviceModal();
    }

    if (!step2.isConfirmed) {
        return;
    }

    // API
    try {

        await createDevice(devices);

    } catch (err) {

        console.error(err);

        await Swal.fire({
            icon: "error",
            title: "등록 실패",
            text: "장비 등록 중 오류가 발생했습니다."
        });

        return;
    }

    // SUCCESS
    resetDeviceForm();

    await Swal.fire({
        icon: "success",
        title: "등록 완료",
        text: `${devices.length}개의 장비가 등록되었습니다.`,
        timer: 1400,
        showConfirmButton: false
    });
}

function resetDeviceForm() {

    const list = document.getElementById("device-list");

    list.innerHTML = "";

    addDeviceRow();
}