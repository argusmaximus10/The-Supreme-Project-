class ProductsManager {
    constructor() {
        this.products = [];
        this.currentEditId = null;
        this.init();
    }

    async init() {
        await this.loadProducts();
        this.renderTable();
        this.bindEvents();
    }

    async loadProducts() {
        this.products = await DataUtils.loadData('products');
    }

    async saveProducts() {
        await DataUtils.saveData('products', this.products);
        DataUtils.updateStats();
    }

    renderTable() {
        const tbody = document.querySelector('#productsTable tbody');
        if (!tbody) return;

        tbody.innerHTML = this.products.map(product => `
            <tr>
                <td>${product.id}</td>
                <td>${product.name}</td>
                <td>${product.category}</td>
                <td>${DataUtils.formatCurrency(product.price)}</td>
                <td>${product.stock}</td>
                <td><span class="status-badge ${product.status.toLowerCase().replace(' ', '-')}">${product.status}</span></td>
                <td>${product.createdAt}</td>
                <td class="action-buttons">
                    <button class="btn btn-info btn-sm" onclick="productsManager.editProduct(${product.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="productsManager.deleteProduct(${product.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }

    bindEvents() {
        // Add product button
        const addBtn = document.getElementById('addProductBtn');
        if (addBtn) {
            addBtn.addEventListener('click', () => this.showModal());
        }

        // Save product button
        const saveBtn = document.getElementById('saveProductBtn');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => this.saveProduct());
        }

        // Modal close button
        const closeBtn = document.querySelector('#productModal .close-modal');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.hideModal());
        }

        // Modal backdrop click
        const modal = document.getElementById('productModal');
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.hideModal();
                }
            });
        }

        // Search functionality
        const searchInput = document.getElementById('productSearch');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchProducts(e.target.value);
            });
        }
    }

    showModal(product = null) {
        const modal = document.getElementById('productModal');
        const modalTitle = document.getElementById('productModalTitle');
        const form = document.getElementById('productForm');

        if (product) {
            modalTitle.textContent = 'Edit Product';
            this.currentEditId = product.id;
            document.getElementById('productName').value = product.name;
            document.getElementById('productCategory').value = product.category;
            document.getElementById('productPrice').value = product.price;
            document.getElementById('productStock').value = product.stock;
            document.getElementById('productStatus').value = product.status;
        } else {
            modalTitle.textContent = 'Add New Product';
            this.currentEditId = null;
            form.reset();
        }

        modal.style.display = 'flex';
    }

    hideModal() {
        const modal = document.getElementById('productModal');
        modal.style.display = 'none';
        this.currentEditId = null;
        document.getElementById('productForm').reset();
    }

    async saveProduct() {
        const name = document.getElementById('productName').value;
        const category = document.getElementById('productCategory').value;
        const price = parseFloat(document.getElementById('productPrice').value);
        const stock = parseInt(document.getElementById('productStock').value);
        const status = document.getElementById('productStatus').value;

        if (!name || !category || isNaN(price) || isNaN(stock)) {
            DataUtils.showNotification('Please fill in all required fields correctly', 'warning');
            return;
        }

        if (this.currentEditId) {
            // Edit existing product
            const index = this.products.findIndex(p => p.id === this.currentEditId);
            if (index !== -1) {
                this.products[index] = {
                    ...this.products[index],
                    name,
                    category,
                    price,
                    stock,
                    status,
                    updatedAt: DataUtils.formatDate()
                };
                DataUtils.showNotification('Product updated successfully', 'success');
            }
        } else {
            // Add new product
            const newProduct = {
                id: DataUtils.generateId(this.products),
                name,
                category,
                price,
                stock,
                status,
                createdAt: DataUtils.formatDate()
            };
            this.products.push(newProduct);
            DataUtils.showNotification('Product added successfully', 'success');
        }

        await this.saveProducts();
        this.renderTable();
        this.hideModal();
    }

    editProduct(id) {
        const product = this.products.find(p => p.id === id);
        if (product) {
            this.showModal(product);
        }
    }

    async deleteProduct(id) {
        if (!DataUtils.confirmAction('Are you sure you want to delete this product?')) {
            return;
        }

        const index = this.products.findIndex(p => p.id === id);
        if (index !== -1) {
            const productName = this.products[index].name;
            this.products.splice(index, 1);
            
            await this.saveProducts();
            this.renderTable();
            DataUtils.showNotification(`Product "${productName}" deleted successfully`, 'success');
        }
    }

    searchProducts(query) {
        if (!query) {
            this.renderTable();
            return;
        }

        const filtered = this.products.filter(product =>
            product.name.toLowerCase().includes(query.toLowerCase()) ||
            product.category.toLowerCase().includes(query.toLowerCase()) ||
            product.status.toLowerCase().includes(query.toLowerCase())
        );

        const tbody = document.querySelector('#productsTable tbody');
        if (tbody) {
            tbody.innerHTML = filtered.map(product => `
                <tr>
                    <td>${product.id}</td>
                    <td>${product.name}</td>
                    <td>${product.category}</td>
                    <td>${DataUtils.formatCurrency(product.price)}</td>
                    <td>${product.stock}</td>
                    <td><span class="status-badge ${product.status.toLowerCase().replace(' ', '-')}">${product.status}</span></td>
                    <td>${product.createdAt}</td>
                    <td class="action-buttons">
                        <button class="btn btn-info btn-sm" onclick="productsManager.editProduct(${product.id})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-danger btn-sm" onclick="productsManager.deleteProduct(${product.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `).join('');
        }
    }
}

// Initialize products manager
let productsManager;
document.addEventListener('DOMContentLoaded', function() {
    if (window.location.pathname.includes('products.html')) {
        productsManager = new ProductsManager();
        window.productsManager = productsManager;

        // Remove duplicate event listeners from products.html script
        // They're already handled in bindEvents() above
    }
});