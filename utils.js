export function generateUniqueId() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

export function formatQuantity(quantity) {
    if (typeof quantity === 'number') {
        return quantity.toFixed(1).replace(/\.0$/, ''); // Форматируем до 1 знака, убираем .0 если целое
    }
    return '';
}