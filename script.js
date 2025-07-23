document.addEventListener('DOMContentLoaded', () => {
    // Инициализация Telegram Web App
    if (window.Telegram && window.Telegram.WebApp) {
        Telegram.WebApp.ready();
        Telegram.WebApp.expand();
        // Устанавливаем тему по умолчанию из Telegram
        document.body.classList.add(Telegram.WebApp.colorScheme + '-mode');
        // Обновляем тему при изменении в Telegram
        Telegram.WebApp.onEvent('themeChanged', () => {
            document.body.classList.remove('light-mode', 'dark-mode');
            document.body.classList.add(Telegram.WebApp.colorScheme + '-mode');
            localStorage.setItem('theme', Telegram.WebApp.colorScheme);
            themeToggle.checked = Telegram.WebApp.colorScheme === 'dark';
        });

        // Запрашиваем начальные данные при старте (включая разделы, заметки, задачи, роль пользователя)
        Telegram.WebApp.sendData(JSON.stringify({ command: 'request_initial_data' }));

        Telegram.WebApp.onEvent('web_app_data', (event) => {
            const data = JSON.parse(event.data);
            if (data.type === 'initial_data') {
                if (data.sections) {
                    allSections = data.sections;
                    renderSections();
                }
                if (data.notes) {
                    allNotes = data.notes;
                    renderNotes();
                }
                if (data.tasks) {
                    allTasks = data.tasks;
                    renderTasks(document.querySelector('#tasks-page .filter-tab.active')?.dataset.filter || 'all');
                }
                if (data.users) {
                    allUsers = data.users;
                }
                if (data.currentUserId) {
                    currentUserId = data.currentUserId;
                }
                if (data.currentUserRole) { // Бот должен передать роль текущего пользователя
                    currentUserRole = data.currentUserRole;
                }
                updateAdminUIVisibility(); // Вызываем эту функцию после получения роли
            } else if (data.type === 'sections_updated' && Array.isArray(data.sections)) {
                allSections = data.sections;
                renderSections();
            } else if (data.type === 'notes_updated' && Array.isArray(data.notes)) {
                allNotes = data.notes;
                renderNotes();
            } else if (data.type === 'tasks_updated' && Array.isArray(data.tasks)) {
                allTasks = data.tasks;
                renderTasks(document.querySelector('#tasks-page .filter-tab.active')?.dataset.filter || 'all');
            } else if (data.type === 'users_updated' && Array.isArray(data.users)) {
                allUsers = data.users; // Обновляем список пользователей
                if (userManagementModal.style.display === 'flex') { // Если модалка открыта, перерисовываем
                    const activeTab = userManagementModal.querySelector('.filter-tab.active');
                    const filter = activeTab ? activeTab.dataset.filter : 'all';
                    renderUsersForUserManagement(filter);
                }
                if (notificationRecipientsModal.style.display === 'flex') { // Если модалка получателей открыта
                    const activeTab = notificationRecipientsModal.querySelector('.filter-tab.active');
                    const filter = activeTab ? activeTab.dataset.filter : 'all';
                    renderRecipientsList(allUsers, currentRecipients); // Перерисовываем список получателей
                }
                if (taskModal.style.display === 'flex') { // Если модалка задач открыта
                    populateUserSelect(taskAssignedToSelect); // Обновляем список пользователей для назначения задачи
                }
                if (sectionSettingsModal.style.display === 'flex') { // Если модалка настроек раздела открыта
                    populateUserSelect(stockManagerSelect); // Обновляем список пользователей для менеджера остатков
                }
            }
        });
    } else {
        // Режим отладки в браузере
        console.log("Running in browser mode (not Telegram Web App)");
        document.querySelector('.admin-test-controls').style.display = 'flex'; // Показываем блок для отладки
        
        // Имитация начальных данных для браузерного тестирования
        allSections = JSON.parse(localStorage.getItem('sections')) || [
            { id: 'sec_1', name: 'Склад А', items: [{id: 'item_1', name: 'Ручки', quantity: 50, minQuantity: 10}], isHidden: false, hiddenFromUsers: [], notificationRecipients: [], criticalMinRecipients: [], stockManagerId: null },
            { id: 'sec_2', name: 'Офис Б', items: [{id: 'item_2', name: 'Бумага А4', quantity: 10, minQuantity: 5}], isHidden: false, hiddenFromUsers: [], notificationRecipients: [], criticalMinRecipients: [], stockManagerId: null }
        ];
        allNotes = JSON.parse(localStorage.getItem('notes')) || [
            { id: 'note_1', title: 'Важное объявление', content: 'Совещание в пятницу в 10:00.' },
            { id: 'note_2', title: 'График отпусков', content: 'Просьба согласовать отпуска до конца месяца.' }
        ];
        allTasks = JSON.parse(localStorage.getItem('tasks')) || [
            { id: 'task_1', title: 'Заказать канцтовары', description: 'Заказать ручки, бумагу и блокноты.', assignedTo: '123456789', status: 'Новая' },
            { id: 'task_2', title: 'Проверить инвентаризацию', description: 'Сверить фактическое наличие с данными в системе.', assignedTo: '987654321', status: 'В работе' },
            { id: 'task_3', title: 'Организовать корпоратив', description: 'Выбрать место и меню.', assignedTo: null, status: 'Новая' }
        ];
        allUsers = JSON.parse(localStorage.getItem('users')) || [
            { id: '123456789', name: 'Иван Иванов', role: 'employee' }, 
            { id: '987654321', name: 'Петр Петров', role: 'main_admin' }, // Главный админ
            { id: '112233445', name: 'Анна Сидорова', role: 'employee' },
            { id: '556677889', name: 'Мария Кузнецова', role: 'junior_admin' }, // Младший админ
            { id: '998877665', name: 'Дмитрий Смирнов', role: 'employee' }
        ];
        currentUserId = '987654321'; // Пример ID админа для тестирования
        currentUserRole = 'main_admin'; // 'main_admin', 'junior_admin', 'employee'

        renderSections();
        renderNotes();
        renderTasks('all'); // Рендерим все задачи по умолчанию
        updateAdminUIVisibility();
    }

    // --- Элементы DOM ---
    const appContainer = document.getElementById('app-container');
    const headerTitle = document.getElementById('header-title');
    const navItems = document.querySelectorAll('.nav-item');
    const pages = document.querySelectorAll('.page');

    // Главная страница
    const mainPage = document.getElementById('main-page');
    const createSectionBtn = document.getElementById('create-section-btn');
    const createNoteBtn = document.getElementById('create-note-btn');
    const sectionsContainer = document.getElementById('sections-container');
    const notesContainer = document.getElementById('notes-container');
    const downloadReportsBtn = document.getElementById('download-reports-btn');

    // Страница разделов
    const sectionsPage = document.getElementById('sections-page');
    const sectionsList = document.getElementById('sections-list');
    const noSectionsMessage = document.getElementById('no-sections-message');

    // Страница задач
    const tasksPage = document.getElementById('tasks-page');
    const taskFilterTabs = document.querySelector('.task-filter-tabs');
    const createTaskBtn = document.getElementById('create-task-btn');
    const tasksList = document.getElementById('tasks-list');
    const noTasksMessage = document.getElementById('no-tasks-message');

    // Модальное окно создания/редактирования раздела
    const sectionSettingsModal = document.getElementById('section-settings-modal');
    const sectionSettingsTitle = document.getElementById('section-settings-title');
    const sectionNameInput = document.getElementById('section-name-input');
    const saveSectionSettingsBtn = document.getElementById('save-section-settings-btn');
    const cancelSectionSettingsBtn = document.getElementById('cancel-section-settings-btn');
    const stockManagerSelect = document.getElementById('stock-manager-select'); // НОВОЕ

    // Модальное окно деталей раздела
    const sectionDetailModal = document.getElementById('section-detail-modal');
    const sectionDetailTitle = document.getElementById('section-detail-title');
    const sectionItemsList = document.getElementById('section-items-list');
    const noItemsMessage = document.getElementById('no-items-message');
    const addItemsBtn = document.getElementById('add-items-btn');
    const subtractItemsBtn = document.getElementById('subtract-items-btn');
    const closeSectionDetailModalBtn = document.getElementById('close-section-detail-modal-btn');

    // Модальное окно добавления/списания товаров
    const itemQuantityModal = document.getElementById('item-quantity-modal');
    const itemQuantityTitle = document.getElementById('item-quantity-title');
    const itemNameInput = document.getElementById('item-name-input');
    const itemQuantityInput = document.getElementById('item-quantity-input');
    const confirmItemQuantityBtn = document.getElementById('confirm-item-quantity-btn');
    const cancelItemQuantityBtn = document = document.getElementById('cancel-item-quantity-btn');

    // Модальное окно редактирования товара
    const editItemModal = document.getElementById('edit-item-modal');
    const editItemNameInput = document.getElementById('edit-item-name-input');
    const editItemQuantityInput = document.getElementById('edit-item-quantity-input');
    const editItemMinInput = document.getElementById('edit-item-min-input');
    const saveItemChangesBtn = document.getElementById('save-item-changes-btn');
    const deleteItemBtn = document.getElementById('delete-item-btn');
    const cancelEditItemBtn = document.getElementById('cancel-edit-item-btn');

    // Модальное окно заметок
    const noteModal = document.getElementById('note-modal');
    const noteModalTitle = document.getElementById('note-modal-title');
    const noteTitleInput = document.getElementById('note-title-input');
    const noteContentInput = document.getElementById('note-content-input');
    const saveNoteBtn = document.getElementById('save-note-btn');
    const cancelNoteBtn = document.getElementById('cancel-note-btn');

    // Модальное окно задач
    const taskModal = document.getElementById('task-modal');
    const taskModalTitle = document.getElementById('task-modal-title');
    const taskTitleInput = document.getElementById('task-title-input');
    const taskDescriptionInput = document.getElementById('task-description-input');
    const taskAssignedToSelect = document.getElementById('task-assigned-to-select');
    const saveTaskBtn = document.getElementById('save-task-btn');
    const cancelTaskBtn = document.getElementById('cancel-task-btn');

    // Модальное окно выбора получателей оповещений
    const notificationRecipientsModal = document.getElementById('notification-recipients-modal');
    const recipientsModalTitle = document.getElementById('recipients-modal-title');
    const recipientFilterTabs = notificationRecipientsModal.querySelector('.recipient-filter-tabs');
    const selectAllRecipientsCheckbox = document.getElementById('select-all-recipients');
    const recipientList = document.getElementById('recipients-list-container');
    const saveRecipientsBtn = document.getElementById('save-recipients-btn');
    const cancelRecipientsBtn = document.getElementById('cancel-recipients-btn');

    // Модальное окно статусов задач
    const taskStatusModal = document.getElementById('task-status-modal');
    const taskStatusOptionButtons = document.querySelectorAll('.task-status-option-button[data-status]');
    const closeTaskStatusModalBtn = document.getElementById('close-task-status-modal');

    // Элементы главного админа
    const mainAdminControls = document.getElementById('main-admin-controls');
    const manageUsersBtn = document.getElementById('manage-users-btn');
    const userManagementModal = document.getElementById('user-management-modal');
    const manageUsersList = document.getElementById('manage-users-list');
    const selectAllManageUsersCheckbox = document.getElementById('select-all-manage-users');
    const assignRoleBtn = document.getElementById('assign-role-btn');
    const removeUserBtn = document.getElementById('remove-user-btn');
    const cancelUserManagementBtn = document.getElementById('cancel-user-management-btn');
    const subscribeBtn = document.getElementById('subscribe-btn');


    // Тестовые кнопки для браузерного режима
    const addTestDataBtn = document.getElementById('add-test-data-btn');
    const clearAllDataBtn = document.getElementById('clear-all-data-btn');
    const toggleAdminModeBtn = document.getElementById('toggle-admin-mode-btn');

    // --- Переменные состояния ---
    let currentSectionId = null;
    let currentSectionName = '';
    let currentItemAction = ''; // 'add' или 'subtract' или 'edit'
    let currentItemId = null;
    let currentNoteId = null;
    let currentTaskId = null;
    let currentRecipientsType = ''; // 'notifications' или 'critical_minimum'
    let currentRecipients = []; // Список ID пользователей для текущего выбора получателей
    let currentTaskForStatusChange = null; // Для хранения ID задачи, для которой открыто меню

    // Имитация текущего пользователя (для фильтрации "Мои задачи")
    // В реальном приложении этот ID будет приходить от Telegram Web App
    let currentUserId = '123456789'; 
    let currentUserRole = 'employee'; // 'main_admin', 'junior_admin', 'employee'

    // Данные приложения (в реальном приложении будут приходить от бота)
    let allSections = [];
    let allNotes = [];
    let allTasks = [];
    let allUsers = [];

    // --- Функции для работы с данными (имитация API) ---
    function saveData(key, data) {
        localStorage.setItem(key, JSON.stringify(data));
        // В реальном приложении здесь будет отправка данных боту
        if (window.Telegram && window.Telegram.WebApp) {
            // Telegram.WebApp.sendData(JSON.stringify({ type: 'update', key: key, data: data }));
        }
    }

    function generateUniqueId(prefix) {
        return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    // --- Управление видимостью UI в зависимости от роли ---
    function updateAdminUIVisibility() {
        // Тестовые элементы админ-контроля всегда видны в браузере для дебага
        if (!(window.Telegram && window.Telegram.WebApp)) {
             document.querySelector('.admin-test-controls').style.display = 'flex'; // Показываем блок для отладки
        } else {
            // В реальном Web App скрываем этот блок, если пользователь не админ
            document.querySelector('.admin-test-controls').style.display = 'none'; // По умолчанию скрываем
        }

        // Блок для главного админа
        if (currentUserRole === 'main_admin') {
            mainAdminControls.style.display = 'flex';
        } else {
            mainAdminControls.style.display = 'none';
        }

        // Кнопка создания раздела доступна для младших и главных админов
        if (currentUserRole === 'main_admin' || currentUserRole === 'junior_admin') {
            createSectionBtn.style.display = 'inline-block';
        } else {
            createSectionBtn.style.display = 'none';
        }

        // Кнопка создания заметки
        if (currentUserRole === 'main_admin' || currentUserRole === 'junior_admin') {
            createNoteBtn.style.display = 'inline-block';
        } else {
            createNoteBtn.style.display = 'none';
        }

        // Кнопка создания задания
        if (currentUserRole === 'main_admin' || currentUserRole === 'junior_admin') {
            createTaskBtn.style.display = 'inline-block';
        } else {
            createTaskBtn.style.display = 'none';
        }

        // Кнопка скачивания отчетов
        if (currentUserRole === 'main_admin' || currentUserRole === 'junior_admin') {
            downloadReportsBtn.style.display = 'block';
        } else {
            downloadReportsBtn.style.display = 'none';
        }

        // Кнопки редактирования/удаления разделов и заметок
        // Их видимость будет управляться в renderSections и renderNotes
    }


    // --- Управление страницами ---
    function showPage(pageId) {
        pages.forEach(page => page.classList.remove('active'));
        navItems.forEach(item => item.classList.remove('active'));

        document.getElementById(pageId).classList.add('active');
        document.querySelector(`.nav-item[data-page="${pageId}"]`).classList.add('active');

        // Обновляем заголовок
        switch (pageId) {
            case 'main-page':
                headerTitle.textContent = 'Главная';
                break;
            case 'sections-page':
                headerTitle.textContent = 'Разделы';
                renderSections(true); // Принудительный ререндер для секции
                break;
            case 'tasks-page':
                headerTitle.textContent = 'Задачи';
                renderTasks(document.querySelector('#tasks-page .filter-tab.active')?.dataset.filter || 'all');
                break;
            default:
                headerTitle.textContent = 'WMS Web App';
        }
        if (window.Telegram && window.Telegram.WebApp) {
            Telegram.WebApp.HapticFeedback.selectionChanged();
        }
    }

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            showPage(item.dataset.page);
        });
    });

    // --- Управление модальными окнами ---
    function showModal(modalElement) {
        document.body.classList.add('modal-open');
        modalElement.classList.remove('hidden');
        modalElement.style.display = 'flex';
        // Остановка распространения события клика на контент модального окна
        modalElement.querySelector('.modal-content').addEventListener('click', (e) => e.stopPropagation());
    }

    function hideModal(modalElement) {
        document.body.classList.remove('modal-open');
        modalElement.classList.add('hidden');
        setTimeout(() => {
            modalElement.style.display = 'none';
        }, 300); // Соответствует времени перехода в CSS
    }

    // Закрытие модального окна по клику вне контента
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                hideModal(modal);
                if (window.Telegram && window.Telegram.WebApp) {
                    Telegram.WebApp.HapticFeedback.impactOccurred('light');
                }
            }
        });
    });


    // --- Функции для работы с разделами ---
    function renderSections(isSectionsPage = false) {
        const targetContainer = isSectionsPage ? sectionsList : sectionsContainer;
        targetContainer.innerHTML = '';
        const visibleSections = allSections.filter(section => {
            // Если секция скрыта глобально или скрыта от текущего пользователя
            return !section.isHidden && !section.hiddenFromUsers.includes(currentUserId);
        });

        if (visibleSections.length === 0) {
            (isSectionsPage ? noSectionsMessage : null)?.style.display = 'block';
        } else {
            (isSectionsPage ? noSectionsMessage : null)?.style.display = 'none';
            visibleSections.forEach(section => {
                const sectionItem = document.createElement('div');
                sectionItem.classList.add('section-item');
                sectionItem.dataset.id = section.id;

                let itemCount = 0;
                let criticalCount = 0;
                if (section.items) {
                    itemCount = section.items.length;
                    criticalCount = section.items.filter(item => item.quantity <= item.minQuantity).length;
                }

                sectionItem.innerHTML = `
                    <div class="section-title">${section.name}</div>
                    <div class="section-item-info">
                        Товаров: ${itemCount}
                        ${criticalCount > 0 ? `<span style="color: var(--error-color);"> (Критический минимум: ${criticalCount})</span>` : ''}
                    </div>
                `;

                // Кнопки управления разделом (только для админов)
                if (currentUserRole === 'main_admin' || currentUserRole === 'junior_admin') {
                    const controlsHtml = `
                        <div class="section-controls" style="position: absolute; top: 10px; right: 10px;">
                            <i class="fas fa-cog edit-section-btn" data-id="${section.id}" style="cursor: pointer; margin-right: 10px; color: var(--secondary-text-color);"></i>
                            <i class="fas fa-eye-slash hide-section-btn" data-id="${section.id}" style="cursor: pointer; margin-right: 10px; color: var(--secondary-text-color);"></i>
                            <i class="fas fa-bell notify-section-btn" data-id="${section.id}" style="cursor: pointer; margin-right: 10px; color: var(--secondary-text-color);"></i>
                            <i class="fas fa-trash-alt delete-section-btn" data-id="${section.id}" style="cursor: pointer; color: var(--error-color);"></i>
                        </div>
                    `;
                    sectionItem.insertAdjacentHTML('beforeend', controlsHtml);
                }

                sectionItem.addEventListener('click', (e) => {
                    // Проверяем, был ли клик по иконке управления разделом
                    if (e.target.closest('.section-controls')) {
                        return; // Не открываем детали, если кликнули на кнопку управления
                    }

                    if (window.Telegram && window.Telegram.WebApp) {
                        Telegram.WebApp.HapticFeedback.impactOccurred('light');
                    }
                    currentSectionId = section.id;
                    currentSectionName = section.name;

                    // Проверка прав на редактирование остатков
                    // Если текущий пользователь - главный админ ИЛИ младший админ ИЛИ (обычный сотрудник И его ID совпадает с stockManagerId раздела)
                    const canEditStock = currentUserRole === 'main_admin' || 
                                        currentUserRole === 'junior_admin' ||
                                        (currentUserRole === 'employee' && section.stockManagerId === currentUserId);

                    showSectionDetailModal(canEditStock);
                });

                // Обработчики для кнопок управления разделом
                if (currentUserRole === 'main_admin' || currentUserRole === 'junior_admin') {
                    sectionItem.querySelector('.edit-section-btn')?.addEventListener('click', (e) => {
                        e.stopPropagation(); // Предотвращаем срабатывание обработчика sectionItem
                        if (window.Telegram && window.Telegram.WebApp) {
                            Telegram.WebApp.HapticFeedback.impactOccurred('medium');
                        }
                        const id = e.target.dataset.id;
                        currentSectionId = id;
                        showSectionSettingsModal(id);
                    });

                    sectionItem.querySelector('.hide-section-btn')?.addEventListener('click', (e) => {
                        e.stopPropagation();
                        if (window.Telegram && window.Telegram.WebApp) {
                            Telegram.WebApp.HapticFeedback.impactOccurred('medium');
                        }
                        const id = e.target.dataset.id;
                        currentSectionId = id; // Устанавливаем текущий раздел
                        currentRecipientsType = 'hidden_from_users';
                        showNotificationRecipientsModal(id, 'Выберите пользователей, от которых скрыть раздел', allSections.find(s => s.id === id)?.hiddenFromUsers || []);
                    });

                    sectionItem.querySelector('.notify-section-btn')?.addEventListener('click', (e) => {
                        e.stopPropagation();
                        if (window.Telegram && window.Telegram.WebApp) {
                            Telegram.WebApp.HapticFeedback.impactOccurred('medium');
                        }
                        const id = e.target.dataset.id;
                        currentSectionId = id; // Устанавливаем текущий раздел

                        // Создаем контекстное меню или модальное окно для выбора типа уведомления
                        // Для простоты, пока будем показывать модалку для обычных уведомлений
                        // В реальном приложении здесь может быть меню с "Оповещения" и "Критический минимум"
                        if (window.Telegram && window.Telegram.WebApp) {
                            Telegram.WebApp.showConfirm('Какой тип оповещения настроить?\n\n- Да: Оповещения об изменениях\n- Нет: Оповещения о критическом минимуме', (confirmed) => {
                                if (confirmed) {
                                    currentRecipientsType = 'notifications';
                                    showNotificationRecipientsModal(id, 'Получатели оповещений об изменениях', allSections.find(s => s.id === id)?.notificationRecipients || []);
                                } else {
                                    currentRecipientsType = 'critical_minimum';
                                    showNotificationRecipientsModal(id, 'Получатели оповещений о критическом минимуме', allSections.find(s => s.id === id)?.criticalMinRecipients || []);
                                }
                            });
                        } else {
                            const choice = prompt('Какой тип оповещения настроить? (1: Обычные, 2: Критический минимум)');
                            if (choice === '1') {
                                currentRecipientsType = 'notifications';
                                showNotificationRecipientsModal(id, 'Получатели оповещений об изменениях', allSections.find(s => s.id === id)?.notificationRecipients || []);
                            } else if (choice === '2') {
                                currentRecipientsType = 'critical_minimum';
                                showNotificationRecipientsModal(id, 'Получатели оповещений о критическом минимуме', allSections.find(s => s.id === id)?.criticalMinRecipients || []);
                            } else {
                                alert('Некорректный выбор.');
                            }
                        }
                    });

                    sectionItem.querySelector('.delete-section-btn')?.addEventListener('click', (e) => {
                        e.stopPropagation();
                        if (window.Telegram && window.Telegram.WebApp) {
                            Telegram.WebApp.HapticFeedback.notificationOccurred('warning');
                            Telegram.WebApp.showConfirm(`Вы уверены, что хотите удалить раздел "${section.name}"?`, (confirmed) => {
                                if (confirmed) {
                                    deleteSection(e.target.dataset.id);
                                    Telegram.WebApp.HapticFeedback.notificationOccurred('success');
                                } else {
                                    Telegram.WebApp.HapticFeedback.notificationOccurred('light');
                                }
                            });
                        } else {
                            if (confirm(`Вы уверены, что хотите удалить раздел "${section.name}"?`)) {
                                deleteSection(e.target.dataset.id);
                            }
                        }
                    });
                }

                targetContainer.appendChild(sectionItem);
            });
        }
        saveData('sections', allSections);
    }

    createSectionBtn.addEventListener('click', () => {
        if (window.Telegram && window.Telegram.WebApp) {
            Telegram.WebApp.HapticFeedback.impactOccurred('medium');
        }
        currentSectionId = null; // Для создания нового раздела
        showSectionSettingsModal();
    });

    function showSectionSettingsModal(sectionId = null) {
        sectionSettingsTitle.textContent = sectionId ? 'Редактировать раздел' : 'Новый раздел';
        currentSectionId = sectionId;
        const currentSection = sectionId ? allSections.find(s => s.id === sectionId) : null;

        // Заполняем список ответственных за остатки
        stockManagerSelect.innerHTML = '<option value="">Не назначен</option>'; // Опция по умолчанию
        allUsers.forEach(user => {
            const option = document.createElement('option');
            option.value = user.id;
            option.textContent = user.name;
            stockManagerSelect.appendChild(option);
        });

        if (currentSection) {
            sectionNameInput.value = currentSection.name;
            // Выбираем назначенного менеджера
            if (currentSection.stockManagerId) {
                stockManagerSelect.value = currentSection.stockManagerId;
            } else {
                stockManagerSelect.value = ''; // Сбрасываем выбор
            }
        } else {
            sectionNameInput.value = '';
            stockManagerSelect.value = '';
        }
        
        // Показываем/скрываем поле выбора менеджера остатков в зависимости от роли
        if (currentUserRole === 'main_admin' || currentUserRole === 'junior_admin') {
            stockManagerSelect.closest('label').style.display = 'block'; // Показываем label
            stockManagerSelect.style.display = 'block'; // Показываем select
        } else {
            stockManagerSelect.closest('label').style.display = 'none';
            stockManagerSelect.style.display = 'none';
        }

        showModal(sectionSettingsModal);
    }

    function hideSectionSettingsModal() {
        hideModal(sectionSettingsModal);
    }

    saveSectionSettingsBtn.addEventListener('click', () => {
        const sectionName = sectionNameInput.value.trim();
        const selectedStockManagerId = stockManagerSelect.value;
        if (!sectionName) {
            if (window.Telegram && window.Telegram.WebApp) {
                Telegram.WebApp.showAlert('Название раздела не может быть пустым!');
            } else {
                alert('Название раздела не может быть пустым!');
            }
            return;
        }

        if (currentSectionId) { // Редактирование существующего раздела
            const sectionIndex = allSections.findIndex(s => s.id === currentSectionId);
            if (sectionIndex !== -1) {
                allSections[sectionIndex].name = sectionName;
                allSections[sectionIndex].stockManagerId = selectedStockManagerId || null;
                // Все остальные настройки видимости и получателей оповещений будут обновлены через отдельные модальные окна
                
                if (window.Telegram && window.Telegram.WebApp) {
                    Telegram.WebApp.sendData(JSON.stringify({
                        type: 'update_section',
                        payload: {
                            id: currentSectionId,
                            name: sectionName,
                            stockManagerId: selectedStockManagerId || null
                        }
                    }));
                    Telegram.WebApp.showAlert('Раздел обновлен.');
                    Telegram.WebApp.HapticFeedback.notificationOccurred('success');
                } else {
                    alert('Раздел обновлен.');
                }
            }
        } else { // Создание нового раздела
            const newSection = {
                id: generateUniqueId('sec'),
                name: sectionName,
                items: [],
                isHidden: false,
                hiddenFromUsers: [],
                notificationRecipients: [],
                criticalMinRecipients: [],
                stockManagerId: selectedStockManagerId || null
            };
            allSections.push(newSection);
            if (window.Telegram && window.Telegram.WebApp) {
                Telegram.WebApp.sendData(JSON.stringify({
                    type: 'create_section',
                    payload: newSection
                }));
                Telegram.WebApp.showAlert('Раздел создан.');
                Telegram.WebApp.HapticFeedback.notificationOccurred('success');
            } else {
                alert('Раздел создан.');
            }
        }
        renderSections();
        hideSectionSettingsModal();
    });

    cancelSectionSettingsBtn.addEventListener('click', () => {
        hideSectionSettingsModal();
        if (window.Telegram && window.Telegram.WebApp) {
            Telegram.WebApp.HapticFeedback.impactOccurred('light');
        }
    });

    function deleteSection(id) {
        allSections = allSections.filter(section => section.id !== id);
        renderSections();
        if (window.Telegram && window.Telegram.WebApp) {
            Telegram.WebApp.sendData(JSON.stringify({
                type: 'delete_section',
                payload: { id: id }
            }));
        }
    }


    // --- Функции для работы с элементами раздела (товарами) ---
    function showSectionDetailModal(canEdit) {
        const section = allSections.find(s => s.id === currentSectionId);
        if (!section) {
            if (window.Telegram && window.Telegram.WebApp) {
                Telegram.WebApp.showAlert('Раздел не найден.');
            } else {
                alert('Раздел не найден.');
            }
            return;
        }
        sectionDetailTitle.textContent = section.name;
        sectionItemsList.innerHTML = '';

        if (section.items.length === 0) {
            noItemsMessage.style.display = 'block';
        } else {
            noItemsMessage.style.display = 'none';
            section.items.forEach(item => {
                const itemDiv = document.createElement('div');
                itemDiv.classList.add('item-detail');
                
                let quantityClass = '';
                if (item.quantity <= item.minQuantity) {
                    quantityClass = 'critical-quantity'; // Красный или предупреждающий цвет
                }

                itemDiv.innerHTML = `
                    <span>${item.name}: <span class="${quantityClass}">${item.quantity} шт.</span></span>
                    <div class="item-detail-actions">
                        ${canEdit ? `<button class="edit-item-action-btn" data-item-id="${item.id}"><i class="fas fa-edit"></i></button>` : ''}
                        ${canEdit ? `<button class="delete-item-action-btn" data-item-id="${item.id}"><i class="fas fa-trash-alt" style="color: var(--error-color);"></i></button>` : ''}
                    </div>
                `;
                sectionItemsList.appendChild(itemDiv);

                itemDiv.querySelector('.edit-item-action-btn')?.addEventListener('click', (e) => {
                    e.stopPropagation();
                    if (window.Telegram && window.Telegram.WebApp) {
                        Telegram.WebApp.HapticFeedback.impactOccurred('medium');
                    }
                    currentItemId = e.target.dataset.itemId;
                    showEditItemModal();
                });

                itemDiv.querySelector('.delete-item-action-btn')?.addEventListener('click', (e) => {
                    e.stopPropagation();
                    if (window.Telegram && window.Telegram.WebApp) {
                        Telegram.WebApp.HapticFeedback.notificationOccurred('warning');
                        Telegram.WebApp.showConfirm(`Вы уверены, что хотите удалить товар "${item.name}"?`, (confirmed) => {
                            if (confirmed) {
                                deleteItem(item.id);
                                Telegram.WebApp.HapticFeedback.notificationOccurred('success');
                            } else {
                                Telegram.WebApp.HapticFeedback.notificationOccurred('light');
                            }
                        });
                    } else {
                        if (confirm(`Вы уверены, что хотите удалить товар "${item.name}"?`)) {
                            deleteItem(item.id);
                        }
                    }
                });
            });
        }

        // Находим кнопки добавления/списания и скрываем/показываем их
        if (canEdit) {
            addItemsBtn.style.display = 'inline-block';
            subtractItemsBtn.style.display = 'inline-block';
        } else {
            addItemsBtn.style.display = 'none';
            subtractItemsBtn.style.display = 'none';
        }

        showModal(sectionDetailModal);
    }

    function hideSectionDetailModal() {
        hideModal(sectionDetailModal);
    }

    addItemsBtn.addEventListener('click', () => {
        if (window.Telegram && window.Telegram.WebApp) {
            Telegram.WebApp.HapticFeedback.impactOccurred('light');
        }
        currentItemAction = 'add';
        itemQuantityTitle.textContent = 'Добавить товар';
        itemNameInput.value = '';
        itemQuantityInput.value = 1;
        showModal(itemQuantityModal);
    });

    subtractItemsBtn.addEventListener('click', () => {
        if (window.Telegram && window.Telegram.WebApp) {
            Telegram.WebApp.HapticFeedback.impactOccurred('light');
        }
        currentItemAction = 'subtract';
        itemQuantityTitle.textContent = 'Списать товар';
        itemNameInput.value = '';
        itemQuantityInput.value = 1;
        showModal(itemQuantityModal);
    });

    closeSectionDetailModalBtn.addEventListener('click', () => {
        hideSectionDetailModal();
        if (window.Telegram && window.Telegram.WebApp) {
            Telegram.WebApp.HapticFeedback.impactOccurred('light');
        }
    });

    confirmItemQuantityBtn.addEventListener('click', () => {
        const itemName = itemNameInput.value.trim();
        const quantity = parseInt(itemQuantityInput.value);

        if (!itemName || isNaN(quantity) || quantity <= 0) {
            if (window.Telegram && window.Telegram.WebApp) {
                Telegram.WebApp.showAlert('Пожалуйста, введите корректное название и количество.');
            } else {
                alert('Пожалуйста, введите корректное название и количество.');
            }
            return;
        }

        const section = allSections.find(s => s.id === currentSectionId);
        if (!section) return;

        let item = section.items.find(i => i.name.toLowerCase() === itemName.toLowerCase());

        if (currentItemAction === 'add') {
            if (item) {
                item.quantity += quantity;
            } else {
                item = { id: generateUniqueId('item'), name: itemName, quantity: quantity, minQuantity: 0 };
                section.items.push(item);
            }
            if (window.Telegram && window.Telegram.WebApp) {
                Telegram.WebApp.sendData(JSON.stringify({
                    type: 'add_item',
                    payload: { sectionId: currentSectionId, item: item, quantityAdded: quantity }
                }));
                Telegram.WebApp.showAlert(`Добавлено ${quantity} шт. ${itemName} в "${section.name}".`);
                Telegram.WebApp.HapticFeedback.notificationOccurred('success');
            } else {
                alert(`Добавлено ${quantity} шт. ${itemName} в "${section.name}".`);
            }
        } else if (currentItemAction === 'subtract') {
            if (item) {
                if (item.quantity >= quantity) {
                    item.quantity -= quantity;
                    if (window.Telegram && window.Telegram.WebApp) {
                        Telegram.WebApp.sendData(JSON.stringify({
                            type: 'subtract_item',
                            payload: { sectionId: currentSectionId, itemId: item.id, quantitySubtracted: quantity, newQuantity: item.quantity }
                        }));
                        Telegram.WebApp.showAlert(`Списано ${quantity} шт. ${itemName} из "${section.name}".`);
                        Telegram.WebApp.HapticFeedback.notificationOccurred('success');
                    } else {
                        alert(`Списано ${quantity} шт. ${itemName} из "${section.name}".`);
                    }
                } else {
                    if (window.Telegram && window.Telegram.WebApp) {
                        Telegram.WebApp.showAlert('Недостаточно товара на складе.');
                        Telegram.WebApp.HapticFeedback.notificationOccurred('error');
                    } else {
                        alert('Недостаточно товара на складе.');
                    }
                    return;
                }
            } else {
                if (window.Telegram && window.Telegram.WebApp) {
                    Telegram.WebApp.showAlert('Товар не найден в этом разделе.');
                    Telegram.WebApp.HapticFeedback.notificationOccurred('error');
                } else {
                    alert('Товар не найден в этом разделе.');
                }
                return;
            }
        }
        
        saveData('sections', allSections);
        hideModal(itemQuantityModal);
        // Переоткрываем модальное окно деталей раздела с обновленными данными
        const canEditStockAfterAction = currentUserRole === 'main_admin' || 
                                        currentUserRole === 'junior_admin' ||
                                        (currentUserRole === 'employee' && section.stockManagerId === currentUserId);
        showSectionDetailModal(canEditStockAfterAction);

        // Проверяем критический минимум после изменения
        if (item && item.quantity <= item.minQuantity && item.minQuantity > 0) {
            sendCriticalMinimumNotification(section, item);
        }
    });

    cancelItemQuantityBtn.addEventListener('click', () => {
        hideModal(itemQuantityModal);
        if (window.Telegram && window.Telegram.WebApp) {
            Telegram.WebApp.HapticFeedback.impactOccurred('light');
        }
    });

    function showEditItemModal() {
        const section = allSections.find(s => s.id === currentSectionId);
        const item = section?.items.find(i => i.id === currentItemId);
        if (!item) {
            if (window.Telegram && window.Telegram.WebApp) {
                Telegram.WebApp.showAlert('Товар не найден.');
            } else {
                alert('Товар не найден.');
            }
            return;
        }

        editItemNameInput.value = item.name;
        editItemQuantityInput.value = item.quantity;
        editItemMinInput.value = item.minQuantity;
        showModal(editItemModal);
    }

    saveItemChangesBtn.addEventListener('click', () => {
        const newName = editItemNameInput.value.trim();
        const newQuantity = parseInt(editItemQuantityInput.value);
        const newMin = parseInt(editItemMinInput.value);

        if (!newName || isNaN(newQuantity) || newQuantity < 0 || isNaN(newMin) || newMin < 0) {
            if (window.Telegram && window.Telegram.WebApp) {
                Telegram.WebApp.showAlert('Пожалуйста, введите корректные данные.');
            } else {
                alert('Пожалуйста, введите корректные данные.');
            }
            return;
        }

        const section = allSections.find(s => s.id === currentSectionId);
        const item = section?.items.find(i => i.id === currentItemId);

        if (item) {
            item.name = newName;
            item.quantity = newQuantity;
            item.minQuantity = newMin;

            saveData('sections', allSections);
            hideModal(editItemModal);
            const canEditStockAfterAction = currentUserRole === 'main_admin' || 
                                            currentUserRole === 'junior_admin' ||
                                            (currentUserRole === 'employee' && section.stockManagerId === currentUserId);
            showSectionDetailModal(canEditStockAfterAction); // Обновить UI

            if (window.Telegram && window.Telegram.WebApp) {
                Telegram.WebApp.sendData(JSON.stringify({
                    type: 'update_item',
                    payload: { sectionId: currentSectionId, item: item }
                }));
                Telegram.WebApp.showAlert('Изменения сохранены.');
                Telegram.WebApp.HapticFeedback.notificationOccurred('success');
            } else {
                alert('Изменения сохранены.');
            }
             // Проверяем критический минимум после изменения
            if (item.quantity <= item.minQuantity && item.minQuantity > 0) {
                sendCriticalMinimumNotification(section, item);
            }
        }
    });

    deleteItemBtn.addEventListener('click', () => {
        if (window.Telegram && window.Telegram.WebApp) {
            Telegram.WebApp.HapticFeedback.notificationOccurred('warning');
            Telegram.WebApp.showConfirm('Вы уверены, что хотите удалить этот товар?', (confirmed) => {
                if (confirmed) {
                    deleteItem(currentItemId);
                    Telegram.WebApp.HapticFeedback.notificationOccurred('success');
                } else {
                    Telegram.WebApp.HapticFeedback.notificationOccurred('light');
                }
            });
        } else {
            if (confirm('Вы уверены, что хотите удалить этот товар?')) {
                deleteItem(currentItemId);
            }
        }
    });

    function deleteItem(itemId) {
        const section = allSections.find(s => s.id === currentSectionId);
        if (section) {
            section.items = section.items.filter(item => item.id !== itemId);
            saveData('sections', allSections);
            hideModal(editItemModal);
            const canEditStockAfterAction = currentUserRole === 'main_admin' || 
                                            currentUserRole === 'junior_admin' ||
                                            (currentUserRole === 'employee' && section.stockManagerId === currentUserId);
            showSectionDetailModal(canEditStockAfterAction); // Обновить UI
            if (window.Telegram && window.Telegram.WebApp) {
                Telegram.WebApp.sendData(JSON.stringify({
                    type: 'delete_item',
                    payload: { sectionId: currentSectionId, itemId: itemId }
                }));
                Telegram.WebApp.showAlert('Товар удален.');
            } else {
                alert('Товар удален.');
            }
        }
    }

    cancelEditItemBtn.addEventListener('click', () => {
        hideModal(editItemModal);
        if (window.Telegram && window.Telegram.WebApp) {
            Telegram.WebApp.HapticFeedback.impactOccurred('light');
        }
    });

    // --- Функции для работы с заметками ---
    function renderNotes() {
        notesContainer.innerHTML = '';
        if (allNotes.length === 0) {
            notesContainer.innerHTML = '<p class="no-data-message">Заметок пока нет. Создайте первую!</p>';
        } else {
            allNotes.forEach(note => {
                const noteItem = document.createElement('div');
                noteItem.classList.add('note-item');
                noteItem.dataset.id = note.id;
                noteItem.innerHTML = `
                    <div class="note-title">${note.title}</div>
                    <div class="note-content">${note.content}</div>
                `;
                
                // Кнопки управления заметкой (только для админов)
                if (currentUserRole === 'main_admin' || currentUserRole === 'junior_admin') {
                    const controlsHtml = `
                        <div class="note-controls" style="position: absolute; top: 10px; right: 10px;">
                            <i class="fas fa-edit edit-note-btn" data-id="${note.id}" style="cursor: pointer; margin-right: 10px; color: var(--secondary-text-color);"></i>
                            <i class="fas fa-trash-alt delete-note-btn" data-id="${note.id}" style="cursor: pointer; color: var(--error-color);"></i>
                        </div>
                    `;
                    noteItem.insertAdjacentHTML('beforeend', controlsHtml);
                }

                noteItem.addEventListener('click', () => {
                     // Проверяем, был ли клик по иконке управления заметкой
                    if (event.target.closest('.note-controls')) {
                        return; // Не открываем модалку, если кликнули на кнопку управления
                    }
                    if (window.Telegram && window.Telegram.WebApp) {
                        Telegram.WebApp.HapticFeedback.impactOccurred('light');
                    }
                    // Показать заметку в модальном окне только для просмотра
                    noteModalTitle.textContent = note.title;
                    noteTitleInput.value = note.title;
                    noteContentInput.value = note.content;
                    saveNoteBtn.style.display = 'none'; // Скрыть кнопку сохранения при просмотре
                    cancelNoteBtn.textContent = 'Закрыть';
                    noteTitleInput.readOnly = true;
                    noteContentInput.readOnly = true;
                    showModal(noteModal);
                });

                if (currentUserRole === 'main_admin' || currentUserRole === 'junior_admin') {
                    noteItem.querySelector('.edit-note-btn')?.addEventListener('click', (e) => {
                        e.stopPropagation();
                        if (window.Telegram && window.Telegram.WebApp) {
                            Telegram.WebApp.HapticFeedback.impactOccurred('medium');
                        }
                        const id = e.target.dataset.id;
                        currentNoteId = id;
                        showNoteModal(id);
                    });

                    noteItem.querySelector('.delete-note-btn')?.addEventListener('click', (e) => {
                        e.stopPropagation();
                        if (window.Telegram && window.Telegram.WebApp) {
                            Telegram.WebApp.HapticFeedback.notificationOccurred('warning');
                            Telegram.WebApp.showConfirm(`Вы уверены, что хотите удалить заметку "${note.title}"?`, (confirmed) => {
                                if (confirmed) {
                                    deleteNote(e.target.dataset.id);
                                    Telegram.WebApp.HapticFeedback.notificationOccurred('success');
                                } else {
                                    Telegram.WebApp.HapticFeedback.notificationOccurred('light');
                                }
                            });
                        } else {
                            if (confirm(`Вы уверены, что хотите удалить заметку "${note.title}"?`)) {
                                deleteNote(e.target.dataset.id);
                            }
                        }
                    });
                }
                notesContainer.appendChild(noteItem);
            });
        }
        saveData('notes', allNotes);
    }

    createNoteBtn.addEventListener('click', () => {
        if (window.Telegram && window.Telegram.WebApp) {
            Telegram.WebApp.HapticFeedback.impactOccurred('medium');
        }
        currentNoteId = null;
        showNoteModal();
    });

    function showNoteModal(noteId = null) {
        noteModalTitle.textContent = noteId ? 'Редактировать заметку' : 'Новая заметка';
        currentNoteId = noteId;
        const note = noteId ? allNotes.find(n => n.id === noteId) : null;

        if (note) {
            noteTitleInput.value = note.title;
            noteContentInput.value = note.content;
        } else {
            noteTitleInput.value = '';
            noteContentInput.value = '';
        }
        // Сбросить режим просмотра
        saveNoteBtn.style.display = 'inline-block';
        cancelNoteBtn.textContent = 'Отмена';
        noteTitleInput.readOnly = false;
        noteContentInput.readOnly = false;
        showModal(noteModal);
    }

    function hideNoteModal() {
        hideModal(noteModal);
    }

    saveNoteBtn.addEventListener('click', () => {
        const title = noteTitleInput.value.trim();
        const content = noteContentInput.value.trim();
        if (!title || !content) {
            if (window.Telegram && window.Telegram.WebApp) {
                Telegram.WebApp.showAlert('Заголовок и содержание заметки не могут быть пустыми!');
            } else {
                alert('Заголовок и содержание заметки не могут быть пустыми!');
            }
            return;
        }

        if (currentNoteId) { // Редактирование
            const noteIndex = allNotes.findIndex(n => n.id === currentNoteId);
            if (noteIndex !== -1) {
                allNotes[noteIndex].title = title;
                allNotes[noteIndex].content = content;
                if (window.Telegram && window.Telegram.WebApp) {
                    Telegram.WebApp.sendData(JSON.stringify({
                        type: 'update_note',
                        payload: allNotes[noteIndex]
                    }));
                    Telegram.WebApp.showAlert('Заметка обновлена.');
                    Telegram.WebApp.HapticFeedback.notificationOccurred('success');
                } else {
                    alert('Заметка обновлена.');
                }
            }
        } else { // Создание
            const newNote = { id: generateUniqueId('note'), title: title, content: content };
            allNotes.push(newNote);
            if (window.Telegram && window.Telegram.WebApp) {
                Telegram.WebApp.sendData(JSON.stringify({
                    type: 'create_note',
                    payload: newNote
                }));
                Telegram.WebApp.showAlert('Заметка создана.');
                Telegram.WebApp.HapticFeedback.notificationOccurred('success');
            } else {
                alert('Заметка создана.');
            }
        }
        renderNotes();
        hideNoteModal();
    });

    cancelNoteBtn.addEventListener('click', () => {
        hideNoteModal();
        if (window.Telegram && window.Telegram.WebApp) {
            Telegram.WebApp.HapticFeedback.impactOccurred('light');
        }
    });

    function deleteNote(id) {
        allNotes = allNotes.filter(note => note.id !== id);
        renderNotes();
        if (window.Telegram && window.Telegram.WebApp) {
            Telegram.WebApp.sendData(JSON.stringify({
                type: 'delete_note',
                payload: { id: id }
            }));
        }
    }

    // --- Функции для работы с задачами ---
    function renderTasks(filter) {
        tasksList.innerHTML = '';
        const filteredTasks = allTasks.filter(task => {
            if (filter === 'all') return true;
            if (filter === 'my') return task.assignedTo === currentUserId;
            // Новый фильтр: доступные задачи (без назначенного сотрудника)
            if (filter === 'available') return !task.assignedTo;
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
                    default:
                        statusClass = 'status-new';
                        statusText = 'Неизвестно';
                }

                // Определяем, должен ли быть виден текст "Назначено" или кнопка "Взять задание"
                let assignedToHtml = '';
                let takeTaskButtonHtml = '';
                const assignedUserName = allUsers.find(u => u.id === task.assignedTo)?.name;

                if (task.assignedTo && assignedUserName) {
                    assignedToHtml = `<span class="task-assigned-to">Назначено: ${assignedUserName}</span>`;
                } else {
                    // Если задача не назначена, показываем кнопку "Взять задание"
                    takeTaskButtonHtml = `
                        <button class="action-button take-task-button" data-task-id="${task.id}">Взять задание</button>
                    `;
                }

                taskItem.innerHTML = `
                    <div class="task-title">${task.title}</div>
                    <div class="task-info">
                        <span class="task-status ${statusClass}">${statusText}</span>
                        ${assignedToHtml}
                    </div>
                    ${task.description ? `<p class="task-description">${task.description}</p>` : ''}
                    ${takeTaskButtonHtml}
                `;
                
                // Добавляем обработчик клика для каждой задачи (открывает модалку статуса)
                taskItem.addEventListener('click', (e) => {
                    // Исключаем клик по кнопке "Взять задание" или по кнопкам админа
                    if (e.target.classList.contains('take-task-button') || e.target.closest('.task-controls')) {
                        return;
                    }
                    if (window.Telegram && window.Telegram.WebApp) {
                        Telegram.WebApp.HapticFeedback.impactOccurred('light');
                    }
                    currentTaskForStatusChange = task.id; 
                    showTaskStatusModal(); 
                });

                // Кнопки управления заданием (только для админов)
                if (currentUserRole === 'main_admin' || currentUserRole === 'junior_admin') {
                    const controlsHtml = `
                        <div class="task-controls" style="position: absolute; top: 10px; right: 10px;">
                            <i class="fas fa-edit edit-task-btn" data-id="${task.id}" style="cursor: pointer; margin-right: 10px; color: var(--secondary-text-color);"></i>
                            <i class="fas fa-trash-alt delete-task-btn" data-id="${task.id}" style="cursor: pointer; color: var(--error-color);"></i>
                        </div>
                    `;
                    taskItem.insertAdjacentHTML('beforeend', controlsHtml);

                    taskItem.querySelector('.edit-task-btn')?.addEventListener('click', (e) => {
                        e.stopPropagation();
                        if (window.Telegram && window.Telegram.WebApp) {
                            Telegram.WebApp.HapticFeedback.impactOccurred('medium');
                        }
                        const id = e.target.dataset.id;
                        currentTaskId = id;
                        showTaskModal(id);
                    });

                    taskItem.querySelector('.delete-task-btn')?.addEventListener('click', (e) => {
                        e.stopPropagation();
                        if (window.Telegram && window.Telegram.WebApp) {
                            Telegram.WebApp.HapticFeedback.notificationOccurred('warning');
                            Telegram.WebApp.showConfirm(`Вы уверены, что хотите удалить задание "${task.title}"?`, (confirmed) => {
                                if (confirmed) {
                                    deleteTask(e.target.dataset.id);
                                    Telegram.WebApp.HapticFeedback.notificationOccurred('success');
                                } else {
                                    Telegram.WebApp.HapticFeedback.notificationOccurred('light');
                                }
                            });
                        } else {
                            if (confirm(`Вы уверены, что хотите удалить задание "${task.title}"?`)) {
                                deleteTask(e.target.dataset.id);
                            }
                        }
                    });
                }


                // Обработчик для кнопки "Взять задание"
                if (!task.assignedTo) {
                    const takeButton = taskItem.querySelector('.take-task-button');
                    if (takeButton) {
                        takeButton.addEventListener('click', (e) => {
                            e.stopPropagation(); // Предотвращаем срабатывание обработчика taskItem
                            if (window.Telegram && window.Telegram.WebApp) {
                                Telegram.WebApp.HapticFeedback.impactOccurred('medium');
                                Telegram.WebApp.showConfirm(`Вы уверены, что хотите взять задание "${task.title}"?`, (confirmed) => {
                                    if (confirmed) {
                                        const taskToUpdate = allTasks.find(t => t.id === task.id);
                                        if (taskToUpdate) {
                                            taskToUpdate.assignedTo = currentUserId; // Назначаем задачу текущему пользователю
                                            taskToUpdate.status = 'В работе'; // Автоматически переводим в "В работе"
                                            renderTasks(document.querySelector('#tasks-page .filter-tab.active').dataset.filter); // Перерисовываем

                                            Telegram.WebApp.sendData(JSON.stringify({
                                                type: 'take_task',
                                                payload: {
                                                    taskId: task.id,
                                                    assignedTo: currentUserId,
                                                    status: 'В работе'
                                                }
                                            }));
                                            Telegram.WebApp.showAlert(`Вы взяли задание "${task.title}".`);
                                        }
                                    } else {
                                        Telegram.WebApp.HapticFeedback.notificationOccurred('light');
                                    }
                                });
                            } else {
                                if (confirm(`Вы уверены, что хотите взять задание "${task.title}"?`)) {
                                    const taskToUpdate = allTasks.find(t => t.id === task.id);
                                    if (taskToUpdate) {
                                        taskToUpdate.assignedTo = currentUserId;
                                        taskToUpdate.status = 'В работе';
                                        renderTasks(document.querySelector('#tasks-page .filter-tab.active').dataset.filter);
                                        alert(`Вы взяли задание "${task.title}".`);
                                    }
                                }
                            }
                        });
                    }
                }
                tasksList.appendChild(taskItem);
            });
        }
        saveData('tasks', allTasks);
    }

    taskFilterTabs.querySelectorAll('.filter-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            taskFilterTabs.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            renderTasks(tab.dataset.filter);
            if (window.Telegram && window.Telegram.WebApp) {
                Telegram.WebApp.HapticFeedback.impactOccurred('light');
            }
        });
    });

    createTaskBtn.addEventListener('click', () => {
        if (window.Telegram && window.Telegram.WebApp) {
            Telegram.WebApp.HapticFeedback.impactOccurred('medium');
        }
        currentTaskId = null;
        showTaskModal();
    });

    function populateUserSelect(selectElement, selectedUserId = null) {
        selectElement.innerHTML = '<option value="">Не назначен</option>';
        allUsers.filter(u => u.role === 'employee').forEach(user => { // Только сотрудники для назначения
            const option = document.createElement('option');
            option.value = user.id;
            option.textContent = user.name;
            selectElement.appendChild(option);
        });
        if (selectedUserId) {
            selectElement.value = selectedUserId;
        }
    }

    function showTaskModal(taskId = null) {
        taskModalTitle.textContent = taskId ? 'Редактировать задание' : 'Новое задание';
        currentTaskId = taskId;
        const task = taskId ? allTasks.find(t => t.id === taskId) : null;

        if (task) {
            taskTitleInput.value = task.title;
            taskDescriptionInput.value = task.description || '';
            populateUserSelect(taskAssignedToSelect, task.assignedTo);
        } else {
            taskTitleInput.value = '';
            taskDescriptionInput.value = '';
            populateUserSelect(taskAssignedToSelect);
        }
        showModal(taskModal);
    }

    function hideTaskModal() {
        hideModal(taskModal);
    }

    saveTaskBtn.addEventListener('click', () => {
        const title = taskTitleInput.value.trim();
        const description = taskDescriptionInput.value.trim();
        const assignedTo = taskAssignedToSelect.value || null;

        if (!title) {
            if (window.Telegram && window.Telegram.WebApp) {
                Telegram.WebApp.showAlert('Название задания не может быть пустым!');
            } else {
                alert('Название задания не может быть пустым!');
            }
            return;
        }

        if (currentTaskId) { // Редактирование
            const taskIndex = allTasks.findIndex(t => t.id === currentTaskId);
            if (taskIndex !== -1) {
                allTasks[taskIndex].title = title;
                allTasks[taskIndex].description = description;
                allTasks[taskIndex].assignedTo = assignedTo;
                // Статус не меняем при редактировании, только через отдельное меню
                
                if (window.Telegram && window.Telegram.WebApp) {
                    Telegram.WebApp.sendData(JSON.stringify({
                        type: 'update_task',
                        payload: allTasks[taskIndex]
                    }));
                    Telegram.WebApp.showAlert('Задание обновлено.');
                    Telegram.WebApp.HapticFeedback.notificationOccurred('success');
                } else {
                    alert('Задание обновлено.');
                }
            }
        } else { // Создание
            const newTask = { 
                id: generateUniqueId('task'), 
                title: title, 
                description: description, 
                assignedTo: assignedTo, 
                status: 'Новая' // Новое задание всегда "Новая"
            };
            allTasks.push(newTask);
            if (window.Telegram && window.Telegram.WebApp) {
                Telegram.WebApp.sendData(JSON.stringify({
                    type: 'create_task',
                    payload: newTask
                }));
                Telegram.WebApp.showAlert('Задание создано.');
                Telegram.WebApp.HapticFeedback.notificationOccurred('success');
            } else {
                alert('Задание создано.');
            }
        }
        renderTasks(document.querySelector('#tasks-page .filter-tab.active')?.dataset.filter || 'all');
        hideTaskModal();
    });

    cancelTaskBtn.addEventListener('click', () => {
        hideTaskModal();
        if (window.Telegram && window.Telegram.WebApp) {
            Telegram.WebApp.HapticFeedback.impactOccurred('light');
        }
    });

    function deleteTask(id) {
        allTasks = allTasks.filter(task => task.id !== id);
        renderTasks(document.querySelector('#tasks-page .filter-tab.active')?.dataset.filter || 'all');
        if (window.Telegram && window.Telegram.WebApp) {
            Telegram.WebApp.sendData(JSON.stringify({
                type: 'delete_task',
                payload: { id: id }
            }));
        }
    }

    // --- Функции для модального окна статусов задач ---
    function showTaskStatusModal() {
        showModal(taskStatusModal);
    }

    function hideTaskStatusModal() {
        hideModal(taskStatusModal);
        currentTaskForStatusChange = null; // Сбрасываем ID задачи
    }

    taskStatusOptionButtons.forEach(button => {
        button.addEventListener('click', () => {
            const newStatus = button.dataset.status;
            if (currentTaskForStatusChange && newStatus) {
                const taskIndex = allTasks.findIndex(t => t.id === currentTaskForStatusChange);
                if (taskIndex !== -1) {
                    allTasks[taskIndex].status = newStatus;
                    renderTasks(document.querySelector('#tasks-page .filter-tab.active').dataset.filter); // Перерисовываем задачи с учетом текущего фильтра

                    if (window.Telegram && window.Telegram.WebApp) {
                        Telegram.WebApp.sendData(JSON.stringify({
                            type: 'update_task_status',
                            payload: {
                                taskId: currentTaskForStatusChange,
                                status: newStatus
                            }
                        }));
                        Telegram.WebApp.showAlert(`Статус задачи "${allTasks[taskIndex].title}" изменен на "${newStatus}".`);
                        Telegram.WebApp.HapticFeedback.notificationOccurred('success');
                    } else {
                        alert(`Статус задачи "${allTasks[taskIndex].title}" изменен на "${newStatus}".`);
                    }
                }
            }
            hideTaskStatusModal();
        });
    });

    closeTaskStatusModalBtn.addEventListener('click', hideTaskStatusModal);


    // --- Функции для работы с получателями оповещений (видимость, критический минимум) ---
    let currentRecipientFilter = 'all';

    function showNotificationRecipientsModal(sectionId, title, currentSelectedUserIds) {
        recipientsModalTitle.textContent = title;
        currentSectionId = sectionId;
        currentRecipients = currentSelectedUserIds; // Запоминаем текущие выбранные ID
        
        // Сброс фильтра и перерисовка списка при открытии модалки
        recipientFilterTabs.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
        recipientFilterTabs.querySelector('.filter-tab[data-filter="all"]').classList.add('active');
        currentRecipientFilter = 'all';

        renderRecipientsList(allUsers, currentRecipients);
        showModal(notificationRecipientsModal);
    }

    function hideNotificationRecipientsModal() {
        hideModal(notificationRecipientsModal);
    }

    recipientFilterTabs.querySelectorAll('.filter-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            recipientFilterTabs.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            currentRecipientFilter = tab.dataset.filter;
            renderRecipientsList(allUsers, currentRecipients); // Рендерим с учетом выбранных
            selectAllRecipientsCheckbox.checked = false;
            if (window.Telegram && window.Telegram.WebApp) {
                Telegram.WebApp.HapticFeedback.impactOccurred('light');
            }
        });
    });

    selectAllRecipientsCheckbox.addEventListener('change', (e) => {
        recipientList.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
            checkbox.checked = e.target.checked;
        });
    });

    function renderRecipientsList(usersToRender, selectedUserIds = []) {
        recipientList.innerHTML = '';
        selectAllRecipientsCheckbox.checked = false; // Сброс при каждом рендере

        let filteredUsers = [];
        if (currentRecipientFilter === 'all') {
            filteredUsers = usersToRender;
        } else if (currentRecipientFilter === 'admins') {
            filteredUsers = usersToRender.filter(user => user.role === 'main_admin' || user.role === 'junior_admin');
        } else if (currentRecipientFilter === 'employees') {
            filteredUsers = usersToRender.filter(user => user.role === 'employee');
        }

        filteredUsers.forEach(user => {
            // Если младший админ и пользователь - другой админ, не показываем его в списке для скрытия
            if (currentRecipientsType === 'hidden_from_users' && currentUserRole === 'junior_admin' && (user.role === 'main_admin' || user.role === 'junior_admin')) {
                return;
            }

            const recipientItem = document.createElement('div');
            recipientItem.classList.add('recipient-item');
            recipientItem.dataset.id = user.id;

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = `recipient-${user.id}`;
            checkbox.value = user.id;
            // Проверяем, если пользователь уже был выбран
            if (selectedUserIds.includes(user.id)) {
                checkbox.checked = true;
            }
            recipientItem.appendChild(checkbox);

            const label = document.createElement('label');
            label.htmlFor = `recipient-${user.id}`;
            label.classList.add('recipient-item-name');
            label.textContent = user.name;
            recipientItem.appendChild(label);

            recipientList.appendChild(recipientItem);
        });
    }

    saveRecipientsBtn.addEventListener('click', () => {
        const selectedUserIds = Array.from(recipientList.querySelectorAll('input[type="checkbox"]:checked'))
                                     .map(checkbox => checkbox.value);
        const section = allSections.find(s => s.id === currentSectionId);
        if (!section) return;

        if (currentRecipientsType === 'notifications') {
            section.notificationRecipients = selectedUserIds;
            if (window.Telegram && window.Telegram.WebApp) {
                Telegram.WebApp.sendData(JSON.stringify({
                    type: 'set_notification_recipients',
                    payload: {
                        sectionId: currentSectionId,
                        recipients: selectedUserIds
                    }
                }));
                Telegram.WebApp.showAlert('Получатели оповещений об изменениях обновлены.');
                Telegram.WebApp.HapticFeedback.notificationOccurred('success');
            } else {
                alert('Получатели оповещений об изменениях обновлены.');
            }
        } else if (currentRecipientsType === 'critical_minimum') {
            section.criticalMinRecipients = selectedUserIds;
            if (window.Telegram && window.Telegram.WebApp) {
                Telegram.WebApp.sendData(JSON.stringify({
                    type: 'set_critical_minimum_recipients',
                    payload: {
                        sectionId: currentSectionId,
                        recipients: selectedUserIds
                    }
                }));
                Telegram.WebApp.showAlert('Получатели оповещений о критическом минимуме обновлены.');
                Telegram.WebApp.HapticFeedback.notificationOccurred('success');
            } else {
                alert('Получатели оповещений о критическом минимуме обновлены.');
            }
        } else if (currentRecipientsType === 'hidden_from_users') {
             // Если текущий пользователь младший админ, фильтруем список, оставляя только сотрудников
            if (currentUserRole === 'junior_admin') {
                const juniorAdminFilteredIds = selectedUserIds.filter(userId => {
                    const user = allUsers.find(u => u.id === userId);
                    return user && user.role === 'employee'; // Младший админ может скрывать только от сотрудников
                });

                // Проверяем, если младший админ пытался выбрать админов
                const triedToHideFromAdmins = selectedUserIds.some(userId => {
                    const user = allUsers.find(u => u.id === userId);
                    return user && (user.role === 'main_admin' || user.role === 'junior_admin');
                });

                if (triedToHideFromAdmins) {
                    if (window.Telegram && window.Telegram.WebApp) {
                        Telegram.WebApp.showAlert('Младший администратор может скрывать разделы только от сотрудников.');
                        Telegram.WebApp.HapticFeedback.notificationOccurred('error');
                    } else {
                        alert('Младший администратор может скрывать разделы только от сотрудников.');
                    }
                    // В этом случае мы все равно отправляем только разрешенные ID, но предупреждаем пользователя
                }
                section.hiddenFromUsers = juniorAdminFilteredIds;
                if (window.Telegram && window.Telegram.WebApp) {
                    Telegram.WebApp.sendData(JSON.stringify({
                        type: 'set_hidden_from_users',
                        payload: {
                            sectionId: currentSectionId,
                            hiddenFromUserIds: juniorAdminFilteredIds
                        }
                    }));
                    if (!triedToHideFromAdmins) { // Если не было попыток скрыть от админов, показываем успех
                        Telegram.WebApp.showAlert('Видимость раздела обновлена.');
                        Telegram.WebApp.HapticFeedback.notificationOccurred('success');
                    }
                } else {
                    alert('Видимость раздела обновлена.');
                }

            } else {
                // Главный админ может скрывать от всех
                section.hiddenFromUsers = selectedUserIds;
                if (window.Telegram && window.Telegram.WebApp) {
                    Telegram.WebApp.sendData(JSON.stringify({
                        type: 'set_hidden_from_users',
                        payload: {
                            sectionId: currentSectionId,
                            hiddenFromUserIds: selectedUserIds
                        }
                    }));
                    Telegram.WebApp.showAlert('Видимость раздела обновлена.');
                    Telegram.WebApp.HapticFeedback.notificationOccurred('success');
                } else {
                    alert('Видимость раздела обновлена.');
                }
            }
            // Обновляем isHidden на основе наличия скрытых пользователей
            section.isHidden = section.hiddenFromUsers.length > 0;
        }

        saveData('sections', allSections);
        renderSections(); // Перерисовать разделы, чтобы обновить видимость
        hideNotificationRecipientsModal();
    });

    cancelRecipientsBtn.addEventListener('click', () => {
        hideNotificationRecipientsModal();
        if (window.Telegram && window.Telegram.WebApp) {
            Telegram.WebApp.HapticFeedback.impactOccurred('light');
        }
    });

    function sendCriticalMinimumNotification(section, item) {
        if (section.criticalMinRecipients.length > 0) {
            if (window.Telegram && window.Telegram.WebApp) {
                Telegram.WebApp.sendData(JSON.stringify({
                    type: 'critical_minimum_alert',
                    payload: {
                        sectionId: section.id,
                        sectionName: section.name,
                        itemId: item.id,
                        itemName: item.name,
                        currentQuantity: item.quantity,
                        minQuantity: item.minQuantity,
                        recipients: section.criticalMinRecipients
                    }
                }));
                Telegram.WebApp.showAlert(`Внимание! Товар "${item.name}" в разделе "${section.name}" достиг критического минимума (${item.quantity} шт.).`);
            }
        }
    }


    // --- Управление пользователями (только для Главного админа) ---
    let currentUserManagementFilter = 'all';

    function showUserManagementModal() {
        showModal(userManagementModal);
        renderUsersForUserManagement(currentUserManagementFilter);
        selectAllManageUsersCheckbox.checked = false;
    }

    function hideUserManagementModal() {
        hideModal(userManagementModal);
    }

    manageUsersBtn.addEventListener('click', () => {
        if (window.Telegram && window.Telegram.WebApp) {
            Telegram.WebApp.HapticFeedback.impactOccurred('medium');
        }
        showUserManagementModal();
    });

    userManagementModal.querySelectorAll('.recipient-filter-tabs .filter-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            userManagementModal.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            currentUserManagementFilter = tab.dataset.filter;
            renderUsersForUserManagement(currentUserManagementFilter);
            selectAllManageUsersCheckbox.checked = false;
            if (window.Telegram && window.Telegram.WebApp) {
                Telegram.WebApp.HapticFeedback.impactOccurred('light');
            }
        });
    });

    selectAllManageUsersCheckbox.addEventListener('change', (e) => {
        manageUsersList.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
            checkbox.checked = e.target.checked;
        });
    });

    function renderUsersForUserManagement(filter) {
        manageUsersList.innerHTML = '';
        let filteredUsers = [];
        if (filter === 'all') {
            filteredUsers = allUsers;
        } else if (filter === 'admins') {
            filteredUsers = allUsers.filter(user => user.role === 'main_admin' || user.role === 'junior_admin');
        } else if (filter === 'employees') {
            filteredUsers = allUsers.filter(user => user.role === 'employee');
        }

        filteredUsers.forEach(user => {
            const userDiv = document.createElement('div');
            userDiv.classList.add('recipient-item'); // Переиспользуем стиль recipient-item
            userDiv.dataset.id = user.id;

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = `manage-user-${user.id}`;
            checkbox.value = user.id;
            // Нельзя удалить или изменить роль самому себе
            if (user.id === currentUserId) {
                checkbox.disabled = true;
            }
            userDiv.appendChild(checkbox);

            const label = document.createElement('label');
            label.htmlFor = `manage-user-${user.id}`;
            label.classList.add('recipient-item-name');
            label.textContent = `${user.name} (${user.role === 'main_admin' ? 'Главный админ' : user.role === 'junior_admin' ? 'Младший админ' : 'Сотрудник'})`;
            userDiv.appendChild(label);

            manageUsersList.appendChild(userDiv);
        });
    }

    // Обработчик кнопки "Назначить роль"
    assignRoleBtn.addEventListener('click', async () => {
        const selectedUserIds = Array.from(manageUsersList.querySelectorAll('input[type="checkbox"]:checked:not(:disabled)'))
                                     .map(checkbox => checkbox.value);
        if (selectedUserIds.length === 0) {
            if (window.Telegram && window.Telegram.WebApp) {
                Telegram.WebApp.showAlert('Пожалуйста, выберите хотя бы одного пользователя (кроме себя).');
            } else {
                alert('Пожалуйста, выберите хотя бы одного пользователя (кроме себя).');
            }
            return;
        }

        let roleInput;
        if (window.Telegram && window.Telegram.WebApp) {
            Telegram.WebApp.HapticFeedback.impactOccurred('light');
            roleInput = prompt('Введите новую роль (employee, junior_admin, main_admin):');
        } else {
            roleInput = prompt('Введите новую роль (employee, junior_admin, main_admin):');
        }

        if (roleInput && ['employee', 'junior_admin', 'main_admin'].includes(roleInput.trim().toLowerCase())) {
            const newRole = roleInput.trim().toLowerCase();
            let confirmed;
            if (window.Telegram && window.Telegram.WebApp) {
                confirmed = await new Promise(resolve => {
                    Telegram.WebApp.showConfirm(`Вы уверены, что хотите назначить роль "${newRole}" выбранным пользователям?`, (result) => resolve(result));
                });
            } else {
                confirmed = confirm(`Вы уверены, что хотите назначить роль "${newRole}" выбранным пользователям?`);
            }

            if (confirmed) {
                selectedUserIds.forEach(userId => {
                    const user = allUsers.find(u => u.id === userId);
                    if (user) {
                        user.role = newRole;
                    }
                });
                renderUsersForUserManagement(currentUserManagementFilter); // Перерисовать список
                saveData('users', allUsers); // Сохраняем измененные роли (для имитации)

                if (window.Telegram && window.Telegram.WebApp) {
                    Telegram.WebApp.sendData(JSON.stringify({
                        type: 'assign_role',
                        payload: {
                            userIds: selectedUserIds,
                            role: newRole
                        }
                    }));
                    Telegram.WebApp.showAlert('Роли пользователей обновлены. Бот оповещен.');
                    Telegram.WebApp.HapticFeedback.notificationOccurred('success');
                } else {
                    alert('Роли пользователей обновлены.');
                }
            } else {
                if (window.Telegram && window.Telegram.WebApp) {
                    Telegram.WebApp.HapticFeedback.notificationOccurred('light');
                }
            }
        } else if (roleInput !== null) {
            if (window.Telegram && window.Telegram.WebApp) {
                Telegram.WebApp.showAlert('Некорректная роль. Допустимые значения: employee, junior_admin, main_admin.');
            } else {
                alert('Некорректная роль. Допустимые значения: employee, junior_admin, main_admin.');
            }
        }
    });

    // Обработчик кнопки "Удалить пользователя" (исключает из чатов - бот)
    removeUserBtn.addEventListener('click', async () => {
        const selectedUserIds = Array.from(manageUsersList.querySelectorAll('input[type="checkbox"]:checked:not(:disabled)'))
                                     .map(checkbox => checkbox.value);
        if (selectedUserIds.length === 0) {
            if (window.Telegram && window.Telegram.WebApp) {
                Telegram.WebApp.showAlert('Пожалуйста, выберите хотя бы одного пользователя для удаления (кроме себя).');
            } else {
                alert('Пожалуйста, выберите хотя бы одного пользователя для удаления (кроме себя).');
            }
            return;
        }

        let confirmed;
        if (window.Telegram && window.Telegram.WebApp) {
            Telegram.WebApp.HapticFeedback.notificationOccurred('warning');
            confirmed = await new Promise(resolve => {
                Telegram.WebApp.showConfirm('Вы уверены, что хотите удалить выбранных пользователей? Это также исключит их из всех рабочих чатов.', (result) => resolve(result));
            });
        } else {
            confirmed = confirm('Вы уверены, что хотите удалить выбранных пользователей? Это также исключит их из всех рабочих чатов.');
        }

        if (confirmed) {
            // Отправляем команду боту на удаление из чатов и из базы
            if (window.Telegram && window.Telegram.WebApp) {
                Telegram.WebApp.sendData(JSON.stringify({
                    type: 'remove_users',
                    payload: {
                        userIds: selectedUserIds
                    }
                }));
                Telegram.WebApp.showAlert('Запрос на удаление пользователей и их исключение из чатов отправлен боту.');
                // На клиенте просто удаляем их из списка (имитация)
                allUsers = allUsers.filter(user => !selectedUserIds.includes(user.id));
                saveData('users', allUsers); // Сохраняем изменения (для имитации)
                renderUsersForUserManagement(currentUserManagementFilter);
                Telegram.WebApp.HapticFeedback.notificationOccurred('success');
            } else {
                alert('Запрос на удаление пользователей и их исключение из чатов отправлен (имитация).');
                allUsers = allUsers.filter(user => !selectedUserIds.includes(user.id));
                saveData('users', allUsers);
                renderUsersForUserManagement(currentUserManagementFilter);
            }
        } else {
            if (window.Telegram && window.Telegram.WebApp) {
                Telegram.WebApp.HapticFeedback.notificationOccurred('light');
            }
        }
    });

    cancelUserManagementBtn.addEventListener('click', () => {
        hideUserManagementModal();
        if (window.Telegram && window.Telegram.WebApp) {
            Telegram.WebApp.HapticFeedback.impactOccurred('light');
        }
    });

    subscribeBtn.addEventListener('click', () => {
        if (window.Telegram && window.Telegram.WebApp) {
            Telegram.WebApp.HapticFeedback.impactOccurred('heavy');
            // В реальном приложении здесь будет запрос к боту для инициирования платежа
            Telegram.WebApp.sendData(JSON.stringify({
                type: 'initiate_payment',
                payload: {
                    amount: 1000, // Пример: 1000 рублей
                    description: 'Подписка на WMS WebApp',
                    currency: 'RUB'
                }
            }));
            Telegram.WebApp.showAlert('Запрос на оплату подписки отправлен боту. Следуйте инструкциям бота.');
        } else {
            alert('Функционал оплаты доступен только в Telegram Web App. Имитация запроса на оплату.');
        }
    });


    // --- Скачивание отчетов ---
    downloadReportsBtn.addEventListener('click', () => {
        if (window.Telegram && window.Telegram.WebApp) {
            Telegram.WebApp.HapticFeedback.impactOccurred('heavy');
            // Отправляем запрос боту на генерацию и отправку отчетов
            Telegram.WebApp.sendData(JSON.stringify({
                type: 'download_reports',
                payload: {
                    reportType: 'all_data_summary', // Можно добавить выбор типа отчета
                    format: 'csv' // Или 'pdf', 'excel'
                }
            }));
            Telegram.WebApp.showAlert('Запрос на скачивание отчетов отправлен боту. Ожидайте файл в Telegram.');
        } else {
            alert('Функционал скачивания отчетов доступен только в Telegram Web App. Имитация запроса.');
        }
    });


    // --- Функции для тестовых кнопок (браузерный режим) ---
    addTestDataBtn.addEventListener('click', () => {
        if (window.Telegram && window.Telegram.WebApp) {
            Telegram.WebApp.HapticFeedback.impactOccurred('medium');
            Telegram.WebApp.showAlert('Эта функция доступна только в режиме отладки в браузере.');
            return;
        }
        allSections = [
            { id: 'sec_1', name: 'Склад А (тест)', items: [{id: 'item_1', name: 'Ручки', quantity: 50, minQuantity: 10}, {id: 'item_3', name: 'Степлер', quantity: 5, minQuantity: 5}], isHidden: false, hiddenFromUsers: [], notificationRecipients: [], criticalMinRecipients: ['987654321'], stockManagerId: '123456789' },
            { id: 'sec_2', name: 'Офис Б (тест)', items: [{id: 'item_2', name: 'Бумага А4', quantity: 10, minQuantity: 5}], isHidden: false, hiddenFromUsers: [], notificationRecipients: [], criticalMinRecipients: [], stockManagerId: '987654321' }
        ];
        allNotes = [
            { id: 'note_1', title: 'Важное объявление', content: 'Совещание в пятницу в 10:00.' },
            { id: 'note_2', title: 'График отпусков', content: 'Просьба согласовать отпуска до конца месяца.' }
        ];
        allTasks = [
            { id: 'task_1', title: 'Заказать канцтовары', description: 'Заказать ручки, бумагу и блокноты.', assignedTo: '123456789', status: 'Новая' },
            { id: 'task_2', title: 'Проверить инвентаризацию', description: 'Сверить фактическое наличие с данными в системе.', assignedTo: '987654321', status: 'В работе' },
            { id: 'task_3', title: 'Организовать корпоратив', description: 'Выбрать место и меню.', assignedTo: null, status: 'Новая' }
        ];
        allUsers = [
            { id: '123456789', name: 'Иван Иванов', role: 'employee' }, 
            { id: '987654321', name: 'Петр Петров', role: 'main_admin' }, // Главный админ
            { id: '112233445', name: 'Анна Сидорова', role: 'employee' },
            { id: '556677889', name: 'Мария Кузнецова', role: 'junior_admin' }, // Младший админ
            { id: '998877665', name: 'Дмитрий Смирнов', role: 'employee' }
        ];
        saveData('sections', allSections);
        saveData('notes', allNotes);
        saveData('tasks', allTasks);
        saveData('users', allUsers);
        renderSections();
        renderNotes();
        renderTasks('all');
        updateAdminUIVisibility();
        alert('Тестовые данные добавлены!');
    });

    clearAllDataBtn.addEventListener('click', () => {
        if (window.Telegram && window.Telegram.WebApp) {
            Telegram.WebApp.HapticFeedback.impactOccurred('medium');
            Telegram.WebApp.showAlert('Эта функция доступна только в режиме отладки в браузере.');
            return;
        }
        if (confirm('Вы уверены, что хотите удалить ВСЕ данные?')) {
            allSections = [];
            allNotes = [];
            allTasks = [];
            allUsers = [
                { id: '123456789', name: 'Иван Иванов', role: 'employee' }, 
                { id: '987654321', name: 'Петр Петров', role: 'main_admin' },
                { id: '112233445', name: 'Анна Сидорова', role: 'employee' },
                { id: '556677889', name: 'Мария Кузнецова', role: 'junior_admin' },
                { id: '998877665', name: 'Дмитрий Смирнов', role: 'employee' }
            ];
            localStorage.clear();
            saveData('sections', allSections);
            saveData('notes', allNotes);
            saveData('tasks', allTasks);
            saveData('users', allUsers);
            renderSections();
            renderNotes();
            renderTasks('all');
            updateAdminUIVisibility();
            alert('Все данные удалены!');
        }
    });

    toggleAdminModeBtn.addEventListener('click', () => {
        if (window.Telegram && window.Telegram.WebApp) {
            Telegram.WebApp.HapticFeedback.impactOccurred('medium');
            Telegram.WebApp.showAlert('Эта функция доступна только в режиме отладки в браузере.');
            return;
        }
        if (currentUserRole === 'employee') {
            currentUserRole = 'main_admin';
            currentUserId = '987654321'; // Имитируем вход админа
            alert('Режим админа включен (Главный админ).');
        } else if (currentUserRole === 'main_admin') {
            currentUserRole = 'junior_admin';
            currentUserId = '556677889'; // Имитируем вход младшего админа
            alert('Режим админа включен (Младший админ).');
        } else {
            currentUserRole = 'employee';
            currentUserId = '123456789'; // Имитируем вход сотрудника
            alert('Режим сотрудника включен.');
        }
        updateAdminUIVisibility();
        renderSections(); // Перерисовать, чтобы обновить кнопки админа
        renderNotes(); // Перерисовать заметки
        renderTasks(document.querySelector('#tasks-page .filter-tab.active')?.dataset.filter || 'all'); // Перерисовать задачи
    });


    // --- Переключение темы ---
    const themeToggle = document.getElementById('checkbox');
    const savedTheme = localStorage.getItem('theme');

    if (savedTheme) {
        document.body.classList.add(savedTheme + '-mode');
        themeToggle.checked = savedTheme === 'dark';
    } else if (window.Telegram && window.Telegram.WebApp) {
        // Если тема не сохранена локально, используем тему из Telegram
        document.body.classList.add(Telegram.WebApp.colorScheme + '-mode');
        themeToggle.checked = Telegram.WebApp.colorScheme === 'dark';
    } else {
        // По умолчанию светлая тема, если нет ни локальных данных, ни Telegram
        document.body.classList.add('light-mode');
        themeToggle.checked = false;
    }

    themeToggle.addEventListener('change', () => {
        if (themeToggle.checked) {
            document.body.classList.remove('light-mode');
            document.body.classList.add('dark-mode');
            localStorage.setItem('theme', 'dark');
        } else {
            document.body.classList.remove('dark-mode');
            document.body.classList.add('light-mode');
            localStorage.setItem('theme', 'light');
        }
        if (window.Telegram && window.Telegram.WebApp) {
            Telegram.WebApp.HapticFeedback.impactOccurred('light');
        }
    });

    // Инициализация отображения
    showPage('main-page'); // Показываем главную страницу при загрузке
});