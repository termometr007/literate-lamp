import { initTelegramWebApp } from './telegramWebApp.js';
import { setupCompanyAndBotInfoListeners } from './companyAndBotInfo.js';
import { setupPageNavigationListeners } from './pageNavigation.js';
import { setupSectionListeners, renderSections } from './sectionsLogic.js';
import { setupContextMenuListeners } from './contextMenuLogic.js';
import { setupRecipientsModalListeners } from './recipientsModalLogic.js';
import { initEmployeeFeatures } from './employeeFeatures.js'; // <-- Добавляем импорт
import { currentParentId } from './constants.js'; // sectionsData больше не нужна здесь напрямую

document.addEventListener('DOMContentLoaded', () => {
    // Инициализация Telegram Web App (или эмуляция для браузера)
    initTelegramWebApp();

    // Настройка слушателей для обновления информации о компании/боте
    setupCompanyAndBotInfoListeners();

    // Настройка слушателей для навигации по страницам
    setupPageNavigationListeners();

    // Настройка слушателей для логики разделов
    setupSectionListeners();

    // Настройка слушателей для контекстного меню
    setupContextMenuListeners();

    // Настройка слушателей для модального окна получателей
    setupRecipientsModalListeners();

    // Инициализация функционала для сотрудников
    initEmployeeFeatures(); // <-- Вызываем функцию инициализации

    // Инициализация разделов при загрузке страницы, если не в TWA
    // Если в TWA, то renderSections будет вызвана после получения initial_data от бота
    if (!(window.Telegram && window.Telegram.WebApp)) {
        renderSections(currentParentId);
    }
});