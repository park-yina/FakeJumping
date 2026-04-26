import {formatDateKo} from "../uis/myStore-uis.js";
import {buildStepHeader} from "../utils/utils.js";

export async function runStepModal({
                                       store,
                                       title,
                                       confirmLabel,
                                       icon,
                                       actionText,
                                       initialDate = null,
                                       apiCall,
                                       validate,
                                       dangerCheck
                                   }) {
    let selectedDate = initialDate;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 1️⃣ 날짜 선택
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
            ${buildStepHeader(1, ["날짜 선택", "확인", "위험"])}
            <div class="swal-modal-header">
                <h3>${store.name}</h3>
                <p>${title}</p>
            </div>
            <div class="date-input-wrapper">
                <input id="dateInput" class="custom-date-input" placeholder="날짜 선택">
            </div>
        `,
        didOpen: () => {
            flatpickr(document.getElementById("dateInput"), {
                locale: flatpickr.l10ns.ko,
                defaultDate: selectedDate,
                dateFormat: "Y-m-d",
                onChange: (_, dateStr) => selectedDate = dateStr
            });
        },
        preConfirm: () => {
            if (!selectedDate) {
                Swal.showValidationMessage("날짜를 선택해주세요");
                return false;
            }
            return selectedDate;
        }
    });

    if (!step1.isConfirmed) return;

    const date = step1.value;

    // 2️⃣ 확인
    const step2 = await Swal.fire({
        width: 420,
        showCancelButton: true,
        confirmButtonText: "다음 →",
        cancelButtonText: "← 이전",
        buttonsStyling: false,
        customClass: {
            popup: "swal-custom",
            confirmButton: "btn btn-violet",
            cancelButton: "btn btn-ghost"
        },
        html: `
            ${buildStepHeader(2, ["날짜 선택", "확인", "위험"])}
            <div class="swal-modal-header">
                <h3>${confirmLabel}</h3>
                <p>${store.name}</p>
            </div>
            <div class="swal-confirm-card">
                <div class="swal-confirm-icon">
                    <i class="${icon}"></i>
                </div>
                <div>
                    <div class="swal-confirm-date">
                        ${formatDateKo(date)}
                    </div>
                    <div class="swal-confirm-meta">
                        ${actionText}
                    </div>
                </div>
            </div>
        `
    });

    if (step2.dismiss === Swal.DismissReason.cancel) {
        return runStepModal(arguments[0]);
    }
    if (!step2.isConfirmed) return;

    // 3️⃣ 위험 처리
    const selected = new Date(date);
    selected.setHours(0, 0, 0, 0);

    let force = false;

    if (dangerCheck) {
        force = await dangerCheck({selected, today, store, date});
        if (force === null) return;
    }

    // 4️⃣ API 호출
    try {
        await apiCall({store, date, force});
    } catch (e) {
        await Swal.fire({
            icon: "error",
            title: "실패",
            text: e.message || "다시 시도해주세요."
        });
        return;
    }

    // 5️⃣ 성공
    await Swal.fire({
        icon: "success",
        title: "완료",
        timer: 1200,
        showConfirmButton: false
    });
}