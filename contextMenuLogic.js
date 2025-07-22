import { sendDataToBot, showAlert, showConfirm, HapticFeedbackImpact, HapticFeedbackNotification } from './telegramWebApp.js';
import { sectionsData, currentSectionForMenu, setCurrentSectionForMenu, setLongPressTimer, longPressTimer, setCurrentRecipientsSelectionType, CONTEXT_MENU_CLOSE_DELAY, LONG_PRESS_THRESHOLD, updateSectionData } from './constants.js';
import { renderSections, currentParentId } from './sectionsLogic.js';
import { showRecipientsModal } from './recipientsModalLogic.js';
import { formatQuantity } from './utils.js';

const contextMenuModal = document.getElementById('context-menu-modal');
const addQuantityBtn = document.getElementById('add-quantity-btn');
const removeQuantityBtn = document.getElementById('remove-quantity-btn');
const criticalMinBtn = document.getElementById('critical-min-btn');
const setReminderBtn = document.getElementById('set-reminder-btn');
const hideFromBtn = document.getElementById('hide-from-btn');
const closeContextMenuBtn = document.getElementById('close-context-menu');

export function startLongPressDetection(e, sectionId) {
    if (e.touches && e.touches.length > 1) {
        setLongPressTimer(null);
        return;
    }

    if (e.type === 'mousedown' && e.button === 2) {
         e.preventDefault(); 
         setCurrentSectionForMenu(sectionId);
         showContextMenu();
         return;
    }

    clearTimeout(longPressTimer); // Используем longPressTimer из constants

    setLongPressTimer(setTimeout(() => {
        setCurrentSectionForMenu(sectionId);
        showContextMenu();
    }, LONG_PRESS_THRESHOLD));
}

function showContextMenu() {
    HapticFeedbackImpact('heavy');
    document.body.classList.add('modal-open');
    contextMenuModal.classList.remove('hidden');
    contextMenuModal.style.display = 'flex';
    contextMenuModal.querySelector('.modal-content').addEventListener('click', (e) => e.stopPropagation());
}

function hideContextMenu() {
    document.body.classList.remove('modal-open');
    contextMenuModal.classList.add('hidden');
    setTimeout(() => {
        contextMenuModal.style.display = 'none';
    }, 300); 
}

export function setupContextMenuListeners() {
    closeContextMenuBtn.addEventListener('click', hideContextMenu);
    contextMenuModal.addEventListener('click', (e) => {
        if (e.target === contextMenuModal) {
            hideContextMenu();
        }
    });

    addQuantityBtn.addEventListener('click', (e) => {
        e.stopPropagation(); 
        hideContextMenu();
        if (!currentSectionForMenu) return;

        setTimeout(() => {
            askForQuantityAndConfirm('add');
        }, CONTEXT_MENU_CLOSE_DELAY);
    });

    removeQuantityBtn.addEventListener('click', (e) => {
        e.stopPropagation(); 
        hideContextMenu();
        if (!currentSectionForMenu) return;

        setTimeout(() => {
            askForQuantityAndConfirm('remove');
        }, CONTEXT_MENU_CLOSE_DELAY);
    });

    criticalMinBtn.addEventListener('click', (e) => {
        e.stopPropagation(); 
        hideContextMenu();
        if (!currentSectionForMenu) return;
        
        setTimeout(() => {
            setCurrentRecipientsSelectionType('critical_minimum');
            HapticFeedbackImpact('light');
            const minQuantityInput = prompt('Введите критический минимум для этого раздела (можно дробное):');
            const minQuantity = parseFloat(minQuantityInput);

            if (!isNaN(minQuantity) && minQuantity >= 0) {
                const section = sectionsData.find(s => s.id === currentSectionForMenu);
                if (section) {
                    updateSectionData(section.id, { min_quantity: minQuantity });
                    showRecipientsModal();
                }
            } else {
                if (minQuantityInput !== null) {
                    showAlert('Некорректное значение для критического минимума.');
                }
            }
        }, CONTEXT_MENU_CLOSE_DELAY);
    });

    setReminderBtn.addEventListener('click', (e) => {
        e.stopPropagation(); 
        hideContextMenu();
        if (!currentSectionForMenu) return;
        
        setTimeout(() => {
            setCurrentRecipientsSelectionType('reminder');
            HapticFeedbackImpact('light');
            const reminderMessage = prompt('Введите сообщение для напоминания:');
            const reminderDateTime = prompt('Введите дату и время напоминания (пример: 01.01.2025 12:30):');

            if (reminderMessage && reminderMessage.trim() !== '' && reminderDateTime && reminderDateTime.trim() !== '') {
                const section = sectionsData.find(s => s.id === currentSectionForMenu);
                if (section) {
                    updateSectionData(section.id, { reminder_message: reminderMessage.trim(), reminder_datetime: reminderDateTime.trim() });
                    showRecipientsModal();
                }
            } else {
                if (reminderMessage !== null && reminderDateTime !== null) {
                    showAlert('Сообщение или дата/время напоминания не могут быть пустыми.');
                }
            }
        }, CONTEXT_MENU_CLOSE_DELAY);
    });

    hideFromBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        hideContextMenu();
        if (!currentSectionForMenu) return;

        setTimeout(() => {
            setCurrentRecipientsSelectionType('hide_from');
            showRecipientsModal();
        }, CONTEXT_MENU_CLOSE_DELAY);
    });
}

async function askForQuantityAndConfirm(type) {
    const section = sectionsData.find(s => s.id === currentSectionForMenu);
    if (!section) return;

    let amountInput;
    let currentQty = section.quantity || 0;
    let promptMessage;
    let confirmMessage;

    if (type === 'add') {
        promptMessage = 'Введите количество для добавления (можно дробное):';
    } else { // 'remove'
        promptMessage = 'Введите количество для списания (можно дробное):';
    }

    while (true) {
        HapticFeedbackImpact('light');
        amountInput = prompt(promptMessage);
        
        if (amountInput === null) {
            setCurrentSectionForMenu(null);
            return;
        }

        const amount = parseFloat(amountInput);

        if (isNaN(amount) || amount <= 0) {
            showAlert('Некорректное количество. Пожалуйста, введите положительное число.');
            continue;
        }

        let newQty;
        if (type === 'add') {
            newQty = currentQty + amount;
            confirmMessage = `Вы уверены, что хотите добавить ${formatQuantity(amount)} шт.? После добавления получится ${formatQuantity(newQty)} шт.`;
        } else { // 'remove'
            if (amount > currentQty) {
                showAlert(`Недостаточное количество. Доступно: ${formatQuantity(currentQty)} шт.`);
                continue;
            }
            newQty = currentQty - amount;
            confirmMessage = `Вы уверены, что хотите списать ${formatQuantity(amount)} шт.? После списания останется ${formatQuantity(newQty)} шт.`;
        }

        let confirmed = await new Promise(resolve => {
            showConfirm(confirmMessage, (result) => resolve(result));
        });

        if (confirmed) {
            updateSectionData(section.id, { quantity: newQty });
            renderSections(currentParentId); // Перерисовываем для обновления UI

            sendDataToBot({
                type: `${type}_quantity`,
                payload: { id: section.id, amount: amount }
            });
            showAlert(`${type === 'add' ? 'Добавлено' : 'Списано'} ${formatQuantity(amount)} ${type === 'add' ? 'к' : 'из'} "${section.name}".`);
            setCurrentSectionForMenu(null);
            return;
        } else {
            HapticFeedbackNotification('light');
        }
    }
}