export const ALL_USERS = [
    { id: 'user1', name: 'Иван Иванов', role: 'employee' },
    { id: 'user2', name: 'Петр Петров', role: 'admin' },
    { id: 'user3', name: 'Анна Сидорова', role: 'employee' },
    { id: 'user4', name: 'Мария Кузнецова', role: 'admin' },
    { id: 'user5', name: 'Дмитрий Смирнов', role: 'employee' }
];

// Имитация данных разделов (для тестирования без бота)
export let sectionsData = [
    { id: 'sec1', name: 'Раздел А (тестовый)', parentId: 'root', quantity: 10.5, min_quantity: 5, hidden_from_users: [] },
    { id: 'sec2', name: 'Раздел Б (тестовый)', parentId: 'root', quantity: 0, min_quantity: 0, hidden_from_users: ['user1'] },
    { id: 'sec1_1', name: 'Позиция А1', parentId: 'sec1', quantity: 20, min_quantity: 10, hidden_from_users: [] },
    { id: 'sec1_2', name: 'Позиция А2', parentId: 'sec1', quantity: 5, min_quantity: 2, hidden_from_users: ['user2', 'user3'] }
];

// Глобальные переменные состояния
export let currentPath = [{ id: 'root', name: 'Главная' }];
export let currentParentId = 'root';
export let longPressTimer = null;
export let currentSectionForMenu = null;
export let currentRecipientsSelectionType = '';

// Константы для контекстного меню
export const CONTEXT_MENU_CLOSE_DELAY = 350; // Должно быть больше, чем 300мс в hideContextMenu
export const LONG_PRESS_THRESHOLD = 500; // milliseconds

// Функция для обновления sectionsData извне (например, от бота)
export function setSectionsData(newSections) {
    sectionsData = newSections;
}

export function updateSectionData(id, updates) {
    const index = sectionsData.findIndex(s => s.id === id);
    if (index !== -1) {
        sectionsData[index] = { ...sectionsData[index], ...updates };
    }
}

export function deleteSectionsData(idsToDelete) {
    sectionsData = sectionsData.filter(s => !idsToDelete.includes(s.id));
}

export function addSectionData(newSection) {
    sectionsData.push(newSection);
}

export function setCurrentPath(path) {
    currentPath = path;
}

export function setCurrentParentId(parentId) {
    currentParentId = parentId;
}

export function setCurrentSectionForMenu(sectionId) {
    currentSectionForMenu = sectionId;
}

export function setCurrentRecipientsSelectionType(type) {
    currentRecipientsSelectionType = type;
}

export function setLongPressTimer(timer) {
    longPressTimer = timer;
}