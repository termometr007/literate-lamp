import { HapticFeedbackImpact } from './telegramWebApp.js';
import { renderSections } from './sectionsLogic.js';
import { currentParentId } from './constants.js';

const headerContainer = document.getElementById('header-container');
const contentArea = document.getElementById('content-area'); // Главная страница
const sectionsPage = document.getElementById('sections-page');
const tasksPage = document.getElementById('tasks-page'); // Новая страница задач
const chatsPage = document.getElementById('chats-page'); // Новая страница чатов
const contentWrapper = document.querySelector('.content-wrapper');
const navButtons = document.querySelectorAll('.nav-button');
const themeSwitch = document.getElementById('theme-switch');
const sunIcon = document.querySelector('.theme-icon.sun-icon');
const moonIcon = document.querySelector('.theme-icon.moon-icon');

export function showPage(pageId) {
    const pageElement = document.getElementById(pageId);
    
    // Скрываем все "страницы"
    contentArea.style.display = 'none';
    sectionsPage.style.display = 'none';
    tasksPage.style.display = 'none'; // Скрываем страницу задач
    chatsPage.style.display = 'none'; // Скрываем страницу чатов

    // Показываем нужную страницу
    pageElement.style.display = 'block';

    // Управление видимостью хедера и отступом content-wrapper
    if (pageElement === contentArea) {
        headerContainer.classList.remove('hidden'); // Показать хедер на главной
        contentWrapper.classList.remove('header-hidden'); // Установить отступ
    } else {
        headerContainer.classList.add('hidden'); // Скрыть хедер на других страницах
        contentWrapper.classList.add('header-hidden'); // Убрать отступ
    }

    // Обновляем активную кнопку навигации
    navButtons.forEach(btn => btn.classList.remove('active'));
    const activeButton = Array.from(navButtons).find(btn => btn.dataset.targetPage === pageId);
    if (activeButton) {
        activeButton.classList.add('active');
    }

    // Дополнительная логика при переключении страниц
    if (pageId === 'sections-page') {
        renderSections(currentParentId); // Убедимся, что разделы отрисованы
    } else if (pageId === 'tasks-page') {
        renderTasks('all'); // Отображаем задачи (по умолчанию все)
    } else if (pageId === 'chats-page') {
        renderChats(); // Отображаем чаты
    }
}

// Пример функции для рендеринга задач (пока тестовая)
function renderTasks(filter) {
    const tasksList = document.getElementById('tasks-list');
    tasksList.innerHTML = ''; // Очищаем список
    const noTasksMessage = document.querySelector('.no-tasks-message');

    // Тестовые данные задач
    const allTasks = [
        { id: 't1', title: 'Проверить запасы на складе А', assignedTo: 'user1', status: 'В работе' },
        { id: 't2', title: 'Отправить ежемесячный отчет', assignedTo: 'user2', status: 'Завершена' },
        { id: 't3', title: 'Заказать новые расходники', assignedTo: 'user1', status: 'Новая' },
        { id: 't4', title: 'Организовать встречу с поставщиком', assignedTo: 'user3', status: 'Отложена' }
    ];

    let filteredTasks = [];
    if (filter === 'all') {
        filteredTasks = allTasks;
    } else if (filter === 'my') {
        // Здесь потребуется реальный ID текущего пользователя
        // Для примера, пусть "user1" - это текущий сотрудник
        const currentUserId = 'user1'; 
        filteredTasks = allTasks.filter(task => task.assignedTo === currentUserId);
    }

    if (filteredTasks.length === 0) {
        noTasksMessage.style.display = 'block';
    } else {
        noTasksMessage.style.display = 'none';
        filteredTasks.forEach(task => {
            const taskItem = document.createElement('div');
            taskItem.classList.add('task-item');
            taskItem.innerHTML = `
                <span class="task-title">${task.title}</span>
                <span class="task-status">${task.status}</span>
            `;
            tasksList.appendChild(taskItem);
        });
    }

    // Обработчики для кнопок фильтра задач
    document.querySelectorAll('#tasks-page .filter-tab').forEach(tab => {
        tab.classList.remove('active');
        if (tab.dataset.filter === filter) {
            tab.classList.add('active');
        }
        tab.onclick = () => {
            HapticFeedbackImpact('light');
            renderTasks(tab.dataset.filter);
        };
    });
}

// Пример функции для рендеринга чатов (пока тестовая)
function renderChats() {
    const chatsList = document.getElementById('chats-list');
    chatsList.innerHTML = '';
    const noChatsMessage = document.querySelector('.no-chats-message');

    // Тестовые данные чатов
    const availableChats = [
        { id: 'chat1', name: 'Общий чат компании', link: 'https://t.me/telegram_web_app_bot_test_chat_1', icon: 'https://via.placeholder.com/40/007bff/FFFFFF?text=КЧ' },
        { id: 'chat2', name: 'Отдел продаж', link: 'https://t.me/telegram_web_app_bot_test_chat_2', icon: 'https://via.placeholder.com/40/28a745/FFFFFF?text=ОП' },
        { id: 'chat3', name: 'Техническая поддержка', link: 'https://t.me/telegram_web_app_bot_test_chat_3', icon: 'https://via.placeholder.com/40/ffc107/FFFFFF?text=ТП' }
    ];

    if (availableChats.length === 0) {
        noChatsMessage.style.display = 'block';
    } else {
        noChatsMessage.style.display = 'none';
        availableChats.forEach(chat => {
            const chatItem = document.createElement('a');
            chatItem.href = chat.link;
            chatItem.target = '_blank'; // Открывать в новом окне/вкладке
            chatItem.classList.add('chat-item');
            chatItem.innerHTML = `
                <img src="${chat.icon}" alt="Chat Icon" class="chat-icon">
                <span class="chat-name">${chat.name}</span>
            `;
            chatsList.appendChild(chatItem);
        });
    }
}


export function setupPageNavigationListeners() {
    // Логика скролла хедера
    let lastScrollTop = 0;
    const borderRadiusSize = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--border-radius-size'));

    window.addEventListener('scroll', () => {
        let currentScrollTop = window.pageYOffset || document.documentElement.scrollTop;
        if (contentArea.style.display !== 'none') { // Только для главной страницы
            let translateYValue = Math.min(0, Math.max(-headerContainer.offsetHeight + borderRadiusSize, currentScrollTop));
            contentArea.style.transform = `translateY(${translateYValue}px)`;
        }
        lastScrollTop = currentScrollTop;
    });

    // Логика переключения темы
    themeSwitch.addEventListener('change', () => {
        const isDark = themeSwitch.checked;
        applyTheme(isDark);
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        // В Telegram Web App тема адаптируется автоматически
    });

    // Загрузка темы при старте
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        themeSwitch.checked = true;
        applyTheme(true);
    } else {
        themeSwitch.checked = false;
        applyTheme(false);
    }

    // Обработчики кликов по кнопкам нижней навигации
    navButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetPageId = button.dataset.targetPage;
            if (targetPageId) {
                showPage(targetPageId);
                HapticFeedbackImpact('light');
            }
        });
    });

    // Активируем кнопку "Главная" по умолчанию при загрузке
    showPage('content-area');
}

export function applyTheme(isDark) {
    if (isDark) {
        document.body.classList.add('dark-mode');
        sunIcon.style.color = 'var(--icon-color-dark)';
        moonIcon.style.color = 'var(--icon-color-light)';
    } else {
        document.body.classList.remove('dark-mode');
        sunIcon.style.color = 'var(--icon-color-light)';
        moonIcon.style.color = 'var(--icon-color-dark)';
    }
}