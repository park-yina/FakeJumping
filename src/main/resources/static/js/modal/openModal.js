import {reopenStore, updateStoreOpenDate} from "../apis/store-api.js";
import {runStepModal} from "./modalCommons.js";
import {renderStoreListPage} from "../uis/store-uis.js";
import {buildStepHeader} from "../utils/utils.js";

export async function openModal(store) {
    return runStepModal({
        store,
        title: "오픈일을 변경합니다",
        confirmLabel: "오픈일 확인",
        icon: "fa-regular fa-calendar-check",
        actionText: "변경 예정",
        initialDate: store.openAt?.split("T")[0],

        dangerCheck: async ({selected, today, date}) => {
            if (selected < today) {
                const confirm = await Swal.fire({
                    icon: "warning",
                    title: "과거 날짜 변경",
                    text: "과거 날짜로 변경하시겠습니까?",
                    showCancelButton: true,
                    confirmButtonText: "강제 변경"
                });
                return confirm.isConfirmed ? true : null;
            }
            return false;
        },

        apiCall: async ({store, date, force}) => {
            await updateStoreOpenDate(store.id, date + "T00:00:00", force);
        }
    });
}
export async function openReopenModal(store) {

    // 1️⃣ 확인
    const step1 = await Swal.fire({
        width: 420,
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
            ${buildStepHeader(1, ["확인", "복구"])}
            <div class="swal-modal-header">
                <h3>재오픈</h3>
                <p>${store.name}</p>
            </div>
            <p style="text-align:center;">
                매장을 다시 운영 상태로 전환합니다.
            </p>
        `
    });

    if (!step1.isConfirmed) return;

    // 2️⃣ 위험 경고 (optional이지만 추천)
    const step2 = await Swal.fire({
        width: 420,
        showCancelButton: true,
        confirmButtonText: "재오픈",
        cancelButtonText: "← 이전",
        buttonsStyling: false,
        customClass: {
            popup: "swal-custom",
            confirmButton: "btn btn-danger",
            cancelButton: "btn btn-ghost"
        },
        html: `
            ${buildStepHeader(2, ["확인", "복구"])}
            <div class="swal-modal-header">
                <h3>재오픈 확인</h3>
            </div>
            <p style="text-align:center;">
                관리자 권한이 다시 활성화됩니다.
            </p>
        `
    });

    if (step2.dismiss === Swal.DismissReason.cancel) {
        return openReopenModal(store);
    }
    if (!step2.isConfirmed) return;

    // 3️⃣ API 호출
    try {
        await
            reopenStore(store.id);

    } catch (e) {
        await Swal.fire({
            icon: "error",
            title: "재오픈 실패",
            text: e.message || "다시 시도해주세요."
        });
        return;
    }

    // 4️⃣ 성공
    await renderStoreListPage();

    await Swal.fire({
        icon: "success",
        title: "재오픈 완료",
        timer: 1200,
        showConfirmButton: false
    });
}