class Localization {
    constructor() {
        this.currentLang = 'en';
        this.translations = {
            en: {
                // Dashboard
                dashboard: 'Dashboard',
                users: 'Users',
                products: 'Products',
                orders: 'Orders',
                categories: 'Categories',
                settings: 'Settings',
                logout: 'Logout',
                
                // Common
                save: 'Save',
                cancel: 'Cancel',
                delete: 'Delete',
                edit: 'Edit',
                add: 'Add New',
                search: 'Search...',
                
                // Status
                active: 'Active',
                inactive: 'Inactive',
                pending: 'Pending',
                completed: 'Completed',
                shipped: 'Shipped',
                
                // Messages
                confirmDelete: 'Are you sure you want to delete this item?',
                saveSuccess: 'Saved successfully!',
                deleteSuccess: 'Deleted successfully!'
            },
            fr: {
                // Dashboard
                dashboard: 'Tableau de bord',
                users: 'Utilisateurs',
                products: 'Produits',
                orders: 'Commandes',
                categories: 'Catégories',
                settings: 'Paramètres',
                logout: 'Déconnexion',
                
                // Common
                save: 'Enregistrer',
                cancel: 'Annuler',
                delete: 'Supprimer',
                edit: 'Modifier',
                add: 'Ajouter',
                search: 'Rechercher...',
                
                // Status
                active: 'Actif',
                inactive: 'Inactif',
                pending: 'En attente',
                completed: 'Terminé',
                shipped: 'Expédié',
                
                // Messages
                confirmDelete: 'Êtes-vous sûr de vouloir supprimer cet élément?',
                saveSuccess: 'Enregistré avec succès!',
                deleteSuccess: 'Supprimé avec succès!'
            }
        };
        this.init();
    }

    init() {
        this.currentLang = localStorage.getItem('dashboard_language') || 'en';
        this.applyLanguage();
        this.bindEvents();
    }

    bindEvents() {
        const langSelect = document.getElementById('languageSelect');
        if (langSelect) {
            langSelect.value = this.currentLang;
            langSelect.addEventListener('change', (e) => {
                this.setLanguage(e.target.value);
            });
        }
    }

    setLanguage(lang) {
        if (this.translations[lang]) {
            this.currentLang = lang;
            localStorage.setItem('dashboard_language', lang);
            this.applyLanguage();
            DataUtils.showNotification(`Language changed to ${lang.toUpperCase()}`, 'success');
        }
    }

    applyLanguage() {
        // Apply translations to elements with data-i18n attribute
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            if (this.translations[this.currentLang][key]) {
                if (element.placeholder !== undefined) {
                    element.placeholder = this.translations[this.currentLang][key];
                } else {
                    element.textContent = this.translations[this.currentLang][key];
                }
            }
        });
    }

    translate(key) {
        return this.translations[this.currentLang][key] || key;
    }
}

// Initialize localization
const localization = new Localization();
window.localization = localization;