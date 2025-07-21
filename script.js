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

    // НОВЫЕ ЭЛЕМЕНТЫ для страницы "Разделы"
    const sectionsPage = document.getElementById('sections-page');
    const sectionsBreadcrumbs = document.getElementById('sections-breadcrumbs');
    const currentSectionsList = document.getElementById('current-sections-list');
    const createSectionBtn = document.getElementById('create-section-btn');
    const goBackSectionBtn = document.getElementById('go-back-section-btn');
    const noSectionsMessage = document.querySelector('.no-sections-message');

    // --- Состояние приложения ---
    let currentPath = [{ id: 'root', name: 'Главная' }]; // Текущий путь в древовидной структуре
    let sectionsData = []; // Здесь будут храниться все разделы (имитация базы данных)
    let currentParentId = 'root'; // ID текущего родительского раздела

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

        // Функция для имитации получения начальных данных от бота.
        // В реальном приложении бот вызовет Telegram.WebApp.postEvent('web_app_data', JSON.stringify({ ... }))
        // Вы можете вызвать это в консоли браузера для тестирования:
        // Telegram.WebApp.receiveInitialData({ companyLogo: 'https://example.com/new_company_logo.png', companyName: 'Новая Компания', botLogo: 'https://example.com/new_bot_logo.png' });
        // Для разделов:
        // Telegram.WebApp.receiveInitialData({ type: 'all_sections_data', sections: [{ id: 's1', name: 'Мой Главный Раздел', parentId: 'root', children: [] }] });
        window.Telegram.WebApp.receiveInitialData = (data) => {
            console.log('Received initial data from bot:', data);
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
            if (data.type === 'all_sections_data' && Array.isArray(data.sections)) {
                sectionsData = data.sections;
                renderSections(currentParentId); // Перерисовываем разделы с учетом полученных данных
            }
        };

        // Запрашиваем начальные данные при старте (включая разделы)
        Telegram.WebApp.sendData(JSON.stringify({ command: 'request_initial_data' }));

    } else {
        // Устанавливаем дефолтные значения, если не в Telegram Web App
        updateCompanyInfo('https://via.placeholder.com/60/0000FF/FFFFFF?text=MyComp', 'Название Компании');
        updateBotLogo('https://via.placeholder.com/60/FF5733/FFFFFF?text=B');
        // Для тестирования в браузере, инициализируем тестовые разделы
        sectionsData = [
            { id: 'sec1', name: 'Раздел А (тестовый)', parentId: 'root', children: [] },
            { id: 'sec2', name: 'Раздел Б (тестовый)', parentId: 'root', children: [] }
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
        // Применяем transform только к contentArea, sectionsPage не должен сдвигаться вместе с ним
        // Мы будем переключать видимость страниц, а не сдвигать их
        if (contentArea.style.display !== 'none') {
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
                alert('Логотип бота обновлен (только в браузере)!');
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

                const sectionNameSpan = document.createElement('span');
                sectionNameSpan.classList.add('section-item-name');
                sectionNameSpan.textContent = section.name;
                sectionDiv.appendChild(sectionNameSpan);

                const sectionActionsDiv = document.createElement('div');
                sectionActionsDiv.classList.add('section-item-actions');

                // Кнопка "Войти" в подраздел
                const enterButton = document.createElement('button');
                enterButton.classList.add('section-action-button');
                enterButton.innerHTML = '&#9658;'; // ▶️
                enterButton.title = 'Войти в подраздел';
                enterButton.addEventListener('click', (e) => {
                    e.stopPropagation(); // Предотвращаем срабатывание клика по sectionDiv
                    navigateToSection(section.id, section.name);
                });
                sectionActionsDiv.appendChild(enterButton);

                // Кнопка "Редактировать"
                const editButton = document.createElement('button');
                editButton.classList.add('section-action-button');
                editButton.innerHTML = '&#9998;'; // ✏️
                editButton.title = 'Редактировать раздел';
                editButton.addEventListener('click', (e) => {
                    e.stopPropagation();
                    editSection(section.id, section.name);
                });
                sectionActionsDiv.appendChild(editButton);

                // Кнопка "Удалить"
                const deleteButton = document.createElement('button');
                deleteButton.classList.add('section-action-button');
                deleteButton.innerHTML = '&#10006;'; // ❌
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

    // Переходит в указанный раздел (добавляет в путь)
    function navigateToSection(id, name) {
        currentParentId = id;
        currentPath.push({ id: id, name: name });
        renderSections(id);
        if (window.Telegram && window.Telegram.WebApp) {
            Telegram.WebApp.HapticFeedback.impactOccurred('light');
        }
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
            Telegram.WebApp.showPopup({
                title: 'Создать раздел',
                message: 'Введите название нового раздела:',
                buttons: [
                    { id: 'save', type: 'ok', text: 'Сохранить' },
                    { id: 'cancel', type: 'cancel', text: 'Отмена' }
                ]
            }, (buttonId) => {
                if (buttonId === 'save') {
                    // Telegram Web App API не предоставляет прямой ввод текста в showPopup.
                    // Для реального ввода текста нужно будет использовать другие подходы (например, Custom Keyboards или поле ввода на самой странице, которое будет показываться).
                    // Для MVP и тестирования, будем использовать prompt для имитации ввода.
                    const sectionName = prompt('Введите название раздела:');
                    if (sectionName && sectionName.trim() !== '') {
                        const newId = generateUniqueId();
                        const newSection = {
                            id: newId,
                            name: sectionName.trim(),
                            parentId: currentParentId
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
                }
            });
        } else {
            const sectionName = prompt('Введите название раздела:');
            if (sectionName && sectionName.trim() !== '') {
                const newId = generateUniqueId();
                const newSection = {
                    id: newId,
                    name: sectionName.trim(),
                    parentId: currentParentId
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
            Telegram.WebApp.showPopup({
                title: 'Редактировать раздел',
                message: `Измените название раздела "${oldName}":`,
                buttons: [
                    { id: 'save', type: 'ok', text: 'Сохранить' },
                    { id: 'cancel', type: 'cancel', text: 'Отмена' }
                ]
            }, (buttonId) => {
                if (buttonId === 'save') {
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
                }
            });
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

    // Инициализация разделов при загрузке страницы (если не в TWA)
    if (!(window.Telegram && window.Telegram.WebApp)) {
        renderSections(currentParentId);
    }
});