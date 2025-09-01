document.addEventListener('DOMContentLoaded', () => {
    // --- Элементы DOM ---
    const companyLogo = document.getElementById('company-logo');
    const companyName = document.getElementById('company-name');
    const backgroundBlur = document.querySelector('.background-blur');
    const headerContainer = document.getElementById('header-container');
    const themeSwitch = document.getElementById('theme-switch');
    const botLogo = document.getElementById('bot-logo');
    const sunIcon = document.querySelector('.theme-icon.sun-icon');
    const moonIcon = document.querySelector('.theme-icon.moon-icon');
    const contentArea = document.getElementById('content-area');
    const contentWrapper = document.querySelector('.content-wrapper');

    // Элементы админ-контроля (для разработчика/тестирования)
    const logoUrlInput = document.getElementById('logo-url-input');
    const companyNameInput = document.getElementById('company-name-input');
    const applyCompanyChangesBtn = document.getElementById('apply-company-changes');
    const botLogoUrlInput = document.getElementById('bot-logo-url-input');
    const applyBotLogoChangesBtn = document.getElementById('apply-bot-logo-changes');

    // Элементы нижней навигации
    const navButtons = document.querySelectorAll('.nav-button');
    const homeNavButton = document.querySelector('.nav-button[data-target-page="content-area"]');
    const sectionsNavButton = document.querySelector('.nav-button[data-target-page="sections-page"]');
    const tasksNavButton = document.querySelector('.nav-button[data-target-page="tasks-page"]'); // Новая кнопка
    const chatsNavButton = document.querySelector('.nav-button[data-target-page="chats-page"]'); // Новая кнопка

    // Элементы страницы "Разделы"
    const sectionsPage = document.getElementById('sections-page');
    const sectionsBreadcrumbs = document.getElementById('sections-breadcrumbs');
    const currentSectionsList = document.getElementById('current-sections-list');
    const createSectionBtn = document.getElementById('create-section-btn');
    const goBackSectionBtn = document.getElementById('go-back-section-btn');
    const noSectionsMessage = document.querySelector('.no-sections-message');

    // Элементы модального окна контекстного меню разделов
    const contextMenuModal = document.getElementById('context-menu-modal');
    const addQuantityBtn = document.getElementById('add-quantity-btn');
    const removeQuantityBtn = document.getElementById('remove-quantity-btn');
    const criticalMinBtn = document.getElementById('critical-min-btn');
    const setReminderBtn = document.getElementById('set-reminder-btn');
    const hideFromBtn = document.getElementById('hide-from-btn');
    const closeContextMenuBtn = document.getElementById('close-context-menu');

    // Элементы модального окна выбора получателей
    const recipientsModal = document.getElementById('recipients-modal');
    const recipientsList = document.getElementById('recipients-list');
    const confirmRecipientsBtn = document.getElementById('confirm-recipients-btn');
    const cancelRecipientsBtn = document.getElementById('cancel-recipients-btn');
    const selectAllRecipientsCheckbox = document.getElementById('select-all-recipients');
    const recipientFilterTabs = document.querySelectorAll('.recipient-filter-tabs .filter-tab');

    // --- НОВЫЕ ЭЛЕМЕНТЫ ДЛЯ ФУНКЦИОНАЛА СОТРУДНИКОВ ---
    const adminNotesContainer = document.getElementById('admin-notes-container');
    const adminNotesContent = document.getElementById('admin-notes-content');
    const clockInOutBtn = document.getElementById('clock-in-out-btn');
    const tasksPage = document.getElementById('tasks-page');
    const chatsPage = document.getElementById('chats-page');
    const taskFilterTabs = document.querySelectorAll('#tasks-page .filter-tab');
    const tasksList = document.getElementById('tasks-list');
    const chatsList = document.getElementById('chats-list');
    const noTasksMessage = tasksPage.querySelector('.no-tasks-message');
    const noChatsMessage = chatsPage.querySelector('.no-chats-message');

    // Элементы модального окна контекстного меню ЗАДАЧ
    const taskContextMenuModal = document.getElementById('task-context-menu-modal');
    const taskSetInProgressBtn = document.getElementById('task-set-in-progress-btn');
    const taskSetCompletedBtn = document.getElementById('task-set-completed-btn');
    const taskSetDeferredBtn = document.getElementById('task-set-deferred-btn');
    const taskTakeAvailableBtn = document.getElementById('task-take-available-btn'); // Новая кнопка
    const taskCloseContextMenuBtn = document.getElementById('task-close-context-menu');

    // --- Состояние приложения ---
    let currentPath = [{ id: 'root', name: 'Главная' }];
    let sectionsData = [];
    let currentParentId = 'root';
    let longPressTimer;
    let currentSectionForMenu = null; // Для разделов
    let currentTaskForMenu = null;    // Для задач
    let currentRecipientsSelectionType = '';

    // Имитация данных пользователей (ОБНОВЛЕННЫЕ ДАННЫЕ С РЕАЛЬНЫМИ ID ДЛЯ ТЕСТИРОВАНИЯ ЗАДАЧ)
    // В реальном приложении currentUserId будет получен из Telegram.WebApp.initDataUnsafe.user.id
    let currentUserId = '123456789'; // Пример ID сотрудника для тестирования
    // При старте приложения в TWA, мы бы запросили initDataUnsafe и обновили currentUserId
    if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.initDataUnsafe && window.Telegram.WebApp.initDataUnsafe.user) {
        currentUserId = window.Telegram.WebApp.initDataUnsafe.user.id.toString();
        console.log("Current User ID from Telegram WebApp:", currentUserId);
    }


    const allUsers = [
        { id: '123456789', name: 'Иван Иванов', role: 'employee' }, // Замените на реальные ID пользователя
        { id: '987654321', name: 'Петр Петров', role: 'admin' },
        { id: '112233445', name: 'Анна Сидорова', role: 'employee' },
        { id: '556677889', name: 'Мария Кузнецова', role: 'admin' },
        { id: '998877665', name: 'Дмитрий Смирнов', role: 'employee' }
    ];

    // --- НОВЫЕ ТЕСТОВЫЕ ДАННЫЕ ДЛЯ ЗАДАЧ И ЧАТОВ ---
    let allTasks = [
        { id: 'task1', title: 'Проверить запасы на складе А', assignedTo: '123456789', status: 'В работе' },
        { id: 'task2', title: 'Отправить ежемесячный отчет', assignedTo: '998877665', status: 'Завершена' },
        { id: 'task3', title: 'Заказать новые расходники', assignedTo: '123456789', status: 'Новая' },
        { id: 'task4', title: 'Организовать встречу с поставщиком', assignedTo: '112233445', status: 'Отложена' },
        { id: 'task5', title: 'Подготовить презентацию', assignedTo: '123456789', status: 'В работе' },
        { id: 'task6', title: 'Согласовать договор', assignedTo: '', status: 'Доступна' } // Задача, которую можно взять
    ];

    const availableChats = [
        { id: 'chat1', name: 'Общий чат компании', link: 'https://t.me/telegram_web_app_bot_test_chat_1', icon: 'https://via.placeholder.com/40/007bff/FFFFFF?text=GC' },
        { id: 'chat2', name: 'Отдел продаж', link: 'https://t.me/telegram_web_app_bot_test_chat_2', icon: 'https://via.placeholder.com/40/28a745/FFFFFF?text=S' },
        { id: 'chat3', name: 'Техническая поддержка', link: 'https://t.me/telegram_web_app_bot_test_chat_3', icon: 'https://via.placeholder.com/40/ffc107/FFFFFF?text=TS' }
    ];

    // --- Инициализация Telegram Web App ---
    if (window.Telegram && window.Telegram.WebApp) {
        window.Telegram.WebApp.ready();
        // Telegram.WebApp.expand(); // Можно раскомментировать, если нужно разворачивать Web App сразу

        Telegram.WebApp.onEvent('themeChanged', () => {
            const isDark = Telegram.WebApp.colorScheme === 'dark';
            applyTheme(isDark);
            themeSwitch.checked = isDark;
            localStorage.setItem('theme', isDark ? 'dark' : 'light');
        });

        // Слушаем данные, приходящие от бота
        Telegram.WebApp.onEvent('web_app_data', (event) => {
            const data = JSON.parse(event.data);
            console.log('Received data from bot:', data);
            if (data.type === 'initial_data') {
                if (data.companyLogo) {
                    updateCompanyInfo(data.companyLogo, null);
                    logoUrlInput.value = data.companyLogo;
                }
                if (data.companyName) {
                    updateCompanyInfo(null, data.companyName);
                    companyNameInput.value = data.companyName;
                }
                if (data.botLogo) {
                    updateBotLogo(data.botLogo);
                    botLogoUrlInput.value = data.botLogo;
                }
                if (data.sections && Array.isArray(data.sections)) {
                    sectionsData = data.sections;
                    renderSections(currentParentId);
                }
                if (data.adminNotes && Array.isArray(data.adminNotes)) {
                    updateAdminNotes(data.adminNotes);
                }
                if (data.tasks && Array.isArray(data.tasks)) {
                    allTasks = data.tasks; // Обновляем задачи из бота
                    renderTasks('all'); // Отрисовываем их
                }
                // Для chat и employee_clock_in_out, они больше отправляются боту, чем приходят от него для инициализации.
            } else if (data.type === 'all_sections_data' && Array.isArray(data.sections)) {
                sectionsData = data.sections;
                renderSections(currentParentId);
            } else if (data.type === 'tasks_update' && Array.isArray(data.tasks)) {
                allTasks = data.tasks;
                // Сохраняем текущий активный фильтр, чтобы не сбрасывать его при обновлении
                const activeFilterTab = document.querySelector('#tasks-page .filter-tab.active');
                const currentFilter = activeFilterTab ? activeFilterTab.dataset.filter : 'all';
                renderTasks(currentFilter);
            } else if (data.type === 'new_task_notification' && data.task) {
                // Пункт 2: Оповещение о новом задании
                Telegram.WebApp.showNotification({
                    message: `Вам назначена новая задача: "${data.task.title}"`,
                    type: 'info'
                });
                // Можно также обновить список задач, если он уже открыт
                if (document.getElementById('tasks-page').style.display === 'block') {
                    // Перезапросить задачи или добавить новую в allTasks
                    Telegram.WebApp.sendData(JSON.stringify({ command: 'request_all_tasks' }));
                }
            }
        });

        // Запрашиваем начальные данные при старте (включая разделы, заметки, задачи)
        Telegram.WebApp.sendData(JSON.stringify({ command: 'request_initial_data' }));

    } else {
        // Устанавливаем дефолтные значения, если не в Telegram Web App (для браузерного тестирования)
        updateCompanyInfo('https://via.placeholder.com/60/0000FF/FFFFFF?text=MyComp', 'Название Компании');
        updateBotLogo('https://via.placeholder.com/60/FF5733/FFFFFF?text=B');
        
        // Тестовые разделы
        sectionsData = [
            { id: 'sec1', name: 'Раздел А (тестовый)', parentId: 'root', quantity: 10.5, min_quantity: 5, hidden_from_users: [] },
            { id: 'sec2', name: 'Раздел Б (тестовый)', parentId: 'root', quantity: 0, min_quantity: 0, hidden_from_users: ['123456789'] }, // Скрыт от user1
            { id: 'sec1_1', name: 'Позиция А1', parentId: 'sec1', quantity: 20, min_quantity: 10, hidden_from_users: [] },
            { id: 'sec1_2', name: 'Позиция А2', parentId: 'sec1', quantity: 5, min_quantity: 2, hidden_from_users: ['987654321', '112233445'] } // Скрыт от admin и user2
        ];
        renderSections(currentParentId);

        // Тестовые заметки админа
        updateAdminNotes([
            "Важное напоминание: не забудьте сдать отчеты до конца дня.",
            "Сегодня в 14:00 собрание по продажам в конференц-зале.",
            "Отличная работа по проекту 'Альфа' на прошлой неделе!"
        ]);

        // Инициализация кнопки прихода/ухода
        initClockInOutButton();

        // Инициализация задач и чатов
        renderTasks('all'); // Показываем все задачи по умолчанию
        renderChats();
    }

    // --- Функции обновления UI ---
    function updateCompanyInfo(logoUrl, name) {
        if (logoUrl) {
            companyLogo.src = logoUrl;
            backgroundBlur.style.backgroundImage = `url(${logoUrl})`;
        }
        if (name) {
            companyName.textContent = name;
        }
    }

    function updateBotLogo(logoUrl) {
        if (logoUrl) {
            botLogo.src = logoUrl;
        }
    }

    function applyTheme(isDark) {
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

    // --- Логика скролла хедера ---
    let lastScrollTop = 0;
    const borderRadiusSize = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--border-radius-size'));

    window.addEventListener('scroll', () => {
        let currentScrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        // Только для главной страницы, где хедер виден и скроллится
        if (contentArea.style.display !== 'none') {
            let translateYValue = Math.min(0, Math.max(-headerContainer.offsetHeight + borderRadiusSize, currentScrollTop));
            contentArea.style.transform = `translateY(${translateYValue}px)`;
        }
        lastScrollTop = currentScrollTop;
    });

    // --- Логика переключения темы ---
    themeSwitch.addEventListener('change', () => {
        const isDark = themeSwitch.checked;
        applyTheme(isDark);
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        if (window.Telegram && window.Telegram.WebApp) {
            // Telegram.WebApp.setHeaderColor(isDark ? Telegram.WebApp.themeParams.bg_color : Telegram.WebApp.themeParams.bg_color);
            // setHeaderColor не изменяет цвет, если нет явной кнопки "Закрыть" и "Вернуться"
            // Вместо этого WebApp сам адаптирует цвет
        }
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

    // --- Логика админ-контроля (тестового) ---
    applyCompanyChangesBtn.addEventListener('click', () => {
        const newLogoUrl = logoUrlInput.value.trim();
        const newCompanyName = companyNameInput.value.trim();
        if (newLogoUrl || newCompanyName) {
            updateCompanyInfo(newLogoUrl, newCompanyName);
            if (window.Telegram && window.Telegram.WebApp) {
                Telegram.WebApp.sendData(JSON.stringify({
                    type: 'update_company_info',
                    companyLogo: newLogoUrl || undefined,
                    companyName: newCompanyName || undefined
                }));
                Telegram.WebApp.showAlert('Информация о компании отправлена боту!');
            } else {
                alert('Информация компании обновлена (только в браузере)!');
            }
        } else {
            if (window.Telegram && window.Telegram.WebApp) {
                Telegram.WebApp.showAlert('Пожалуйста, введите данные для обновления информации о компании.');
            } else {
                alert('Пожалуйста, введите данные для обновления информации о компании.');
            }
        }
    });

    applyBotLogoChangesBtn.addEventListener('click', () => {
        const newBotLogoUrl = botLogoUrlInput.value.trim();
        if (newBotLogoUrl) {
            updateBotLogo(newBotLogoUrl);
            if (window.Telegram && window.Telegram.WebApp) {
                Telegram.WebApp.sendData(JSON.stringify({
                    type: 'update_bot_logo',
                    botLogo: newBotLogoUrl
                }));
                Telegram.WebApp.showAlert('Логотип бота отправлен боту!');
            } else {
                alert('Пожалуйста, введите URL логотипа бота.');
            }
        } else {
            if (window.Telegram && window.Telegram.WebApp) {
                Telegram.WebApp.showAlert('Пожалуйста, введите URL логотипа бота.');
            } else {
                alert('Пожалуйста, введите URL логотипа бота.');
            }
        }
    });

    // --- Логика переключения страниц ---
    function showPage(pageElement) {
        // Скрываем все "страницы"
        contentArea.style.display = 'none';
        sectionsPage.style.display = 'none';
        tasksPage.style.display = 'none'; // Скрываем новую страницу задач
        chatsPage.style.display = 'none'; // Скрываем новую страницу чатов

        // Показываем нужную страницу
        pageElement.style.display = 'block';

        // Управление видимостью хедера и отступом content-wrapper
        if (pageElement === contentArea) {
            headerContainer.classList.remove('hidden');
            contentWrapper.classList.remove('header-hidden');
        } else { // Для всех остальных страниц (разделы, задачи, чаты) хедер скрыт
            headerContainer.classList.add('hidden');
            contentWrapper.classList.add('header-hidden');
        }

        // Обновляем активную кнопку навигации
        navButtons.forEach(btn => btn.classList.remove('active'));
        // Находим кнопку по data-target-page и добавляем active класс
        const activeButton = document.querySelector(`.nav-button[data-target-page="${pageElement.id}"]`);
        if (activeButton) {
            activeButton.classList.add('active');
        }
    }

    // Обработчики кликов по кнопкам нижней навигации
    homeNavButton.addEventListener('click', () => {
        showPage(contentArea);
        if (window.Telegram && window.Telegram.WebApp) {
            Telegram.WebApp.HapticFeedback.impactOccurred('light');
        }
    });

    sectionsNavButton.addEventListener('click', () => {
        showPage(sectionsPage);
        renderSections(currentParentId); // Убедимся, что разделы отрисованы
        if (window.Telegram && window.Telegram.WebApp) {
            Telegram.WebApp.HapticFeedback.impactOccurred('light');
        }
    });

    // НОВЫЕ ОБРАБОТЧИКИ ДЛЯ КНОПОК "ЗАДАЧИ" И "ЧАТЫ"
    tasksNavButton.addEventListener('click', () => {
        showPage(tasksPage);
        renderTasks('all'); // Показываем все задачи при переходе на страницу задач
        if (window.Telegram && window.Telegram.WebApp) {
            Telegram.WebApp.HapticFeedback.impactOccurred('light');
        }
    });

    chatsNavButton.addEventListener('click', () => {
        showPage(chatsPage);
        renderChats(); // Отрисовываем чаты
        if (window.Telegram && window.Telegram.WebApp) {
            Telegram.WebApp.HapticFeedback.impactOccurred('light');
        }
    });

    // Активируем кнопку "Главная" по умолчанию при загрузке
    showPage(contentArea);

    // --- Функции для управления разделами (Древовидная структура) ---

    function generateUniqueId() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    function updateBreadcrumbs() {
        sectionsBreadcrumbs.innerHTML = '';
        currentPath.forEach((item, index) => {
            const span = document.createElement('span');
            span.classList.add('breadcrumb-item');
            if (index === currentPath.length - 1) {
                span.classList.add('active');
            } else {
                span.addEventListener('click', () => navigateToPath(item.id));
            }
            span.textContent = item.name;
            span.dataset.id = item.id;
            sectionsBreadcrumbs.appendChild(span);
        });
        goBackSectionBtn.style.display = currentParentId === 'root' ? 'none' : 'inline-block';
    }

    function renderSections(parentId) {
        currentSectionsList.innerHTML = '';
        const children = sectionsData.filter(section => {
            // Фильтруем разделы, которые скрыты от текущего пользователя
            const isHiddenFromCurrentUser = section.hidden_from_users && section.hidden_from_users.includes(currentUserId);
            return section.parentId === parentId && !isHiddenFromCurrentUser;
        });

        if (children.length === 0) {
            noSectionsMessage.style.display = 'block';
        } else {
            noSectionsMessage.style.display = 'none';
            children.forEach(section => {
                const sectionDiv = document.createElement('div');
                sectionDiv.classList.add('section-item');
                sectionDiv.dataset.id = section.id;
                
                sectionDiv.addEventListener('mousedown', (e) => startLongPress(e, section.id, 'section'));
                sectionDiv.addEventListener('mouseup', cancelLongPress);
                sectionDiv.addEventListener('mouseleave', cancelLongPress);
                sectionDiv.addEventListener('touchstart', (e) => startLongPress(e, section.id, 'section'), { passive: true });
                sectionDiv.addEventListener('touchend', cancelLongPress);
                sectionDiv.addEventListener('touchcancel', cancelLongPress);

                sectionDiv.addEventListener('click', (e) => {
                    if (e.target.closest('.section-action-button') || e.target.closest('.context-menu-item')) {
                        return;
                    }
                    if (longPressTimer) {
                        return;
                    }
                    if (window.Telegram && window.Telegram.WebApp) {
                        Telegram.WebApp.HapticFeedback.impactOccurred('light');
                    }
                    navigateToSection(section.id, section.name);
                });

                const sectionNameSpan = document.createElement('span');
                sectionNameSpan.classList.add('section-item-name');
                sectionNameSpan.textContent = section.name;
                
                if (typeof section.quantity === 'number' && section.quantity > 0) {
                    const quantitySpan = document.createElement('span');
                    quantitySpan.classList.add('section-item-quantity');
                    quantitySpan.textContent = `${section.quantity.toFixed(1).replace(/\.0$/, '')} шт.`;
                    sectionNameSpan.appendChild(quantitySpan);
                }
                
                sectionDiv.appendChild(sectionNameSpan);

                const sectionActionsDiv = document.createElement('div');
                sectionActionsDiv.classList.add('section-item-actions');

                const editButton = document.createElement('button');
                editButton.classList.add('section-action-button');
                editButton.innerHTML = '&#9998;';
                editButton.title = 'Редактировать раздел';
                editButton.addEventListener('click', (e) => {
                    e.stopPropagation();
                    editSection(section.id, section.name);
                });
                sectionActionsDiv.appendChild(editButton);

                const deleteButton = document.createElement('button');
                deleteButton.classList.add('section-action-button');
                deleteButton.innerHTML = '&#10006;';
                deleteButton.title = 'Удалить раздел';
                deleteButton.addEventListener('click', (e) => {
                    e.stopPropagation();
                    deleteSection(section.id);
                });
                sectionActionsDiv.appendChild(deleteButton);

                sectionDiv.appendChild(sectionActionsDiv);
                currentSectionsList.appendChild(sectionDiv);
            });
        }
        updateBreadcrumbs();
    }

    function navigateToSection(id, name) {
        currentParentId = id;
        currentPath.push({ id: id, name: name });
        renderSections(id);
    }

    function navigateToPath(id) {
        const index = currentPath.findIndex(item => item.id === id);
        if (index !== -1) {
            currentPath = currentPath.slice(0, index + 1);
            currentParentId = id;
            renderSections(id);
            if (window.Telegram && window.Telegram.WebApp) {
                Telegram.WebApp.HapticFeedback.impactOccurred('light');
            }
        }
    }

    createSectionBtn.addEventListener('click', async () => {
        if (window.Telegram && window.Telegram.WebApp) {
            Telegram.WebApp.HapticFeedback.impactOccurred('medium');
            const sectionName = prompt('Введите название нового раздела:'); 
            if (sectionName && sectionName.trim() !== '') {
                const newId = generateUniqueId();
                const newSection = {
                    id: newId,
                    name: sectionName.trim(),
                    parentId: currentParentId,
                    quantity: 0,
                    min_quantity: null,
                    hidden_from_users: []
                };
                sectionsData.push(newSection);
                renderSections(currentParentId);

                Telegram.WebApp.sendData(JSON.stringify({
                    type: 'create_section',
                    payload: newSection
                }));
                Telegram.WebApp.showAlert(`Раздел "${sectionName}" создан и данные отправлены боту.`);
            } else if (sectionName !== null) {
                Telegram.WebApp.showAlert('Название раздела не может быть пустым.');
            }
        } else {
            const sectionName = prompt('Введите название раздела:');
            if (sectionName && sectionName.trim() !== '') {
                const newId = generateUniqueId();
                const newSection = {
                    id: newId,
                    name: sectionName.trim(),
                    parentId: currentParentId,
                    quantity: 0,
                    min_quantity: null,
                    hidden_from_users: []
                };
                sectionsData.push(newSection);
                renderSections(currentParentId);
                alert(`Раздел "${sectionName}" создан (только в браузере).`);
            } else if (sectionName !== null) {
                alert('Название раздела не может быть пустым.');
            }
        }
    });

    function editSection(id, oldName) {
        if (window.Telegram && window.Telegram.WebApp) {
            Telegram.WebApp.HapticFeedback.impactOccurred('medium');
            const newName = prompt(`Введите новое название для раздела "${oldName}":`, oldName);
            if (newName && newName.trim() !== '') {
                const sectionIndex = sectionsData.findIndex(s => s.id === id);
                if (sectionIndex !== -1) {
                    sectionsData[sectionIndex].name = newName.trim();
                    const pathIndex = currentPath.findIndex(p => p.id === id);
                    if (pathIndex !== -1) {
                        currentPath[pathIndex].name = newName.trim();
                    }
                    renderSections(currentParentId);

                    Telegram.WebApp.sendData(JSON.stringify({
                        type: 'update_section',
                        payload: { id: id, name: newName.trim() }
                    }));
                    Telegram.WebApp.showAlert(`Раздел обновлен и данные отправлены боту.`);
                }
            } else if (newName !== null) {
                Telegram.WebApp.showAlert('Название раздела не может быть пустым.');
            }
        } else {
            const newName = prompt(`Введите новое название для раздела "${oldName}":`, oldName);
            if (newName && newName.trim() !== '') {
                const sectionIndex = sectionsData.findIndex(s => s.id === id);
                if (sectionIndex !== -1) {
                    sectionsData[sectionIndex].name = newName.trim();
                     const pathIndex = currentPath.findIndex(p => p.id === id);
                    if (pathIndex !== -1) {
                        currentPath[pathIndex].name = newName.trim();
                    }
                    renderSections(currentParentId);
                    alert(`Раздел обновлен (только в браузере).`);
                }
            } else if (newName !== null) {
                alert('Название раздела не может быть пустым.');
            }
        }
    }

    function deleteSection(id) {
        if (window.Telegram && window.Telegram.WebApp) {
            Telegram.WebApp.HapticFeedback.notificationOccurred('warning');
            Telegram.WebApp.showConfirm('Вы уверены, что хотите удалить этот раздел и все его подразделы?', (confirmed) => {
                if (confirmed) {
                    const idsToDelete = [id];
                    function collectChildrenIds(parentId) {
                        const children = sectionsData.filter(s => s.parentId === parentId);
                        children.forEach(child => {
                            idsToDelete.push(child.id);
                            collectChildrenIds(child.id);
                        });
                    }
                    collectChildrenIds(id);

                    sectionsData = sectionsData.filter(s => !idsToDelete.includes(s.id));
                    renderSections(currentParentId);

                    Telegram.WebApp.sendData(JSON.stringify({
                        type: 'delete_section',
                        payload: { ids: idsToDelete }
                    }));
                    Telegram.WebApp.showAlert('Раздел и его подразделы удалены. Данные отправлены боту.');
                }
            });
        } else {
            if (confirm('Вы уверены, что хотите удалить этот раздел и все его подразделы?')) {
                const idsToDelete = [id];
                function collectChildrenIds(parentId) {
                    const children = sectionsData.filter(s => s.parentId === parentId);
                    children.forEach(child => {
                        idsToDelete.push(child.id);
                        collectChildrenIds(child.id);
                    });
                }
                collectChildrenIds(id);

                sectionsData = sectionsData.filter(s => !idsToDelete.includes(s.id));
                renderSections(currentParentId);
                alert('Раздел и его подразделы удалены (только в браузере).');
            }
        }
    }

    goBackSectionBtn.addEventListener('click', () => {
        if (currentPath.length > 1) {
            currentPath.pop();
            currentParentId = currentPath[currentPath.length - 1].id;
            renderSections(currentParentId);
            if (window.Telegram && window.Telegram.WebApp) {
                Telegram.WebApp.HapticFeedback.impactOccurred('light');
            }
        }
    });

    // --- Логика долгого нажатия и контекстного меню ---
    const LONG_PRESS_THRESHOLD = 500;

    function startLongPress(e, id, type) {
        if (e.touches && e.touches.length > 1) {
            cancelLongPress();
            return;
        }

        if (e.type === 'mousedown' && e.button === 2) {
             e.preventDefault(); 
             if (type === 'section') {
                currentSectionForMenu = id;
                showContextMenu(contextMenuModal);
             } else if (type === 'task') {
                currentTaskForMenu = id;
                showContextMenu(taskContextMenuModal);
             }
             return;
        }

        clearTimeout(longPressTimer);

        longPressTimer = setTimeout(() => {
            if (type === 'section') {
                currentSectionForMenu = id;
                showContextMenu(contextMenuModal);
            } else if (type === 'task') {
                currentTaskForMenu = id;
                showContextMenu(taskContextMenuModal);
            }
        }, LONG_PRESS_THRESHOLD);
    }

    function cancelLongPress() {
        clearTimeout(longPressTimer);
        longPressTimer = null;
    }

    function showContextMenu(modalElement) {
        if (window.Telegram && window.Telegram.WebApp) {
            Telegram.WebApp.HapticFeedback.impactOccurred('heavy');
        }
        document.body.classList.add('modal-open');
        modalElement.classList.remove('hidden');
        modalElement.style.display = 'flex';
        modalElement.querySelector('.modal-content').addEventListener('click', (e) => e.stopPropagation());
    }

    function hideContextMenu(modalElement) {
        document.body.classList.remove('modal-open');
        modalElement.classList.add('hidden');
        setTimeout(() => {
            modalElement.style.display = 'none';
        }, 300); 
    }

    // Обработчики закрытия модальных окон
    closeContextMenuBtn.addEventListener('click', () => hideContextMenu(contextMenuModal));
    contextMenuModal.addEventListener('click', (e) => {
        if (e.target === contextMenuModal) {
            hideContextMenu(contextMenuModal);
        }
    });

    taskCloseContextMenuBtn.addEventListener('click', () => hideContextMenu(taskContextMenuModal));
    taskContextMenuModal.addEventListener('click', (e) => {
        if (e.target === taskContextMenuModal) {
            hideContextMenu(taskContextMenuModal);
        }
    });

    // --- Обработчики кнопок контекстного меню разделов ---
    const CONTEXT_MENU_CLOSE_DELAY = 350;

    async function askForQuantityAndConfirm(type) {
        const section = sectionsData.find(s => s.id === currentSectionForMenu);
        if (!section) return;

        let amountInput;
        let currentQty = section.quantity || 0;
        let promptMessage;
        let confirmMessage;

        if (type === 'add') {
            promptMessage = 'Введите количество для добавления (можно дробное):';
        } else { // 'remove'
            promptMessage = 'Введите количество для списания (можно дробное):';
        }

        while (true) {
            if (window.Telegram && window.Telegram.WebApp) {
                Telegram.WebApp.HapticFeedback.impactOccurred('light');
                amountInput = prompt(promptMessage);
            } else {
                amountInput = prompt(promptMessage);
            }
            
            if (amountInput === null) {
                currentSectionForMenu = null;
                return;
            }

            const amount = parseFloat(amountInput);

            if (isNaN(amount) || amount <= 0) {
                if (window.Telegram && window.Telegram.WebApp) {
                    Telegram.WebApp.showAlert('Некорректное количество. Пожалуйста, введите положительное число.');
                } else {
                    alert('Некорректное количество. Пожалуйста, введите положительное число.');
                }
                continue;
            }

            let newQty;
            if (type === 'add') {
                newQty = currentQty + amount;
                confirmMessage = `Вы уверены, что хотите добавить ${amount.toFixed(1).replace(/\.0$/, '')} шт.? После добавления получится ${newQty.toFixed(1).replace(/\.0$/, '')} шт.`;
            } else { // 'remove'
                if (amount > currentQty) {
                    if (window.Telegram && window.Telegram.WebApp) {
                        Telegram.WebApp.showAlert(`Недостаточное количество. Доступно: ${currentQty.toFixed(1).replace(/\.0$/, '')} шт.`);
                    } else {
                        alert(`Недостаточное количество. Доступно: ${currentQty.toFixed(1).replace(/\.0$/, '')} шт.`);
                    }
                    continue;
                }
                newQty = currentQty - amount;
                confirmMessage = `Вы уверены, что хотите списать ${amount.toFixed(1).replace(/\.0$/, '')} шт.? После списания останется ${newQty.toFixed(1).replace(/\.0$/, '')} шт.`;
            }

            let confirmed;
            if (window.Telegram && window.Telegram.WebApp) {
                confirmed = await new Promise(resolve => {
                    Telegram.WebApp.showConfirm(confirmMessage, (result) => resolve(result));
                });
            } else {
                confirmed = confirm(confirmMessage);
            }

            if (confirmed) {
                section.quantity = newQty;
                renderSections(currentParentId);

                if (window.Telegram && window.Telegram.WebApp) {
                    Telegram.WebApp.sendData(JSON.stringify({
                        type: `${type}_quantity`,
                        payload: { id: section.id, amount: amount }
                    }));
                    Telegram.WebApp.showAlert(`${type === 'add' ? 'Добавлено' : 'Списано'} ${amount.toFixed(1).replace(/\.0$/, '')} ${type === 'add' ? 'к' : 'из'} "${section.name}".`);
                } else {
                    alert(`${type === 'add' ? 'Добавлено' : 'Списано'} ${amount.toFixed(1).replace(/\.0$/, '')} ${type === 'add' ? 'к' : 'из'} "${section.name}".`);
                }
                currentSectionForMenu = null;
                return;
            } else {
                if (window.Telegram && window.Telegram.WebApp) {
                    Telegram.WebApp.HapticFeedback.notificationOccurred('light');
                }
            }
        }
    }


    addQuantityBtn.addEventListener('click', (e) => {
        e.stopPropagation(); 
        hideContextMenu(contextMenuModal);
        if (!currentSectionForMenu) return;

        setTimeout(() => {
            askForQuantityAndConfirm('add');
        }, CONTEXT_MENU_CLOSE_DELAY);
    });

    removeQuantityBtn.addEventListener('click', (e) => {
        e.stopPropagation(); 
        hideContextMenu(contextMenuModal);
        if (!currentSectionForMenu) return;

        setTimeout(() => {
            askForQuantityAndConfirm('remove');
        }, CONTEXT_MENU_CLOSE_DELAY);
    });

    criticalMinBtn.addEventListener('click', (e) => {
        e.stopPropagation(); 
        hideContextMenu(contextMenuModal);
        if (!currentSectionForMenu) return;
        
        setTimeout(() => {
            currentRecipientsSelectionType = 'critical_minimum';
            let minQuantityInput;
            if (window.Telegram && window.Telegram.WebApp) {
                Telegram.WebApp.HapticFeedback.impactOccurred('light');
                minQuantityInput = prompt('Введите критический минимум для этого раздела (можно дробное):');
            } else {
                minQuantityInput = prompt('Введите критический минимум для этого раздела (можно дробное):');
            }
            const minQuantity = parseFloat(minQuantityInput);

            if (!isNaN(minQuantity) && minQuantity >= 0) {
                const section = sectionsData.find(s => s.id === currentSectionForMenu);
                if (section) {
                    section.min_quantity = minQuantity;
                    showRecipientsModal();
                }
            } else {
                if (minQuantityInput !== null) {
                    if (window.Telegram && window.Telegram.WebApp) {
                        Telegram.WebApp.showAlert('Некорректное значение для критического минимума.');
                    } else {
                        alert('Некорректное значение для критического минимума.');
                    }
                }
            }
        }, CONTEXT_MENU_CLOSE_DELAY);
    });

    setReminderBtn.addEventListener('click', (e) => {
        e.stopPropagation(); 
        hideContextMenu(contextMenuModal);
        if (!currentSectionForMenu) return;
        
        setTimeout(() => {
            currentRecipientsSelectionType = 'reminder';

            let reminderMessage = '';
            let reminderDateTime = '';

            if (window.Telegram && window.Telegram.WebApp) {
                Telegram.WebApp.HapticFeedback.impactOccurred('light');
                reminderMessage = prompt('Введите сообщение для напоминания:');
                reminderDateTime = prompt('Введите дату и время напоминания (пример: 01.01.2025 12:30):');
            } else {
                reminderMessage = prompt('Введите сообщение для напоминания:');
                reminderDateTime = prompt('Введите дату и время напоминания (пример: 01.01.2025 12:30):');
            }

            if (reminderMessage && reminderMessage.trim() !== '' && reminderDateTime && reminderDateTime.trim() !== '') {
                const section = sectionsData.find(s => s.id === currentSectionForMenu);
                if (section) {
                    section.reminder_message = reminderMessage.trim();
                    section.reminder_datetime = reminderDateTime.trim();
                    showRecipientsModal();
                }
            } else {
                if (reminderMessage !== null && reminderDateTime !== null) {
                    if (window.Telegram && window.Telegram.WebApp) {
                        Telegram.WebApp.showAlert('Сообщение или дата/время напоминания не могут быть пустыми.');
                    } else {
                        alert('Сообщение или дата/время напоминания не могут быть пустыми.');
                    }
                }
            }
        }, CONTEXT_MENU_CLOSE_DELAY);
    });

    hideFromBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        hideContextMenu(contextMenuModal);
        if (!currentSectionForMenu) return;

        setTimeout(() => {
            currentRecipientsSelectionType = 'hide_from';
            showRecipientsModal();
        }, CONTEXT_MENU_CLOSE_DELAY);
    });

    // --- Логика выбора получателей ---
    function showRecipientsModal() {
        document.body.classList.add('modal-open');
        recipientsModal.classList.remove('hidden');
        recipientsModal.style.display = 'flex';
        const activeTab = document.querySelector('.recipient-filter-tabs .filter-tab.active');
        const filter = activeTab ? activeTab.dataset.filter : 'all';
        renderUsersForSelection(filter); 
        selectAllRecipientsCheckbox.checked = false;
        
        const section = sectionsData.find(s => s.id === currentSectionForMenu);
        if (section && currentRecipientsSelectionType === 'hide_from' && section.hidden_from_users) {
            setTimeout(() => {
                section.hidden_from_users.forEach(userId => {
                    const checkbox = recipientsList.querySelector(`input[value="${userId}"]`);
                    if (checkbox) {
                        checkbox.checked = true;
                    }
                });
            }, 50);
        }

        recipientsModal.querySelector('.modal-content').addEventListener('click', (e) => e.stopPropagation());
    }

    function hideRecipientsModal() {
        document.body.classList.remove('modal-open');
        recipientsModal.classList.add('hidden');
        setTimeout(() => {
            recipientsModal.style.display = 'none';
        }, 300);
        currentSectionForMenu = null;
    }

    function renderUsersForSelection(filter) {
        recipientsList.innerHTML = '';
        let filteredUsers = [];
        if (filter === 'all') {
            filteredUsers = allUsers;
        } else if (filter === 'admins') {
            filteredUsers = allUsers.filter(user => user.role === 'admin');
        } else if (filter === 'employees') { 
            filteredUsers = allUsers.filter(user => user.role === 'employee');
        }

        filteredUsers.forEach(user => {
            const userDiv = document.createElement('div');
            userDiv.classList.add('recipient-item');
            userDiv.dataset.id = user.id;

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = `user-${user.id}`;
            checkbox.value = user.id;
            userDiv.appendChild(checkbox);

            const label = document.createElement('label');
            label.htmlFor = `user-${user.id}`;
            label.classList.add('recipient-item-name');
            label.textContent = `${user.name} (${user.role === 'admin' ? 'Админ' : 'Сотрудник'})`;
            userDiv.appendChild(label);

            recipientsList.appendChild(userDiv);
        });
    }

    recipientFilterTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            recipientFilterTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            renderUsersForSelection(tab.dataset.filter);
            selectAllRecipientsCheckbox.checked = false;
        });
    });

    selectAllRecipientsCheckbox.addEventListener('change', (e) => {
        recipientsList.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
            checkbox.checked = e.target.checked;
        });
    });

    confirmRecipientsBtn.addEventListener('click', () => {
        const selectedUserIds = Array.from(recipientsList.querySelectorAll('input[type="checkbox"]:checked'))
                                     .map(checkbox => checkbox.value);
        
        const section = sectionsData.find(s => s.id === currentSectionForMenu);
        if (!section) {
            hideRecipientsModal();
            return;
        }

        if (selectedUserIds.length === 0 && currentRecipientsSelectionType !== 'hide_from') {
            if (window.Telegram && window.Telegram.WebApp) {
                Telegram.WebApp.showAlert('Пожалуйста, выберите хотя бы одного получателя.');
            } else {
                alert('Пожалуйста, выберите хотя бы одного получателя.');
            }
            return;
        }

        if (currentRecipientsSelectionType === 'critical_minimum') {
            if (window.Telegram && window.Telegram.WebApp) {
                 Telegram.WebApp.sendData(JSON.stringify({
                    type: 'set_critical_minimum',
                    payload: {
                        id: section.id,
                        min_quantity: section.min_quantity,
                        recipients: selectedUserIds
                    }
                }));
                Telegram.WebApp.showAlert(`Критический минимум ${section.min_quantity.toFixed(1).replace(/\.0$/, '')} для "${section.name}" установлен. Оповещения будут приходить выбранным пользователям.`);
            } else {
                alert(`Критический минимум ${section.min_quantity.toFixed(1).replace(/\.0$/, '')} для "${section.name}" установлен. Оповещения будут приходить выбранным пользователям.`);
            }
           
        } else if (currentRecipientsSelectionType === 'reminder') {
            if (window.Telegram && window.Telegram.WebApp) {
                Telegram.WebApp.sendData(JSON.stringify({
                    type: 'set_reminder',
                    payload: {
                        id: section.id,
                        message: section.reminder_message,
                        datetime: section.reminder_datetime,
                        recipients: selectedUserIds
                    }
                }));
                Telegram.WebApp.showAlert(`Напоминание для "${section.name}" запланировано. Сообщение "${section.reminder_message}" будет отправлено выбранным пользователям в ${section.reminder_datetime}.`);
            } else {
                alert(`Напоминание для "${section.name}" запланировано. Сообщение "${section.reminder_message}" будет отправлено выбранным пользователям в ${section.reminder_datetime}.`);
            }
        } else if (currentRecipientsSelectionType === 'hide_from') {
            section.hidden_from_users = selectedUserIds;
            if (window.Telegram && window.Telegram.WebApp) {
                Telegram.WebApp.sendData(JSON.stringify({
                    type: 'set_hidden_from_users',
                    payload: {
                        id: section.id,
                        hidden_from_users: selectedUserIds
                    }
                }));
                if (selectedUserIds.length > 0) {
                    Telegram.WebApp.showAlert(`Раздел "${section.name}" теперь скрыт от выбранных пользователей.`);
                } else {
                    Telegram.WebApp.showAlert(`Раздел "${section.name}" теперь виден всем.`);
                }
            } else {
                if (selectedUserIds.length > 0) {
                    alert(`Раздел "${section.name}" теперь скрыт от выбранных пользователей (только в браузере).`);
                } else {
                    alert(`Раздел "${section.name}" теперь виден всем (только в браузере).`);
                }
            }
            renderSections(currentParentId);
        }
        hideRecipientsModal();
    });

    cancelRecipientsBtn.addEventListener('click', () => {
        hideRecipientsModal();
        if (window.Telegram && window.Telegram.WebApp) {
            Telegram.WebApp.HapticFeedback.impactOccurred('light');
        }
    });

    recipientsModal.addEventListener('click', (e) => {
        if (e.target === recipientsModal) {
            hideRecipientsModal();
        }
    });

    // --- ФУНКЦИОНАЛ СОТРУДНИКОВ ---

    // 1. Заметки от Администратора
    function updateAdminNotes(notes) {
        adminNotesContent.innerHTML = '';
        if (notes && notes.length > 0) {
            adminNotesContainer.style.display = 'block';
            notes.forEach(note => {
                const p = document.createElement('p');
                p.textContent = note;
                adminNotesContent.appendChild(p);
            });
        } else {
            adminNotesContainer.style.display = 'none';
        }
    }

    // 2. Кнопка "Пришел/Ушел"
    function initClockInOutButton() {
        let isClockedIn = localStorage.getItem('isClockedIn') === 'true'; // Состояние сохраняется

        function updateClockButton() {
            if (isClockedIn) {
                clockInOutBtn.textContent = 'Ушел/Ушла';
                clockInOutBtn.classList.add('clock-out');
                clockInOutBtn.classList.remove('clock-in');
            } else {
                clockInOutBtn.textContent = 'Пришел/Пришла';
                clockInOutBtn.classList.add('clock-in');
                clockInOutBtn.classList.remove('clock-out');
            }
        }

        clockInOutBtn.addEventListener('click', () => {
            isClockedIn = !isClockedIn;
            localStorage.setItem('isClockedIn', isClockedIn);
            updateClockButton();

            const command = isClockedIn ? 'employee_clock_in' : 'employee_clock_out';
            const message = isClockedIn ? 'Отмечен приход.' : 'Отмечен уход.';

            if (window.Telegram && window.Telegram.WebApp) {
                Telegram.WebApp.sendData(JSON.stringify({
                    command: command,
                    timestamp: new Date().toISOString()
                }));
                Telegram.WebApp.showAlert(message);
                Telegram.WebApp.HapticFeedback.impactOccurred('medium');
            } else {
                alert(message + ' (Только в браузере)');
            }
        });

        updateClockButton(); // Инициализация состояния кнопки при загрузке
    }

    // 3. Страница "Задачи"
    function renderTasks(filter) {
        tasksList.innerHTML = '';
        const filteredTasks = allTasks.filter(task => {
            if (filter === 'all') return true;
            if (filter === 'my') return task.assignedTo === currentUserId || task.assignedTo === ''; // Если задача не назначена, она тоже считается "моей" если пользователь может ее взять
            if (filter === 'available') return task.assignedTo === ''; // Только доступные задачи
            return false;
        });

        if (filteredTasks.length === 0) {
            noTasksMessage.style.display = 'block';
        } else {
            noTasksMessage.style.display = 'none';
            filteredTasks.forEach(task => {
                const taskItem = document.createElement('div');
                taskItem.classList.add('task-item');
                taskItem.dataset.id = task.id;

                let statusClass = '';
                let statusText = '';
                let assignedToName = allUsers.find(u => u.id === task.assignedTo)?.name || 'Не назначено';

                switch (task.status) {
                    case 'Новая':
                        statusClass = 'status-new';
                        statusText = 'Новая';
                        break;
                    case 'В работе':
                        statusClass = 'status-in-progress';
                        statusText = 'В работе';
                        break;
                    case 'Завершена':
                        statusClass = 'status-completed';
                        statusText = 'Завершена';
                        break;
                    case 'Отложена':
                        statusClass = 'status-deferred';
                        statusText = 'Отложена';
                        break;
                    case 'Доступна': // Новый статус
                        statusClass = 'status-available';
                        statusText = 'Доступна';
                        assignedToName = 'Никому'; // Для наглядности
                        break;
                    default:
                        statusClass = 'status-new';
                        statusText = 'Неизвестно';
                }

                taskItem.innerHTML = `
                    <div class="task-title">${task.title}</div>
                    <div class="task-info">
                        <span class="task-status ${statusClass}">${statusText}</span>
                        <span class="task-assigned-to">Назначено: ${assignedToName}</span>
                    </div>
                `;
                
                // Добавляем обработчик для контекстного меню задачи
                taskItem.addEventListener('mousedown', (e) => startLongPress(e, task.id, 'task'));
                taskItem.addEventListener('mouseup', cancelLongPress);
                taskItem.addEventListener('mouseleave', cancelLongPress);
                taskItem.addEventListener('touchstart', (e) => startLongPress(e, task.id, 'task'), { passive: true });
                taskItem.addEventListener('touchend', cancelLongPress);
                taskItem.addEventListener('touchcancel', cancelLongPress);

                taskItem.addEventListener('click', (e) => {
                    if (longPressTimer) { // Предотвращаем срабатывание клика после долгого нажатия
                        return;
                    }
                    if (window.Telegram && window.Telegram.WebApp) {
                        Telegram.WebApp.HapticFeedback.impactOccurred('light');
                        // Просто показать информацию о задаче при коротком тапе
                        Telegram.WebApp.showAlert(`Задача: "${task.title}"\nСтатус: ${task.status}\nНазначена: ${assignedToName}`);
                    } else {
                        alert(`Задача: "${task.title}"\nСтатус: ${task.status}\nНазначена: ${assignedToName}`);
                    }
                });
                tasksList.appendChild(taskItem);
            });
        }
    }

    // Обработчики для табов фильтра задач
    taskFilterTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            taskFilterTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            renderTasks(tab.dataset.filter);
            if (window.Telegram && window.Telegram.WebApp) {
                Telegram.WebApp.HapticFeedback.impactOccurred('light');
            }
        });
    });

    // --- Функции для контекстного меню ЗАДАЧ ---
    function updateTaskStatus(taskId, newStatus, assignedToId = null) {
        const taskIndex = allTasks.findIndex(t => t.id === taskId);
        if (taskIndex !== -1) {
            const oldStatus = allTasks[taskIndex].status;
            allTasks[taskIndex].status = newStatus;
            if (assignedToId !== null) { // Если назначаем, обновляем назначенного
                allTasks[taskIndex].assignedTo = assignedToId;
            } else if (newStatus === 'Доступна') { // Если делаем доступной, обнуляем назначенного
                allTasks[taskIndex].assignedTo = '';
            }

            // После изменения статуса, перерисовываем задачи
            const activeFilterTab = document.querySelector('#tasks-page .filter-tab.active');
            const currentFilter = activeFilterTab ? activeFilterTab.dataset.filter : 'all';
            renderTasks(currentFilter);

            if (window.Telegram && window.Telegram.WebApp) {
                Telegram.WebApp.sendData(JSON.stringify({
                    type: 'update_task_status',
                    payload: {
                        id: taskId,
                        status: newStatus,
                        assignedTo: allTasks[taskIndex].assignedTo // Отправляем актуального назначенного
                    }
                }));
                Telegram.WebApp.showAlert(`Статус задачи "${allTasks[taskIndex].title}" изменен на "${newStatus}".`);
            } else {
                alert(`Статус задачи "${allTasks[taskIndex].title}" изменен на "${newStatus}".`);
            }
        }
        currentTaskForMenu = null;
    }

    // Обработчики для кнопок контекстного меню задач
    taskSetInProgressBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        hideContextMenu(taskContextMenuModal);
        if (!currentTaskForMenu) return;

        const task = allTasks.find(t => t.id === currentTaskForMenu);
        if (task && task.status !== 'В работе') {
            updateTaskStatus(currentTaskForMenu, 'В работе', task.assignedTo || currentUserId); // Назначить себя, если не назначено
        } else {
            if (window.Telegram && window.Telegram.WebApp) {
                Telegram.WebApp.showAlert('Задача уже в работе или не может быть переведена в этот статус.');
            } else {
                alert('Задача уже в работе или не может быть переведена в этот статус.');
            }
        }
    });

    taskSetCompletedBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        hideContextMenu(taskContextMenuModal);
        if (!currentTaskForMenu) return;

        const task = allTasks.find(t => t.id === currentTaskForMenu);
        if (task && task.status !== 'Завершена') {
            updateTaskStatus(currentTaskForMenu, 'Завершена', task.assignedTo || currentUserId); // Назначить себя, если не назначено
        } else {
            if (window.Telegram && window.Telegram.WebApp) {
                Telegram.WebApp.showAlert('Задача уже завершена или не может быть переведена в этот статус.');
            } else {
                alert('Задача уже завершена или не может быть переведена в этот статус.');
            }
        }
    });

    taskSetDeferredBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        hideContextMenu(taskContextMenuModal);
        if (!currentTaskForMenu) return;

        const task = allTasks.find(t => t.id === currentTaskForMenu);
        if (task && task.status !== 'Отложена') {
            updateTaskStatus(currentTaskForMenu, 'Отложена', task.assignedTo || currentUserId); // Назначить себя, если не назначено
        } else {
            if (window.Telegram && window.Telegram.WebApp) {
                Telegram.WebApp.showAlert('Задача уже отложена или не может быть переведена в этот статус.');
            } else {
                alert('Задача уже отложена или не может быть переведена в этот статус.');
            }
        }
    });

    taskTakeAvailableBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        hideContextMenu(taskContextMenuModal);
        if (!currentTaskForMenu) return;

        const task = allTasks.find(t => t.id === currentTaskForMenu);
        if (task && task.status === 'Доступна' && task.assignedTo === '') {
            // Пункт 3: Сотрудник берет задачу, если она "Доступна" и не назначена
            updateTaskStatus(currentTaskForMenu, 'В работе', currentUserId);
        } else {
            if (window.Telegram && window.Telegram.WebApp) {
                Telegram.WebApp.showAlert('Эта задача недоступна для взятия или уже назначена.');
            } else {
                alert('Эта задача недоступна для взятия или уже назначена.');
            }
        }
    });


    // 4. Страница "Чаты"
    function renderChats() {
        chatsList.innerHTML = '';
        if (availableChats.length === 0) {
            noChatsMessage.style.display = 'block';
        } else {
            noChatsMessage.style.display = 'none';
            availableChats.forEach(chat => {
                const chatItem = document.createElement('a');
                chatItem.classList.add('chat-item');
                chatItem.href = chat.link;
                chatItem.target = '_blank'; // Открывать в новой вкладке (или внешнем приложении)

                chatItem.innerHTML = `
                    <img class="chat-icon" src="${chat.icon || 'https://via.placeholder.com/40/CCCCCC/FFFFFF?text=C'}" alt="Иконка чата">
                    <span class="chat-name">${chat.name}</span>
                    <svg class="chat-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="9 18 15 12 9 6"></polyline>
                    </svg>
                `;
                chatItem.addEventListener('click', (e) => {
                    if (window.Telegram && window.Telegram.WebApp) {
                        // Для открытия внешних ссылок лучше использовать Telegram.WebApp.openLink
                        e.preventDefault(); // Предотвращаем стандартное действие
                        Telegram.WebApp.openLink(chat.link);
                        Telegram.WebApp.HapticFeedback.impactOccurred('light');
                    }
                });
                chatsList.appendChild(chatItem);
            });
        }
    }

    // --- Инициализация при загрузке страницы (если не в TWA) ---
    if (!(window.Telegram && window.Telegram.WebApp)) {
        renderSections(currentParentId);
        // Заметки, кнопка прихода/ухода, задачи и чаты уже инициализируются в блоке else выше.
    }
});