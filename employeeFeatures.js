import { sendDataToBot, showAlert, HapticFeedbackImpact } from './telegramWebApp.js';

const adminNotesContainer = document.getElementById('admin-notes-container');
const adminNotesContent = document.getElementById('admin-notes-content');
const clockInOutBtn = document.getElementById('clock-in-out-btn');

// Состояние кнопки Пришел/Ушел
// В реальном приложении это состояние должно приходить от бота или храниться на сервере
let isClockedIn = false; 

export function initEmployeeFeatures() {
    // 1. Инициализация заметок (пример)
    // В реальном приложении, заметки будут приходить от бота
    // Например, при получении initial_data
    updateAdminNotes([
        "Важное напоминание: не забудьте сдать отчеты до конца дня.",
        "Сегодня в 14:00 собрание по продажам в конференц-зале.",
        "Отличная работа по проекту 'Альфа' на прошлой неделе!"
    ]);

    // 2. Слушатель для кнопки "Пришел/Ушел"
    clockInOutBtn.addEventListener('click', handleClockInOut);

    // Пример восстановления состояния кнопки при загрузке (для тестирования)
    // В реальном приложении это состояние будет зависеть от данных, полученных от бота
    const savedClockedInState = localStorage.getItem('isClockedIn');
    if (savedClockedInState === 'true') {
        isClockedIn = true;
        clockInOutBtn.textContent = 'Ушел/Ушла';
        clockInOutBtn.classList.add('clocked-in');
    } else {
        isClockedIn = false;
        clockInOutBtn.textContent = 'Пришел/Пришла';
        clockInOutBtn.classList.remove('clocked-in');
    }
}

export function updateAdminNotes(notes) {
    if (notes && notes.length > 0) {
        adminNotesContent.innerHTML = notes.map(note => `<p>${note}</p>`).join('');
        adminNotesContainer.style.display = 'block';
    } else {
        adminNotesContainer.style.display = 'none';
        adminNotesContent.innerHTML = '';
    }
}

async function handleClockInOut() {
    HapticFeedbackImpact('medium');

    if (isClockedIn) {
        // Логика для "Ушел/Ушла"
        const confirmLeave = await showAlert('Вы уверены, что хотите отметить уход?'); // showAlert теперь возвращает Promise
        
        if (confirmLeave) {
            isClockedIn = false;
            clockInOutBtn.textContent = 'Пришел/Пришла';
            clockInOutBtn.classList.remove('clocked-in');
            localStorage.setItem('isClockedIn', 'false');

            sendDataToBot({
                command: 'employee_clock_out',
                timestamp: new Date().toISOString()
            });

            showAlert('Вы отметили уход. Не забудьте свои личные вещи на рабочем месте! До встречи!');
        }
    } else {
        // Логика для "Пришел/Пришла"
        isClockedIn = true;
        clockInOutBtn.textContent = 'Ушел/Ушла';
        clockInOutBtn.classList.add('clocked-in');
        localStorage.setItem('isClockedIn', 'true');

        sendDataToBot({
            command: 'employee_clock_in',
            timestamp: new Date().toISOString()
        });

        showAlert('Вы отметили приход. Добро пожаловать!');
    }
}