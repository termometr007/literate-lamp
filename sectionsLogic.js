import { generateUniqueId, formatQuantity } from './utils.js';
import { sendDataToBot, showAlert, showConfirm, HapticFeedbackImpact, HapticFeedbackNotification } from './telegramWebApp.js';
import { sectionsData, currentPath, currentParentId, setSectionsData, setCurrentPath, setCurrentParentId, setLongPressTimer, longPressTimer, setCurrentSectionForMenu } from './constants.js';
import { startLongPressDetection } from './contextMenuLogic.js'; // Импортируем функцию для инициации долгого нажатия

const sectionsBreadcrumbs = document.getElementById('sections-breadcrumbs');
const currentSectionsList = document.getElementById('current-sections-list');
const createSectionBtn = document.getElementById('create-section-btn');
const goBackSectionBtn = document.getElementById('go-back-section-btn');
const noSectionsMessage = document.querySelector('.no-sections-message');

export function updateBreadcrumbs() {
    sectionsBreadcrumbs.innerHTML = '';
    currentPath.forEach((item, index) => {
        const span = document.createElement('span');
        span.classList.add('breadcrumb-item');
        if (index === currentPath.length - 1) {
            span.classList.add('active');
        } else {
            span.addEventListener('click', () => navigateToPath(item.id));
        }
        span.textContent = item.name;
        span.dataset.id = item.id;
        sectionsBreadcrumbs.appendChild(span);
    });
    goBackSectionBtn.style.display = currentParentId === 'root' ? 'none' : 'inline-block';
}

export function renderSections(parentId) {
    currentSectionsList.innerHTML = '';
    const children = sectionsData.filter(section => section.parentId === parentId);

    if (children.length === 0) {
        noSectionsMessage.style.display = 'block';
    } else {
        noSectionsMessage.style.display = 'none';
        children.forEach(section => {
            const sectionDiv = document.createElement('div');
            sectionDiv.classList.add('section-item');
            sectionDiv.dataset.id = section.id;
            
            // Добавляем обработчики для долгого нажатия
            sectionDiv.addEventListener('mousedown', (e) => startLongPressDetection(e, section.id));
            sectionDiv.addEventListener('mouseup', () => setLongPressTimer(null)); // Используем setLongPressTimer
            sectionDiv.addEventListener('mouseleave', () => setLongPressTimer(null));
            sectionDiv.addEventListener('touchstart', (e) => startLongPressDetection(e, section.id), { passive: true });
            sectionDiv.addEventListener('touchend', () => setLongPressTimer(null));
            sectionDiv.addEventListener('touchcancel', () => setLongPressTimer(null));

            // Добавляем обработчик для обычного клика (для перехода)
            sectionDiv.addEventListener('click', (e) => {
                if (e.target.closest('.section-action-button') || e.target.closest('.context-menu-item')) {
                    return;
                }
                if (longPressTimer) { 
                    return;
                }
                HapticFeedbackImpact('light');
                navigateToSection(section.id, section.name);
            });

            const sectionNameSpan = document.createElement('span');
            sectionNameSpan.classList.add('section-item-name');
            sectionNameSpan.textContent = section.name;
            
            if (typeof section.quantity === 'number' && section.quantity > 0) {
                const quantitySpan = document.createElement('span');
                quantitySpan.classList.add('section-item-quantity');
                quantitySpan.textContent = `${formatQuantity(section.quantity)} шт.`;
                sectionNameSpan.appendChild(quantitySpan);
            }
            
            sectionDiv.appendChild(sectionNameSpan);

            const sectionActionsDiv = document.createElement('div');
            sectionActionsDiv.classList.add('section-item-actions');

            const editButton = document.createElement('button');
            editButton.classList.add('section-action-button');
            editButton.innerHTML = '&#9998;'; // ✏️
            editButton.title = 'Редактировать раздел';
            editButton.addEventListener('click', (e) => {
                e.stopPropagation();
                editSection(section.id, section.name);
            });
            sectionActionsDiv.appendChild(editButton);

            const deleteButton = document.createElement('button');
            deleteButton.classList.add('section-action-button');
            deleteButton.innerHTML = '&#10006;'; // ❌
            deleteButton.title = 'Удалить раздел';
            deleteButton.addEventListener('click', (e) => {
                e.stopPropagation();
                deleteSection(section.id);
            });
            sectionActionsDiv.appendChild(deleteButton);

            sectionDiv.appendChild(sectionActionsDiv);
            currentSectionsList.appendChild(sectionDiv);
        });
    }
    updateBreadcrumbs();
}

