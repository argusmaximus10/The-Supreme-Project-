class SettingsManager {
    constructor() {
        this.settings = {};
        this.init();
    }

    async init() {
        await this.loadSettings();
        this.populateForm();
        this.bindEvents();
    }

    async loadSettings() {
        this.settings = await DataUtils.loadData('settings');
    }

    populateForm() {
        // General Settings
        document.getElementById('siteName').value = this.settings.siteName || '';
        document.getElementById('siteUrl').value = this.settings.siteUrl || '';
        document.getElementById('adminEmail').value = this.settings.adminEmail || '';
        document.getElementById('itemsPerPage').value = this.settings.itemsPerPage || 10;
        document.getElementById('currency').value = this.settings.currency || 'USD';
        document.getElementById('timezone').value = this.settings.timezone || 'UTC';

        // Toggles
        document.getElementById('maintenanceMode').checked = this.settings.maintenanceMode || false;
        document.getElementById('registrationEnabled').checked = this.settings.registrationEnabled || true;

        // Notifications
        const notifications = this.settings.notifications || {};
        document.getElementById('notifyEmail').checked = notifications.email || false;
        document.getElementById('notifyPush').checked = notifications.push || false;
        document.getElementById('notifySMS').checked = notifications.sms || false;

        // Theme
        const theme = this.settings.theme || {};
        document.getElementById('primaryColor').value = theme.primaryColor || '#3498db';
        document.getElementById('secondaryColor').value = theme.secondaryColor || '#2c3e50';
        document.getElementById('darkMode').checked = theme.darkMode || false;
    }

    bindEvents() {
        const saveBtn = document.getElementById('saveSettingsBtn');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => this.saveSettings());
        }

        const resetBtn = document.getElementById('resetSettingsBtn');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => this.resetSettings());
        }
    }

    async saveSettings() {
        // Collect all settings
        const newSettings = {
            siteName: document.getElementById('siteName').value,
            siteUrl: document.getElementById('siteUrl').value,
            adminEmail: document.getElementById('adminEmail').value,
            itemsPerPage: parseInt(document.getElementById('itemsPerPage').value),
            currency: document.getElementById('currency').value,
            timezone: document.getElementById('timezone').value,
            maintenanceMode: document.getElementById('maintenanceMode').checked,
            registrationEnabled: document.getElementById('registrationEnabled').checked,
            notifications: {
                email: document.getElementById('notifyEmail').checked,
                push: document.getElementById('notifyPush').checked,
                sms: document.getElementById('notifySMS').checked
            },
            theme: {
                primaryColor: document.getElementById('primaryColor').value,
                secondaryColor: document.getElementById('secondaryColor').value,
                darkMode: document.getElementById('darkMode').checked
            }
        };

        this.settings = newSettings;
        await DataUtils.saveData('settings', this.settings);
        DataUtils.showNotification('Settings saved successfully', 'success');
    }

    async resetSettings() {
        if (DataUtils.confirmAction('Are you sure you want to reset all settings to default?')) {
            await DataUtils.saveData('settings', {});
            this.settings = {};
            this.populateForm();
            DataUtils.showNotification('Settings reset to default', 'success');
        }
    }
}

let settingsManager;
document.addEventListener('DOMContentLoaded', function() {
    if (window.location.pathname.includes('settings.html')) {
        settingsManager = new SettingsManager();
        window.settingsManager = settingsManager;
    }
});