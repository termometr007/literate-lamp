import { ALL_USERS, sectionsData, currentSectionForMenu, setCurrentSectionForMenu, currentRecipientsSelectionType, updateSectionData } from './constants.js';
import { sendDataToBot, showAlert, HapticFeedbackImpact } from './telegramWebApp.js';
import { renderSections, currentParentId } from './sectionsLogic.js';
import { formatQuantity } from './utils.js';

const recipientsModal = document.getElementById('recipients-modal');
const recipientsList = document.getElementById('recipients-list');
const confirmRecipientsBtn = document.getElementById('confirm-recipients-btn');
const cancelRecipientsBtn = document.getElementById('cancel-recipients-btn');
const selectAllRecipientsCheckbox = document.getElementById('select-all-recipients');
const recipientFilterTabs = document.querySelectorAll('.filter-tab');

export function showRecipientsModal() {
    document.body.classList.add('modal-open');
    recipientsModal.classList.remove('hidden');
    recipientsModal.style.display = 'flex';
    
    // Устанавливаем фильтр по умолчанию на "Все", но затем отрисовываем на основе активного таба
    const activeTab = document.querySelector('.recipient-filter-tabs .filter-tab.active');
    const filter = activeTab ? activeTab.dataset.filter : 'all';
    renderUsersForSelection(filter); 
    selectAllRecipientsCheckbox.checked = false;
    
    const section = sectionsData.find(s => s.id === currentSectionForMenu);
    if (section && currentRecipientsSelectionType === 'hide_from' && section.hidden_from_users) {
        setTimeout(() => {
            section.hidden_from_users.forEach(userId => {
                const checkbox = recipientsList.querySelector(`input[value="${userId}"]`);
                if (checkbox) {
                    checkbox.checked = true;
                }
            });
        }, 50);
    }
    recipientsModal.querySelector('.modal-content').addEventListener('click', (e) => e.stopPropagation());
}

function hideRecipientsModal() {
    document.body.classList.remove('modal-open');
    recipientsModal.classList.add('hidden');
    setTimeout(() => {
        recipientsModal.style.display = 'none';
    }, 300);
    setCurrentSectionForMenu(null);
}

function renderUsersForSelection(filter) {
    recipientsList.innerHTML = '';
    let filteredUsers = [];
    if (filter === 'all') {
        filteredUsers = ALL_USERS;
    } else if (filter === 'admins') {
        filteredUsers = ALL_USERS.filter(user => user.role === 'admin');
    } else if (filter === 'employees') { 
        filteredUsers = ALL_USERS.filter(user => user.role === 'employee');
    }

    filteredUsers.forEach(user => {
        const userDiv = document.createElement('div');
        userDiv.classList.add('recipient-item');
        userDiv.dataset.id = user.id;

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = `user-${user.id}`;
        checkbox.value = user.id;
        userDiv.appendChild(checkbox);

        const label = document.createElement('label');
        label.htmlFor = `user-${user.id}`;
        label.classList.add('recipient-item-name');
        label.textContent = `${user.name} (${user.role === 'admin' ? 'Админ' : 'Сотрудник'})`;
        userDiv.appendChild(label);

        recipientsList.appendChild(userDiv);
    });
}

export function setupRecipientsModalListeners() {
    recipientFilterTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            recipientFilterTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            renderUsersForSelection(tab.dataset.filter);
            selectAllRecipientsCheckbox.checked = false;
        });
    });

    selectAllRecipientsCheckbox.addEventListener('change', (e) => {
        recipientsList.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
            checkbox.checked = e.target.checked;
        });
    });

    confirmRecipientsBtn.addEventListener('click', () => {
        const selectedUserIds = Array.from(recipientsList.querySelectorAll('input[type="checkbox"]:checked'))
                                     .map(checkbox => checkbox.value);
        
        const section = sectionsData.find(s => s.id === currentSectionForMenu);
        if (!section) {
            hideRecipientsModal();
            return;
        }

        if (selectedUserIds.length === 0 && currentRecipientsSelectionType !== 'hide_from') {
            showAlert('Пожалуйста, выберите хотя бы одного получателя.');
            return;
        }

        if (currentRecipientsSelectionType === 'critical_minimum') {
            sendDataToBot({
                type: 'set_critical_minimum',
                payload: {
                    id: section.id,
                    min_quantity: section.min_quantity,
                    recipients: selectedUserIds
                }
            });
            showAlert(`Критический минимум ${formatQuantity(section.min_quantity)} для "${section.name}" установлен. Оповещения будут приходить выбранным пользователям.`);
           
        } else if (currentRecipientsSelectionType === 'reminder') {
            sendDataToBot({
                type: 'set_reminder',
                payload: {
                    id: section.id,
                    message: section.reminder_message,
                    datetime: section.reminder_datetime,
                    recipients: selectedUserIds
                }
            });
            showAlert(`Напоминание для "${section.name}" запланировано. Сообщение "${section.reminder_message}" будет отправлено выбранным пользователям в ${section.reminder_datetime}.`);
        } else if (currentRecipientsSelectionType === 'hide_from') {
            updateSectionData(section.id, { hidden_from_users: selectedUserIds }); // Обновляем массив скрытых пользователей
            sendDataToBot({
                type: 'set_hidden_from_users',
                payload: {
                    id: section.id,
                    hidden_from_users: selectedUserIds
                }
            });
            if (selectedUserIds.length > 0) {
                showAlert(`Раздел "${section.name}" теперь скрыт от выбранных пользователей.`);
            } else {
                showAlert(`Раздел "${section.name}" теперь виден всем.`);
            }
            renderSections(currentParentId); // Перерисовываем, чтобы обновить состояние, если нужно
        }
        hideRecipientsModal();
    });

    cancelRecipientsBtn.addEventListener('click', () => {
        hideRecipientsModal();
        HapticFeedbackImpact('light');
    });

    recipientsModal.addEventListener('click', (e) => {
        if (e.target === recipientsModal) {
            hideRecipientsModal();
        }
    });
}