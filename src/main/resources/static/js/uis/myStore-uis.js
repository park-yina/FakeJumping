import {fetchMyStoreMe, updateOpenDate} from "../apis/myStore-apis.js";
import {formatDate, navigate, openContactModal} from "../utils/utils.js";
import {getHolidayMap} from "../calendar/holidays.js";

function getStatusHtml(data) {
    const open = data.openAt ? new Date(data.openAt) : null;
    const now = new Date();

    if (!open) {
        return `
            <div>
                <span class="badge badge-amber">오픈 미정</span>
                <div style="margin-top:6px;">미정</div>
            </div>
        `;
    }

    if (open > now) {
        const dday = getDDay(data.openAt);

        return `
            <div>
                <span class="badge badge-violet">${dday}</span>
                <div style="margin-top:6px;">오픈 예정</div>
            </div>
        `;
    }

    return `
        <div>
            <span class="badge badge-teal">운영중</span>
            <div style="margin-top:6px;">운영중</div>
        </div>
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
            ? `오픈일: ${formatDate(data.openAt)}`
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
            openDatePicker(data);
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

// 스텝 인디케이터 HTML 생성 헬퍼
function buildStepBar(currentStep) {
    const steps = ["날짜 선택", "확인", "완료"];

    return steps.map((label, i) => {
        const idx = i + 1;
        const isDone = idx < currentStep;
        const isActive = idx === currentStep;

        const circleClass = isDone ? "done" : isActive ? "active" : "";
        const labelClass = isActive ? "active" : "";
        const circleInner = isDone ? "✓" : idx;
        const lineClass = isDone ? "done" : "";

        const node = `
      <div class="swal-step-node">
        <div class="swal-step-circle ${circleClass}">${circleInner}</div>
        <span class="swal-step-label ${labelClass}">${label}</span>
      </div>`;

        const line = i < steps.length - 1
            ? `<div class="swal-step-line ${lineClass}"></div>`
            : "";

        return node + line;
    }).join("");
}

// 날짜 → "2025년 4월 15일 화요일" 포맷
function formatDateKo(dateStr) {
    const d = new Date(dateStr);
    const days = ["일", "월", "화", "수", "목", "금", "토"];
    return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일 ${days[d.getDay()]}요일`;
}

let fp;

async function openDatePicker(store) {
    let selectedDate = store.openAt ? store.openAt.split("T")[0] : null;

    // ── STEP 1: 날짜 선택 ──────────────────────
    const step1 = await Swal.fire({
        width: 470,
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
        <div class="swal-step-bar">
            ${buildStepBar(1)}
        </div>

        <div class="swal-modal-header">
            <h3>오픈일 선택</h3>
            <p>매장 오픈 예정일을 선택해주세요</p>
        </div>

        <div class="date-input-wrapper">
            <input id="flatpickrInput" 
                   class="custom-date-input"
                   placeholder="날짜 선택">
        </div>

        <div class="swal-guide-box">
            <div class="swal-guide-text">
                과거 날짜로 오픈일을 변경하려면 본사 관리자에게 문의해주세요.
            </div>
            <button id="contactAdminBtn" class="btn btn-ghost btn-sm">
                <i class="fa-solid fa-headset"></i>
                관리자에게 문의
            </button>
        </div>
        `,
        didOpen: () => {
            const input = document.getElementById("flatpickrInput");

            fp = flatpickr(input, {
                locale: flatpickr.l10ns.ko,
                defaultDate: selectedDate,
                dateFormat: "Y-m-d",
                allowInput: true,
                clickOpens: false,
                minDate: "today",

                onChange(selectedDates, dateStr, instance) {
                    if (!selectedDates.length) return;
                    selectedDate = dateStr;
                    instance.close();
                },

                onDayCreate(dObj, dStr, fp, dayElem) {
                    const date = fp.formatDate(dayElem.dateObj, "Y-m-d");
                    const map = getHolidayMap(dayElem.dateObj.getFullYear());

                    if (map[date]) {
                        dayElem.classList.add("holiday");
                        dayElem.title = map[date].join(", ");
                    }
                }
            });

            input.onclick = (e) => {
                e.stopPropagation();
                fp.isOpen ? fp.close() : fp.open();
            };

            document.getElementById("contactAdminBtn")
                .addEventListener("click", openContactModal);
        },
        willClose: () => {
            fp?.destroy();
            fp = null;
        },
        preConfirm() {
            if (!selectedDate) {
                Swal.showValidationMessage("날짜를 선택해주세요");
                return false;
            }
            return selectedDate;
        }
    });

    if (!step1.isConfirmed) return;
    const date = step1.value;

    // ── STEP 2: 확인 ──────────────────────────
    const step2 = await Swal.fire({
        width: 420,
        showCancelButton: true,
        confirmButtonText: "저장하기",
        cancelButtonText: "← 이전",
        buttonsStyling: false,
        customClass: {
            popup: "swal-custom",
            confirmButton: "btn btn-primary",
            cancelButton: "btn btn-ghost"
        },
        html: `
        <div class="swal-step-bar">
            ${buildStepBar(2)}
        </div>

        <div class="swal-modal-header">
            <h3>오픈일 확인</h3>
            <p>선택하신 날짜가 맞으면 저장하세요</p>
        </div>

        <div class="swal-confirm-card">
            <div class="swal-confirm-icon">
                <i class="fa-regular fa-calendar-check"></i>
            </div>
            <div>
                <div class="swal-confirm-date">
                    ${formatDateKo(date)}
                </div>
                <div class="swal-confirm-meta">
                    오픈 예정일
                </div>
            </div>
        </div>
        `
    });

    if (step2.dismiss === Swal.DismissReason.cancel) {
        return openDatePicker(store);
    }
    if (!step2.isConfirmed) return;

    // ── STEP 3: 저장 ──────────────────────────
    try {
        await updateOpenDate(date + "T00:00:00", false);

    } catch (e) {

        if (e.code === "OPERATING_TO_FUTURE") {

            const confirm = await Swal.fire({
                icon: "warning",
                title: "오픈일 변경",
                html: `
                    운영 중 매장의 오픈일을 미래로 변경하면<br>
                    <b>게임 데이터 및 통계에 영향</b>이 있을 수 있습니다.<br><br>
                    계속 진행하시겠습니까?
                `,
                showCancelButton: true,
                confirmButtonText: "강제 변경",
                cancelButtonText: "취소",
                buttonsStyling: false,
                customClass: {
                    popup: "swal-custom",
                    confirmButton: "btn btn-danger",
                    cancelButton: "btn btn-ghost"
                }
            });

            if (!confirm.isConfirmed) return;

            await updateOpenDate(date + "T00:00:00", true);

        } else {
            await Swal.fire({
                icon: "error",
                title: "실패",
                text: e.message || "오픈 날짜 설정 실패"
            });
            return;
        }
    }

    // ── 성공 처리 ──────────────────────────
    await renderMyStoreSummary();

    await Swal.fire({
        width: 420,
        icon: "success",
        title: "설정 완료",
        html: `
        <div class="swal-step-bar">
            ${buildStepBar(3)}
        </div>

        <div class="swal-confirm-card">
            <div class="swal-confirm-icon">
                <i class="fa-solid fa-circle-check"></i>
            </div>
            <div>
                <div class="swal-confirm-date">
                    ${formatDateKo(date)}
                </div>
                <div class="swal-confirm-meta">
                    오픈일이 설정되었습니다
                </div>
            </div>
        </div>
        `,
        timer: 1200,
        showConfirmButton: false
    });
}