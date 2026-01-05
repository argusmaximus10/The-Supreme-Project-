class Auth {
    constructor() {
        this.currentUser = null;
        this.init();
    }

    init() {
        this.checkLoginStatus();
        this.bindEvents();
    }

    checkLoginStatus() {
        const user = localStorage.getItem('dashboard_user') || sessionStorage.getItem('dashboard_user');
        if (user) {
            this.currentUser = JSON.parse(user);
            this.redirectIfLoggedIn();
        } else {
            this.redirectIfNotLoggedIn();
        }
    }

    redirectIfLoggedIn() {
        const currentPage = window.location.pathname.split('/').pop();
        if (currentPage === 'index.html' || currentPage === '' || currentPage.includes('index')) {
            // Immediate redirect to dashboard
            window.location.href = 'dashboard.html';
        }
    }

    redirectIfNotLoggedIn() {
        const currentPage = window.location.pathname.split('/').pop();
        const publicPages = ['index.html', ''];
        if (!publicPages.includes(currentPage) && !currentPage.includes('index')) {
            window.location.href = 'index.html';
        }
    }

    bindEvents() {
        // Login form
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.login();
            });
        }

        // Logout buttons (all pages)
        document.addEventListener('DOMContentLoaded', () => {
            const logoutBtns = document.querySelectorAll('#logoutBtn');
            logoutBtns.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.logout();
                });
            });
        });
    }

    login() {
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const remember = document.getElementById('remember')?.checked;

        // Default credentials
        if (username === 'admin' && password === 'admin123') {
            this.currentUser = {
                id: 1,
                username: 'admin',
                name: 'Administrator',
                role: 'Admin',
                email: 'admin@example.com'
            };

            if (remember) {
                localStorage.setItem('dashboard_user', JSON.stringify(this.currentUser));
            } else {
                sessionStorage.setItem('dashboard_user', JSON.stringify(this.currentUser));
            }

            DataUtils.showNotification('Login successful! Redirecting...', 'success');
            // Immediate redirect without delay
            window.location.href = 'dashboard.html';
        } else {
            DataUtils.showNotification('Invalid credentials! Try: admin / admin123', 'error');
        }
    }

    logout() {
        localStorage.removeItem('dashboard_user');
        sessionStorage.removeItem('dashboard_user');
        this.currentUser = null;
        DataUtils.showNotification('Logged out successfully', 'success');
        window.location.href = 'index.html';
    }

    isAuthenticated() {
        return this.currentUser !== null;
    }
}

// Initialize auth immediately
const auth = new Auth();
window.auth = auth;