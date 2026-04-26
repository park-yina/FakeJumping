import {updateStoreOpenDate} from "../apis/store-api.js";
import {runStepModal} from "./modalCommons.js";

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