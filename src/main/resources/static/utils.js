export function sortByDateDesc() {
    tempData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    renderTempList(tempData);
}

export function sortByDateAsc() {
    tempData.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    renderTempList(tempData);
}

export function sortByStore() {
    tempData.sort((a, b) => a.storeName.localeCompare(b.storeName, 'ko'));
    renderTempList(tempData);
}