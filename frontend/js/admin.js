// admin.js - Admin dashboard specific functions

document.addEventListener('DOMContentLoaded', async () => {
    const user = checkAuth();
    console.log('Dashboard loaded - User:', user);
    
    if (!user) {
        console.log('No user found, stopping dashboard load');
        return; // checkAuth() already redirects to login
    }
    
    // Check user type matches the dashboard
    if (window.location.pathname.includes('parent.html') && user.user_type !== 'parent') {
        console.log('Wrong dashboard for user type, redirecting...');
        if (user.user_type === 'staff' || user.user_type === 'admin') {
            window.location.href = 'staff.html';
        } else {
            window.location.href = 'login.html';
        }
        return;
    }
    
    if (window.location.pathname.includes('staff.html') && !['staff', 'admin'].includes(user.user_type)) {
        console.log('Wrong dashboard for user type, redirecting...');
        if (user.user_type === 'parent') {
            window.location.href = 'parent.html';
        } else {
            window.location.href = 'login.html';
        }
        return;
    }

    // Continue loading dashboard...
    // Update user info in header
    document.getElementById('userName').textContent = user.name;
    document.getElementById('userAvatar').textContent = 
        user.name.split(' ').map(n => n[0]).join('').toUpperCase();

    await loadParentDashboard(); // or loadStaffDashboard() etc.
    setupEventListeners();
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
