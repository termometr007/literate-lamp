document.addEventListener('DOMContentLoaded', () => {
    const companyLogo = document.getElementById('company-logo');
    const companyName = document.getElementById('company-name');
    const backgroundBlur = document.querySelector('.background-blur');
    const headerContainer = document.querySelector('.header-container');
    const themeSwitch = document.getElementById('theme-switch'); // Ползунок
    const botLogo = document.getElementById('bot-logo'); // Логотип бота

    // Элементы для тестирования админ-функционала
    const logoUrlInput = document.getElementById('logo-url-input');
    const companyNameInput = document.getElementById('company-name-input');
    const applyAdminChangesBtn = document.getElementById('apply-admin-changes');

    // Инициализация Telegram WebApp
    if (window.Telegram && window.Telegram.WebApp) {
        window.Telegram.WebApp.ready();
        // Telegram.WebApp.expand(); // Можно раскомментировать, если нужно сразу разворачивать на весь экран
    }

    // Функция для обновления логотипа и фона
    function updateCompanyInfo(logoUrl, name) {
        if (logoUrl) {
            companyLogo.src = logoUrl;
            backgroundBlur.style.backgroundImage = `url(${logoUrl})`;
        }
        if (name) {
            companyName.textContent = name;
        }
    }

    // Функция для обновления логотипа бота
    function updateBotLogo(logoUrl) {
        if (logoUrl) {
            botLogo.src = logoUrl;
        }
    }

    // Пример использования при загрузке (можно задать дефолтные значения)
    // updateCompanyInfo('https://via.placeholder.com/100/0000FF/FFFFFF?text=MyComp', 'Моя Компания');
    // updateBotLogo('https://via.placeholder.com/40/FF5733/FFFFFF?text=B');

    // Логика скролла для скрытия хедера
    let lastScrollTop = 0;
    const headerInitialHeight = headerContainer.offsetHeight; // Сохраняем начальную высоту
    const headerThreshold = 50; // Насколько прокрутить, прежде чем скрывать

    window.addEventListener('scroll', () => {
        let st = window.pageYOffset || document.documentElement.scrollTop;

        if (st > lastScrollTop && st > headerThreshold) { // Скроллим вниз и превысили порог
            headerContainer.style.height = '0px'; // Скрываем
            headerContainer.style.opacity = '0';
            headerContainer.style.paddingTop = '0px'; // Убираем отступ
        } else if (st < lastScrollTop || st <= headerThreshold) { // Скроллим вверх или в самом верху
            headerContainer.style.height = `${headerInitialHeight}px`; // Показываем
            headerContainer.style.opacity = '1';
            headerContainer.style.paddingTop = '20px'; // Возвращаем отступ
        }
        lastScrollTop = st <= 0 ? 0 : st;
    });

    // Логика переключения темы (дневной/ночной)
    themeSwitch.addEventListener('change', () => {
        if (themeSwitch.checked) {
            document.body.classList.add('dark-mode');
            localStorage.setItem('theme', 'dark');
        } else {
            document.body.classList.remove('dark-mode');
            localStorage.setItem('theme', 'light');
        }
    });

    // Загрузка темы при старте
    if (localStorage.getItem('theme') === 'dark') {
        document.body.classList.add('dark-mode');
        themeSwitch.checked = true; // Устанавливаем ползунок в положение "включено"
    }

    // Логика для тестирования админ-функционала
    applyAdminChangesBtn.addEventListener('click', () => {
        const newLogoUrl = logoUrlInput.value.trim();
        const newCompanyName = companyNameInput.value.trim();

        if (newLogoUrl) {
            updateCompanyInfo(newLogoUrl, null); // Обновляем только лого
        }
        if (newCompanyName) {
            updateCompanyInfo(null, newCompanyName); // Обновляем только имя
        }
        if (newLogoUrl || newCompanyName) {
            alert('Информация компании обновлена!');
        } else {
            alert('Пожалуйста, введите URL фото или название компании.');
        }
    });

    // Для тестирования лого бота (можно вызывать вручную в консоли или добавить отдельное поле)
    // updateBotLogo('https://example.com/new-bot-logo.png');
});