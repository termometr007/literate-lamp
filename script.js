document.addEventListener('DOMContentLoaded', () => {
    const companyLogo = document.getElementById('company-logo');
    const companyName = document.getElementById('company-name');
    // const companyDescription = document.getElementById('company-description'); // УДАЛЕНО
    const backgroundBlur = document.querySelector('.background-blur');
    const headerContainer = document.querySelector('.header-container');
    const themeSwitch = document.getElementById('theme-switch');
    const botLogo = document.getElementById('bot-logo');
    const sunIcon = document.querySelector('.theme-icon.sun-icon');
    const moonIcon = document.querySelector('.theme-icon.moon-icon');
    const contentArea = document.querySelector('.content-area');

    const logoUrlInput = document.getElementById('logo-url-input');
    const companyNameInput = document.getElementById('company-name-input');
    // const companyDescriptionInput = document.getElementById('company-description-input'); // УДАЛЕНО
    const applyCompanyChangesBtn = document.getElementById('apply-company-changes');

    const botLogoUrlInput = document.getElementById('bot-logo-url-input');
    const applyBotLogoChangesBtn = document.getElementById('apply-bot-logo-changes');

    if (window.Telegram && window.Telegram.WebApp) {
        window.Telegram.WebApp.ready();
        // Telegram.WebApp.expand();
    }

    // Функция для обновления логотипа компании и названия (БЕЗ ОПИСАНИЯ)
    function updateCompanyInfo(logoUrl, name) {
        if (logoUrl !== null) {
            companyLogo.src = logoUrl;
            backgroundBlur.style.backgroundImage = `url(${logoUrl})`;
        }
        if (name !== null) {
            companyName.textContent = name;
        }
    }

    // Функция для обновления логотипа бота
    function updateBotLogo(logoUrl) {
        if (logoUrl) {
            botLogo.src = logoUrl;
        }
    }

    // Устанавливаем дефолтные значения при загрузке (БЕЗ ОПИСАНИЯ)
    updateCompanyInfo('https://via.placeholder.com/60/0000FF/FFFFFF?text=MyComp', 'Название Компании');
    updateBotLogo('https://via.placeholder.com/60/FF5733/FFFFFF?text=B');

    // --- Логика скролла ---
    let lastScrollTop = 0;
    const headerTotalHeight = parseInt(getComputedStyle(headerContainer).getPropertyValue('--header-height'));
    const borderRadiusSize = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--border-radius-size'));
    
    const scrollRevealHeight = headerTotalHeight - borderRadiusSize;

    window.addEventListener('scroll', () => {
        let currentScrollTop = window.pageYOffset || document.documentElement.scrollTop;
        let translateYValue = Math.min(0, Math.max(-scrollRevealHeight, currentScrollTop));
        contentArea.style.transform = `translateY(${translateYValue}px)`;
        lastScrollTop = currentScrollTop;
    });


    // Функция для применения темы (ВОССТАНОВЛЕНА ЛОГИКА ИЗ ВАШЕГО КОДА)
    function applyTheme(isDark) {
        if (isDark) {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }
        // Эти строки обеспечивают плавное изменение цвета иконок при смене темы
        sunIcon.style.color = getComputedStyle(document.body).getPropertyValue('--icon-color-light');
        moonIcon.style.color = getComputedStyle(document.body).getPropertyValue('--icon-color-dark');
    }

    // Логика переключения темы
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

    // Логика для тестирования админ-функционала компании (БЕЗ ОПИСАНИЯ)
    applyCompanyChangesBtn.addEventListener('click', () => {
        const newLogoUrl = logoUrlInput.value.trim();
        const newCompanyName = companyNameInput.value.trim();

        updateCompanyInfo(
            newLogoUrl || null,
            newCompanyName || null
        );

        if (newLogoUrl || newCompanyName) {
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