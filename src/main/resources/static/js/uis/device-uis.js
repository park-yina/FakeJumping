import {createDevice} from "../apis/device-apis.js";
import {fetchWithAuth} from "../utils/utils.js";

export function renderCreateDevice() {
    document.getElementById("page-title").textContent = "장비 등록";

    const el = document.getElementById("main-content");

    el.innerHTML = `
        <div style="display:flex; gap:24px; align-items:flex-start">

            <!-- 왼쪽 -->
            <div class="card" style="flex:1">

                <h2 style="font-size:16px; font-weight:600; margin-bottom:16px;">
                    장비 등록 (다중)
                </h2>

                <div id="device-list" style="display:flex; flex-direction:column; gap:10px;"></div>

                <button class="btn btn-ghost add-btn" style="margin-top:10px;">
                    + 장비 추가
                </button>

                <div style="display:flex; justify-content:flex-end; gap:8px; margin-top:16px;">
                    <button class="btn btn-ghost cancel-btn">취소</button>
                    <button class="btn btn-primary create-btn">등록</button>
                </div>

            </div>

            <!-- 오른쪽 -->
            <div style="width:260px; display:flex; flex-direction:column; gap:12px;">

                <div class="card">
                    <div style="font-weight:600; font-size:14px;">입력 가이드</div>

                    <ul style="margin-top:10px; font-size:13px; color:var(--txt-2); line-height:1.6; display:flex; flex-direction:column; gap:6px;">
                        <li>• 여러 장비를 한 번에 등록할 수 있습니다</li>
                        <li>• 장비 타입은 반드시 선택해야 합니다</li>
                        <li>• 등록 후 시리얼은 자동 생성됩니다</li>
                    </ul>
                </div>

                <div class="card" style="background: var(--rose-dim);">
                    <div style="font-size:13px; color:var(--rose); font-weight:500;">
                        ⚠️ 등록된 장비는 즉시 사용 가능합니다
                    </div>
                </div>

            </div>

        </div>
    `;

    // 초기 row 1개
    addDeviceRow();

    // 이벤트
    el.querySelector(".add-btn").onclick = addDeviceRow;
    el.querySelector(".create-btn").onclick = createDeviceHandler;
    el.querySelector(".cancel-btn").onclick = resetDeviceForm;
}
let cachedDeviceTypes = [];

async function loadDeviceTypes() {
    if (cachedDeviceTypes.length) return cachedDeviceTypes;

    const res = await fetchWithAuth("/api/devices/device-types");
    cachedDeviceTypes = await res.json();

    return cachedDeviceTypes;
}

async function addDeviceRow() {
    const list = document.getElementById("device-list");

    const types = await loadDeviceTypes();
    console.log(types);
    const row = document.createElement("div");
    row.className = "device-row";

    row.style = `
        display:flex;
        gap:8px;
        align-items:center;
    `;

    row.innerHTML = `
        <input class="device-name" placeholder="장비 이름" style="flex:1">

        <select class="device-type">
            ${types.map(t => `<option value="${t}">${t}</option>`).join("")}
        </select>

        <button class="btn btn-ghost remove-btn">삭제</button>
    `;

    row.querySelector(".remove-btn").onclick = () => row.remove();

    list.appendChild(row);
}
function collectDevices() {
    const rows = document.querySelectorAll(".device-row");

    return Array.from(rows).map(r => ({
        deviceName: r.querySelector(".device-name").value.trim(),
        deviceType: r.querySelector(".device-type").value,
        storeId: null // 현재 구조 기준
    }));
}async function createDeviceHandler() {
    const devices = collectDevices();
    console.log("보내는 데이터:", devices);

    // 검증
    if (!devices.length) {
        Swal.fire("경고", "장비를 하나 이상 추가해주세요", "warning");
        return;
    }

    if (devices.some(d => !d.deviceName)) {
        Swal.fire("경고", "장비 이름을 모두 입력해주세요", "warning");
        return;
    }

    try {
        await createDevice(devices);

        await Swal.fire({
            title: "등록 완료",
            icon: "success",
            confirmButtonText: "확인"
        });

        resetDeviceForm();

    } catch (err) {
        Swal.fire("오류", "장비 등록 실패", "error");
    }
}
function resetDeviceForm() {
    const list = document.getElementById("device-list");
    list.innerHTML = "";
    addDeviceRow();
}