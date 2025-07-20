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
    // const contentArea = document.querySelector('.content-area'); // Больше не нужен прямой доступ для margin-top

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

            // --- Логика для анимации "бегущей строки" ---
            companyDescription.style.animation = 'none'; // Сброс анимации перед измерением
            companyDescription.classList.remove('animate-scroll');

            const tempSpan = document.createElement('span');
            tempSpan.style.whiteSpace = 'nowrap';
            tempSpan.style.position = 'absolute';
            tempSpan.style.left = '-9999px';
            tempSpan.style.fontSize = getComputedStyle(companyDescription).fontSize;
            tempSpan.style.fontFamily = getComputedStyle(companyDescription).fontFamily;
            tempSpan.textContent = description;
            document.body.appendChild(tempSpan);
            const textWidth = tempSpan.offsetWidth;
            document.body.removeChild(tempSpan);

            const containerWidth = companyDescription.offsetWidth; 

            if (textWidth > containerWidth) {
                const scrollSpeed = 25; // px/sec
                const scrollDistance = textWidth + 20; // Дополнительный отступ в 20px
                const scrollDuration = scrollDistance / scrollSpeed;

                companyDescription.style.setProperty('--scroll-duration', `${scrollDuration}s`);
                companyDescription.style.setProperty('--scroll-distance-px', `-${scrollDistance}px`);

                companyDescription.classList.add('animate-scroll');
            } else {
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
    updateCompanyInfo('https://via.placeholder.com/60/0000FF/FFFFFF?text=MyComp', 'Название Компании', 'Это очень-очень длинное мотивационное описание, которое должно прокручиваться полностью, без обрезания, чтобы пользователи могли прочитать весь текст без проблем, и даже очень-очень длинный текст будет виден целиком от начала до конца!');
    updateBotLogo('https://via.placeholder.com/60/FF5733/FFFFFF?text=B');

    // --- Логика скролла для скрытия/показа хедера (переделана) ---
    let lastScrollTop = 0;
    const headerInitialHeight = parseInt(getComputedStyle(headerContainer).getPropertyValue('--header-height'));
    const scrollThreshold = 10; // Порог скролла для активации скрытия/показа

    window.addEventListener('scroll', () => {
        let currentScrollTop = window.pageYOffset || document.documentElement.scrollTop;

        // Если скроллим вверх (currentScrollTop < lastScrollTop)
        // ИЛИ находимся в самом верху страницы (currentScrollTop <= scrollThreshold)
        if (currentScrollTop < lastScrollTop || currentScrollTop <= scrollThreshold) {
            // Показываем хедер (смещаем вниз на 0px)
            headerContainer.style.transform = `translateY(0px)`;
        }
        // Если скроллим вниз (currentScrollTop > lastScrollTop)
        // И превысили порог скролла
        else if (currentScrollTop > lastScrollTop && currentScrollTop > scrollThreshold) {
            // Скрываем хедер (смещаем вверх за пределы экрана)
            headerContainer.style.transform = `translateY(-${headerInitialHeight}px)`;
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