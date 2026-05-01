import {updateCloseDate} from "../apis/store-api.js";
import {runStepModal} from "./modalCommons.js";

export async function updateCloseModal(store) {
    return runStepModal({
        store,
        title: "폐점일을 수정합니다",
        confirmLabel: "폐점일 변경 확인",
        icon: "fa-solid fa-pen",
        actionText: "변경 예정",
        initialDate: store.closedAt?.split("T")[0],

        dangerCheck: async ({selected, today}) => {
            if (selected < today) {
                const confirm = await Swal.fire({
                    icon: "warning",
                    title: "과거 변경",
                    text: "과거 날짜로 변경하시겠습니까?",
                    showCancelButton: true,
                    confirmButtonText: "강제 변경"
                });
                return confirm.isConfirmed ? true : null;
            }
            return false;
        },

        apiCall: async ({store, date}) => {
            await updateCloseDate(store.id, date + "T00:00:00");
        }
    });
}