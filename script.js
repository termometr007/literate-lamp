document.addEventListener('DOMContentLoaded', () => {
    const companyLogo = document.getElementById('company-logo');
    const companyName = document.getElementById('company-name');
    const companyDescription = document.getElementById('company-description');
    const backgroundBlur = document.querySelector('.background-blur');
    const headerContainer = document.querySelector('.header-container');
    const themeSwitch = document.getElementById('theme-switch');
    const botLogo = document.getElementById('bot-logo');
    const sunIcon = document.querySelector('.sun-icon');
    const moonIcon = document.querySelector('.moon-icon');

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

            // Логика для анимации "бегущей строки"
            // Временно добавляем текст в невидимый элемент для измерения его полной ширины
            const tempSpan = document.createElement('span');
            tempSpan.style.whiteSpace = 'nowrap';
            tempSpan.style.position = 'absolute';
            tempSpan.style.left = '-9999px'; // Убираем с экрана
            tempSpan.textContent = description;
            document.body.appendChild(tempSpan);
            const textWidth = tempSpan.offsetWidth;
            document.body.removeChild(tempSpan);

            // Получаем фактическую ширину контейнера, в который помещается текст (company-description)
            // Важно: .company-description должен иметь fixed/max-width для корректного расчета
            const containerWidth = companyDescription.offsetWidth; 

            if (textWidth > containerWidth) {
                // Если текст длиннее контейнера, запускаем анимацию
                const scrollSpeed = 40; // px/sec
                const scrollDistance = textWidth - containerWidth + 20; // + небольшой отступ
                const scrollDuration = scrollDistance / scrollSpeed;

                companyDescription.style.setProperty('--scroll-duration', `${scrollDuration}s`);
                companyDescription.style.setProperty('--container-width', `${containerWidth}px`);
                companyDescription.style.setProperty('--scroll-offset', `${scrollDistance}px`); // Расстояние, на которое текст должен прокрутиться

                companyDescription.classList.add('animate-scroll');
            } else {
                // Если текст помещается, убираем анимацию
                companyDescription.classList.remove('animate-scroll');
                companyDescription.style.animation = 'none';
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
    updateCompanyInfo('https://via.placeholder.com/60/0000FF/FFFFFF?text=MyComp', 'Название Компании', 'Это довольно длинное мотивационное описание, которое должно прокручиваться полностью, не обрываясь, чтобы пользователи могли прочитать весь текст без проблем.');
    updateBotLogo('https://via.placeholder.com/60/FF5733/FFFFFF?text=B');

    // Логика скролла для скрытия/показа хедера
    let lastScrollTop = 0;
    const headerInitialHeight = 120; // Изначальная высота хедера
    const headerHiddenHeight = 0; // Высота хедера в скрытом состоянии
    const scrollThreshold = 30; // Порог скролла для активации скрытия/показа

    window.addEventListener('scroll', () => {
        let currentScrollTop = window.pageYOffset || document.documentElement.scrollTop;

        // Если скроллим вверх
        if (currentScrollTop < lastScrollTop && currentScrollTop < (document.body.scrollHeight - window.innerHeight - scrollThreshold)) {
            // Показываем хедер, если скроллим вверх и не в самом низу страницы
            headerContainer.style.height = `${headerInitialHeight}px`;
            headerContainer.style.opacity = '1';
        }
        // Если скроллим вниз
        else if (currentScrollTop > lastScrollTop && currentScrollTop > scrollThreshold) {
            // Скрываем хедер, если скроллим вниз и превысили порог
            headerContainer.style.height = `${headerHiddenHeight}px`;
            headerContainer.style.opacity = '0';
        }

        lastScrollTop = currentScrollTop;
    });


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
            // Вызываем updateCompanyInfo еще раз, чтобы триггернуть пересчет
            // (передаем текущие значения, чтобы не сбросить их)
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