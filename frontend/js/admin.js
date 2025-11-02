// admin.js - Admin dashboard specific functions

document.addEventListener('DOMContentLoaded', async () => {
    const user = checkAuth();
    if (!user || user.user_type !== 'admin') {
        window.location.href = 'login.html';
        return;
    }

    // Update user info
    document.getElementById('userName').textContent = user.name;
    document.getElementById('userAvatar').textContent = 
        user.name.split(' ').map(n => n[0]).join('').toUpperCase();

    await loadAdminDashboard();
});

async function loadAdminDashboard() {
    try {
        const dashboardData = await apiCall('/admin/dashboard');
        if (dashboardData) {
            updateAdminStats(dashboardData.data);
        }
    } catch (error) {
        console.error('Admin dashboard load error:', error);
        showNotification('Failed to load admin dashboard', 'error');
    }
}

function updateAdminStats(stats) {
    document.getElementById('totalChildren').textContent = stats.total_children || 0;
    document.getElementById('adoptedChildren').textContent = stats.adopted_children || 0;
    document.getElementById('verifiedParents').textContent = stats.verified_parents || 0;
    document.getElementById('pendingDocuments').textContent = stats.pending_documents || 0;
} 
