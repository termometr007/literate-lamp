document.addEventListener('DOMContentLoaded', () => {
    const companyLogo = document.getElementById('company-logo');
    const companyName = document.getElementById('company-name');
    const companyDescription = document.getElementById('company-description');
    const backgroundBlur = document.querySelector('.background-blur');
    const headerContainer = document.querySelector('.header-container');
    const themeSwitch = document.getElementById('theme-switch');
    const botLogo = document.getElementById('bot-logo');
    const sunIcon = document.querySelector('.theme-icon.sun-icon');
    const moonIcon = document.querySelector('.moon-icon'); 
    const contentArea = document.querySelector('.content-area');

    const logoUrlInput = document.getElementById('logo-url-input');
    const companyNameInput = document.getElementById('company-name-input');
    const companyDescriptionInput = document.getElementById('company-description-input'); 
    const applyCompanyChangesBtn = document.getElementById('apply-company-changes');

    const botLogoUrlInput = document.getElementById('bot-logo-url-input');
    const applyBotLogoChangesBtn = document.getElementById('apply-bot-logo-changes');

    if (window.Telegram && window.Telegram.WebApp) {
        window.Telegram.WebApp.ready();
        // window.Telegram.WebApp.expand();
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
            // Убедимся, что текст виден и может переноситься
            companyDescription.style.display = 'block'; // Или 'inline-block' в зависимости от разметки
            companyDescription.style.whiteSpace = 'normal'; // Разрешаем перенос строк
            companyDescription.style.overflow = 'visible'; // Убираем скрытие
            companyDescription.style.animation = 'none'; // Отключаем любую анимацию
            companyDescription.style.transform = 'translateX(0)'; // Отключаем смещение
        }
    }

    // Функция для обновления логотипа бота
    function updateBotLogo(logoUrl) {
        if (logoUrl) {
            botLogo.src = logoUrl;
        }
    }

    // Устанавливаем дефолтные значения при загрузке
    updateCompanyInfo('https://via.placeholder.com/60/0000FF/FFFFFF?text=MyComp', 'Название Компании', 'Это очень-очень длинное мотивационное описание, которое должно теперь полностью помещаться, переносясь на новую строку, чтобы пользователи могли прочитать весь текст без проблем, и даже очень-очень длинный текст будет виден целиком от начала до конца!');
    updateBotLogo('https://via.placeholder.com/60/FF5733/FFFFFF?text=B');

    // --- Логика скролла: content-area двигается, header-container остается неподвижным ---
    let lastScrollTop = 0;
    const headerTotalHeight = parseInt(getComputedStyle(headerContainer).getPropertyValue('--header-height'));
    const borderRadiusSize = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--border-radius-size'));
    
    const maxTranslateY = headerTotalHeight + borderRadiusSize; 
    
    window.addEventListener('scroll', () => {
        let currentScrollTop = window.pageYOffset || document.documentElement.scrollTop;

        let translateYValue = -Math.min(currentScrollTop, maxTranslateY);
        
        contentArea.style.transform = `translateY(${translateYValue}px)`;

        lastScrollTop = currentScrollTop;

        if (currentScrollTop === 0) {
            contentArea.style.transform = `translateY(0px)`;
        }
    });


    // Функция для применения темы
    function applyTheme(isDark) {
        if (isDark) {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }
        // Эти строки теперь не нужны, так как переходы управляются CSS 'transition'
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
        const newCompanyDescription = companyDescriptionInput.value.trim();

        updateCompanyInfo(
            newLogoUrl || null,
            newCompanyName || null,
            newCompanyDescription || null
        );

        alert('Информация компании обновлена!');
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