document.addEventListener('DOMContentLoaded', () => {
    const companyLogo = document.getElementById('company-logo');
    const companyName = document.getElementById('company-name');
    const companyDescription = document.getElementById('company-description');
    const backgroundBlur = document.querySelector('.background-blur');
    const headerContainer = document.querySelector('.header-container');
    const themeSwitch = document.getElementById('theme-switch');
    const botLogo = document.getElementById('bot-logo');
    const sunIcon = document.querySelector('.theme-icon.sun-icon');
    const moonIcon = document.querySelector('.theme-icon.moon-icon');
    const contentArea = document.querySelector('.content-area'); // Для коррекции padding-top

    const logoUrlInput = document.getElementById('logo-url-input');
    const companyNameInput = document.getElementById('company-name-input');
    const companyDescriptionInput = document.getElementById('company-description-input');
    const applyCompanyChangesBtn = document.getElementById('apply-company-changes');

    const botLogoUrlInput = document.getElementById('bot-logo-url-input');
    const applyBotLogoChangesBtn = document.getElementById('apply-bot-logo-changes');

    if (window.Telegram && window.Telegram.WebApp) {
        window.Telegram.WebApp.ready();
        // Telegram.WebApp.expand();
    }

    // Функция для обновления логотипа компании, названия и описания
    function updateCompanyInfo(logoUrl, name, description) {
        if (logoUrl !== null) {
            companyLogo.src = logoUrl;
            backgroundBlur.style.backgroundImage = `url(${logoUrl})`;
        }
        if (name !== null) {
            companyName.textContent = name;
        }
        if (description !== null) {
            companyDescription.textContent = description;
            companyDescription.style.display = description ? 'block' : 'none';

            // --- Логика для анимации "бегущей строки" (исправлено) ---
            companyDescription.style.animation = 'none'; // Сброс анимации перед измерением
            companyDescription.classList.remove('animate-scroll');

            // Временно устанавливаем ширину контейнера для измерения текста
            const originalMaxWidth = companyDescription.style.maxWidth;
            companyDescription.style.maxWidth = 'none'; // Снимаем ограничение для измерения полной ширины
            const textWidth = companyDescription.scrollWidth; // Полная ширина текста
            companyDescription.style.maxWidth = originalMaxWidth; // Возвращаем оригинальное ограничение

            const containerWidth = companyDescription.offsetWidth; // Фактическая видимая ширина контейнера

            // Если текст длиннее видимого контейнера, запускаем анимацию
            if (textWidth > containerWidth) {
                const scrollSpeed = 25; // px/sec, можно регулировать скорость
                // Прокручиваем текст на всю его ширину + ширина контейнера,
                // чтобы создать плавное повторение после полного исчезновения
                const scrollDistance = textWidth + 10; // Дополнительный отступ между повторениями
                const scrollDuration = scrollDistance / scrollSpeed;

                companyDescription.style.setProperty('--scroll-duration', `${scrollDuration}s`);
                companyDescription.style.setProperty('--scroll-distance-px', `-${scrollDistance}px`); // Расстояние для анимации

                companyDescription.classList.add('animate-scroll');
            } else {
                companyDescription.classList.remove('animate-scroll');
                companyDescription.style.animation = 'none'; // Гарантируем отсутствие анимации
            }
        }
    }

    // Функция для обновления логотипа бота
    function updateBotLogo(logoUrl) {
        if (logoUrl) {
            botLogo.src = logoUrl;
        }
    }

    // Устанавливаем дефолтные значения при загрузке
    updateCompanyInfo('https://via.placeholder.com/60/0000FF/FFFFFF?text=MyComp', 'Название Компании', 'Это довольно длинное мотивационное описание, которое должно прокручиваться полностью, не обрываясь, чтобы пользователи могли прочитать весь текст без проблем, и даже очень-очень длинный текст будет виден целиком!');
    updateBotLogo('https://via.placeholder.com/60/FF5733/FFFFFF?text=B');

    // --- Логика скролла для скрытия/показа хедера с эффектом "прилипания" (исправлено) ---
    let lastScrollTop = 0;
    let currentScrollTop = 0;
    const headerInitialHeight = parseInt(getComputedStyle(headerContainer).getPropertyValue('--header-height'));
    const scrollSensitivity = 0.5; // Насколько сильно панель "следует" за пальцем (0.1 - слабо, 1.0 - сильно)
    let headerOffset = 0; // Текущее смещение хедера по Y

    // Для предотвращения резких скачков
    let isScrolling = false;
    let scrollTimeout;

    window.addEventListener('scroll', () => {
        currentScrollTop = window.pageYOffset || document.documentElement.scrollTop;
        isScrolling = true;

        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            isScrolling = false;
            // Когда пользователь отпустил палец, "доводим" панель до конца
            if (headerOffset < -headerInitialHeight / 2) { // Если скрыта более чем наполовину
                headerOffset = -headerInitialHeight;
            } else {
                headerOffset = 0;
            }
            headerContainer.style.transition = 'transform var(--header-transition-duration) ease-out';
            headerContainer.style.transform = `translateY(${headerOffset}px)`;
            // Обновляем padding-top для content-area
            contentArea.style.paddingTop = `${headerInitialHeight + headerOffset}px`;

        }, 150); // Небольшая задержка после остановки скролла

        const scrollDelta = currentScrollTop - lastScrollTop;

        // Если скроллим вверх (показываем панель)
        if (scrollDelta < 0) {
            headerOffset = Math.min(0, headerOffset - scrollDelta * scrollSensitivity);
        }
        // Если скроллим вниз (скрываем панель)
        else if (scrollDelta > 0) {
            headerOffset = Math.max(-headerInitialHeight, headerOffset - scrollDelta * scrollSensitivity);
        }

        // Применяем transform, но без transition во время активного скролла
        headerContainer.style.transition = 'none';
        headerContainer.style.transform = `translateY(${headerOffset}px)`;
        // Обновляем padding-top для content-area
        contentArea.style.paddingTop = `${headerInitialHeight + headerOffset}px`;


        lastScrollTop = currentScrollTop;
    }, { passive: true }); // Использование passive: true для лучшей производительности скролла

    // Функция для применения темы
    function applyTheme(isDark) {
        if (isDark) {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }
        sunIcon.style.color = getComputedStyle(document.body).getPropertyValue('--icon-color-light');
        moonIcon.style.color = getComputedStyle(document.body).getPropertyValue('--icon-color-dark');
    }

    // Логика переключения темы (дневной/ночной)
    themeSwitch.addEventListener('change', () => {
        applyTheme(themeSwitch.checked);
        localStorage.setItem('theme', themeSwitch.checked ? 'dark' : 'light');
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

    // Логика для тестирования админ-функционала компании
    applyCompanyChangesBtn.addEventListener('click', () => {
        const newLogoUrl = logoUrlInput.value.trim();
        const newCompanyName = companyNameInput.value.trim();
        const newCompanyDescription = companyDescriptionInput.value.trim();

        updateCompanyInfo(
            newLogoUrl || null,
            newCompanyName || null,
            newCompanyDescription || null
        );

        if (newLogoUrl || newCompanyName || newCompanyDescription) {
            // После обновления, пересчитываем анимацию текста, если она нужна
            updateCompanyInfo(companyLogo.src, companyName.textContent, companyDescription.textContent);
            alert('Информация компании обновлена!');
        } else {
            alert('Пожалуйста, введите данные для обновления информации о компании.');
        }
    });

    // Логика для тестирования логотипа бота
    applyBotLogoChangesBtn.addEventListener('click', () => {
        const newBotLogoUrl = botLogoUrlInput.value.trim();
        if (newBotLogoUrl) {
            updateBotLogo(newBotLogoUrl);
            alert('Логотип бота обновлен!');
        } else {
            alert('Пожалуйста, введите URL логотипа бота.');
        }
    });
});