export function navigateToSection(id, name) {
    setCurrentParentId(id);
    setCurrentPath([...currentPath, { id: id, name: name }]);
    renderSections(id);
}

export function navigateToPath(id) {
    const index = currentPath.findIndex(item => item.id === id);
    if (index !== -1) {
        setCurrentPath(currentPath.slice(0, index + 1));
        setCurrentParentId(id);
        renderSections(id);
        HapticFeedbackImpact('light');
    }
}

export function setupSectionListeners() {
    createSectionBtn.addEventListener('click', async () => {
        HapticFeedbackImpact('medium');
        const sectionName = prompt('Введите название нового раздела:'); 
        if (sectionName && sectionName.trim() !== '') {
            const newId = generateUniqueId();
            const newSection = {
                id: newId,
                name: sectionName.trim(),
                parentId: currentParentId,
                quantity: 0,
                min_quantity: null,
                hidden_from_users: []
            };
            sectionsData.push(newSection); // Обновляем данные напрямую
            renderSections(currentParentId);

            sendDataToBot({
                type: 'create_section',
                payload: newSection
            });
            showAlert(`Раздел "${sectionName}" создан и данные отправлены боту.`);
        } else if (sectionName !== null) {
            showAlert('Название раздела не может быть пустым.');
        }
    });

    goBackSectionBtn.addEventListener('click', () => {
        if (currentPath.length > 1) {
            const newPath = [...currentPath];
            newPath.pop();
            setCurrentPath(newPath);
            setCurrentParentId(currentPath[currentPath.length - 1].id);
            renderSections(currentParentId);
            HapticFeedbackImpact('light');
        }
    });
}

function editSection(id, oldName) {
    HapticFeedbackImpact('medium');
    const newName = prompt(`Введите новое название для раздела "${oldName}":`, oldName);
    if (newName && newName.trim() !== '') {
        const sectionIndex = sectionsData.findIndex(s => s.id === id);
        if (sectionIndex !== -1) {
            sectionsData[sectionIndex].name = newName.trim();
            const pathIndex = currentPath.findIndex(p => p.id === id);
            if (pathIndex !== -1) {
                currentPath[pathIndex].name = newName.trim();
            }
            renderSections(currentParentId);

            sendDataToBot({
                type: 'update_section',
                payload: { id: id, name: newName.trim() }
            });
            showAlert(`Раздел обновлен и данные отправлены боту.`);
        }
    } else if (newName !== null) {
        showAlert('Название раздела не может быть пустым.');
    }
}

function deleteSection(id) {
    HapticFeedbackNotification('warning');
    showConfirm('Вы уверены, что хотите удалить этот раздел и все его подразделы?', (confirmed) => {
        if (confirmed) {
            const idsToDelete = [id];
            function collectChildrenIds(parentId) {
                const children = sectionsData.filter(s => s.parentId === parentId);
                children.forEach(child => {
                    idsToDelete.push(child.id);
                    collectChildrenIds(child.id);
                });
            }
            collectChildrenIds(id);

            // Удаляем элементы из sectionsData
            setSectionsData(sectionsData.filter(s => !idsToDelete.includes(s.id)));
            renderSections(currentParentId);

            sendDataToBot({
                type: 'delete_section',
                payload: { ids: idsToDelete }
            });
            showAlert('Раздел и его подразделы удалены. Данные отправлены боту.');
        }
    });
}