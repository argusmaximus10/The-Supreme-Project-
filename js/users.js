class UsersManager {
    constructor() {
        this.users = [];
        this.currentEditId = null;
        this.init();
    }

    async init() {
        await this.loadUsers();
        this.renderTable();
        this.bindEvents();
    }

    async loadUsers() {
        this.users = await DataUtils.loadData('users');
    }

    async saveUsers() {
        await DataUtils.saveData('users', this.users);
        DataUtils.updateStats(); // Update dashboard charts
    }

    renderTable() {
        const tbody = document.querySelector('#usersTable tbody');
        if (!tbody) return;

        tbody.innerHTML = this.users.map(user => `
            <tr>
                <td>${user.id}</td>
                <td>${user.name}</td>
                <td>${user.email}</td>
                <td><span class="status-badge ${user.status.toLowerCase()}">${user.status}</span></td>
                <td>${user.role}</td>
                <td>${user.createdAt}</td>
                <td>${user.lastLogin || 'Never'}</td>
                <td class="action-buttons">
                    <button class="btn btn-info btn-sm" onclick="usersManager.editUser(${user.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="usersManager.deleteUser(${user.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }

    bindEvents() {
        // Add user button
        const addBtn = document.getElementById('addUserBtn');
        if (addBtn) {
            addBtn.addEventListener('click', () => this.showModal());
        }

        // Save user button
        const saveBtn = document.getElementById('saveUserBtn');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => this.saveUser());
        }

        // Modal close
        const closeBtn = document.querySelector('.close-modal');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.hideModal());
        }

        // Modal backdrop click
        const modal = document.getElementById('userModal');
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.hideModal();
                }
            });
        }
    }

    showModal(user = null) {
        const modal = document.getElementById('userModal');
        const modalTitle = document.getElementById('modalTitle');
        const form = document.getElementById('userForm');

        if (user) {
            modalTitle.textContent = 'Edit User';
            this.currentEditId = user.id;
            document.getElementById('userName').value = user.name;
            document.getElementById('userEmail').value = user.email;
            document.getElementById('userRole').value = user.role;
            document.getElementById('userStatus').value = user.status;
        } else {
            modalTitle.textContent = 'Add New User';
            this.currentEditId = null;
            form.reset();
        }

        modal.style.display = 'flex';
    }

    hideModal() {
        const modal = document.getElementById('userModal');
        modal.style.display = 'none';
        this.currentEditId = null;
        document.getElementById('userForm').reset();
    }

    async saveUser() {
        const name = document.getElementById('userName').value;
        const email = document.getElementById('userEmail').value;
        const role = document.getElementById('userRole').value;
        const status = document.getElementById('userStatus').value;

        if (!name || !email) {
            DataUtils.showNotification('Please fill in all required fields', 'warning');
            return;
        }

        if (this.currentEditId) {
            // Edit existing user
            const index = this.users.findIndex(u => u.id === this.currentEditId);
            if (index !== -1) {
                this.users[index] = {
                    ...this.users[index],
                    name,
                    email,
                    role,
                    status,
                    updatedAt: DataUtils.formatDate()
                };
                DataUtils.showNotification('User updated successfully', 'success');
            }
        } else {
            // Add new user
            const newUser = {
                id: DataUtils.generateId(this.users),
                name,
                email,
                role,
                status,
                createdAt: DataUtils.formatDate(),
                lastLogin: null
            };
            this.users.push(newUser);
            DataUtils.showNotification('User added successfully', 'success');
        }

        await this.saveUsers();
        this.renderTable();
        this.hideModal();
    }

    editUser(id) {
        const user = this.users.find(u => u.id === id);
        if (user) {
            this.showModal(user);
        }
    }

    async deleteUser(id) {
        if (!DataUtils.confirmAction('Are you sure you want to delete this user?')) {
            return;
        }

        const userIndex = this.users.findIndex(u => u.id === id);
        if (userIndex !== -1) {
            const userName = this.users[userIndex].name;
            this.users.splice(userIndex, 1);
            
            await this.saveUsers();
            this.renderTable();
            DataUtils.showNotification(`User "${userName}" deleted successfully`, 'success');
        }
    }

    async searchUsers(query) {
        if (!query) {
            await this.loadUsers();
            this.renderTable();
            return;
        }

        const filtered = this.users.filter(user =>
            user.name.toLowerCase().includes(query.toLowerCase()) ||
            user.email.toLowerCase().includes(query.toLowerCase()) ||
            user.role.toLowerCase().includes(query.toLowerCase())
        );

        const tbody = document.querySelector('#usersTable tbody');
        if (tbody) {
            tbody.innerHTML = filtered.map(user => `
                <tr>
                    <td>${user.id}</td>
                    <td>${user.name}</td>
                    <td>${user.email}</td>
                    <td><span class="status-badge ${user.status.toLowerCase()}">${user.status}</span></td>
                    <td>${user.role}</td>
                    <td>${user.createdAt}</td>
                    <td>${user.lastLogin || 'Never'}</td>
                    <td class="action-buttons">
                        <button class="btn btn-info btn-sm" onclick="usersManager.editUser(${user.id})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-danger btn-sm" onclick="usersManager.deleteUser(${user.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `).join('');
        }
    }
}

// Initialize users manager
let usersManager;
document.addEventListener('DOMContentLoaded', function() {
    if (window.location.pathname.includes('users.html')) {
        usersManager = new UsersManager();
        window.usersManager = usersManager;

        // Bind search
        const searchInput = document.getElementById('userSearch');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                usersManager.searchUsers(e.target.value);
            });
        }
    }
});