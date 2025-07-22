import { sendDataToBot, showAlert } from './telegramWebApp.js';

const companyLogo = document.getElementById('company-logo');
const companyName = document.getElementById('company-name');
const backgroundBlur = document.querySelector('.background-blur');
const logoUrlInput = document.getElementById('logo-url-input');
const companyNameInput = document.getElementById('company-name-input');
const applyCompanyChangesBtn = document.getElementById('apply-company-changes');
const botLogo = document.getElementById('bot-logo');
const botLogoUrlInput = document.getElementById('bot-logo-url-input');
const applyBotLogoChangesBtn = document.getElementById('apply-bot-logo-changes');

export function updateCompanyInfo(logoUrl, name) {
    if (logoUrl) {
        companyLogo.src = logoUrl;
        backgroundBlur.style.backgroundImage = `url(${logoUrl})`;
    }
    if (name) {
        companyName.textContent = name;
    }
}

export function updateBotLogo(logoUrl) {
    if (logoUrl) {
        botLogo.src = logoUrl;
    }
}

export function setupCompanyAndBotInfoListeners() {
    applyCompanyChangesBtn.addEventListener('click', () => {
        const newLogoUrl = logoUrlInput.value.trim();
        const newCompanyName = companyNameInput.value.trim();
        if (newLogoUrl || newCompanyName) {
            updateCompanyInfo(newLogoUrl, newCompanyName);
            sendDataToBot({
                type: 'update_company_info',
                companyLogo: newLogoUrl || undefined,
                companyName: newCompanyName || undefined
            });
            showAlert('Информация о компании отправлена боту!');
        } else {
            showAlert('Пожалуйста, введите данные для обновления информации о компании.');
        }
    });

    applyBotLogoChangesBtn.addEventListener('click', () => {
        const newBotLogoUrl = botLogoUrlInput.value.trim();
        if (newBotLogoUrl) {
            updateBotLogo(newBotLogoUrl);
            sendDataToBot({
                type: 'update_bot_logo',
                botLogo: newBotLogoUrl
            });
            showAlert('Логотип бота отправлен боту!');
        } else {
            showAlert('Пожалуйста, введите URL логотипа бота.');
        }
    });
}