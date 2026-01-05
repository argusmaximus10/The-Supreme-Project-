class OrdersManager {
    constructor() {
        this.orders = [];
        this.currentEditId = null;
        this.init();
    }

    async init() {
        await this.loadOrders();
        this.renderTable();
        this.bindEvents();
        this.populateProductOptions();
    }

    async loadOrders() {
        this.orders = await DataUtils.loadData('orders');
    }

    async saveOrders() {
        await DataUtils.saveData('orders', this.orders);
        this.logChange('order', 'updated');
        DataUtils.updateStats();
    }

    renderTable() {
        const tbody = document.querySelector('#ordersTable tbody');
        if (!tbody) return;

        tbody.innerHTML = this.orders.map(order => `
            <tr>
                <td>${order.orderNumber}</td>
                <td>${order.customer}</td>
                <td>${order.product}</td>
                <td>${order.quantity}</td>
                <td>${DataUtils.formatCurrency(order.total)}</td>
                <td><span class="status-badge ${order.status.toLowerCase()}">${order.status}</span></td>
                <td>${order.date}</td>
                <td class="action-buttons">
                    <button class="btn btn-info btn-sm" onclick="ordersManager.editOrder(${order.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="ordersManager.deleteOrder(${order.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }

    bindEvents() {
        // Add order button
        const addBtn = document.getElementById('addOrderBtn');
        if (addBtn) {
            addBtn.addEventListener('click', () => this.showModal());
        }

        // Save order button
        const saveBtn = document.getElementById('saveOrderBtn');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => this.saveOrder());
        }

        // Modal close
        const closeBtn = document.querySelector('#orderModal .close-modal');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.hideModal());
        }

        // Modal backdrop
        const modal = document.getElementById('orderModal');
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) this.hideModal();
            });
        }

        // Quantity change updates total
        const quantityInput = document.getElementById('orderQuantity');
        if (quantityInput) {
            quantityInput.addEventListener('input', () => this.calculateTotal());
        }

        // Product change updates price
        const productSelect = document.getElementById('orderProduct');
        if (productSelect) {
            productSelect.addEventListener('change', () => this.calculateTotal());
        }
    }

    async populateProductOptions() {
        const products = await DataUtils.loadData('products');
        const select = document.getElementById('orderProduct');
        if (select) {
            // Clear existing options except the first
            while (select.options.length > 1) {
                select.remove(1);
            }
            
            // Add product options
            products.forEach(product => {
                const option = document.createElement('option');
                option.value = product.name;
                option.textContent = `${product.name} - ${DataUtils.formatCurrency(product.price)}`;
                option.dataset.price = product.price;
                select.appendChild(option);
            });
        }
    }

    showModal(order = null) {
        const modal = document.getElementById('orderModal');
        const modalTitle = document.getElementById('orderModalTitle');
        const form = document.getElementById('orderForm');

        if (order) {
            modalTitle.textContent = 'Edit Order';
            this.currentEditId = order.id;
            document.getElementById('orderCustomer').value = order.customer;
            document.getElementById('orderProduct').value = order.product;
            document.getElementById('orderQuantity').value = order.quantity;
            document.getElementById('orderTotal').value = order.total;
            document.getElementById('orderStatus').value = order.status;
            document.getElementById('orderDate').value = order.date;
        } else {
            modalTitle.textContent = 'Add New Order';
            this.currentEditId = null;
            form.reset();
            document.getElementById('orderDate').value = new Date().toISOString().split('T')[0];
            this.calculateTotal();
        }

        modal.style.display = 'flex';
    }

    hideModal() {
        const modal = document.getElementById('orderModal');
        modal.style.display = 'none';
        this.currentEditId = null;
        document.getElementById('orderForm').reset();
    }

    calculateTotal() {
        const productSelect = document.getElementById('orderProduct');
        const quantityInput = document.getElementById('orderQuantity');
        const totalInput = document.getElementById('orderTotal');
        
        if (productSelect && quantityInput && totalInput) {
            const selectedOption = productSelect.options[productSelect.selectedIndex];
            const price = parseFloat(selectedOption.dataset.price) || 0;
            const quantity = parseFloat(quantityInput.value) || 0;
            const total = price * quantity;
            
            totalInput.value = total.toFixed(2);
        }
    }

    async saveOrder() {
        const customer = document.getElementById('orderCustomer').value;
        const product = document.getElementById('orderProduct').value;
        const quantity = parseInt(document.getElementById('orderQuantity').value);
        const total = parseFloat(document.getElementById('orderTotal').value);
        const status = document.getElementById('orderStatus').value;
        const date = document.getElementById('orderDate').value;

        if (!customer || !product || isNaN(quantity) || quantity <= 0) {
            DataUtils.showNotification('Please fill in all required fields correctly', 'warning');
            return;
        }

        if (this.currentEditId) {
            // Edit existing order
            const index = this.orders.findIndex(o => o.id === this.currentEditId);
            if (index !== -1) {
                this.orders[index] = {
                    ...this.orders[index],
                    customer,
                    product,
                    quantity,
                    total,
                    status,
                    date,
                    updatedAt: DataUtils.formatDate()
                };
                DataUtils.showNotification('Order updated successfully', 'success');
            }
        } else {
            // Add new order
            const newOrder = {
                id: DataUtils.generateId(this.orders),
                orderNumber: `ORD-${String(this.orders.length + 1).padStart(3, '0')}`,
                customer,
                product,
                quantity,
                total,
                status,
                date: date || DataUtils.formatDate(),
                createdAt: DataUtils.formatDate()
            };
            this.orders.push(newOrder);
            DataUtils.showNotification('Order added successfully', 'success');
        }

        await this.saveOrders();
        this.renderTable();
        this.hideModal();
    }

    editOrder(id) {
        const order = this.orders.find(o => o.id === id);
        if (order) {
            this.showModal(order);
        }
    }

    async deleteOrder(id) {
        if (!DataUtils.confirmAction('Are you sure you want to delete this order?')) {
            return;
        }

        const index = this.orders.findIndex(o => o.id === id);
        if (index !== -1) {
            const orderNumber = this.orders[index].orderNumber;
            this.orders.splice(index, 1);
            
            await this.saveOrders();
            this.renderTable();
            DataUtils.showNotification(`Order "${orderNumber}" deleted successfully`, 'success');
        }
    }

    logChange(entity, action) {
        const changes = JSON.parse(localStorage.getItem('dashboard_changes') || '[]');
        changes.push({
            entity,
            action,
            type: action === 'delete' ? 'delete' : 'update',
            timestamp: new Date().toISOString()
        });
        
        // Keep only last 20 changes
        if (changes.length > 20) changes.shift();
        localStorage.setItem('dashboard_changes', JSON.stringify(changes));
    }
}

let ordersManager;
document.addEventListener('DOMContentLoaded', function() {
    if (window.location.pathname.includes('orders.html')) {
        ordersManager = new OrdersManager();
        window.ordersManager = ordersManager;
    }
});