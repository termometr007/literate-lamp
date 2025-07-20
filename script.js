document.addEventListener('DOMContentLoaded', () => {
    const companyLogo = document.getElementById('company-logo');
    const companyName = document.getElementById('company-name');
    const companyDescription = document.getElementById('company-description');
    const backgroundBlur = document.querySelector('.background-blur');
    const headerContainer = document.querySelector('.header-container');
    const themeSwitch = document.getElementById('theme-switch');
    const botLogo = document.getElementById('bot-logo');
    const sunIcon = document.querySelector('.theme-icon.sun-icon');
    const moonIcon = document.querySelector('.moon-icon'); // Уточнил селектор
    const contentArea = document.querySelector('.content-area');

    const logoUrlInput = document.getElementById('logo-url-input');
    const companyNameInput = document.getElementById('company-name-input');
    const companyDescriptionInput = document.getElementById('company-description-input');
    const applyCompanyChangesBtn = document.getElementById('apply-company-changes');

    const botLogoUrlInput = document.getElementById('bot-logo-url-input');
    const applyBotLogoChangesBtn = document.getElementById('apply-bot-logo-changes');

    if (window.Telegram && window.Telegram.WebApp) {
        window.Telegram.WebApp.ready();
        // window.Telegram.WebApp.expand(); // Это может вызвать проблемы на некоторых устройствах, закомментируем пока
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
            companyDescription.style.display = description ? 'inline-block' : 'none';

            // --- Логика для анимации "бегущей строки" ---
            // Сброс всех анимаций и классов, чтобы гарантировать чистый старт
            companyDescription.style.animation = 'none';
            companyDescription.classList.remove('animate-scroll');
            companyDescription.style.transform = ''; // Сброс любого transform
            
            // Принудительная перерисовка DOM
            // Это очень важный шаг, который заставляет браузер "забыть" предыдущее состояние анимации
            void companyDescription.offsetWidth; 

            // Используем requestAnimationFrame для гарантии, что измерения будут после рефлоу
            requestAnimationFrame(() => {
                const textInfoContainer = companyDescription.closest('.text-info');
                const containerWidth = textInfoContainer ? textInfoContainer.offsetWidth : companyDescription.offsetWidth;

                const tempSpan = document.createElement('span');
                tempSpan.style.whiteSpace = 'nowrap';
                tempSpan.style.position = 'absolute';
                tempSpan.style.visibility = 'hidden'; // Скрываем, чтобы не моргало
                tempSpan.style.fontSize = getComputedStyle(companyDescription).fontSize;
                tempSpan.style.fontFamily = getComputedStyle(companyDescription).fontFamily;
                tempSpan.textContent = description;
                document.body.appendChild(tempSpan);
                const textWidth = tempSpan.offsetWidth;
                document.body.removeChild(tempSpan);

                // Добавим отладочные сообщения
                // console.log('Text Width:', textWidth, 'Container Width:', containerWidth);

                if (textWidth > containerWidth) {
                    const scrollSpeed = 20; // px/sec, немного медленнее для лучшей читаемости
                    // Прокрутка на всю ширину текста, плюс небольшой отступ, чтобы был виден "конец"
                    const scrollDistance = textWidth + 10; 
                    const scrollDuration = scrollDistance / scrollSpeed;

                    companyDescription.style.setProperty('--scroll-duration', `${scrollDuration}s`);
                    companyDescription.style.setProperty('--scroll-distance-px', `-${scrollDistance}px`);
                    
                    // console.log('Setting animation. Duration:', scrollDuration, 'Distance:', scrollDistance);
                    companyDescription.classList.add('animate-scroll');
                    companyDescription.style.animationPlayState = 'running'; // Убедимся, что анимация запущена
                } else {
                    companyDescription.classList.remove('animate-scroll');
                    companyDescription.style.animation = 'none'; // Убедимся, что анимация остановлена
                    companyDescription.style.transform = 'translateX(0)'; // Возвращаем на место
                    companyDescription.style.animationPlayState = 'paused'; // Пауза
                    // console.log('Text fits. No animation needed.');
                }
            });
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

    // --- Логика скролла: content-area двигается, header-container остается неподвижным ---
    let lastScrollTop = 0;
    const headerTotalHeight = parseInt(getComputedStyle(headerContainer).getPropertyValue('--header-height'));
    const borderRadiusSize = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--border-radius-size'));
    
    const maxTranslateY = headerTotalHeight + borderRadiusSize; 
    
    window.addEventListener('scroll', () => {
        let currentScrollTop = window.pageYOffset || document.documentElement.scrollTop;

        // Определяем, насколько высоко должен подняться content-area
        // 0px при currentScrollTop = 0
        // -maxTranslateY при currentScrollTop >= maxTranslateY
        let translateYValue = -Math.min(currentScrollTop, maxTranslateY);
        
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