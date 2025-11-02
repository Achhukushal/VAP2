// common.js - Shared functions used across all pages

// API Base URL - Change this if your server runs on different port
const API_BASE_URL = 'http://localhost:5000/api';

// Show notification function
function showNotification(message, type = 'info') {
    // Remove existing notification
    const existingNotification = document.getElementById('global-notification');
    if (existingNotification) {
        existingNotification.remove();
    }

    // Create notification element
    const notification = document.createElement('div');
    notification.id = 'global-notification';
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-message">${message}</span>
            <button class="notification-close" onclick="this.parentElement.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;

    // Add styles if not already added
    if (!document.getElementById('notification-styles')) {
        const styles = document.createElement('style');
        styles.id = 'notification-styles';
        styles.textContent = `
            .notification {
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 15px 20px;
                border-radius: 5px;
                color: white;
                z-index: 10000;
                min-width: 300px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                animation: slideIn 0.3s ease;
            }
            .notification.success { background-color: #27ae60; }
            .notification.error { background-color: #e74c3c; }
            .notification.warning { background-color: #f39c12; }
            .notification.info { background-color: #3498db; }
            .notification-content {
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            .notification-close {
                background: none;
                border: none;
                color: white;
                cursor: pointer;
                margin-left: 10px;
            }
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(styles);
    }

    document.body.appendChild(notification);

    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

// Loading spinner functions
function showLoading() {
    const spinner = document.createElement('div');
    spinner.id = 'loading-spinner';
    spinner.innerHTML = `
        <div class="spinner-overlay">
            <div class="spinner"></div>
            <p>Loading...</p>
        </div>
    `;

    // Add spinner styles if not exists
    if (!document.getElementById('spinner-styles')) {
        const styles = document.createElement('style');
        styles.id = 'spinner-styles';
        styles.textContent = `
            .spinner-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.5);
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                z-index: 9999;
                color: white;
            }
            .spinner {
                border: 4px solid #f3f3f3;
                border-top: 4px solid #3498db;
                border-radius: 50%;
                width: 50px;
                height: 50px;
                animation: spin 1s linear infinite;
            }
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        `;
        document.head.appendChild(styles);
    }

    document.body.appendChild(spinner);
}

function hideLoading() {
    const spinner = document.getElementById('loading-spinner');
    if (spinner) {
        spinner.remove();
    }
}

// Format date function
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}

// Format date time function
function formatDateTime(dateTimeString) {
    const options = { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    return new Date(dateTimeString).toLocaleDateString(undefined, options);
}

// Validate email function
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Validate phone number function
function isValidPhone(phone) {
    const phoneRegex = /^\+?[\d\s-()]{10,}$/;
    return phoneRegex.test(phone);
}

// Check if user is logged in
// Check if user is logged in
function checkAuth() {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    
    console.log('Auth Check - Token:', !!token, 'User:', user);
    
    if (!token || !user) {
        console.log('No auth data, redirecting to login');
        // Only redirect if we're not already on login page
        if (!window.location.href.includes('login.html')) {
            window.location.href = 'login.html';
        }
        return null;
    }
    
    // Verify token is not expired (basic check)
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const isExpired = payload.exp * 1000 < Date.now();
        
        if (isExpired) {
            console.log('Token expired');
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            if (!window.location.href.includes('login.html')) {
                window.location.href = 'login.html';
            }
            return null;
        }
    } catch (error) {
        console.log('Token invalid');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        if (!window.location.href.includes('login.html')) {
            window.location.href = 'login.html';
        }
        return null;
    }
    
    console.log('User authenticated:', user);
    return user;
}

// Logout function
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'login.html';
} 
