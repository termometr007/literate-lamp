document.addEventListener('DOMContentLoaded', () => {
    const companyLogo = document.getElementById('company-logo');
    const companyName = document.getElementById('company-name');
    const backgroundBlur = document.querySelector('.background-blur');
    const headerContainer = document.querySelector('.header-container');
    const themeSwitch = document.getElementById('theme-switch');
    const botLogo = document.getElementById('bot-logo');
    const sunIcon = document.querySelector('.sun-icon');
    const moonIcon = document.querySelector('.moon-icon');

    const logoUrlInput = document.getElementById('logo-url-input');
    const companyNameInput = document.getElementById('company-name-input');
    const applyAdminChangesBtn = document.getElementById('apply-admin-changes');

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
    updateCompanyInfo('https://via.placeholder.com/100/0000FF/FFFFFF?text=Logo', 'Название Компании');
    updateBotLogo('https://via.placeholder.com/40/FF5733/FFFFFF?text=B');


    // Логика скролла для скрытия хедера
    let lastScrollTop = 0;
    const headerInitialHeight = 120; // Установим фиксированную начальную высоту для скрытия/показа
    const headerThreshold = 50;

    window.addEventListener('scroll', () => {
        let st = window.pageYOffset || document.documentElement.scrollTop;

        if (st > lastScrollTop && st > headerThreshold) {
            headerContainer.style.height = '0px';
            headerContainer.style.opacity = '0';
            headerContainer.style.paddingTop = '0px';
        } else if (st < lastScrollTop || st <= headerThreshold) {
            headerContainer.style.height = `${headerInitialHeight}px`;
            headerContainer.style.opacity = '1';
            headerContainer.style.paddingTop = '0px'; // Отступ теперь внутри header-content
        }
        lastScrollTop = st <= 0 ? 0 : st;
    });

    // Функция для применения темы
    function applyTheme(isDark) {
        if (isDark) {
            document.body.classList.add('dark-mode');
            sunIcon.style.color = 'var(--icon-color-light)'; // Цвет солнца в темном режиме
            moonIcon.style.color = 'var(--icon-color-dark)'; // Цвет луны в темном режиме
        } else {
            document.body.classList.remove('dark-mode');
            sunIcon.style.color = 'var(--icon-color-light)'; // Цвет солнца в светлом режиме
            moonIcon.style.color = 'var(--icon-color-dark)'; // Цвет луны в светлом режиме
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
        applyTheme(false); // Убедимся, что светлая тема применена, если не сохранена темная
    }

    // Логика для тестирования админ-функционала
    applyAdminChangesBtn.addEventListener('click', () => {
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

    // Для изменения логотипа бота (для разработчика)
    // Можешь добавить кнопку или поле ввода для этого, или менять вручную здесь:
    // updateBotLogo('https://your-custom-bot-logo.png');
});