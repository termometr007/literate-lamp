document.addEventListener('DOMContentLoaded', () => {
    const companyLogo = document.getElementById('company-logo');
    const companyName = document.getElementById('company-name');
    const backgroundBlur = document.querySelector('.background-blur');
    const headerContainer = document.querySelector('.header-container');
    const toggleThemeBtn = document.getElementById('toggle-theme-btn');

    // Инициализация Telegram WebApp
    if (window.Telegram && window.Telegram.WebApp) {
        window.Telegram.WebApp.ready();
        // Можно использовать Telegram.WebApp.expand() для разворачивания приложения на весь экран
        // Telegram.WebApp.expand();
    }

    // Функция для обновления логотипа и фона (для админа)
    function updateCompanyInfo(logoUrl, name) {
        if (logoUrl) {
            companyLogo.src = logoUrl;
            backgroundBlur.style.backgroundImage = `url(${logoUrl})`;
        }
        if (name) {
            companyName.textContent = name;
        }
    }

    // Пример использования:
    // updateCompanyInfo('https://via.placeholder.com/100/FF0000/FFFFFF?text=NewLogo', 'Моя Новая Компания');

    // Логика скролла для скрытия хедера
    let lastScrollTop = 0;
    window.addEventListener('scroll', () => {
        let st = window.pageYOffset || document.documentElement.scrollTop;
        if (st > lastScrollTop && st > 50) { // Скроллим вниз
            headerContainer.style.height = '0px'; // Скрываем
            headerContainer.style.opacity = '0';
        } else { // Скроллим вверх
            headerContainer.style.height = '150px'; // Показываем
            headerContainer.style.opacity = '1';
        }
        lastScrollTop = st <= 0 ? 0 : st; // Для Mobile Safari
    });

    // Логика переключения темы (дневной/ночной)
    toggleThemeBtn.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        // Сохраняем предпочтение пользователя (можно использовать localStorage)
        if (document.body.classList.contains('dark-mode')) {
            localStorage.setItem('theme', 'dark');
        } else {
            localStorage.setItem('theme', 'light');
        }
    });

    // Загрузка темы при старте
    if (localStorage.getItem('theme') === 'dark') {
        document.body.classList.add('dark-mode');
    }
});