document.addEventListener('DOMContentLoaded', () => {
    // Имитация текущего пользователя (для фильтрации "Мои задачи")
    // В реальном приложении этот ID и роль будут приходить от Telegram Web App
    const currentUserId = '987654321'; // Пример ID админа для тестирования
    const currentUserRole = 'main_admin'; // 'main_admin', 'junior_admin', 'employee'

    // Проверка роли для удобства
    const isMainAdmin = currentUserRole === 'main_admin';
    const isJuniorAdmin = currentUserRole === 'junior_admin';
    const isAdmin = isMainAdmin || isJuniorAdmin; // Любой админ
    const isEmployee = currentUserRole === 'employee';

    // Элементы DOM
    const companyLogo = document.getElementById('company-logo');
    const companyNameElem = document.getElementById('company-name');
    const settingsBtn = document.getElementById('settings-btn');
    const mainSectionsGrid = document.getElementById('main-sections-grid');
    const sectionsAdminActions = document.getElementById('sections-admin-actions');
    const createSectionBtn = document.getElementById('create-section-btn');
    const goBackSectionBtn = document.getElementById('go-back-section-btn');
    const adminNotesContent = document.getElementById('admin-notes-content');
    const downloadReportsBtn = document.getElementById('download-reports-btn');

    const homePage = document.getElementById('home-page');
    const sectionsPage = document.getElementById('sections-page');
    const tasksPage = document.getElementById('tasks-page');
    const analyticsPage = document.getElementById('analytics-page');
    const settingsPage = document.getElementById('settings-page');

    const bottomNavItems = document.querySelectorAll('.nav-item');
    const currentSectionNameElem = document.getElementById('current-section-name');
    const subSectionsList = document.getElementById('sub-sections-list');
    const itemsList = document.getElementById('items-list');
    const createSubSectionBtn = document.getElementById('create-sub-section-btn');
    const createItemBtn = document.getElementById('create-item-btn');
    const backFromSectionBtn = document.getElementById('back-from-section-btn');

    // Элементы модального окна создания/редактирования раздела/позиции
    const newSectionModal = document.getElementById('new-section-modal');
    const newModalTitle = document.getElementById('new-modal-title');
    const newSectionNameInput = document.getElementById('new-section-name-input');
    const confirmNewSectionBtn = document.getElementById('confirm-new-section-btn');
    const cancelNewSectionBtn = document.getElementById('cancel-new-section-btn');

    const editModal = document.getElementById('edit-modal');
    const editModalTitle = document.getElementById('edit-modal-title');
    const editNameInput = document.getElementById('edit-name-input');
    const editItemFields = document.getElementById('edit-item-fields');
    const editQuantityInput = document.getElementById('edit-quantity-input');
    const editMinQuantityInput = document.getElementById('edit-min-quantity-input');
    const confirmEditBtn = document.getElementById('confirm-edit-btn');
    const cancelEditBtn = document.getElementById('cancel-edit-btn');

    // Элементы модального окна количества
    const quantityModal = document.getElementById('quantity-modal');
    const quantityModalTitle = document.getElementById('quantity-modal-title');
    const quantityInput = document.getElementById('quantity-input');
    const addQuantityBtn = document.getElementById('add-quantity-btn');
    const subtractQuantityBtn = document.getElementById('subtract-quantity-btn');
    const cancelQuantityBtn = document.getElementById('cancel-quantity-btn');

    // Элементы модального окна выбора получателей
    const recipientsModal = document.getElementById('recipients-modal');
    const recipientsList = document.getElementById('recipients-list');
    const confirmRecipientsBtn = document.getElementById('confirm-recipients-btn');
    const cancelRecipientsBtn = document.getElementById('cancel-recipients-btn');
    const recipientFilterTabs = document.querySelectorAll('.recipients-modal .filter-tab');
    const filterAdminsTab = document.getElementById('filter-admins-tab');

    // Элементы контекстного меню
    const contextMenu = document.getElementById('context-menu');
    const contextMenuItems = document.querySelectorAll('.context-menu-item');

    // Элементы страницы задач
    const taskFilterTabs = document.querySelectorAll('.task-filter-tabs .filter-tab');
    const tasksList = document.getElementById('tasks-list');
    const createTaskBtn = document.getElementById('create-task-btn');

    // Элементы модального окна статусов задач
    const taskStatusModal = document.getElementById('task-status-modal');
    const closeTaskStatusModalBtn = document.getElementById('close-task-status-modal');
    const taskStatusOptionButtons = document.querySelectorAll('.task-status-modal .status-option-button');

    // Элементы модального окна создания задачи
    const createTaskModal = document.getElementById('create-task-modal');
    const taskTitleInput = document.getElementById('task-title-input');
    const taskDescriptionInput = document.getElementById('task-description-input');
    const taskAssignedToSelect = document.getElementById('task-assigned-to-select');
    const confirmCreateTaskBtn = document.getElementById('confirm-create-task-btn');
    const cancelCreateTaskBtn = document.getElementById('cancel-create-task-btn');

    // Элементы админ-контроля
    const adminControlsPanel = document.getElementById('admin-controls-panel');
    const logoUrlInput = document.getElementById('logo-url-input');
    const companyNameInput = document.getElementById('company-name-input');
    const applyCompanyChangesBtn = document.getElementById('apply-company-changes');
    const botLogoUrlInput = document.getElementById('bot-logo-url-input');
    const applyBotLogoChangesBtn = document.getElementById('apply-bot-logo-changes');
    const newAdminNoteInput = document.getElementById('new-admin-note-input');
    const addAdminNoteBtn = document.getElementById('add-admin-note-btn');
    const clearAdminNotesBtn = document.getElementById('clear-admin-notes-btn');

    // Состояние приложения
    let currentSectionId = null;
    let currentItem = null; // Для модального окна количества
    let currentEditedElement = null; // Для модального окна редактирования
    let longPressTimer; // Для долгого нажатия на разделы/позиции
    const LONG_PRESS_THRESHOLD = 500; // Порог для долгого нажатия (мс)
    let currentContextMenuTargetId = null; // ID элемента, для которого открыто контекстное меню
    let currentContextMenuType = null; // 'section' или 'item'
    let currentTaskForStatusChange = null;
    let longPressTaskTimer; // Для долгого нажатия на задачи
    const LONG_PRESS_TASK_THRESHOLD = 500; // Порог для долгого нажатия на задачу

    // Имитация данных с сервера
    let allSections = [
        { id: 'sec1', name: 'Склад', icon: '📦', parentId: null, recipients: [], hiddenFor: [] },
        { id: 'sec2', name: 'Офис', icon: '🏢', parentId: null, recipients: [], hiddenFor: [] },
        { id: 'sec3', name: 'Автопарк', icon: '🚗', parentId: null, recipients: [], hiddenFor: [] },
        { id: 'sub1_1', name: 'Продукты А', parentId: 'sec1', recipients: [], hiddenFor: [] },
        { id: 'sub1_2', name: 'Продукты Б', parentId: 'sec1', recipients: [], hiddenFor: [] },
        { id: 'sub2_1', name: 'Канцтовары', parentId: 'sec2', recipients: [], hiddenFor: [] },
    ];

    let allItems = [
        { id: 'item1', name: 'Молоко', parentId: 'sub1_1', quantity: 10, minQuantity: 5, recipients: [], hiddenFor: [] },
        { id: 'item2', name: 'Хлеб', parentId: 'sub1_1', quantity: 20, minQuantity: 10, recipients: [], hiddenFor: [] },
        { id: 'item3', name: 'Ручки', parentId: 'sub2_1', quantity: 50, minQuantity: 20, recipients: [], hiddenFor: [] },
        { id: 'item4', name: 'Бумага А4', parentId: 'sub2_1', quantity: 5, minQuantity: 10, recipients: [], hiddenFor: [] }, // Низкий запас
        { id: 'item5', name: 'Масло моторное', parentId: 'sec3', quantity: 2, minQuantity: 5, recipients: [], hiddenFor: [] }, // Критический
        { id: 'item6', name: 'Шины зимние', parentId: 'sec3', quantity: 8, minQuantity: 4, recipients: [], hiddenFor: [] },
    ];

    let allTasks = [
        { id: 'task1', title: 'Проверить запасы на складе А', assignedTo: '123456789', status: 'В работе', description: 'Склад А требует инвентаризации всех продуктов.' },
        { id: 'task2', title: 'Отправить ежемесячный отчет', assignedTo: '998877665', status: 'Завершена', description: 'Отчет по расходам за июнь.' },
        { id: 'task3', title: 'Заказать новые расходники', assignedTo: '123456789', status: 'Новая', description: 'Необходимо заказать канцелярские принадлежности.' },
        { id: 'task4', title: 'Организовать встречу с поставщиком', assignedTo: '112233445', status: 'Отложена', description: 'Перенести встречу на следующую неделю.' },
        { id: 'task5', title: 'Подготовить презентацию', assignedTo: '123456789', status: 'В работе', description: 'Презентация для нового клиента.' },
        { id: 'task6', title: 'Согласовать договор', assignedTo: '998877665', status: 'Новая', description: 'Документы по договору №123.' },
        { id: 'task7', title: 'Новая задача для всех', assignedTo: null, status: 'Новая', description: 'Эту задачу может взять любой свободный сотрудник.' },
        { id: 'task8', title: 'Еще одна свободная задача', assignedTo: 'unassigned', status: 'Новая', description: '' }
    ];

    let allUsers = [
        { id: '123456789', name: 'Иван Иванов', role: 'employee' },
        { id: '998877665', name: 'Петр Петров', role: 'employee' },
        { id: '112233445', name: 'Сидор Сидоров', role: 'employee' },
        { id: '987654321', name: 'Анна Админова', role: 'main_admin' },
        { id: '543210987', name: 'Ольга Младшая', role: 'junior_admin' },
    ];

    let companyData = {
        name: 'Название Компании',
        logoUrl: 'https://via.placeholder.com/40',
        botLogoUrl: 'https://via.placeholder.com/40',
        adminNotes: ['Добро пожаловать!', 'Проведите инвентаризацию до конца недели.'],
        darkMode: false // Пример состояния
    };

    // --- Utility Functions ---
    function generateUniqueId() {
        return '_' + Math.random().toString(36).substr(2, 9);
    }

    function showPage(pageId) {
        document.querySelectorAll('.page-content').forEach(page => {
            page.classList.add('hidden');
        });
        document.getElementById(pageId).classList.remove('hidden');

        // Обновление активного элемента в нижнем меню
        bottomNavItems.forEach(item => {
            if (item.dataset.page === pageId) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
        hideContextMenu();
        hideAllModals(); // Закрываем все модальные окна при смене страницы
    }

    function updateCompanyInfo() {
        companyNameElem.textContent = companyData.name;
        companyLogo.src = companyData.logoUrl;
        document.body.classList.toggle('dark-mode', companyData.darkMode);
    }

    function updateAdminNotes(notes) {
        adminNotesContent.innerHTML = '';
        if (notes && notes.length > 0) {
            notes.forEach(note => {
                const p = document.createElement('p');
                p.textContent = note;
                adminNotesContent.appendChild(p);
            });
            companyData.adminNotes = notes; // Обновляем данные
        } else {
            adminNotesContent.innerHTML = '<p>Нет текущих заметок для админов.</p>';
            companyData.adminNotes = [];
        }
    }

    function renderSections(parentId) {
        mainSectionsGrid.innerHTML = '';
        subSectionsList.innerHTML = '';
        itemsList.innerHTML = '';
        goBackSectionBtn.style.display = (parentId === null) ? 'none' : 'block';
        currentSectionNameElem.textContent = (parentId === null) ? 'Главная' : allSections.find(s => s.id === parentId)?.name || 'Раздел';
        currentSectionId = parentId;

        const filteredSections = allSections.filter(section => section.parentId === parentId);
        const filteredItems = allItems.filter(item => item.parentId === parentId);

        // Render main sections if parentId is null
        if (parentId === null) {
            sectionsPage.classList.add('hidden');
            homePage.classList.remove('hidden');
            mainSectionsGrid.style.display = 'grid';
            sectionsAdminActions.style.display = 'flex'; // Показываем кнопки управления разделами на главной

            filteredSections.forEach(section => {
                const sectionDiv = document.createElement('div');
                sectionDiv.classList.add('section-item');
                sectionDiv.innerHTML = `
                    <span class="section-item-icon">${section.icon || '📁'}</span>
                    <h3>${section.name}</h3>
                `;
                // Добавляем обработчики долгого нажатия и кнопки действий только для админов
                if (isAdmin) {
                    sectionDiv.addEventListener('mousedown', (e) => startLongPress(e, section.id, 'section'));
                    sectionDiv.addEventListener('mouseup', cancelLongPress);
                    sectionDiv.addEventListener('mouseleave', cancelLongPress);
                    sectionDiv.addEventListener('touchstart', (e) => startLongPress(e, section.id, 'section'), { passive: true });
                    sectionDiv.addEventListener('touchend', cancelLongPress);
                    sectionDiv.addEventListener('touchcancel', cancelLongPress);

                    const sectionActionsDiv = document.createElement('div');
                    sectionActionsDiv.classList.add('section-item-actions');

                    const editButton = document.createElement('button');
                    editButton.classList.add('section-action-button');
                    editButton.innerHTML = '&#9998;'; // Карандаш
                    editButton.title = 'Редактировать раздел';
                    editButton.addEventListener('click', (e) => {
                        e.stopPropagation();
                        editSection(section.id, section.name);
                    });
                    sectionActionsDiv.appendChild(editButton);

                    const deleteButton = document.createElement('button');
                    deleteButton.classList.add('section-action-button');
                    deleteButton.innerHTML = '&#10006;'; // Крестик
                    deleteButton.title = 'Удалить раздел';
                    deleteButton.addEventListener('click', (e) => {
                        e.stopPropagation();
                        deleteSection(section.id);
                    });
                    sectionActionsDiv.appendChild(deleteButton);

                    sectionDiv.appendChild(sectionActionsDiv);
                }

                // Обработчик клика для навигации по разделам
                sectionDiv.addEventListener('click', (e) => {
                    // Разрешаем навигацию, если не было нажатия на кнопку действия или контекстное меню
                    if (isAdmin && (e.target.closest('.section-action-button') || e.target.closest('.context-menu-item'))) {
                        return;
                    }
                    if (longPressTimer && isAdmin) { // Только если админ, проверяем longPressTimer
                        return;
                    }
                    if (window.Telegram && window.Telegram.WebApp) {
                        Telegram.WebApp.HapticFeedback.impactOccurred('light');
                    }
                    navigateToSection(section.id, section.name);
                });
                mainSectionsGrid.appendChild(sectionDiv);
            });
        } else {
            // Render sub-sections and items
            homePage.classList.add('hidden');
            sectionsPage.classList.remove('hidden');
            mainSectionsGrid.style.display = 'none';
            sectionsAdminActions.style.display = 'none'; // Скрываем кнопки управления разделами на подстраницах

            // Show 'Create Sub-section' and 'Create Item' buttons based on current depth
            createSubSectionBtn.style.display = 'block';
            createItemBtn.style.display = 'block';

            if (filteredSections.length > 0) {
                filteredSections.forEach(section => {
                    const sectionDiv = document.createElement('div');
                    sectionDiv.classList.add('sub-section-item');
                    sectionDiv.innerHTML = `<h3>${section.name}</h3>`;
                     // Добавляем обработчики долгого нажатия и кнопки действий только для админов
                     if (isAdmin) {
                        sectionDiv.addEventListener('mousedown', (e) => startLongPress(e, section.id, 'section'));
                        sectionDiv.addEventListener('mouseup', cancelLongPress);
                        sectionDiv.addEventListener('mouseleave', cancelLongPress);
                        sectionDiv.addEventListener('touchstart', (e) => startLongPress(e, section.id, 'section'), { passive: true });
                        sectionDiv.addEventListener('touchend', cancelLongPress);
                        sectionDiv.addEventListener('touchcancel', cancelLongPress);

                        const sectionActionsDiv = document.createElement('div');
                        sectionActionsDiv.classList.add('section-item-actions');

                        const editButton = document.createElement('button');
                        editButton.classList.add('section-action-button');
                        editButton.innerHTML = '&#9998;'; // Карандаш
                        editButton.title = 'Редактировать подраздел';
                        editButton.addEventListener('click', (e) => {
                            e.stopPropagation();
                            editSection(section.id, section.name);
                        });
                        sectionActionsDiv.appendChild(editButton);

                        const deleteButton = document.createElement('button');
                        deleteButton.classList.add('section-action-button');
                        deleteButton.innerHTML = '&#10006;'; // Крестик
                        deleteButton.title = 'Удалить подраздел';
                        deleteButton.addEventListener('click', (e) => {
                            e.stopPropagation();
                            deleteSection(section.id);
                        });
                        sectionActionsDiv.appendChild(deleteButton);

                        sectionDiv.appendChild(sectionActionsDiv);
                    }

                    sectionDiv.addEventListener('click', (e) => {
                        if (isAdmin && (e.target.closest('.section-action-button') || e.target.closest('.context-menu-item'))) {
                            return;
                        }
                        if (longPressTimer && isAdmin) { // Только если админ, проверяем longPressTimer
                            return;
                        }
                        if (window.Telegram && window.Telegram.WebApp) {
                            Telegram.WebApp.HapticFeedback.impactOccurred('light');
                        }
                        navigateToSection(section.id, section.name);
                    });
                    subSectionsList.appendChild(sectionDiv);
                });
            }

            if (filteredItems.length > 0) {
                filteredItems.forEach(item => {
                    const itemDiv = document.createElement('div');
                    itemDiv.classList.add('item-card');
                    let statusClass = '';
                    if (item.quantity <= item.minQuantity) {
                        statusClass = 'critical';
                    } else if (item.quantity <= item.minQuantity * 1.5 && item.minQuantity > 0) { // Пример: низкий запас, если меньше 1.5 мин. кол-ва
                        statusClass = 'low-stock';
                    }
                    itemDiv.classList.add(statusClass);

                    itemDiv.innerHTML = `
                        <h3>${item.name}</h3>
                        <p class="item-quantity">Количество: ${item.quantity}</p>
                        <p class="item-min-quantity">Мин. количество: ${item.minQuantity || 'Не установлено'}</p>
                    `;
                    // Добавляем обработчики долгого нажатия и кнопки действий только для админов
                    if (isAdmin) {
                        itemDiv.addEventListener('mousedown', (e) => startLongPress(e, item.id, 'item'));
                        itemDiv.addEventListener('mouseup', cancelLongPress);
                        itemDiv.addEventListener('mouseleave', cancelLongPress);
                        itemDiv.addEventListener('touchstart', (e) => startLongPress(e, item.id, 'item'), { passive: true });
                        itemDiv.addEventListener('touchend', cancelLongPress);
                        itemDiv.addEventListener('touchcancel', cancelLongPress);

                        const itemActionsDiv = document.createElement('div');
                        itemActionsDiv.classList.add('section-item-actions');

                        const editButton = document.createElement('button');
                        editButton.classList.add('section-action-button');
                        editButton.innerHTML = '&#9998;';
                        editButton.title = 'Редактировать позицию';
                        editButton.addEventListener('click', (e) => {
                            e.stopPropagation();
                            editItem(item.id, item.name, item.quantity, item.minQuantity);
                        });
                        itemActionsDiv.appendChild(editButton);

                        const deleteButton = document.createElement('button');
                        deleteButton.classList.add('section-action-button');
                        deleteButton.innerHTML = '&#10006;';
                        deleteButton.title = 'Удалить позицию';
                        deleteButton.addEventListener('click', (e) => {
                            e.stopPropagation();
                            deleteItem(item.id);
                        });
                        itemActionsDiv.appendChild(deleteButton);

                        itemDiv.appendChild(itemActionsDiv);
                    }

                    itemDiv.addEventListener('click', (e) => {
                        if (isAdmin && (e.target.closest('.section-action-button') || e.target.closest('.context-menu-item'))) {
                            return;
                        }
                        if (longPressTimer && isAdmin) { // Только если админ, проверяем longPressTimer
                            return;
                        }
                        if (window.Telegram && window.Telegram.WebApp) {
                            Telegram.WebApp.HapticFeedback.impactOccurred('light');
                            Telegram.WebApp.showAlert(`Позиция: ${item.name}\nКоличество: ${item.quantity}\nМин. количество: ${item.minQuantity || 'Не установлено'}`);
                        } else {
                            alert(`Позиция: ${item.name}\nКоличество: ${item.quantity}\nМин. количество: ${item.minQuantity || 'Не установлено'}`);
                        }
                    });
                    itemsList.appendChild(itemDiv);
                });
            }

            if (filteredSections.length === 0 && filteredItems.length === 0) {
                subSectionsList.innerHTML = '<p class="no-tasks-message">В этом разделе пока нет подразделов или позиций.</p>';
            }
        }
    }

    function navigateToSection(id, name) {
        currentSectionId = id;
        currentSectionNameElem.textContent = name;
        renderSections(id);
        if (id === null) {
            showPage('home-page');
        } else {
            showPage('sections-page');
        }
    }

    function renderTasks(filter) {
        tasksList.innerHTML = '';
        const filteredTasks = allTasks.filter(task => {
            if (filter === 'all') return true;
            if (filter === 'my') return task.assignedTo === currentUserId;
            return false;
        });

        if (filteredTasks.length === 0) {
            tasksList.innerHTML = '<p class="no-tasks-message">Нет доступных задач.</p>';
            return;
        }

        filteredTasks.forEach(task => {
            const taskItem = document.createElement('div');
            taskItem.classList.add('task-item');

            let statusText = task.status;
            let statusClass = '';
            switch (task.status) {
                case 'Новая':
                    statusClass = 'new';
                    break;
                case 'В работе':
                    statusClass = 'in-progress';
                    break;
                case 'Завершена':
                    statusClass = 'completed';
                    break;
                case 'Отложена':
                    statusClass = 'deferred';
                    break;
                default:
                    statusClass = 'new';
            }
            const assignedUserName = allUsers.find(u => u.id === task.assignedTo)?.name || 'Не назначено';

            taskItem.innerHTML = `
                <div class="task-title">${task.title}</div>
                <div class="task-description" style="font-size: 0.9em; color: var(--bottom-nav-text-color); margin-top: 4px;">${task.description || ''}</div>
                <div class="task-info">
                    <span class="task-status ${statusClass}">${statusText}</span>
                    <span class="task-assigned-to">Назначено: ${assignedUserName}</span>
                </div>
            `;

            // Добавляем обработчики долгого нажатия для изменения статуса
            taskItem.addEventListener('mousedown', (e) => startLongPressTask(e, task.id));
            taskItem.addEventListener('mouseup', cancelLongPressTask);
            taskItem.addEventListener('mouseleave', cancelLongPressTask);
            taskItem.addEventListener('touchstart', (e) => startLongPressTask(e, task.id), { passive: true });
            taskItem.addEventListener('touchend', cancelLongPressTask);
            taskItem.addEventListener('touchcancel', cancelLongPressTask);

            taskItem.addEventListener('click', () => {
                // Если сработало долгое нажатие, то не обрабатываем короткий клик
                if (longPressTaskTimer === null) { // Проверяем, что таймер неактивен (т.е. не было долгого нажатия)
                    if (window.Telegram && window.Telegram.WebApp) {
                        Telegram.WebApp.HapticFeedback.impactOccurred('light');
                        Telegram.WebApp.showAlert(`Задача: "${task.title}"\nОписание: ${task.description || 'Нет'}\nСтатус: ${task.status}\nНазначена: ${assignedUserName}`);
                    } else {
                        alert(`Задача: "${task.title}"\nОписание: ${task.description || 'Нет'}\nСтатус: ${task.status}\nНазначена: ${assignedUserName}`);
                    }
                }
            });

            // Проверяем, если задача не назначена и не завершена, добавляем кнопку "Взять в работу"
            if ((!task.assignedTo || task.assignedTo === 'unassigned') && task.status !== 'Завершена') {
                const takeTaskButton = document.createElement('button');
                takeTaskButton.classList.add('take-task-button');
                takeTaskButton.textContent = 'Взять в работу';
                takeTaskButton.addEventListener('click', async (e) => {
                    e.stopPropagation(); // Предотвращаем срабатывание общего клика по задаче
                    if (window.Telegram && window.Telegram.WebApp) {
                        Telegram.WebApp.HapticFeedback.impactOccurred('medium');
                        const confirmed = await new Promise(resolve => {
                            Telegram.WebApp.showConfirm(`Вы уверены, что хотите взять задачу "${task.title}" в работу?`, (result) => resolve(result));
                        });
                        if (confirmed) {
                            task.assignedTo = currentUserId;
                            task.status = 'В работе'; // Статус автоматически меняется на "В работе"
                            renderTasks(document.querySelector('#tasks-page .filter-tab.active')?.dataset.filter || 'all');
                            Telegram.WebApp.sendData(JSON.stringify({
                                type: 'take_task',
                                payload: {
                                    taskId: task.id,
                                    assignedTo: currentUserId,
                                    status: 'В работе'
                                }
                            }));
                            Telegram.WebApp.showAlert(`Вы взяли задачу "${task.title}" в работу.`);
                        } else {
                            Telegram.WebApp.HapticFeedback.notificationOccurred('light');
                        }
                    } else {
                        if (confirm(`Вы уверены, что хотите взять задачу "${task.title}" в работу?`)) {
                            task.assignedTo = currentUserId;
                            task.status = 'В работе';
                            renderTasks(document.querySelector('#tasks-page .filter-tab.active')?.dataset.filter || 'all');
                            alert(`Вы взяли задачу "${task.title}" в работу (только в браузере).`);
                        }
                    }
                });
                taskItem.appendChild(takeTaskButton);
            }

            tasksList.appendChild(taskItem);
        });
    }

    // --- Modal Functions ---
    function showModal(modal) {
        if (window.Telegram && window.Telegram.WebApp) {
            Telegram.WebApp.HapticFeedback.impactOccurred('heavy');
        }
        document.body.classList.add('modal-open');
        modal.classList.remove('hidden');
        modal.style.display = 'flex'; // Показываем как flex-контейнер
        // Останавливаем распространение клика, чтобы клик по контенту модального окна не закрывал его
        modal.querySelector('.modal-content').addEventListener('click', (e) => e.stopPropagation());
    }

    function hideModal(modal) {
        document.body.classList.remove('modal-open');
        modal.classList.add('hidden');
        // Задержка перед скрытием display, чтобы анимация успела отработать
        setTimeout(() => {
            modal.style.display = 'none';
        }, 300);
    }

    function hideAllModals() {
        hideModal(newSectionModal);
        hideModal(editModal);
        hideModal(quantityModal);
        hideModal(recipientsModal);
        hideModal(taskStatusModal);
        hideModal(createTaskModal);
    }

    function startLongPress(e, id, type) {
        if (!isAdmin) return; // Только админы могут использовать долгое нажатие
        if (e.touches && e.touches.length > 1) { // Игнорируем мультитач
            cancelLongPress();
            return;
        }
        clearTimeout(longPressTimer);
        longPressTimer = setTimeout(() => {
            currentContextMenuTargetId = id;
            currentContextMenuType = type;
            showContextMenu(e);
        }, LONG_PRESS_THRESHOLD);
    }

    function cancelLongPress() {
        clearTimeout(longPressTimer);
        longPressTimer = null;
    }

    function showContextMenu(e) {
        if (!isAdmin) return;
        if (window.Telegram && window.Telegram.WebApp) {
            Telegram.WebApp.HapticFeedback.impactOccurred('heavy');
        }
        contextMenu.classList.remove('hidden');
        // Устанавливаем позицию
        let x = e.clientX || e.touches[0].clientX;
        let y = e.clientY || e.touches[0].clientY;

        // Корректируем позицию, чтобы меню не выходило за границы экрана
        const menuWidth = contextMenu.offsetWidth;
        const menuHeight = contextMenu.offsetHeight;
        if (x + menuWidth > window.innerWidth) {
            x = window.innerWidth - menuWidth - 10; // 10px отступ
        }
        if (y + menuHeight > window.innerHeight) {
            y = window.innerHeight - menuHeight - 10; // 10px отступ
        }
        contextMenu.style.left = `${x}px`;
        contextMenu.style.top = `${y}px`;

        // Определяем видимость пунктов меню в зависимости от типа элемента
        contextMenuItems.forEach(item => {
            const action = item.dataset.action;
            item.style.display = 'block'; // Показываем по умолчанию

            if (currentContextMenuType === 'section') {
                if (action === 'add-subtract' || action === 'min-quantity' || action === 'remind') {
                    item.style.display = 'none'; // Эти действия только для позиций
                }
            } else if (currentContextMenuType === 'item') {
                // Все пункты могут быть для позиций, но некоторые могут быть неактивны в зависимости от контекста
                // Пока все активны для простоты
            }
        });

        // Добавляем обработчик для закрытия меню по клику вне его
        document.addEventListener('click', hideContextMenuOnClickOutside, { once: true });
    }

    function hideContextMenu() {
        contextMenu.classList.add('hidden');
        currentContextMenuTargetId = null;
        currentContextMenuType = null;
        document.removeEventListener('click', hideContextMenuOnClickOutside);
    }

    function hideContextMenuOnClickOutside(event) {
        if (!contextMenu.contains(event.target)) {
            hideContextMenu();
        }
    }
  
        // --- Section/Item Management Functions ---
    function createSection(name, parentId, icon = '📁') {
        const newSection = {
            id: generateUniqueId(),
            name: name,
            icon: icon, // Для корневых разделов может быть иконка
            parentId: parentId,
            recipients: [],
            hiddenFor: []
        };
        allSections.push(newSection);
        renderSections(parentId);

        if (window.Telegram && window.Telegram.WebApp) {
            Telegram.WebApp.sendData(JSON.stringify({
                type: 'create_section',
                payload: newSection
            }));
            Telegram.WebApp.showAlert(`Раздел "${name}" создан.`);
        } else {
            alert(`Раздел "${name}" создан (только в браузере).`);
        }
    }

    function createItem(name, parentId, quantity, minQuantity) {
        const newItem = {
            id: generateUniqueId(),
            name: name,
            parentId: parentId,
            quantity: quantity,
            minQuantity: minQuantity,
            recipients: [],
            hiddenFor: []
        };
        allItems.push(newItem);
        renderSections(parentId);

        if (window.Telegram && window.Telegram.WebApp) {
            Telegram.WebApp.sendData(JSON.stringify({
                type: 'create_item',
                payload: newItem
            }));
            Telegram.WebApp.showAlert(`Позиция "${name}" добавлена.`);
        } else {
            alert(`Позиция "${name}" добавлена (только в браузере).`);
        }
    }

    function editSection(id, currentName) {
        currentEditedElement = allSections.find(s => s.id === id);
        if (!currentEditedElement) return;

        showModal(editModal);
        editModalTitle.textContent = 'Редактировать раздел';
        editNameInput.value = currentName;
        editItemFields.style.display = 'none'; // Скрываем поля для позиций

        confirmEditBtn.onclick = async () => {
            const newName = editNameInput.value.trim();
            if (newName && currentEditedElement) {
                let confirmed;
                if (window.Telegram && window.Telegram.WebApp) {
                    confirmed = await new Promise(resolve => {
                        Telegram.WebApp.showConfirm(`Вы уверены, что хотите переименовать раздел в "${newName}"?`, (result) => resolve(result));
                    });
                } else {
                    confirmed = confirm(`Вы уверены, что хотите переименовать раздел в "${newName}"?`);
                }

                if (confirmed) {
                    currentEditedElement.name = newName;
                    renderSections(currentEditedElement.parentId);
                    hideModal(editModal);

                    if (window.Telegram && window.Telegram.WebApp) {
                        Telegram.WebApp.sendData(JSON.stringify({
                            type: 'edit_section',
                            payload: { id: currentEditedElement.id, name: newName }
                        }));
                        Telegram.WebApp.showAlert(`Раздел "${newName}" обновлен.`);
                    } else {
                        alert(`Раздел "${newName}" обновлен (только в браузере).`);
                    }
                }
            } else {
                if (window.Telegram && window.Telegram.WebApp) {
                    Telegram.WebApp.showAlert('Пожалуйста, введите название.');
                } else {
                    alert('Пожалуйста, введите название.');
                }
            }
        };
    }

    function editItem(id, currentName, currentQuantity, currentMinQuantity) {
        currentEditedElement = allItems.find(item => item.id === id);
        if (!currentEditedElement) return;

        showModal(editModal);
        editModalTitle.textContent = 'Редактировать позицию';
        editNameInput.value = currentName;
        editQuantityInput.value = currentQuantity;
        editMinQuantityInput.value = currentMinQuantity;
        editItemFields.style.display = 'block'; // Показываем поля для позиций

        confirmEditBtn.onclick = async () => {
            const newName = editNameInput.value.trim();
            const newQuantity = parseInt(editQuantityInput.value);
            const newMinQuantity = parseInt(editMinQuantityInput.value);

            if (newName && !isNaN(newQuantity) && newQuantity >= 0 && !isNaN(newMinQuantity) && newMinQuantity >= 0 && currentEditedElement) {
                let confirmed;
                if (window.Telegram && window.Telegram.WebApp) {
                    confirmed = await new Promise(resolve => {
                        Telegram.WebApp.showConfirm(`Вы уверены, что хотите обновить позицию "${newName}"?\nКоличество: ${newQuantity}\nМин. количество: ${newMinQuantity}`, (result) => resolve(result));
                    });
                } else {
                    confirmed = confirm(`Вы уверены, что хотите обновить позицию "${newName}"?\nКоличество: ${newQuantity}\nМин. количество: ${newMinQuantity}`);
                }

                if (confirmed) {
                    currentEditedElement.name = newName;
                    currentEditedElement.quantity = newQuantity;
                    currentEditedElement.minQuantity = newMinQuantity;
                    renderSections(currentEditedElement.parentId);
                    hideModal(editModal);

                    if (window.Telegram && window.Telegram.WebApp) {
                        Telegram.WebApp.sendData(JSON.stringify({
                            type: 'edit_item',
                            payload: {
                                id: currentEditedElement.id,
                                name: newName,
                                quantity: newQuantity,
                                minQuantity: newMinQuantity
                            }
                        }));
                        Telegram.WebApp.showAlert(`Позиция "${newName}" обновлена.`);
                    } else {
                        alert(`Позиция "${newName}" обновлена (только в браузере).`);
                    }
                }
            } else {
                if (window.Telegram && window.Telegram.WebApp) {
                    Telegram.WebApp.showAlert('Пожалуйста, введите корректные данные (название и неотрицательные числа).');
                } else {
                    alert('Пожалуйста, введите корректные данные (название и неотрицательные числа).');
                }
            }
        };
    }

    async function deleteSection(id) {
        const sectionToDelete = allSections.find(s => s.id === id);
        if (!sectionToDelete) return;

        let confirmed;
        if (window.Telegram && window.Telegram.WebApp) {
            confirmed = await new Promise(resolve => {
                Telegram.WebApp.showConfirm(`Вы уверены, что хотите удалить раздел "${sectionToDelete.name}"? Все подразделы и позиции внутри будут также удалены.`, (result) => resolve(result));
            });
        } else {
            confirmed = confirm(`Вы уверены, что хотите удалить раздел "${sectionToDelete.name}"? Все подразделы и позиции внутри будут также удалены.`);
        }

        if (confirmed) {
            // Рекурсивное удаление вложенных элементов
            const idsToDelete = [id];
            let index = 0;
            while (index < idsToDelete.length) {
                const currentId = idsToDelete[index];
                allSections.filter(s => s.parentId === currentId).forEach(s => idsToDelete.push(s.id));
                index++;
            }

            allSections = allSections.filter(s => !idsToDelete.includes(s.id));
            allItems = allItems.filter(item => !idsToDelete.includes(item.parentId) && item.parentId !== id); // Удаляем итемы из удаленных разделов

            renderSections(sectionToDelete.parentId); // Возвращаемся на родительский раздел
            hideContextMenu();

            if (window.Telegram && window.Telegram.WebApp) {
                Telegram.WebApp.sendData(JSON.stringify({
                    type: 'delete_section',
                    payload: { id: id }
                }));
                Telegram.WebApp.showAlert(`Раздел "${sectionToDelete.name}" удален.`);
            } else {
                alert(`Раздел "${sectionToDelete.name}" удален (только в браузере).`);
            }
        } else {
            hideContextMenu();
        }
    }

    async function deleteItem(id) {
        const itemToDelete = allItems.find(item => item.id === id);
        if (!itemToDelete) return;

        let confirmed;
        if (window.Telegram && window.Telegram.WebApp) {
            confirmed = await new Promise(resolve => {
                Telegram.WebApp.showConfirm(`Вы уверены, что хотите удалить позицию "${itemToDelete.name}"?`, (result) => resolve(result));
            });
        } else {
            confirmed = confirm(`Вы уверены, что хотите удалить позицию "${itemToDelete.name}"?`);
        }

        if (confirmed) {
            allItems = allItems.filter(item => item.id !== id);
            renderSections(itemToDelete.parentId); // Обновляем текущий раздел
            hideContextMenu();

            if (window.Telegram && window.Telegram.WebApp) {
                Telegram.WebApp.sendData(JSON.stringify({
                    type: 'delete_item',
                    payload: { id: id }
                }));
                Telegram.WebApp.showAlert(`Позиция "${itemToDelete.name}" удалена.`);
            } else {
                alert(`Позиция "${itemToDelete.name}" удалена (только в браузере).`);
            }
        } else {
            hideContextMenu();
        }
    }

    function showQuantityModal(item) {
        currentItem = item;
        quantityModalTitle.textContent = `Изменить количество: ${item.name}`;
        quantityInput.value = 1; // Сброс значения
        showModal(quantityModal);
    }

    async function updateItemQuantity(itemId, change) {
        const item = allItems.find(i => i.id === itemId);
        if (item) {
            const newQuantity = item.quantity + change;
            if (newQuantity < 0) {
                if (window.Telegram && window.Telegram.WebApp) {
                    Telegram.WebApp.showAlert('Количество не может быть отрицательным.');
                } else {
                    alert('Количество не может быть отрицательным.');
                }
                return false;
            }

            let confirmed;
            const actionText = change > 0 ? 'добавить' : 'списать';
            if (window.Telegram && window.Telegram.WebApp) {
                confirmed = await new Promise(resolve => {
                    Telegram.WebApp.showConfirm(`Вы уверены, что хотите ${actionText} ${Math.abs(change)} к "${item.name}"? Новое количество: ${newQuantity}`, (result) => resolve(result));
                });
            } else {
                confirmed = confirm(`Вы уверены, что хотите ${actionText} ${Math.abs(change)} к "${item.name}"? Новое количество: ${newQuantity}`);
            }

            if (confirmed) {
                item.quantity = newQuantity;
                renderSections(item.parentId); // Обновляем UI
                hideModal(quantityModal);
                hideContextMenu();

                if (window.Telegram && window.Telegram.WebApp) {
                    Telegram.WebApp.sendData(JSON.stringify({
                        type: 'update_item_quantity',
                        payload: {
                            id: item.id,
                            quantity: item.quantity
                        }
                    }));
                    Telegram.WebApp.showAlert(`Количество "${item.name}" обновлено до ${item.quantity}.`);
                } else {
                    alert(`Количество "${item.name}" обновлено до ${item.quantity} (только в браузере).`);
                }
                return true;
            } else {
                if (window.Telegram && window.Telegram.WebApp) {
                    Telegram.WebApp.HapticFeedback.notificationOccurred('light');
                }
                return false;
            }
        }
        return false;
    }

    function showRecipientsModal(targetId, targetType, currentRecipients, currentHiddenFor) {
        currentContextMenuTargetId = targetId;
        currentContextMenuType = targetType; // 'section' or 'item'
        showModal(recipientsModal);
        populateRecipientsList(currentRecipients, currentHiddenFor);
    }

    function populateRecipientsList(currentRecipients = [], currentHiddenFor = []) {
        // Убедимся, что по умолчанию выбрана вкладка "Все" для главного админа
        // и "Сотрудники" для младшего админа
        document.querySelector('.recipients-modal .filter-tab.active')?.classList.remove('active');
        if (isMainAdmin) {
             document.querySelector('.recipients-modal .filter-tab[data-filter="all"]').classList.add('active');
             renderUsersForSelection('all');
        } else if (isJuniorAdmin) {
            document.querySelector('.recipients-modal .filter-tab[data-filter="employees"]').classList.add('active');
            renderUsersForSelection('employees');
        } else {
             // Для не-админов, если вдруг попали сюда
             recipientsList.innerHTML = '<p>Нет доступных пользователей для выбора.</p>';
             return;
        }

        // Устанавливаем текущие выбранные значения
        recipientsList.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
            const userId = checkbox.value;
            checkbox.checked = currentRecipients.includes(userId);
            // Также можно добавить логику для "скрыть от", если нужно
            checkbox.dataset.hidden = currentHiddenFor.includes(userId);
        });
    }

    function renderUsersForSelection(filter) {
        recipientsList.innerHTML = '';
        let usersToDisplay = [];

        if (isMainAdmin) {
            usersToDisplay = allUsers; // Главный админ видит всех
        } else if (isJuniorAdmin) {
            usersToDisplay = allUsers.filter(user => user.role === 'employee'); // Младший админ видит только сотрудников
        } else {
            // Если не админ, или какая-то другая роль, возможно, список должен быть пустым
            // или показывать только самого себя, в зависимости от логики.
            usersToDisplay = [];
        }

        let filteredUsers = [];
        if (filter === 'all') {
            filteredUsers = usersToDisplay;
        } else if (filter === 'admins') {
            filteredUsers = usersToDisplay.filter(user => user.role === 'main_admin' || user.role === 'junior_admin');
        } else if (filter === 'employees') {
            filteredUsers = usersToDisplay.filter(user => user.role === 'employee');
        }

        if (filteredUsers.length === 0) {
            recipientsList.innerHTML = '<p>Нет пользователей для отображения.</p>';
            return;
        }

        filteredUsers.forEach(user => {
            const div = document.createElement('div');
            div.classList.add('recipient-item');
            div.innerHTML = `
                <input type="checkbox" id="user-${user.id}" value="${user.id}">
                <label for="user-${user.id}">${user.name} (${user.role === 'main_admin' ? 'Главный админ' : user.role === 'junior_admin' ? 'Младший админ' : 'Сотрудник'})</label>
            `;
            recipientsList.appendChild(div);
        });
    }

    async function applyRecipientsChanges(actionType) { // actionType: 'remind', 'min_quantity', 'hide_from'
        const selectedUsers = Array.from(recipientsList.querySelectorAll('input[type="checkbox"]:checked')).map(cb => cb.value);

        let targetElement;
        if (currentContextMenuType === 'section') {
            targetElement = allSections.find(s => s.id === currentContextMenuTargetId);
        } else if (currentContextMenuType === 'item') {
            targetElement = allItems.find(i => i.id === currentContextMenuTargetId);
        }

        if (!targetElement) return;

        let confirmed = true;
        let message = '';
        let payload = {};

        if (actionType === 'hide_from') {
            message = `Вы уверены, что хотите скрыть "${targetElement.name}" от выбранных пользователей?`;
            targetElement.hiddenFor = selectedUsers; // Заменяем массив скрытых
            payload = { id: targetElement.id, type: currentContextMenuType, hiddenFor: selectedUsers };
        } else if (actionType === 'remind') {
            message = `Вы уверены, что хотите настроить напоминания для "${targetElement.name}" для выбранных пользователей?`;
            targetElement.recipients = selectedUsers; // Заменяем массив получателей напоминаний
            payload = { id: targetElement.id, type: currentContextMenuType, recipients: selectedUsers };
        } else if (actionType === 'min_quantity') {
            message = `Вы уверены, что хотите настроить оповещения о критическом минимуме для "${targetElement.name}" для выбранных пользователей?`;
            targetElement.recipients = selectedUsers; // Здесь тоже используем recipients для простоты
            payload = { id: targetElement.id, type: currentContextMenuType, recipients: selectedUsers, minQuantityAlert: true };
        }

        if (window.Telegram && window.Telegram.WebApp) {
            confirmed = await new Promise(resolve => {
                Telegram.WebApp.showConfirm(message, (result) => resolve(result));
            });
        } else {
            confirmed = confirm(message);
        }

        if (confirmed) {
            hideModal(recipientsModal);
            hideContextMenu();
            renderSections(currentSectionId); // Перерисовываем, чтобы изменения вступили в силу в UI

            if (window.Telegram && window.Telegram.WebApp) {
                Telegram.WebApp.sendData(JSON.stringify({
                    type: actionType,
                    payload: payload
                }));
                Telegram.WebApp.showAlert(`Настройки для "${targetElement.name}" обновлены.`);
            } else {
                alert(`Настройки для "${targetElement.name}" обновлены (только в браузере).`);
            }
        } else {
            if (window.Telegram && window.Telegram.WebApp) {
                Telegram.WebApp.HapticFeedback.notificationOccurred('light');
            }
        }
    }
  
  // --- Task Management Functions ---
    function startLongPressTask(e, taskId) {
        clearTimeout(longPressTaskTimer);
        longPressTaskTimer = setTimeout(() => {
            currentTaskForStatusChange = allTasks.find(t => t.id === taskId);
            if (currentTaskForStatusChange) {
                showModal(taskStatusModal);
            }
        }, LONG_PRESS_TASK_THRESHOLD);
    }

    function cancelLongPressTask() {
        clearTimeout(longPressTaskTimer);
        longPressTaskTimer = null;
    }

    async function updateTaskStatus(taskId, newStatus) {
        const task = allTasks.find(t => t.id === taskId);
        if (!task) return;

        // Разрешить изменение статуса только назначенному пользователю, админу или если задача "Новая" и не назначена
        const isAssignedToCurrentUser = task.assignedTo === currentUserId;
        const isUnassignedNewTask = (!task.assignedTo || task.assignedTo === 'unassigned') && task.status === 'Новая';

        if (!isAdmin && !isAssignedToCurrentUser && !isUnassignedNewTask) {
            if (window.Telegram && window.Telegram.WebApp) {
                Telegram.WebApp.showAlert('У вас нет прав для изменения статуса этой задачи.');
            } else {
                alert('У вас нет прав для изменения статуса этой задачи.');
            }
            return;
        }

        let confirmed;
        if (window.Telegram && window.Telegram.WebApp) {
            confirmed = await new Promise(resolve => {
                Telegram.WebApp.showConfirm(`Вы уверены, что хотите изменить статус задачи "${task.title}" на "${newStatus}"?`, (result) => resolve(result));
            });
        } else {
            confirmed = confirm(`Вы уверены, что хотите изменить статус задачи "${task.title}" на "${newStatus}"?`);
        }

        if (confirmed) {
            task.status = newStatus;
            // Если задачу взял кто-то, кто еще не был назначен, и она была "Новая", назначить ее ему
            if (newStatus === 'В работе' && (!task.assignedTo || task.assignedTo === 'unassigned')) {
                task.assignedTo = currentUserId;
            } else if (newStatus === 'Завершена' || newStatus === 'Отложена') {
                // Если задача завершена или отложена, можно снять назначение, если это не админ
                // Пока оставим назначенного, чтобы можно было видеть, кто завершил/отложил
                // task.assignedTo = 'unassigned';
            }

            renderTasks(document.querySelector('#tasks-page .filter-tab.active')?.dataset.filter || 'all');
            hideModal(taskStatusModal);

            if (window.Telegram && window.Telegram.WebApp) {
                Telegram.WebApp.sendData(JSON.stringify({
                    type: 'update_task_status',
                    payload: {
                        taskId: task.id,
                        status: newStatus,
                        assignedTo: task.assignedTo // Отправляем также нового назначенного, если изменился
                    }
                }));
                Telegram.WebApp.showAlert(`Статус задачи "${task.title}" обновлен до "${newStatus}".`);
            } else {
                alert(`Статус задачи "${task.title}" обновлен до "${newStatus}" (только в браузере).`);
            }
        } else {
            if (window.Telegram && window.Telegram.WebApp) {
                Telegram.WebApp.HapticFeedback.notificationOccurred('light');
            }
        }
    }

    // --- Event Listeners ---
    settingsBtn.addEventListener('click', () => showPage('settings-page'));

    bottomNavItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const pageId = this.dataset.page;
            showPage(pageId);
        });
    });

    // Back button for sections page
    backFromSectionBtn.addEventListener('click', () => navigateToSection(null)); // Go back to main sections

    // Admin controls for company info (for testing/demo)
    if (adminControlsPanel) { // Проверяем, что панель существует
        applyCompanyChangesBtn.addEventListener('click', async () => {
            const newName = companyNameInput.value.trim();
            const newLogoUrl = logoUrlInput.value.trim();
            if (newName || newLogoUrl) {
                let confirmed;
                if (window.Telegram && window.Telegram.WebApp) {
                    confirmed = await new Promise(resolve => {
                        Telegram.WebApp.showConfirm('Применить изменения данных компании?', (result) => resolve(result));
                    });
                } else {
                    confirmed = confirm('Применить изменения данных компании?');
                }

                if (confirmed) {
                    if (newName) companyData.name = newName;
                    if (newLogoUrl) companyData.logoUrl = newLogoUrl;
                    updateCompanyInfo();
                    if (window.Telegram && window.Telegram.WebApp) {
                        Telegram.WebApp.sendData(JSON.stringify({
                            type: 'update_company_info',
                            payload: { name: newName, logoUrl: newLogoUrl }
                        }));
                        Telegram.WebApp.showAlert('Данные компании обновлены.');
                    } else {
                        alert('Данные компании обновлены (только в браузере).');
                    }
                }
            } else {
                if (window.Telegram && window.Telegram.WebApp) {
                    Telegram.WebApp.showAlert('Введите название или URL логотипа.');
                } else {
                    alert('Введите название или URL логотипа.');
                }
            }
        });

        applyBotLogoChangesBtn.addEventListener('click', async () => {
            const newBotLogoUrl = botLogoUrlInput.value.trim();
            if (newBotLogoUrl) {
                let confirmed;
                if (window.Telegram && window.Telegram.WebApp) {
                    confirmed = await new Promise(resolve => {
                        Telegram.WebApp.showConfirm('Применить новый логотип для бота?', (result) => resolve(result));
                    });
                } else {
                    confirmed = confirm('Применить новый логотип для бота?');
                }

                if (confirmed) {
                    companyData.botLogoUrl = newBotLogoUrl;
                    // Здесь в реальном приложении нужно было бы отправить на сервер для обновления логотипа бота
                    if (window.Telegram && window.Telegram.WebApp) {
                        Telegram.WebApp.sendData(JSON.stringify({
                            type: 'update_bot_logo',
                            payload: { botLogoUrl: newBotLogoUrl }
                        }));
                        Telegram.WebApp.showAlert('Логотип бота обновлен.');
                    } else {
                        alert('Логотип бота обновлен (только в браузере).');
                    }
                }
            } else {
                if (window.Telegram && window.Telegram.WebApp) {
                    Telegram.WebApp.showAlert('Введите URL нового логотипа бота.');
                } else {
                    alert('Введите URL нового логотипа бота.');
                }
            }
        });

        addAdminNoteBtn.addEventListener('click', async () => {
            const newNote = newAdminNoteInput.value.trim();
            if (newNote) {
                let confirmed;
                if (window.Telegram && window.Telegram.WebApp) {
                    confirmed = await new Promise(resolve => {
                        Telegram.WebApp.showConfirm(`Добавить заметку "${newNote}"?`, (result) => resolve(result));
                    });
                } else {
                    confirmed = confirm(`Добавить заметку "${newNote}"?`);
                }

                if (confirmed) {
                    companyData.adminNotes.push(newNote);
                    updateAdminNotes(companyData.adminNotes);
                    newAdminNoteInput.value = '';
                    if (window.Telegram && window.Telegram.WebApp) {
                        Telegram.WebApp.sendData(JSON.stringify({
                            type: 'add_admin_note',
                            payload: { note: newNote }
                        }));
                        Telegram.WebApp.showAlert('Заметка добавлена.');
                    } else {
                        alert('Заметка добавлена (только в браузере).');
                    }
                }
            } else {
                if (window.Telegram && window.Telegram.WebApp) {
                    Telegram.WebApp.showAlert('Введите текст заметки.');
                } else {
                    alert('Введите текст заметки.');
                }
            }
        });

        clearAdminNotesBtn.addEventListener('click', async () => {
            let confirmed;
            if (window.Telegram && window.Telegram.WebApp) {
                confirmed = await new Promise(resolve => {
                    Telegram.WebApp.showConfirm('Вы уверены, что хотите удалить все заметки для админов?', (result) => resolve(result));
                });
            } else {
                confirmed = confirm('Вы уверены, что хотите удалить все заметки для админов?');
            }

            if (confirmed) {
                updateAdminNotes([]);
                if (window.Telegram && window.Telegram.WebApp) {
                    Telegram.WebApp.sendData(JSON.stringify({
                        type: 'clear_admin_notes'
                    }));
                    Telegram.WebApp.showAlert('Все заметки удалены.');
                } else {
                    alert('Все заметки удалены (только в браузере).');
                }
            }
        });
    }

    // Toggle Dark Mode
    document.getElementById('toggle-dark-mode').addEventListener('click', () => {
        companyData.darkMode = !companyData.darkMode;
        document.body.classList.toggle('dark-mode', companyData.darkMode);
        if (window.Telegram && window.Telegram.WebApp) {
            Telegram.WebApp.sendData(JSON.stringify({
                type: 'toggle_dark_mode',
                payload: { darkMode: companyData.darkMode }
            }));
            Telegram.WebApp.showAlert(`Темный режим ${companyData.darkMode ? 'включен' : 'выключен'}.`);
        } else {
            alert(`Темный режим ${companyData.darkMode ? 'включен' : 'выключен'}.`);
        }
    });

    // Create Section / Sub-section
    createSectionBtn.addEventListener('click', () => {
        newModalTitle.textContent = 'Создать новый раздел';
        newSectionNameInput.value = '';
        showModal(newSectionModal);
        confirmNewSectionBtn.onclick = async () => {
            const sectionName = newSectionNameInput.value.trim();
            if (sectionName) {
                createSection(sectionName, null); // Создаем корневой раздел
                hideModal(newSectionModal);
            } else {
                if (window.Telegram && window.Telegram.WebApp) {
                    Telegram.WebApp.showAlert('Пожалуйста, введите название раздела.');
                } else {
                    alert('Пожалуйста, введите название раздела.');
                }
            }
        };
    });

    createSubSectionBtn.addEventListener('click', () => {
        newModalTitle.textContent = 'Создать новый подраздел';
        newSectionNameInput.value = '';
        showModal(newSectionModal);
        confirmNewSectionBtn.onclick = async () => {
            const subSectionName = newSectionNameInput.value.trim();
            if (subSectionName) {
                createSection(subSectionName, currentSectionId); // Создаем подраздел
                hideModal(newSectionModal);
            } else {
                if (window.Telegram && window.Telegram.WebApp) {
                    Telegram.WebApp.showAlert('Пожалуйста, введите название подраздела.');
                } else {
                    alert('Пожалуйста, введите название подраздела.');
                }
            }
        };
    });

    // Create Item
    createItemBtn.addEventListener('click', () => {
        newModalTitle.textContent = 'Добавить новую позицию';
        newSectionNameInput.value = '';
        // Вместо newSectionNameInput используем модальное окно редактирования для создания позиции
        // или создадим новое модальное окно для создания позиции с полями quantity/minQuantity.
        // Для простоты, пока используем editModal.
        editModalTitle.textContent = 'Добавить новую позицию';
        editNameInput.value = '';
        editQuantityInput.value = 1;
        editMinQuantityInput.value = 0;
        editItemFields.style.display = 'block';
        showModal(editModal);

        confirmEditBtn.onclick = async () => {
            const itemName = editNameInput.value.trim();
            const itemQuantity = parseInt(editQuantityInput.value);
            const itemMinQuantity = parseInt(editMinQuantityInput.value);

            if (itemName && !isNaN(itemQuantity) && itemQuantity >= 0 && !isNaN(itemMinQuantity) && itemMinQuantity >= 0) {
                createItem(itemName, currentSectionId, itemQuantity, itemMinQuantity);
                hideModal(editModal);
            } else {
                if (window.Telegram && window.Telegram.WebApp) {
                    Telegram.WebApp.showAlert('Пожалуйста, введите корректные данные (название и неотрицательные числа).');
                } else {
                    alert('Пожалуйста, введите корректные данные (название и неотрицательные числа).');
                }
            }
        };
    });

    // Cancel buttons for modals
    cancelNewSectionBtn.addEventListener('click', () => hideModal(newSectionModal));
    cancelEditBtn.addEventListener('click', () => hideModal(editModal));
    cancelQuantityBtn.addEventListener('click', () => hideModal(quantityModal));
    cancelRecipientsBtn.addEventListener('click', () => hideModal(recipientsModal));
    closeTaskStatusModalBtn.addEventListener('click', () => hideModal(taskStatusModal));
    cancelCreateTaskBtn.addEventListener('click', () => hideModal(createTaskModal));

    // Quantity Modal buttons
    addQuantityBtn.addEventListener('click', async () => {
        const value = parseInt(quantityInput.value);
        if (!isNaN(value) && value > 0) {
            await updateItemQuantity(currentItem.id, value);
        } else {
            if (window.Telegram && window.Telegram.WebApp) {
                Telegram.WebApp.showAlert('Введите корректное положительное число.');
            } else {
                alert('Введите корректное положительное число.');
            }
        }
    });

    subtractQuantityBtn.addEventListener('click', async () => {
        const value = parseInt(quantityInput.value);
        if (!isNaN(value) && value > 0) {
            await updateItemQuantity(currentItem.id, -value);
        } else {
            if (window.Telegram && window.Telegram.WebApp) {
                Telegram.WebApp.showAlert('Введите корректное положительное число.');
            } else {
                alert('Введите корректное положительное число.');
            }
        }
    });

    // Recipients Modal filter tabs
    recipientFilterTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            recipientFilterTabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            renderUsersForSelection(this.dataset.filter);
        });
    });

    // Recipients Modal confirm button
    confirmRecipientsBtn.addEventListener('click', () => {
        if (currentContextMenuType === 'item') {
            const item = allItems.find(i => i.id === currentContextMenuTargetId);
            if (item) {
                // Определяем действие по пункту контекстного меню, который вызвал модалку
                // Это упрощенная логика, в реальном приложении нужно передавать действие через параметр
                // Например, `currentContextMenuAction`
                const action = contextMenu.querySelector('.context-menu-item.active-context-action')?.dataset.action; // Нужно добавить класс active-context-action при показе меню
                applyRecipientsChanges(action || 'remind'); // По умолчанию напоминание
            }
        } else if (currentContextMenuType === 'section') {
            const section = allSections.find(s => s.id === currentContextMenuTargetId);
            if (section) {
                const action = contextMenu.querySelector('.context-menu-item.active-context-action')?.dataset.action;
                applyRecipientsChanges(action || 'remind');
            }
        }
    });

    // Context Menu item click handlers
    contextMenuItems.forEach(item => {
        item.addEventListener('click', () => {
            const action = item.dataset.action;
            let targetElement;
            if (currentContextMenuType === 'section') {
                targetElement = allSections.find(s => s.id === currentContextMenuTargetId);
            } else if (currentContextMenuType === 'item') {
                targetElement = allItems.find(i => i.id === currentContextMenuTargetId);
            }

            if (!targetElement) {
                hideContextMenu();
                return;
            }

            // Добавляем класс, чтобы знать, какое действие вызвало модалку получателей
            contextMenuItems.forEach(i => i.classList.remove('active-context-action'));
            item.classList.add('active-context-action');

            switch (action) {
                case 'edit':
                    if (currentContextMenuType === 'section') {
                        editSection(targetElement.id, targetElement.name);
                    } else if (currentContextMenuType === 'item') {
                        editItem(targetElement.id, targetElement.name, targetElement.quantity, targetElement.minQuantity);
                    }
                    break;
                case 'add-subtract':
                    if (currentContextMenuType === 'item') {
                        showQuantityModal(targetElement);
                    }
                    break;
                case 'min-quantity':
                    if (currentContextMenuType === 'item') {
                        showRecipientsModal(targetElement.id, 'item', targetElement.recipients, targetElement.hiddenFor);
                    }
                    break;
                case 'remind':
                    showRecipientsModal(targetElement.id, currentContextMenuType, targetElement.recipients, targetElement.hiddenFor);
                    break;
                case 'hide-from':
                    showRecipientsModal(targetElement.id, currentContextMenuType, targetElement.recipients, targetElement.hiddenFor); // Use hiddenFor array
                    break;
                case 'delete':
                    if (currentContextMenuType === 'section') {
                        deleteSection(targetElement.id);
                    } else if (currentContextMenuType === 'item') {
                        deleteItem(targetElement.id);
                    }
                    break;
            }
            hideContextMenu();
        });
    });

    // Task filter tabs
    taskFilterTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            taskFilterTabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            renderTasks(this.dataset.filter);
        });
    });

    // Task Status Modal buttons
    taskStatusOptionButtons.forEach(button => {
        button.addEventListener('click', () => {
            if (currentTaskForStatusChange) {
                updateTaskStatus(currentTaskForStatusChange.id, button.dataset.status);
            }
        });
    });

    // Create Task Button and Modal
    createTaskBtn.addEventListener('click', () => {
        taskTitleInput.value = '';
        taskDescriptionInput.value = '';
        taskAssignedToSelect.innerHTML = '<option value="">Назначить (необязательно)</option>';

        // Добавляем всех пользователей в список для назначения
        allUsers.forEach(user => {
            const option = document.createElement('option');
            option.value = user.id;
            option.textContent = user.name;
            taskAssignedToSelect.appendChild(option);
        });
        showModal(createTaskModal);
    });

    confirmCreateTaskBtn.addEventListener('click', async () => {
        const title = taskTitleInput.value.trim();
        const description = taskDescriptionInput.value.trim();
        const assignedTo = taskAssignedToSelect.value || 'unassigned'; // Если не выбрано, то 'unassigned'

        if (!title) {
            if (window.Telegram && window.Telegram.WebApp) {
                Telegram.WebApp.showAlert('Пожалуйста, введите название задачи.');
            } else {
                alert('Пожалуйста, введите название задачи.');
            }
            return;
        }

        let confirmed;
        if (window.Telegram && window.Telegram.WebApp) {
            confirmed = await new Promise(resolve => {
                Telegram.WebApp.showConfirm(`Создать задачу "${title}"?`, (result) => resolve(result));
            });
        } else {
            confirmed = confirm(`Создать задачу "${title}"?`);
        }

        if (confirmed) {
            const newTask = {
                id: generateUniqueId(),
                title: title,
                description: description,
                assignedTo: assignedTo,
                status: 'Новая'
            };
            allTasks.push(newTask);
            renderTasks(document.querySelector('#tasks-page .filter-tab.active')?.dataset.filter || 'all');
            hideModal(createTaskModal);

            if (window.Telegram && window.Telegram.WebApp) {
                Telegram.WebApp.sendData(JSON.stringify({
                    type: 'create_task',
                    payload: newTask
                }));
                Telegram.WebApp.showAlert(`Задача "${title}" создана.`);
            } else {
                alert(`Задача "${title}" создана (только в браузере).`);
            }
        } else {
            if (window.Telegram && window.Telegram.WebApp) {
                Telegram.WebApp.HapticFeedback.notificationOccurred('light');
            }
        }
    });

    // Initial setup
    updateCompanyInfo();
    updateAdminNotes(companyData.adminNotes);
    renderSections(null); // Load main sections
    renderTasks('all'); // Load all tasks initially

    // Set admin panel visibility
    if (isAdmin) { // Проверяем, является ли текущий пользователь админом
        adminControlsPanel.style.display = 'flex';
        createSectionBtn.style.display = 'block';
        if (isMainAdmin) {
            downloadReportsBtn.style.display = 'block';
            filterAdminsTab.style.display = 'block'; // Показываем вкладку "Админы" только главному админу
        } else {
            downloadReportsBtn.style.display = 'none';
            filterAdminsTab.style.display = 'none';
        }
        createTaskBtn.style.display = 'block'; // Кнопка "Создать задачу" видна только админам
    } else {
        adminControlsPanel.style.display = 'none';
        createSectionBtn.style.display = 'none';
        downloadReportsBtn.style.display = 'none';
        createSubSectionBtn.style.display = 'none';
        createItemBtn.style.display = 'none';
        createTaskBtn.style.display = 'none';
        filterAdminsTab.style.display = 'none';
    }


    // Initialize Telegram Web App
    if (window.Telegram && window.Telegram.WebApp) {
        Telegram.WebApp.ready();
        Telegram.WebApp.expand(); // Разворачиваем приложение на весь экран

        // Пример получения данных из Telegram (можно расширить для получения user_id, role и т.д.)
        const initData = Telegram.WebApp.initDataUnsafe;
        if (initData && initData.user) {
            // В реальном приложении здесь нужно было бы обновить currentUserId и currentUserRole
            // Например: currentUserId = initData.user.id.toString();
            // Получить роль с сервера по initData.user.id
            // const userFromTelegram = allUsers.find(u => u.id === initData.user.id.toString());
            // if (userFromTelegram) {
            //     currentUserId = userFromTelegram.id;
            //     currentUserRole = userFromTelegram.role;
            // }
            // console.log('Telegram User:', initData.user);
        }

        // Подтверждение закрытия Web App
        Telegram.WebApp.onEvent('mainButtonClicked', () => {
            Telegram.WebApp.showConfirm('Вы уверены, что хотите закрыть приложение?', (confirmed) => {
                if (confirmed) {
                    Telegram.WebApp.close();
                }
            });
        });

        Telegram.WebApp.setHeaderColor('#ffffff'); // Пример цвета шапки
        Telegram.WebApp.setBackgroundColor('#f8f9fa'); // Пример цвета фона
    }
});