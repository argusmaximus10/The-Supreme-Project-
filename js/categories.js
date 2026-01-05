class CategoriesManager {
    constructor() {
        this.categories = [];
        this.currentEditId = null;
        this.init();
    }

    async init() {
        await this.loadCategories();
        this.renderTable();
        this.bindEvents();
    }

    async loadCategories() {
        this.categories = await DataUtils.loadData('categories');
    }

    async saveCategories() {
        await DataUtils.saveData('categories', this.categories);
        DataUtils.updateStats();
    }

    renderTable() {
        const tbody = document.querySelector('#categoriesTable tbody');
        if (!tbody) return;

        tbody.innerHTML = this.categories.map(category => `
            <tr>
                <td>${category.id}</td>
                <td>${category.name}</td>
                <td>${category.description}</td>
                <td>${category.productCount}</td>
                <td>${category.createdAt}</td>
                <td class="action-buttons">
                    <button class="btn btn-info btn-sm" onclick="categoriesManager.editCategory(${category.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="categoriesManager.deleteCategory(${category.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }

    showModal(category = null) {
        const modal = document.getElementById('categoryModal');
        const modalTitle = document.getElementById('categoryModalTitle');

        if (category) {
            modalTitle.textContent = 'Edit Category';
            this.currentEditId = category.id;
            document.getElementById('categoryName').value = category.name;
            document.getElementById('categoryDescription').value = category.description;
        } else {
            modalTitle.textContent = 'Add New Category';
            this.currentEditId = null;
            document.getElementById('categoryForm').reset();
        }

        modal.style.display = 'flex';
    }

    hideModal() {
        const modal = document.getElementById('categoryModal');
        modal.style.display = 'none';
        this.currentEditId = null;
        document.getElementById('categoryForm').reset();
    }

    async saveCategory() {
        const name = document.getElementById('categoryName').value;
        const description = document.getElementById('categoryDescription').value;

        if (!name) {
            DataUtils.showNotification('Please fill in the category name', 'warning');
            return;
        }

        if (this.currentEditId) {
            const index = this.categories.findIndex(c => c.id === this.currentEditId);
            if (index !== -1) {
                this.categories[index] = {
                    ...this.categories[index],
                    name,
                    description,
                    updatedAt: DataUtils.formatDate()
                };
                DataUtils.showNotification('Category updated successfully', 'success');
            }
        } else {
            const newCategory = {
                id: DataUtils.generateId(this.categories),
                name,
                description,
                productCount: 0,
                createdAt: DataUtils.formatDate()
            };
            this.categories.push(newCategory);
            DataUtils.showNotification('Category added successfully', 'success');
        }

        await this.saveCategories();
        this.renderTable();
        this.hideModal();
    }

    editCategory(id) {
        const category = this.categories.find(c => c.id === id);
        if (category) {
            this.showModal(category);
        }
    }

    async deleteCategory(id) {
        if (!DataUtils.confirmAction('Are you sure you want to delete this category?')) {
            return;
        }

        const index = this.categories.findIndex(c => c.id === id);
        if (index !== -1) {
            const categoryName = this.categories[index].name;
            this.categories.splice(index, 1);
            
            await this.saveCategories();
            this.renderTable();
            DataUtils.showNotification(`Category "${categoryName}" deleted successfully`, 'success');
        }
    }
}

let categoriesManager;
document.addEventListener('DOMContentLoaded', function() {
    if (window.location.pathname.includes('categories.html')) {
        categoriesManager = new CategoriesManager();
        window.categoriesManager = categoriesManager;
    }
});