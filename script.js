document.addEventListener('DOMContentLoaded', () => {
    // --- Элементы DOM ---
    const companyLogo = document.getElementById('company-logo');
    const companyName = document.getElementById('company-name');
    const backgroundBlur = document.querySelector('.background-blur');
    const headerContainer = document.querySelector('.header-container');
    const themeSwitch = document.getElementById('theme-switch');
    const botLogo = document.getElementById('bot-logo');
    const sunIcon = document.querySelector('.theme-icon.sun-icon');
    const moonIcon = document.querySelector('.theme-icon.moon-icon');
    const contentArea = document.getElementById('content-area'); // Главная страница

    // Элементы админ-контроля (для разработчика/тестирования)
    const logoUrlInput = document.getElementById('logo-url-input');
    const companyNameInput = document.getElementById('company-name-input');
    const applyCompanyChangesBtn = document.getElementById('apply-company-changes');
    const botLogoUrlInput = document.getElementById('bot-logo-url-input');
    const applyBotLogoChangesBtn = document.getElementById('apply-bot-logo-changes');

    // Элементы нижней навигации
    const navButtons = document.querySelectorAll('.nav-button');
    const homeNavButton = navButtons[0]; // Кнопка "Главная"
    const sectionsNavButton = navButtons[1]; // Кнопка "Разделы"
    // const chatsNavButton = navButtons[2]; // Кнопка "Чаты"

    // Элементы страницы "Разделы"
    const sectionsPage = document.getElementById('sections-page');
    const sectionsBreadcrumbs = document.getElementById('sections-breadcrumbs');
    const currentSectionsList = document.getElementById('current-sections-list');
    const createSectionBtn = document.getElementById('create-section-btn');
    const goBackSectionBtn = document.getElementById('go-back-section-btn');
    const noSectionsMessage = document.querySelector('.no-sections-message');

    // Элементы модального окна контекстного меню
    const contextMenuModal = document.getElementById('context-menu-modal');
    const addQuantityBtn = document.getElementById('add-quantity-btn');
    const removeQuantityBtn = document.getElementById('remove-quantity-btn');
    const criticalMinBtn = document.getElementById('critical-min-btn');
    const setReminderBtn = document.getElementById('set-reminder-btn');
    const closeContextMenuBtn = document.getElementById('close-context-menu');

    // Элементы модального окна выбора получателей
    const recipientsModal = document.getElementById('recipients-modal');
    const recipientsList = document.getElementById('recipients-list');
    const confirmRecipientsBtn = document.getElementById('confirm-recipients-btn');
    const cancelRecipientsBtn = document.getElementById('cancel-recipients-btn');
    const selectAllRecipientsCheckbox = document.getElementById('select-all-recipients');
    const recipientFilterTabs = document.querySelectorAll('.filter-tab');

    // --- Состояние приложения ---
    let currentPath = [{ id: 'root', name: 'Главная' }]; // Текущий путь в древовидной структуре
    // Добавляем quantity и min_quantity для каждого раздела
    let sectionsData = []; // Здесь будут храниться все разделы (имитация базы данных)
    let currentParentId = 'root'; // ID текущего родительского раздела
    let longPressTimer;
    let currentSectionForMenu = null; // Раздел, для которого открыто контекстное меню
    let currentRecipientsSelectionType = 'critical_minimum'; // 'critical_minimum' или 'reminder'

    // Имитация данных пользователей
    const allUsers = [
        { id: 'user1', name: 'Иван Иванов', role: 'employee' },
        { id: 'user2', name: 'Петр Петров', role: 'admin' },
        { id: 'user3', name: 'Анна Сидорова', role: 'employee' },
        { id: 'user4', name: 'Мария Кузнецова', role: 'admin' },
        { id: 'user5', name: 'Дмитрий Смирнов', role: 'employee' }
    ];

    // --- Инициализация Telegram Web App ---
    if (window.Telegram && window.Telegram.WebApp) {
        window.Telegram.WebApp.ready();
        // Telegram.WebApp.expand();

        Telegram.WebApp.onEvent('themeChanged', () => {
            const isDark = Telegram.WebApp.colorScheme === 'dark';
            applyTheme(isDark);
            themeSwitch.checked = isDark;
            localStorage.setItem('theme', isDark ? 'dark' : 'light');
        });

        // Обработчик для получения данных от бота (например, начальные данные или ответы на запросы)
        window.Telegram.WebApp.onEvent('web_app_data', (event) => {
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
            } else if (data.type === 'all_sections_data' && Array.isArray(data.sections)) {
                sectionsData = data.sections;
                renderSections(currentParentId); // Перерисовываем разделы с учетом полученных данных
            }
            // Здесь можно добавить обработку других типов данных от бота, например, подтверждений операций
            Telegram.WebApp.showAlert(`Получен ответ от бота: ${JSON.stringify(data)}`);
        });

        // Запрашиваем начальные данные при старте (включая разделы)
        Telegram.WebApp.sendData(JSON.stringify({ command: 'request_initial_data' }));

    } else {
        // Устанавливаем дефолтные значения, если не в Telegram Web App
        updateCompanyInfo('https://via.placeholder.com/60/0000FF/FFFFFF?text=MyComp', 'Название Компании');
        updateBotLogo('https://via.placeholder.com/60/FF5733/FFFFFF?text=B');
        // Для тестирования в браузере, инициализируем тестовые разделы
        sectionsData = [
            { id: 'sec1', name: 'Раздел А (тестовый)', parentId: 'root', quantity: 10.5, min_quantity: 5 },
            { id: 'sec2', name: 'Раздел Б (тестовый)', parentId: 'root', quantity: 0, min_quantity: 0 },
            { id: 'sec1_1', name: 'Позиция А1', parentId: 'sec1', quantity: 20, min_quantity: 10 },
            { id: 'sec1_2', name: 'Позиция А2', parentId: 'sec1', quantity: 5, min_quantity: 2 }
        ];
        renderSections(currentParentId);
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
    const headerTotalHeight = parseInt(getComputedStyle(headerContainer).getPropertyValue('--header-height'));
    const borderRadiusSize = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--border-radius-size'));
    const scrollRevealHeight = headerTotalHeight - borderRadiusSize;

    window.addEventListener('scroll', () => {
        let currentScrollTop = window.pageYOffset || document.documentElement.scrollTop;
        let translateYValue = Math.min(0, Math.max(-scrollRevealHeight, currentScrollTop));
        
        // Применяем transform только к видимой странице
        if (contentArea.style.display !== 'none') {
             contentArea.style.transform = `translateY(${translateYValue}px)`;
        } else if (sectionsPage.style.display !== 'none') {
            sectionsPage.style.transform = `translateY(${translateYValue}px)`;
        }
        lastScrollTop = currentScrollTop;
    });

    // --- Логика переключения темы ---
    themeSwitch.addEventListener('change', () => {
        const isDark = themeSwitch.checked;
        applyTheme(isDark);
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        if (window.Telegram && window.Telegram.WebApp) {
            Telegram.WebApp.setHeaderColor(isDark ? Telegram.WebApp.themeParams.bg_color : Telegram.WebApp.themeParams.bg_color);
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
            alert('Пожалуйста, введите данные для обновления информации о компании.');
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
            alert('Пожалуйста, введите URL логотипа бота.');
        }
    });

    // --- Логика переключения страниц (Главная / Разделы) ---
    function showPage(pageElement) {
        // Скрываем все "страницы"
        contentArea.style.display = 'none';
        sectionsPage.style.display = 'none';
        // ... другие страницы, если будут

        // Показываем нужную страницу
        pageElement.style.display = 'block';

        // Управление видимостью хедера
        if (pageElement === contentArea) {
            headerContainer.classList.remove('hidden'); // Показать хедер на главной
        } else if (pageElement === sectionsPage) {
            headerContainer.classList.add('hidden'); // Скрыть хедер на странице разделов
        }

        // Обновляем активную кнопку навигации
        navButtons.forEach(btn => btn.classList.remove('active'));
        if (pageElement === contentArea) {
            homeNavButton.classList.add('active');
        } else if (pageElement === sectionsPage) {
            sectionsNavButton.classList.add('active');
        }
        // ... другие кнопки
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

    // Активируем кнопку "Главная" по умолчанию при загрузке
    homeNavButton.classList.add('active');
    showPage(contentArea); // Показываем главную страницу по умолчанию

    // --- Функции для управления разделами (Древовидная структура) ---

    // Генерируем уникальный ID (для имитации)
    function generateUniqueId() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    // Обновляет хлебные крошки
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
            span.dataset.id = item.id; // Для навигации
            sectionsBreadcrumbs.appendChild(span);
        });
        // Показываем/скрываем кнопку "Назад"
        goBackSectionBtn.style.display = currentParentId === 'root' ? 'none' : 'inline-block';
    }

    // Отображает разделы для текущего родителя
    function renderSections(parentId) {
        currentSectionsList.innerHTML = '';
        const children = sectionsData.filter(section => section.parentId === parentId);

        if (children.length === 0) {
            noSectionsMessage.style.display = 'block';
        } else {
            noSectionsMessage.style.display = 'none';
            children.forEach(section => {
                const sectionDiv = document.createElement('div');
                sectionDiv.classList.add('section-item');
                sectionDiv.dataset.id = section.id;
                
                // Добавляем обработчики для долгого нажатия
                sectionDiv.addEventListener('mousedown', (e) => startLongPress(e, section.id));
                sectionDiv.addEventListener('mouseup', cancelLongPress);
                sectionDiv.addEventListener('mouseleave', cancelLongPress);
                sectionDiv.addEventListener('touchstart', (e) => startLongPress(e, section.id), { passive: true });
                sectionDiv.addEventListener('touchend', cancelLongPress);
                sectionDiv.addEventListener('touchcancel', cancelLongPress);

                // Добавляем обработчик для обычного клика (для перехода)
                sectionDiv.addEventListener('click', (e) => {
                    // Проверяем, был ли клик по кнопке действия, чтобы не переходить в раздел
                    if (e.target.closest('.section-action-button') || e.target.closest('.context-menu-item')) {
                        return; // Не переходим, если кликнули на кнопку действия или пункт меню
                    }
                    if (window.Telegram && window.Telegram.WebApp) {
                        Telegram.WebApp.HapticFeedback.impactOccurred('light');
                    }
                    navigateToSection(section.id, section.name);
                });

                const sectionNameSpan = document.createElement('span');
                sectionNameSpan.classList.add('section-item-name');
                sectionNameSpan.textContent = section.name;
                
                // Добавляем отображение количества, только если оно больше 0
                if (typeof section.quantity === 'number' && section.quantity > 0) {
                    const quantitySpan = document.createElement('span');
                    quantitySpan.classList.add('section-item-quantity');
                    quantitySpan.textContent = `${section.quantity.toFixed(1).replace(/\.0$/, '')} шт.`; // Форматируем до 1 знака, убираем .0 если целое
                    sectionNameSpan.appendChild(quantitySpan);
                }
                
                sectionDiv.appendChild(sectionNameSpan);

                const sectionActionsDiv = document.createElement('div');
                sectionActionsDiv.classList.add('section-item-actions');

                // Кнопки "Редактировать" и "Удалить" остаются
                const editButton = document.createElement('button');
                editButton.classList.add('section-action-button');
                editButton.innerHTML = '&#9998;'; // ✏️
                editButton.title = 'Редактировать раздел';
                editButton.addEventListener('click', (e) => {
                    e.stopPropagation(); // Предотвращаем срабатывание клика на родительском элементе
                    editSection(section.id, section.name);
                });
                sectionActionsDiv.appendChild(editButton);

                const deleteButton = document.createElement('button');
                deleteButton.classList.add('section-action-button');
                deleteButton.innerHTML = '&#10006;'; // ❌
                deleteButton.title = 'Удалить раздел';
                deleteButton.addEventListener('click', (e) => {
                    e.stopPropagation(); // Предотвращаем срабатывание клика на родительском элементе
                    deleteSection(section.id);
                });
                sectionActionsDiv.appendChild(deleteButton);

                sectionDiv.appendChild(sectionActionsDiv);
                currentSectionsList.appendChild(sectionDiv);
            });
        }
        updateBreadcrumbs();
    }

    // Переходит в указанный раздел (добавляет в путь)
    function navigateToSection(id, name) {
        currentParentId = id;
        currentPath.push({ id: id, name: name });
        renderSections(id);
    }

    // Переходит к указанному элементу в хлебных крошках
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

    // Создание нового раздела/подраздела
    createSectionBtn.addEventListener('click', async () => {
        if (window.Telegram && window.Telegram.WebApp) {
            Telegram.WebApp.HapticFeedback.impactOccurred('medium');
            // Telegram.WebApp.showPopup не позволяет ввести текст напрямую, 
            // поэтому для имитации ввода используем prompt после выбора кнопки.
            // В реальном приложении это будет реализовано через поле ввода в боте или кастомный WebApp UI.
            const sectionName = prompt('Введите название нового раздела:'); 
            if (sectionName && sectionName.trim() !== '') {
                const newId = generateUniqueId();
                const newSection = {
                    id: newId,
                    name: sectionName.trim(),
                    parentId: currentParentId,
                    quantity: 0, // Новые разделы начинаются с 0 шт.
                    min_quantity: null // По умолчанию нет критического минимума
                };
                sectionsData.push(newSection);
                renderSections(currentParentId);

                // Отправляем данные боту
                Telegram.WebApp.sendData(JSON.stringify({
                    type: 'create_section',
                    payload: newSection
                }));
                Telegram.WebApp.showAlert(`Раздел "${sectionName}" создан и данные отправлены боту.`);
            } else {
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
                    min_quantity: null
                };
                sectionsData.push(newSection);
                renderSections(currentParentId);
                alert(`Раздел "${sectionName}" создан (только в браузере).`);
            } else {
                alert('Название раздела не может быть пустым.');
            }
        }
    });

    // Редактирование раздела
    function editSection(id, oldName) {
        if (window.Telegram && window.Telegram.WebApp) {
            Telegram.WebApp.HapticFeedback.impactOccurred('medium');
            const newName = prompt(`Введите новое название для раздела "${oldName}":`, oldName);
            if (newName && newName.trim() !== '') {
                const sectionIndex = sectionsData.findIndex(s => s.id === id);
                if (sectionIndex !== -1) {
                    sectionsData[sectionIndex].name = newName.trim();
                    // Обновляем имя в текущем пути, если оно там есть
                    const pathIndex = currentPath.findIndex(p => p.id === id);
                    if (pathIndex !== -1) {
                        currentPath[pathIndex].name = newName.trim();
                    }
                    renderSections(currentParentId);

                    // Отправляем данные боту
                    Telegram.WebApp.sendData(JSON.stringify({
                        type: 'update_section',
                        payload: { id: id, name: newName.trim() }
                    }));
                    Telegram.WebApp.showAlert(`Раздел обновлен и данные отправлены боту.`);
                }
            } else {
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
            } else {
                alert('Название раздела не может быть пустым.');
            }
        }
    }

    // Удаление раздела
    function deleteSection(id) {
        if (window.Telegram && window.Telegram.WebApp) {
            Telegram.WebApp.HapticFeedback.notificationOccurred('warning');
            Telegram.WebApp.showConfirm('Вы уверены, что хотите удалить этот раздел и все его подразделы?', (confirmed) => {
                if (confirmed) {
                    // Рекурсивная функция для получения всех ID, которые нужно удалить
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

                    // Отправляем данные боту
                    Telegram.WebApp.sendData(JSON.stringify({
                        type: 'delete_section',
                        payload: { ids: idsToDelete } // Отправляем список удаленных ID
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

    // Кнопка "Назад"
    goBackSectionBtn.addEventListener('click', () => {
        if (currentPath.length > 1) {
            currentPath.pop(); // Удаляем текущий раздел из пути
            currentParentId = currentPath[currentPath.length - 1].id; // Новый родитель
            renderSections(currentParentId);
            if (window.Telegram && window.Telegram.WebApp) {
                Telegram.WebApp.HapticFeedback.impactOccurred('light');
            }
        }
    });

    // --- Логика долгого нажатия и контекстного меню ---
    const LONG_PRESS_THRESHOLD = 500; // milliseconds

    function startLongPress(e, sectionId) {
        // Если это тач-событие и уже есть активное касание, не запускаем новый таймер
        if (e.touches && e.touches.length > 1) {
            cancelLongPress();
            return;
        }

        // Предотвращаем стандартное контекстное меню браузера для правого клика
        if (e.type === 'mousedown' && e.button === 2) {
             e.preventDefault(); 
             return; // Игнорируем правый клик для long press
        }

        clearTimeout(longPressTimer); // Очищаем предыдущий таймер, если он был

        longPressTimer = setTimeout(() => {
            currentSectionForMenu = sectionId;
            showContextMenu();
        }, LONG_PRESS_THRESHOLD);
    }

    function cancelLongPress() {
        clearTimeout(longPressTimer);
    }

    function showContextMenu() {
        if (window.Telegram && window.Telegram.WebApp) {
            Telegram.WebApp.HapticFeedback.impactOccurred('heavy');
        }
        document.body.classList.add('modal-open'); // Добавляем класс для блюра
        contextMenuModal.classList.remove('hidden');
        contextMenuModal.style.display = 'flex';
        // Убедимся, что modal-content не закрывает модальное окно при клике
        contextMenuModal.querySelector('.modal-content').addEventListener('click', (e) => e.stopPropagation());
    }

    function hideContextMenu() {
        document.body.classList.remove('modal-open');
        contextMenuModal.classList.add('hidden');
        setTimeout(() => { // Ждем окончания анимации, затем скрываем
            contextMenuModal.style.display = 'none';
        }, 300); 
        currentSectionForMenu = null;
    }

    closeContextMenuBtn.addEventListener('click', hideContextMenu);
    contextMenuModal.addEventListener('click', (e) => {
        // Закрываем, если клик был на фоне (вне modal-content)
        if (e.target === contextMenuModal) {
            hideContextMenu();
        }
    });

    // --- Обработчики кнопок контекстного меню ---
    addQuantityBtn.addEventListener('click', async () => {
        hideContextMenu();
        if (!currentSectionForMenu) return;

        let amountInput;
        // В реальном TWA приложении для ввода числа потребуется более сложный UI или кастомная клавиатура бота.
        // Здесь используем prompt для демонстрации.
        if (window.Telegram && window.Telegram.WebApp) {
            amountInput = prompt('Введите количество для добавления (можно дробное):');
            Telegram.WebApp.HapticFeedback.impactOccurred('light');
        } else {
            amountInput = prompt('Введите количество для добавления (можно дробное):');
        }
        const amount = parseFloat(amountInput);

        if (!isNaN(amount) && amount > 0) {
            const section = sectionsData.find(s => s.id === currentSectionForMenu);
            if (section) {
                section.quantity = (section.quantity || 0) + amount; // Добавляем к текущему или к 0
                renderSections(currentParentId); // Перерисовать, чтобы обновилось кол-во

                if (window.Telegram && window.Telegram.WebApp) {
                    Telegram.WebApp.sendData(JSON.stringify({
                        type: 'add_quantity',
                        payload: { id: section.id, amount: amount }
                    }));
                    Telegram.WebApp.showAlert(`Добавлено ${amount.toFixed(1).replace(/\.0$/, '')} к "${section.name}".`);
                } else {
                    alert(`Добавлено ${amount.toFixed(1).replace(/\.0$/, '')} к "${section.name}".`);
                }
            }
        } else {
            if (amountInput !== null) { // Если пользователь не отменил ввод
                if (window.Telegram && window.Telegram.WebApp) {
                    Telegram.WebApp.showAlert('Некорректное количество.');
                } else {
                    alert('Некорректное количество.');
                }
            }
        }
    });

    removeQuantityBtn.addEventListener('click', async () => {
        hideContextMenu();
        if (!currentSectionForMenu) return;

        let amountInput;
        if (window.Telegram && window.Telegram.WebApp) {
            amountInput = prompt('Введите количество для списания (можно дробное):');
            Telegram.WebApp.HapticFeedback.impactOccurred('light');
        } else {
            amountInput = prompt('Введите количество для списания (можно дробное):');
        }
        const amount = parseFloat(amountInput);

        if (!isNaN(amount) && amount > 0) {
            const section = sectionsData.find(s => s.id === currentSectionForMenu);
            if (section) {
                const currentQty = section.quantity || 0;
                if (amount > currentQty) {
                    if (window.Telegram && window.Telegram.WebApp) {
                        Telegram.WebApp.showAlert(`Недостаточное количество. Доступно: ${currentQty.toFixed(1).replace(/\.0$/, '')} шт.`);
                    } else {
                        alert(`Недостаточное количество. Доступно: ${currentQty.toFixed(1).replace(/\.0$/, '')} шт.`);
                    }
                    return;
                }
                section.quantity = currentQty - amount;
                renderSections(currentParentId);

                if (window.Telegram && window.Telegram.WebApp) {
                    Telegram.WebApp.sendData(JSON.stringify({
                        type: 'remove_quantity',
                        payload: { id: section.id, amount: amount }
                    }));
                    Telegram.WebApp.showAlert(`Списано ${amount.toFixed(1).replace(/\.0$/, '')} из "${section.name}".`);
                } else {
                    alert(`Списано ${amount.toFixed(1).replace(/\.0$/, '')} из "${section.name}".`);
                }
            }
        } else {
            if (amountInput !== null) { // Если пользователь не отменил ввод
                if (window.Telegram && window.Telegram.WebApp) {
                    Telegram.WebApp.showAlert('Некорректное количество.');
                } else {
                    alert('Некорректное количество.');
                }
            }
        }
    });

    criticalMinBtn.addEventListener('click', () => {
        hideContextMenu();
        if (!currentSectionForMenu) return;
        currentRecipientsSelectionType = 'critical_minimum';
        
        let minQuantityInput;
        if (window.Telegram && window.Telegram.WebApp) {
            minQuantityInput = prompt('Введите критический минимум для этого раздела (можно дробное):');
            Telegram.WebApp.HapticFeedback.impactOccurred('light');
        } else {
            minQuantityInput = prompt('Введите критический минимум для этого раздела (можно дробное):');
        }
        const minQuantity = parseFloat(minQuantityInput);

        if (!isNaN(minQuantity) && minQuantity >= 0) {
            const section = sectionsData.find(s => s.id === currentSectionForMenu);
            if (section) {
                section.min_quantity = minQuantity; // Сохраняем критический минимум
                showRecipientsModal(); // Показываем модальное окно выбора получателей
            }
        } else {
             if (minQuantityInput !== null) { // Если пользователь не отменил ввод
                if (window.Telegram && window.Telegram.WebApp) {
                    Telegram.WebApp.showAlert('Некорректное значение для критического минимума.');
                } else {
                    alert('Некорректное значение для критического минимума.');
                }
            }
        }
    });

    setReminderBtn.addEventListener('click', () => {
        hideContextMenu();
        if (!currentSectionForMenu) return;
        currentRecipientsSelectionType = 'reminder';

        let reminderMessage = '';
        let reminderDateTime = '';

        if (window.Telegram && window.Telegram.WebApp) {
            reminderMessage = prompt('Введите сообщение для напоминания:');
            // Для datetime-local в TWA, скорее всего, потребуется кастомный ввод или выбор из UI
            reminderDateTime = prompt('Введите дату и время напоминания (YYYY-MM-DDTHH:MM):'); 
            Telegram.WebApp.HapticFeedback.impactOccurred('light');
        } else {
            reminderMessage = prompt('Введите сообщение для напоминания:');
            reminderDateTime = prompt('Введите дату и время напоминания (YYYY-MM-DDTHH:MM):');
        }

        if (reminderMessage && reminderMessage.trim() !== '' && reminderDateTime && reminderDateTime.trim() !== '') {
            // В реальном приложении нужно будет проверить формат даты/времени
            const section = sectionsData.find(s => s.id === currentSectionForMenu);
            if (section) {
                section.reminder_message = reminderMessage.trim();
                section.reminder_datetime = reminderDateTime.trim();
                showRecipientsModal(); // Показываем модальное окно выбора получателей
            }
        } else {
             if (reminderMessage !== null && reminderDateTime !== null) { // Если пользователь не отменил ввод
                if (window.Telegram && window.Telegram.WebApp) {
                    Telegram.WebApp.showAlert('Сообщение или дата/время напоминания не могут быть пустыми.');
                } else {
                    alert('Сообщение или дата/время напоминания не могут быть пустыми.');
                }
            }
        }
    });

    // --- Логика выбора получателей ---
    function showRecipientsModal() {
        document.body.classList.add('modal-open'); // Добавляем класс для блюра
        recipientsModal.classList.remove('hidden');
        recipientsModal.style.display = 'flex';
        // Изначально показываем всех пользователей
        renderUsersForSelection('all'); 
        // Сбросить чекбокс "Выбрать всех"
        selectAllRecipientsCheckbox.checked = false;
        // Активировать вкладку "Все"
        recipientFilterTabs.forEach(tab => {
            if (tab.dataset.filter === 'all') {
                tab.classList.add('active');
            } else {
                tab.classList.remove('active');
            }
        });
        // Убедимся, что modal-content не закрывает модальное окно при клике
        recipientsModal.querySelector('.modal-content').addEventListener('click', (e) => e.stopPropagation());
    }

    function hideRecipientsModal() {
        document.body.classList.remove('modal-open');
        recipientsModal.classList.add('hidden');
        setTimeout(() => {
            recipientsModal.style.display = 'none';
        }, 300);
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

    // Обработчики для табов фильтра
    recipientFilterTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            recipientFilterTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            renderUsersForSelection(tab.dataset.filter);
            selectAllRecipientsCheckbox.checked = false; // Сбросить при смене фильтра
        });
    });

    // Выбрать/снять выделение со всех
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

        if (selectedUserIds.length === 0) {
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
                        min_quantity: section.min_quantity, // Используем ранее сохраненное значение
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
                        message: section.reminder_message, // Используем ранее сохраненное сообщение
                        datetime: section.reminder_datetime, // Используем ранее сохраненное время
                        recipients: selectedUserIds
                    }
                }));
                Telegram.WebApp.showAlert(`Напоминание для "${section.name}" запланировано. Сообщение "${section.reminder_message}" будет отправлено выбранным пользователям в ${section.reminder_datetime}.`);
            } else {
                alert(`Напоминание для "${section.name}" запланировано. Сообщение "${section.reminder_message}" будет отправлено выбранным пользователям в ${section.reminder_datetime}.`);
            }
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
        // Закрываем, если клик был на фоне (вне modal-content)
        if (e.target === recipientsModal) {
            hideRecipientsModal();
        }
    });


    // Инициализация разделов при загрузке страницы (если не в TWA)
    if (!(window.Telegram && window.Telegram.WebApp)) {
        renderSections(currentParentId);
    }
});