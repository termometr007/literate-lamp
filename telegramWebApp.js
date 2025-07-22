import { applyTheme } from './pageNavigation.js';
import { updateCompanyInfo, updateBotLogo } from './companyAndBotInfo.js';
import { setSectionsData, currentParentId } from './constants.js';
import { renderSections } from './sectionsLogic.js';
import { updateAdminNotes } from './employeeFeatures.js'; // Импортируем для обновления заметок

export let isWebApp = false;

export function initTelegramWebApp() {
    if (window.Telegram && window.Telegram.WebApp) {
        isWebApp = true;
        Telegram.WebApp.ready();
        // Telegram.WebApp.expand(); // Можно раскомментировать, если нужно сразу развернуть WebApp

        Telegram.WebApp.onEvent('themeChanged', () => {
            const isDark = Telegram.WebApp.colorScheme === 'dark';
            applyTheme(isDark);
            document.getElementById('theme-switch').checked = isDark;
            localStorage.setItem('theme', isDark ? 'dark' : 'light');
        });

        window.Telegram.WebApp.onEvent('web_app_data', (event) => {
            const data = JSON.parse(event.data);
            console.log('Received data from bot:', data);
            if (data.type === 'initial_data') {
                if (data.companyLogo) {
                    updateCompanyInfo(data.companyLogo, null);
                    document.getElementById('logo-url-input').value = data.companyLogo;
                }
                if (data.companyName) {
                    updateCompanyInfo(null, data.companyName);
                    document.getElementById('company-name-input').value = data.companyName;
                }
                if (data.botLogo) {
                    updateBotLogo(data.botLogo);
                    document.getElementById('bot-logo-url-input').value = data.botLogo;
                }
                if (data.sections && Array.isArray(data.sections)) {
                    setSectionsData(data.sections); // Обновляем sectionsData в constants.js
                    renderSections(currentParentId); // Перерисовываем разделы
                }
                if (data.adminNotes && Array.isArray(data.adminNotes)) { // <-- Обработка заметок
                    updateAdminNotes(data.adminNotes);
                }
                // Здесь можно добавить обработку других начальных данных
            } else if (data.type === 'all_sections_data' && Array.isArray(data.sections)) {
                setSectionsData(data.sections);
                renderSections(currentParentId);
            }
            // Здесь можно добавить обработку других типов данных от бота
            showAlert(`Получен ответ от бота: ${JSON.stringify(data)}`);
        });

        // Запрашиваем начальные данные при старте
        Telegram.WebApp.sendData(JSON.stringify({ command: 'request_initial_data' }));

    } else {
        // Дефолтные значения и тестовые данные для браузера
        updateCompanyInfo('https://via.placeholder.com/60/0000FF/FFFFFF?text=MyComp', 'Название Компании');
        updateBotLogo('https://via.placeholder.com/60/FF5733/FFFFFF?text=B');
        // renderSections будет вызвана в main.js
        // updateAdminNotes будет вызвана в employeeFeatures.js
    }
}

export function sendDataToBot(data) {
    if (isWebApp) {
        Telegram.WebApp.sendData(JSON.stringify(data));
    } else {
        console.log('Would send to bot (not in WebApp):', data);
    }
}

export function showAlert(message) {
    return new Promise(resolve => {
        if (isWebApp) {
            Telegram.WebApp.showAlert(message, () => resolve(true)); // WebApp showAlert имеет колбэк
        } else {
            alert(message);
            resolve(true);
        }
    });
}

export function showConfirm(message, callback) {
    if (isWebApp) {
        Telegram.WebApp.showConfirm(message, callback);
    } else {
        callback(confirm(message));
    }
}

export function HapticFeedbackImpact(style) {
    if (isWebApp) {
        Telegram.WebApp.HapticFeedback.impactOccurred(style);
    }
}

export function HapticFeedbackNotification(type) {
    if (isWebApp) {
        Telegram.WebApp.HapticFeedback.notificationOccurred(type);
    }
}