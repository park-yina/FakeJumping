import {closeStore} from "../apis/store-api.js";
import {runStepModal} from "./modalCommons.js";

export async function closeModal(store) {
    return runStepModal({
        store,
        title: "폐점일을 설정합니다",
        confirmLabel: "폐점 확인",
        icon: "fa-solid fa-lock",
        actionText: "폐점 예정",

        dangerCheck: async ({selected, today}) => {
            if (selected < today) {
                const confirm = await Swal.fire({
                    icon: "warning",
                    title: "과거 폐점",
                    text: "과거 날짜로 폐점하시겠습니까?",
                    showCancelButton: true,
                    confirmButtonText: "강제 폐점"
                });
                return confirm.isConfirmed ? true : null;
            }
            return false;
        },

        apiCall: async ({store, date, force}) => {
            try {
                await closeStore(store.id, date + "T00:00:00", force);
            } catch (e) {
                if ((e.code || e.errorCode) === "NOT_OPENED_CANNOT_CLOSE") {
                    const confirm = await Swal.fire({
                        icon: "warning",
                        title: "미오픈 매장",
                        text: "강제로 폐점하시겠습니까?",
                        showCancelButton: true
                    });

                    if (!confirm.isConfirmed) throw e;

                    await closeStore(store.id, date + "T00:00:00", true);
                } else {
                    throw e;
                }
            }
        }
    });
}