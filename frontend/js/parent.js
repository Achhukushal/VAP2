// parent.js - Parent dashboard specific functions

let parentData = {
    profile: {},
    applications: [],
    visits: [],
    documents: []
};

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

async function loadParentDashboard() {
    try {
        // Load all parent data in parallel
        const [profileData, applicationsData, visitsData, documentsData] = await Promise.all([
            apiCall('/users/profile'),
            apiCall('/applications/my-applications'),
            apiCall('/visits/my-visits'),
            apiCall('/documents/my-documents')
        ]);

        if (profileData) {
            parentData.profile = profileData.data;
            updateProfileUI();
        }

        if (applicationsData) {
            parentData.applications = applicationsData.data;
            updateApplicationsUI();
        }

        if (visitsData) {
            parentData.visits = visitsData.data;
            updateVisitsUI();
        }

        if (documentsData) {
            parentData.documents = documentsData.data;
            updateDocumentsUI();
        }

        updateDashboardStats();

    } catch (error) {
        console.error('Dashboard load error:', error);
        showNotification('Failed to load dashboard data', 'error');
    }
}

function setupEventListeners() {
    // Logout button
    document.getElementById('logoutBtn').addEventListener('click', logout);

    // Menu navigation
    document.querySelectorAll('.menu-item').forEach(item => {
        if (!item.id.includes('logoutBtn')) {
            item.addEventListener('click', function() {
                const target = this.getAttribute('data-target');
                switchTab(target);
            });
        }
    });

    // Edit profile buttons
    document.getElementById('editProfileBtn')?.addEventListener('click', enableProfileEdit);
    document.getElementById('editFamilyInfoBtn')?.addEventListener('click', enableFamilyInfoEdit);
}

function switchTab(tabName) {
    // Update active menu item
    document.querySelectorAll('.menu-item').forEach(item => {
        item.classList.remove('active');
    });
    document.querySelector(`[data-target="${tabName}"]`).classList.add('active');

    // Update active content
    document.querySelectorAll('.dashboard-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(tabName).classList.add('active');

    // Update page title
    const pageTitle = document.getElementById('pageTitle');
    const tabText = document.querySelector(`[data-target="${tabName}"] span`).textContent;
    pageTitle.textContent = tabText;
}

function updateProfileUI() {
    const profile = parentData.profile;
    
    // Update basic info
    document.getElementById('profileName').textContent = profile.name || 'Not provided';
    document.getElementById('profileEmail').textContent = profile.email || 'Not provided';
    document.getElementById('profilePhone').textContent = profile.phone || 'Not provided';
    document.getElementById('profileAddress').textContent = profile.address || 'Not provided';
    document.getElementById('profileRegDate').textContent = formatDate(profile.created_at) || 'Not provided';
    document.getElementById('profileStatus').textContent = profile.status || 'Pending';

    // Update family info if available
    if (profile.parent_info) {
        document.getElementById('maritalStatus').textContent = profile.parent_info.marital_status || 'Not provided';
        document.getElementById('spouseName').textContent = profile.parent_info.spouse_name || 'Not provided';
        document.getElementById('childrenCount').textContent = profile.parent_info.children_count || '0';
        document.getElementById('occupation').textContent = profile.parent_info.occupation || 'Not provided';
        document.getElementById('annualIncome').textContent = profile.parent_info.annual_income ? 
            `$${profile.parent_info.annual_income}` : 'Not provided';
        document.getElementById('homeType').textContent = profile.parent_info.home_type || 'Not provided';
    }

    // Update status badge
    const statusBadge = document.getElementById('statusBadge');
    statusBadge.textContent = profile.status || 'Pending';
    statusBadge.className = `status-badge status-${(profile.status || 'pending').toLowerCase()}`;
}

function updateApplicationsUI() {
    const container = document.getElementById('applicationsTable');
    if (!container) return;

    container.innerHTML = parentData.applications.map(app => `
        <tr>
            <td>${app.child_name}</td>
            <td>${formatDate(app.application_date)}</td>
            <td><span class="status-badge status-${app.status}">${app.status}</span></td>
            <td>${app.assigned_staff || 'Not assigned'}</td>
            <td>
                <button class="btn btn-sm btn-primary" onclick="viewApplication(${app.id})">
                    <i class="fas fa-eye"></i> View
                </button>
            </td>
        </tr>
    `).join('');
}

function updateDashboardStats() {
    const healthCount = parentData.applications.reduce((count, app) => {
        return count + (app.health_records ? app.health_records.length : 0);
    }, 0);

    const educationCount = parentData.applications.reduce((count, app) => {
        return count + (app.education_records ? app.education_records.length : 0);
    }, 0);

    document.getElementById('healthRecordsCount').textContent = healthCount;
    document.getElementById('educationRecordsCount').textContent = educationCount;
    document.getElementById('scheduledVisitsCount').textContent = parentData.visits.filter(v => v.status === 'scheduled').length;
}

// Placeholder functions - you'll implement these based on your specific needs
function enableProfileEdit() { showNotification('Edit profile feature coming soon', 'info'); }
function enableFamilyInfoEdit() { showNotification('Edit family info feature coming soon', 'info'); }
function viewApplication(id) { showNotification(`View application ${id} feature coming soon`, 'info'); } 
