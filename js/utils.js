class DataUtils {
    static async fetchData(file) {
        try {
            const response = await fetch(`data/${file}.json`);
            if (!response.ok) throw new Error(`Failed to fetch ${file}`);
            return await response.json();
        } catch (error) {
            console.error(`Error fetching ${file}:`, error);
            this.showNotification(`Error loading ${file}`, 'error');
            return file === 'settings' ? {} : [];
        }
    }

    static async saveData(file, data) {
        try {
            // In a real app, you would send this to a server
            // For demo purposes, we'll store in localStorage
            localStorage.setItem(`dashboard_${file}`, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error(`Error saving ${file}:`, error);
            this.showNotification(`Error saving ${file}`, 'error');
            return false;
        }
    }

    static async loadData(file) {
        try {
            // Check localStorage first, then fetch from file
            const localData = localStorage.getItem(`dashboard_${file}`);
            if (localData) {
                return JSON.parse(localData);
            }
            return await this.fetchData(file);
        } catch (error) {
            console.error(`Error loading ${file}:`, error);
            return [];
        }
    }

    static generateId(dataArray) {
        if (dataArray.length === 0) return 1;
        const maxId = Math.max(...dataArray.map(item => item.id));
        return maxId + 1;
    }

    static formatDate(date = new Date()) {
        return date.toISOString().split('T')[0];
    }

    static formatCurrency(amount, currency = 'USD') {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency
        }).format(amount);
    }

    static showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <span>${message}</span>
            <button onclick="this.parentElement.remove()">×</button>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 3000);
    }

    static confirmAction(message) {
        return confirm(message);
    }

    static updateStats() {
        // This will be called after any CRUD operation
        if (window.updateDashboardCharts) {
            window.updateDashboardCharts();
        }
    }
static logChange(entity, action, details) {
    const changes = JSON.parse(localStorage.getItem('dashboard_changes') || '[]');
    changes.push({
        entity,
        action,
        details,
        timestamp: new Date().toISOString()
    });
    
    // Keep only last 20 changes
    if (changes.length > 20) changes.shift();
    localStorage.setItem('dashboard_changes', JSON.stringify(changes));
    
    // Update dashboard charts
    this.updateStats();
}

// Add this method to DataUtils class:
static async updateStats() {
    console.log('Updating dashboard stats...');
    
    // This will be called after any CRUD operation
    if (window.updateDashboardCharts && typeof window.updateDashboardCharts === 'function') {
        console.log('Calling updateDashboardCharts...');
        window.updateDashboardCharts();
    } else {
        console.log('updateDashboardCharts not available, trying refreshDashboardCharts...');
        if (window.refreshDashboardCharts && typeof window.refreshDashboardCharts === 'function') {
            window.refreshDashboardCharts();
        } else {
            console.log('No dashboard update function available');
        }
    }
}

// Also add this function to log changes:
static logChange(entity, action, details) {
    try {
        const changes = JSON.parse(localStorage.getItem('dashboard_changes') || '[]');
        changes.push({
            entity,
            action,
            details,
            timestamp: new Date().toISOString(),
            type: action.includes('delete') ? 'delete' : 'update'
        });
        
        // Keep only last 10 changes
        if (changes.length > 10) changes.shift();
        localStorage.setItem('dashboard_changes', JSON.stringify(changes));
        
        // Update dashboard
        this.updateStats();
    } catch (error) {
        console.error('Error logging change:', error);
    }
}
}

// Add notification styles
const style = document.createElement('style');
style.textContent = `
    .notification {
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 5px;
        color: white;
        z-index: 1000;
        display: flex;
        justify-content: space-between;
        align-items: center;
        min-width: 300px;
        animation: slideIn 0.3s ease;
    }
    
    .notification.info {
        background: #3498db;
    }
    
    .notification.success {
        background: #2ecc71;
    }
    
    .notification.warning {
        background: #f39c12;
    }
    
    .notification.error {
        background: #e74c3c;
    }
    
    .notification button {
        background: none;
        border: none;
        color: white;
        font-size: 20px;
        cursor: pointer;
        margin-left: 10px;
    }
    
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
`;
document.head.appendChild(style);

// Export to global scope
window.DataUtils = DataUtils;