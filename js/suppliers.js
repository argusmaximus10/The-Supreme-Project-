class SuppliersManager {
    constructor() {
        this.suppliers = [];
        this.currentEditId = null;
        this.init();
    }

    async init() {
        await this.loadSuppliers();
        this.renderTable();
        this.bindEvents();
    }

    async loadSuppliers() {
        this.suppliers = await DataUtils.loadData('suppliers');
    }

    async saveSuppliers() {
        await DataUtils.saveData('suppliers', this.suppliers);
        DataUtils.updateStats();
    }

    renderTable() {
        const tbody = document.querySelector('#suppliersTable tbody');
        if (!tbody) return;

        tbody.innerHTML = this.suppliers.map(supplier => `
            <tr>
                <td>${supplier.id}</td>
                <td>${supplier.name}</td>
                <td>${supplier.contactPerson}</td>
                <td>${supplier.email}</td>
                <td>${supplier.phone}</td>
                <td>${supplier.productsSupplied.join(', ')}</td>
                <td><span class="status-badge ${supplier.status.toLowerCase()}">${supplier.status}</span></td>
                <td>${supplier.createdAt}</td>
                <td class="action-buttons">
                    <button class="btn btn-info btn-sm" onclick="suppliersManager.editSupplier(${supplier.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="suppliersManager.deleteSupplier(${supplier.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }

    bindEvents() {
        const addBtn = document.getElementById('addSupplierBtn');
        if (addBtn) {
            addBtn.addEventListener('click', () => this.showModal());
        }

        const saveBtn = document.getElementById('saveSupplierBtn');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => this.saveSupplier());
        }

        const closeBtn = document.querySelector('#supplierModal .close-modal');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.hideModal());
        }

        const modal = document.getElementById('supplierModal');
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) this.hideModal();
            });
        }
    }

    showModal(supplier = null) {
        const modal = document.getElementById('supplierModal');
        const modalTitle = document.getElementById('supplierModalTitle');
        const form = document.getElementById('supplierForm');

        if (supplier) {
            modalTitle.textContent = 'Edit Supplier';
            this.currentEditId = supplier.id;
            document.getElementById('supplierName').value = supplier.name;
            document.getElementById('supplierContact').value = supplier.contactPerson;
            document.getElementById('supplierEmail').value = supplier.email;
            document.getElementById('supplierPhone').value = supplier.phone;
            document.getElementById('supplierAddress').value = supplier.address;
            document.getElementById('supplierProducts').value = supplier.productsSupplied.join(', ');
            document.getElementById('supplierStatus').value = supplier.status;
        } else {
            modalTitle.textContent = 'Add New Supplier';
            this.currentEditId = null;
            form.reset();
        }

        modal.style.display = 'flex';
    }

    hideModal() {
        const modal = document.getElementById('supplierModal');
        modal.style.display = 'none';
        this.currentEditId = null;
        document.getElementById('supplierForm').reset();
    }

    async saveSupplier() {
        const name = document.getElementById('supplierName').value;
        const contactPerson = document.getElementById('supplierContact').value;
        const email = document.getElementById('supplierEmail').value;
        const phone = document.getElementById('supplierPhone').value;
        const address = document.getElementById('supplierAddress').value;
        const productsSupplied = document.getElementById('supplierProducts').value.split(',').map(p => p.trim());
        const status = document.getElementById('supplierStatus').value;

        if (!name || !contactPerson || !email) {
            DataUtils.showNotification('Please fill in required fields (Name, Contact, Email)', 'warning');
            return;
        }

        if (this.currentEditId) {
            const index = this.suppliers.findIndex(s => s.id === this.currentEditId);
            if (index !== -1) {
                this.suppliers[index] = {
                    ...this.suppliers[index],
                    name,
                    contactPerson,
                    email,
                    phone,
                    address,
                    productsSupplied,
                    status,
                    updatedAt: DataUtils.formatDate()
                };
                DataUtils.showNotification('Supplier updated successfully', 'success');
            }
        } else {
            const newSupplier = {
                id: DataUtils.generateId(this.suppliers),
                name,
                contactPerson,
                email,
                phone,
                address,
                productsSupplied,
                status,
                createdAt: DataUtils.formatDate()
            };
            this.suppliers.push(newSupplier);
            DataUtils.showNotification('Supplier added successfully', 'success');
        }

        await this.saveSuppliers();
        this.renderTable();
        this.hideModal();
    }

    editSupplier(id) {
        const supplier = this.suppliers.find(s => s.id === id);
        if (supplier) {
            this.showModal(supplier);
        }
    }

    async deleteSupplier(id) {
        if (!DataUtils.confirmAction('Are you sure you want to delete this supplier?')) {
            return;
        }

        const index = this.suppliers.findIndex(s => s.id === id);
        if (index !== -1) {
            const supplierName = this.suppliers[index].name;
            this.suppliers.splice(index, 1);
            
            await this.saveSuppliers();
            this.renderTable();
            DataUtils.showNotification(`Supplier "${supplierName}" deleted successfully`, 'success');
        }
    }
}

let suppliersManager;
document.addEventListener('DOMContentLoaded', function() {
    if (window.location.pathname.includes('suppliers.html')) {
        suppliersManager = new SuppliersManager();
        window.suppliersManager = suppliersManager;
    }
});