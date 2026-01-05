class Dashboard {
    constructor() {
        this.charts = {};
        this.chartData = {
            users: [],
            products: [],
            orders: [],
            categories: [],
            suppliers: []
        };
        this.init();
    }

    async init() {
        console.log('Dashboard initializing...');
        this.updateDate();
        await this.loadAllData();
        this.initCharts();
        await this.loadRecentActivity();
        this.bindEvents();
        
        // Force update after a short delay to ensure DOM is ready
        setTimeout(() => this.updateAllCharts(), 500);
    }

    updateDate() {
        const dateElement = document.getElementById('currentDate');
        if (dateElement) {
            const now = new Date();
            dateElement.textContent = now.toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            });
        }
    }

    async loadAllData() {
        console.log('Loading all data...');
        try {
            // Load ALL data at once
            const [users, products, orders, categories, suppliers] = await Promise.all([
                this.loadData('users'),
                this.loadData('products'),
                this.loadData('orders'),
                this.loadData('categories'),
                this.loadData('suppliers')
            ]);

            console.log('Data loaded:', { users, products, orders, categories, suppliers });

            // Store data
            this.chartData = { users, products, orders, categories, suppliers };

            // Update stats cards
            this.updateStatsCards(users, products, orders, categories, suppliers);
            
            // Update charts immediately
            this.updateAllCharts();
            
        } catch (error) {
            console.error('Error loading data:', error);
            // Use mock data if real data fails
            this.useMockData();
        }
    }

    async loadData(file) {
        try {
            // Try localStorage first
            const localData = localStorage.getItem(`dashboard_${file}`);
            if (localData) {
                console.log(`Loaded ${file} from localStorage`);
                return JSON.parse(localData);
            }
            
            // Fall back to fetch
            const response = await fetch(`data/${file}.json`);
            if (!response.ok) throw new Error(`Failed to fetch ${file}`);
            const data = await response.json();
            console.log(`Loaded ${file} from file:`, data.length || 'object');
            return data;
        } catch (error) {
            console.error(`Error loading ${file}:`, error);
            return file === 'settings' ? {} : [];
        }
    }

    updateStatsCards(users, products, orders, categories, suppliers) {
        console.log('Updating stats cards...');
        const usersCount = document.getElementById('usersCount');
        const productsCount = document.getElementById('productsCount');
        const ordersCount = document.getElementById('ordersCount');
        const suppliersCount = document.getElementById('suppliersCount');
        
        if (usersCount) usersCount.textContent = users.length;
        if (productsCount) productsCount.textContent = products.length;
        if (ordersCount) ordersCount.textContent = orders.length;
        if (suppliersCount) suppliersCount.textContent = suppliers ? suppliers.length : 0;
    }

    initCharts() {
        console.log('Initializing charts...');
        
        // Users Chart - Active vs Inactive
        const usersCtx = document.getElementById('usersChart');
        if (usersCtx) {
            this.charts.usersChart = new Chart(usersCtx.getContext('2d'), {
                type: 'doughnut',
                data: {
                    labels: ['Active Users', 'Inactive Users'],
                    datasets: [{
                        data: [0, 0],
                        backgroundColor: ['#FFD700', '#B8860B'],
                        borderColor: ['#FFD700', '#B8860B'],
                        borderWidth: 2
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: { 
                            position: 'bottom',
                            labels: { color: '#FFD700' }
                        },
                        title: {
                            display: true,
                            text: 'User Status',
                            color: '#FFD700'
                        }
                    }
                }
            });
        }

        // Products Chart - By Category
        const productsCtx = document.getElementById('productsChart');
        if (productsCtx) {
            this.charts.productsChart = new Chart(productsCtx.getContext('2d'), {
                type: 'pie',
                data: {
                    labels: [],
                    datasets: [{
                        data: [],
                        backgroundColor: [
                            '#FFD700', '#B8860B', '#DAA520', '#F0E68C', '#EEE8AA',
                            '#FFEC8B', '#FFDAB9', '#E6E6FA', '#FFF0F5', '#F5F5DC'
                        ]
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: { 
                            position: 'right',
                            labels: { color: '#FFD700' }
                        },
                        title: {
                            display: true,
                            text: 'Products by Category',
                            color: '#FFD700'
                        }
                    }
                }
            });
        }

        // Orders Chart - By Status
        const ordersCtx = document.getElementById('ordersChart');
        if (ordersCtx) {
            this.charts.ordersChart = new Chart(ordersCtx.getContext('2d'), {
                type: 'bar',
                data: {
                    labels: [],
                    datasets: [{
                        label: 'Orders',
                        data: [],
                        backgroundColor: '#FFD700',
                        borderColor: '#B8860B',
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: { 
                            display: false 
                        },
                        title: {
                            display: true,
                            text: 'Orders by Status',
                            color: '#FFD700'
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: { color: '#FFD700' },
                            grid: { color: 'rgba(255, 215, 0, 0.1)' }
                        },
                        x: {
                            ticks: { color: '#FFD700' },
                            grid: { color: 'rgba(255, 215, 0, 0.1)' }
                        }
                    }
                }
            });
        }

        // Activity Chart - Entity Overview
        const activityCtx = document.getElementById('activityChart');
        if (activityCtx) {
            this.charts.activityChart = new Chart(activityCtx.getContext('2d'), {
                type: 'radar',
                data: {
                    labels: ['Users', 'Products', 'Orders', 'Categories', 'Suppliers'],
                    datasets: [{
                        label: 'Count',
                        data: [0, 0, 0, 0, 0],
                        backgroundColor: 'rgba(255, 215, 0, 0.2)',
                        borderColor: '#FFD700',
                        pointBackgroundColor: '#FFD700',
                        pointBorderColor: '#B8860B'
                    }]
                },
                options: {
                    responsive: true,
                    scales: {
                        r: {
                            beginAtZero: true,
                            ticks: { color: '#FFD700', backdropColor: 'transparent' },
                            grid: { color: 'rgba(255, 215, 0, 0.1)' },
                            angleLines: { color: 'rgba(255, 215, 0, 0.1)' }
                        }
                    },
                    plugins: {
                        legend: { 
                            labels: { color: '#FFD700' }
                        },
                        title: {
                            display: true,
                            text: 'Data Overview',
                            color: '#FFD700'
                        }
                    }
                }
            });
        }
        
        console.log('Charts initialized:', Object.keys(this.charts));
    }

    updateAllCharts() {
        console.log('Updating all charts with data:', this.chartData);
        
        // Update Users Chart
        if (this.charts.usersChart && this.chartData.users.length > 0) {
            const activeUsers = this.chartData.users.filter(u => u.status === 'Active').length;
            const inactiveUsers = this.chartData.users.length - activeUsers;
            
            this.charts.usersChart.data.datasets[0].data = [activeUsers, inactiveUsers];
            this.charts.usersChart.update();
            console.log('Updated users chart:', [activeUsers, inactiveUsers]);
        }

        // Update Products Chart
        if (this.charts.productsChart && this.chartData.products.length > 0) {
            const categoryCounts = {};
            this.chartData.products.forEach(product => {
                const category = product.category || 'Uncategorized';
                categoryCounts[category] = (categoryCounts[category] || 0) + 1;
            });
            
            this.charts.productsChart.data.labels = Object.keys(categoryCounts);
            this.charts.productsChart.data.datasets[0].data = Object.values(categoryCounts);
            this.charts.productsChart.update();
            console.log('Updated products chart:', categoryCounts);
        }

        // Update Orders Chart
        if (this.charts.ordersChart && this.chartData.orders.length > 0) {
            const statusCounts = {};
            this.chartData.orders.forEach(order => {
                const status = order.status || 'Pending';
                statusCounts[status] = (statusCounts[status] || 0) + 1;
            });
            
            this.charts.ordersChart.data.labels = Object.keys(statusCounts);
            this.charts.ordersChart.data.datasets[0].data = Object.values(statusCounts);
            this.charts.ordersChart.update();
            console.log('Updated orders chart:', statusCounts);
        }

        // Update Activity Chart
        if (this.charts.activityChart) {
            const counts = [
                this.chartData.users.length,
                this.chartData.products.length,
                this.chartData.orders.length,
                this.chartData.categories.length,
                this.chartData.suppliers ? this.chartData.suppliers.length : 0
            ];
            
            this.charts.activityChart.data.datasets[0].data = counts;
            this.charts.activityChart.update();
            console.log('Updated activity chart:', counts);
        }
    }

    useMockData() {
        console.log('Using mock data for charts...');
        
        // Mock data for testing
        this.chartData = {
            users: [
                { status: 'Active' },
                { status: 'Active' },
                { status: 'Inactive' },
                { status: 'Active' }
            ],
            products: [
                { category: 'Containers' },
                { category: 'Navigation' },
                { category: 'Safety' },
                { category: 'Containers' },
                { category: 'Fuel' }
            ],
            orders: [
                { status: 'Shipped' },
                { status: 'Processing' },
                { status: 'Pending' },
                { status: 'Shipped' }
            ],
            categories: [{}, {}, {}],
            suppliers: [{}, {}]
        };
        
        this.updateStatsCards(
            this.chartData.users,
            this.chartData.products,
            this.chartData.orders,
            this.chartData.categories,
            this.chartData.suppliers
        );
        
        this.updateAllCharts();
    }

    async loadRecentActivity() {
        const activityList = document.getElementById('activityList');
        if (!activityList) return;

        try {
            // Get recent changes or use default
            const changes = JSON.parse(localStorage.getItem('dashboard_changes') || '[]');
            
            let activities = [];
            
            if (changes.length > 0) {
                changes.slice(-5).reverse().forEach(change => {
                    activities.push({
                        type: change.type === 'delete' ? 'error' : 'success',
                        message: `${change.action}: ${change.entity}`,
                        time: this.formatTimeAgo(change.timestamp)
                    });
                });
            }
            
            // Add system activities if no recent changes
            if (activities.length === 0) {
                activities = [
                    { type: 'success', message: 'System initialized successfully', time: 'Just now' },
                    { type: 'info', message: 'Welcome to ATRADEIS Shipping Dashboard', time: 'Today' },
                    { type: 'warning', message: 'No recent shipping activity', time: 'Today' }
                ];
            }
            
            activityList.innerHTML = activities.map(activity => `
                <div class="activity-item ${activity.type}">
                    <span>${activity.message}</span>
                    <span class="activity-time">${activity.time}</span>
                </div>
            `).join('');
            
        } catch (error) {
            console.error('Error loading recent activity:', error);
        }
    }

    formatTimeAgo(timestamp) {
        if (!timestamp) return 'Recently';
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now - date;
        
        if (diff < 60000) return 'Just now';
        if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
        return `${Math.floor(diff / 86400000)}d ago`;
    }

    bindEvents() {
        // Listen for storage changes to update charts
        window.addEventListener('storage', () => {
            console.log('Storage changed, reloading data...');
            this.loadAllData();
        });
        
        // Update charts when page becomes visible again
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                console.log('Page visible, updating charts...');
                this.loadAllData();
            }
        });
    }
}

// Initialize dashboard when page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, checking for dashboard...');
    
    // Check if we're on the dashboard page
    const currentPage = window.location.pathname.split('/').pop();
    const isDashboard = currentPage === 'dashboard.html' || 
                        currentPage === '' || 
                        currentPage.includes('dashboard') ||
                        document.getElementById('usersChart') !== null;
    
    if (isDashboard) {
        console.log('Initializing dashboard...');
        const dashboard = new Dashboard();
        
        // Make update function available globally
        window.updateDashboardCharts = function() {
            console.log('Manual chart update triggered');
            dashboard.loadAllData();
        };
        
        // Also trigger update when returning to page
        window.addEventListener('focus', () => {
            console.log('Window focused, updating charts...');
            dashboard.loadAllData();
        });
    }
});

// Global function to force chart updates
window.refreshDashboardCharts = async function() {
    console.log('Force refreshing dashboard charts...');
    const dashboard = new Dashboard();
    await dashboard.loadAllData();
};