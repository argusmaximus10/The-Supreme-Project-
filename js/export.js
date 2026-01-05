class DataExporter {
    static async exportToCSV(data, filename) {
        if (!data || data.length === 0) {
            DataUtils.showNotification('No data to export', 'warning');
            return;
        }

        const headers = Object.keys(data[0]);
        const csvContent = [
            headers.join(','),
            ...data.map(row => headers.map(header => JSON.stringify(row[header])).join(','))
        ].join('\n');

        this.downloadFile(csvContent, filename, 'text/csv');
    }

    static async exportToJSON(data, filename) {
        if (!data || data.length === 0) {
            DataUtils.showNotification('No data to export', 'warning');
            return;
        }

        const jsonContent = JSON.stringify(data, null, 2);
        this.downloadFile(jsonContent, filename, 'application/json');
    }

    static downloadFile(content, filename, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    static async exportAllData() {
        try {
            const [users, products, orders, categories, settings] = await Promise.all([
                DataUtils.loadData('users'),
                DataUtils.loadData('products'),
                DataUtils.loadData('orders'),
                DataUtils.loadData('categories'),
                DataUtils.loadData('settings')
            ]);

            const allData = {
                users,
                products,
                orders,
                categories,
                settings
            };

            const jsonContent = JSON.stringify(allData, null, 2);
            this.downloadFile(jsonContent, `dashboard-export-${DataUtils.formatDate()}.json`, 'application/json');
            DataUtils.showNotification('All data exported successfully', 'success');
        } catch (error) {
            console.error('Error exporting data:', error);
            DataUtils.showNotification('Error exporting data', 'error');
        }
    }
}

// Global export function
function exportData() {
    const format = prompt('Export format? (csv/json/all)', 'json');
    const type = prompt('Export which data? (users/products/orders/categories)', 'users');

    if (!format || !type) return;

    switch (format.toLowerCase()) {
        case 'csv':
            DataUtils.loadData(type).then(data => {
                DataExporter.exportToCSV(data, `${type}-${DataUtils.formatDate()}.csv`);
            });
            break;
        case 'json':
            DataUtils.loadData(type).then(data => {
                DataExporter.exportToJSON(data, `${type}-${DataUtils.formatDate()}.json`);
            });
            break;
        case 'all':
            DataExporter.exportAllData();
            break;
        default:
            DataUtils.showNotification('Invalid export format', 'warning');
    }
}

window.exportData = exportData;