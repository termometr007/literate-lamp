document.addEventListener('DOMContentLoaded', () => {
    const companyLogo = document.getElementById('company-logo');
    const companyName = document.getElementById('company-name');
    const companyDescription = document.getElementById('company-description');
    const backgroundBlur = document.querySelector('.background-blur');
    const headerContainer = document.querySelector('.header-container'); // Теперь эта панель статична
    const themeSwitch = document.getElementById('theme-switch');
    const botLogo = document.getElementById('bot-logo');
    const sunIcon = document.querySelector('.theme-icon.sun-icon');
    const moonIcon = document.querySelector('.theme-icon.moon-icon');
    const contentArea = document.querySelector('.content-area'); // Теперь эта панель будет двигаться

    const logoUrlInput = document.getElementById('logo-url-input');
    const companyNameInput = document.getElementById('company-name-input');
    const companyDescriptionInput = document.getElementById('company-description-input'); // Это было неверно
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
            
            // Принудительная перерисовка DOM
            void companyDescription.offsetWidth; 

            // Создаем временный элемент для измерения полной ширины текста
            const tempSpan = document.createElement('span');
            tempSpan.style.whiteSpace = 'nowrap';
            tempSpan.style.position = 'absolute';
            tempSpan.style.left = '-9999px';
            tempSpan.style.fontSize = getComputedStyle(companyDescription).fontSize;
            tempSpan.style.fontFamily = getComputedStyle(companyDescription).fontFamily;
            tempSpan.textContent = description;
            document.body.appendChild(tempSpan);
            const textWidth = tempSpan.offsetWidth; // Полная ширина текста
            document.body.removeChild(tempSpan);

            const containerWidth = companyDescription.offsetWidth; // Фактическая видимая ширина контейнера
            
            if (textWidth > containerWidth) {
                const scrollSpeed = 25; // px/sec, можно регулировать скорость
                const scrollDistance = textWidth + 20; // Дополнительный отступ в 20px (чтобы текст полностью исчезал)
                const scrollDuration = scrollDistance / scrollSpeed;

                companyDescription.style.setProperty('--scroll-duration', `${scrollDuration}s`);
                companyDescription.style.setProperty('--scroll-distance-px', `-${scrollDistance}px`);

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
    updateCompanyInfo('https://via.placeholder.com/60/0000FF/FFFFFF?text=MyComp', 'Название Компании', 'Это очень-очень длинное мотивационное описание, которое должно прокручиваться полностью, без обрезания, чтобы пользователи могли прочитать весь текст без проблем, и даже очень-очень длинный текст будет виден целиком от начала до конца!');
    updateBotLogo('https://via.placeholder.com/60/FF5733/FFFFFF?text=B');

    // --- Логика скролла: теперь двигается content-area, а header-container остается неподвижным ---
    let lastScrollTop = 0;
    const headerTotalHeight = parseInt(getComputedStyle(headerContainer).getPropertyValue('--header-height')); // Высота хедера
    const borderRadiusSize = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--border-radius-size')); // Размер радиуса
    
    // Фактическое расстояние, на которое content-area может подняться над хедером
    // Это будет (headerTotalHeight - borderRadiusSize)
    const scrollRevealHeight = headerTotalHeight - borderRadiusSize;

    window.addEventListener('scroll', () => {
        let currentScrollTop = window.pageYOffset || document.documentElement.scrollTop;

        // Определяем желаемое смещение content-area
        // При скролле вниз, contentArea.transformY будет уходить в отрицательное значение,
        // поднимая content-area вверх и скрывая хедер.
        // Максимальное отрицательное значение -scrollRevealHeight (т.е. на высоту хедера минус радиус)
        let translateYValue = Math.min(0, Math.max(-scrollRevealHeight, currentScrollTop));
        
        // Применяем transform к contentArea, а не к headerContainer
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
        const newCompanyDescription = companyDescriptionInput.value.trim(); // Правильное обращение к value

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