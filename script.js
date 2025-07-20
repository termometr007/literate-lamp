document.addEventListener('DOMContentLoaded', () => {
    const companyLogo = document.getElementById('company-logo');
    const companyName = document.getElementById('company-name');
    // const companyDescription = document.getElementById('company-description'); // Удалена константа
    const backgroundBlur = document.querySelector('.background-blur');
    const headerContainer = document.querySelector('.header-container');
    const themeSwitch = document.getElementById('theme-switch');
    const botLogo = document.getElementById('bot-logo');
    const sunIcon = document.querySelector('.theme-icon.sun-icon');
    const moonIcon = document.querySelector('.theme-icon.moon-icon');
    const contentArea = document.querySelector('.content-area');

    const logoUrlInput = document.getElementById('logo-url-input');
    const companyNameInput = document.getElementById('company-name-input');
    // const companyDescriptionInput = document.getElementById('company-description-input'); // Удалена константа
    const applyCompanyChangesBtn = document.getElementById('apply-company-changes');

    const botLogoUrlInput = document.getElementById('bot-logo-url-input');
    const applyBotLogoChangesBtn = document.getElementById('apply-bot-logo-changes');

    if (window.Telegram && window.Telegram.WebApp) {
        window.Telegram.WebApp.ready();
        // Telegram.WebApp.expand();
    }

    // Функция для обновления логотипа компании и названия
    function updateCompanyInfo(logoUrl, name /*, description */) { // Удален параметр description
        if (logoUrl !== null) {
            companyLogo.src = logoUrl;
            backgroundBlur.style.backgroundImage = `url(${logoUrl})`;
        }
        if (name !== null) {
            companyName.textContent = name;
        }
        // Удалена вся логика, связанная с companyDescription
    }

    // Функция для обновления логотипа бота
    function updateBotLogo(logoUrl) {
        if (logoUrl) {
            botLogo.src = logoUrl;
        }
    }

    // Устанавливаем дефолтные значения при загрузке
    updateCompanyInfo('https://via.placeholder.com/60/0000FF/FFFFFF?text=MyComp', 'Название Компании'); // Удалено описание из вызова
    updateBotLogo('https://via.placeholder.com/60/FF5733/FFFFFF?text=B');

    // --- Логика скролла: теперь двигается content-area, а header-container остается неподвижным ---
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


    // Функция для применения темы
    function applyTheme(isDark) {
        if (isDark) {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }
        // Удалены строки, которые устанавливали цвет иконок через JS, теперь это управляется CSS-переменными напрямую и без transition
        // sunIcon.style.color = getComputedStyle(document.body).getPropertyValue('--icon-color-light');
        // moonIcon.style.color = getComputedStyle(document.body).getPropertyValue('--icon-color-dark');
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
        // const newCompanyDescription = companyDescriptionInput.value.trim(); // Удалена константа

        updateCompanyInfo(
            newLogoUrl || null,
            newCompanyName || null
            // newCompanyDescription || null // Удалено описание из вызова
        );

        if (newLogoUrl || newCompanyName) { // Проверяем только лого и название
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