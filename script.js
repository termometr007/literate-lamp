document.addEventListener('DOMContentLoaded', () => {
    const companyLogo = document.getElementById('company-logo');
    const companyName = document.getElementById('company-name');
    const backgroundBlur = document.querySelector('.background-blur');
    const headerContainer = document.querySelector('.header-container');
    const themeSwitch = document.getElementById('theme-switch');
    const botLogo = document.getElementById('bot-logo');
    const sunIcon = document.querySelector('.sun-icon');
    const moonIcon = document.querySelector('.moon-icon');

    // Элементы для тестирования админ-функционала компании
    const logoUrlInput = document.getElementById('logo-url-input');
    const companyNameInput = document.getElementById('company-name-input');
    const applyCompanyChangesBtn = document.getElementById('apply-company-changes');

    // Элементы для тестирования логотипа бота
    const botLogoUrlInput = document.getElementById('bot-logo-url-input');
    const applyBotLogoChangesBtn = document.getElementById('apply-bot-logo-changes');


    // Инициализация Telegram WebApp
    if (window.Telegram && window.Telegram.WebApp) {
        window.Telegram.WebApp.ready();
        // Telegram.WebApp.expand();
    }

    // Функция для обновления логотипа компании и фона
    function updateCompanyInfo(logoUrl, name) {
        if (logoUrl) {
            companyLogo.src = logoUrl;
            backgroundBlur.style.backgroundImage = `url(${logoUrl})`;
        }
        if (name) {
            companyName.textContent = name;
        }
    }

    // Функция для обновления логотипа бота (разработчик меняет)
    function updateBotLogo(logoUrl) {
        if (logoUrl) {
            botLogo.src = logoUrl;
        }
    }

    // Устанавливаем дефолтные значения при загрузке (можно изменить)
    // Эти значения будут видны при первом запуске, пока ты их не изменишь через поля ввода
    updateCompanyInfo('https://via.placeholder.com/100/0000FF/FFFFFF?text=MyComp', 'Название Компании');
    updateBotLogo('https://via.placeholder.com/50/FF5733/FFFFFF?text=B');


    // Логика скролла для скрытия хедера
    let lastScrollTop = 0;
    const headerInitialHeight = 120; // Фиксированная начальная высота хедера
    const headerThreshold = 50;

    window.addEventListener('scroll', () => {
        let st = window.pageYOffset || document.documentElement.scrollTop;

        if (st > lastScrollTop && st > headerThreshold) {
            headerContainer.style.height = '0px';
            headerContainer.style.opacity = '0';
        } else if (st < lastScrollTop || st <= headerThreshold) {
            headerContainer.style.height = `${headerInitialHeight}px`;
            headerContainer.style.opacity = '1';
        }
        lastScrollTop = st <= 0 ? 0 : st;
    });

    // Функция для применения темы
    function applyTheme(isDark) {
        if (isDark) {
            document.body.classList.add('dark-mode');
            // Обновляем цвета иконок в зависимости от режима
            sunIcon.style.color = 'var(--icon-color-light)';
            moonIcon.style.color = 'var(--icon-color-dark)';
        } else {
            document.body.classList.remove('dark-mode');
            sunIcon.style.color = 'var(--icon-color-light)';
            moonIcon.style.color = 'var(--icon-color-dark)';
        }
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

        if (newLogoUrl) {
            updateCompanyInfo(newLogoUrl, null);
        }
        if (newCompanyName) {
            updateCompanyInfo(null, newCompanyName);
        }
        if (newLogoUrl || newCompanyName) {
            alert('Информация компании обновлена!');
        } else {
            alert('Пожалуйста, введите URL фото или название компании.');
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