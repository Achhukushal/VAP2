// staff.js - Staff dashboard specific functions

let staffData = {
    tasks: [],
    visits: [],
    documents: []
};

document.addEventListener('DOMContentLoaded', async () => {
    const user = checkAuth();
    if (!user || user.user_type !== 'staff') {
        window.location.href = 'login.html';
        return;
    }

    // Update user info in header
    document.getElementById('userName').textContent = user.name;
    document.getElementById('userAvatar').textContent = 
        user.name.split(' ').map(n => n[0]).join('').toUpperCase();

    await loadStaffDashboard();
    setupStaffEventListeners();
});

async function loadStaffDashboard() {
    try {
        const [tasksData, visitsData, documentsData] = await Promise.all([
            apiCall('/staff/tasks'),
            apiCall('/staff/visits'),
            apiCall('/staff/documents')
        ]);

        if (tasksData) {
            staffData.tasks = tasksData.data;
            updateTasksUI();
        }

        if (visitsData) {
            staffData.visits = visitsData.data;
            updateVisitsUI();
        }

        if (documentsData) {
            staffData.documents = documentsData.data;
            updateDocumentsUI();
        }

        updateStaffStats();

    } catch (error) {
        console.error('Staff dashboard load error:', error);
        showNotification('Failed to load staff dashboard data', 'error');
    }
}

function setupStaffEventListeners() {
    // Logout button
    document.getElementById('logoutBtn').addEventListener('click', logout);

    // Menu navigation
    document.querySelectorAll('.menu-item').forEach(item => {
        if (!item.id.includes('logoutBtn')) {
            item.addEventListener('click', function() {
                const target = this.getAttribute('data-target');
                switchStaffTab(target);
            });
        }
    });
}

function switchStaffTab(tabName) {
    // Similar to parent tab switching
    document.querySelectorAll('.menu-item').forEach(item => {
        item.classList.remove('active');
    });
    document.querySelector(`[data-target="${tabName}"]`).classList.add('active');

    document.querySelectorAll('.dashboard-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(tabName).classList.add('active');

    const pageTitle = document.getElementById('pageTitle');
    const tabText = document.querySelector(`[data-target="${tabName}"] span`).textContent;
    pageTitle.textContent = tabText;
}

function updateStaffStats() {
    const assignedTasks = staffData.tasks.length;
    const completedTasks = staffData.tasks.filter(task => task.status === 'completed').length;
    const pendingDocuments = staffData.documents.filter(doc => doc.status === 'pending').length;
    const overdueTasks = staffData.tasks.filter(task => {
        if (task.status !== 'completed') {
            return new Date(task.due_date) < new Date();
        }
        return false;
    }).length;

    document.getElementById('assignedTasks').textContent = assignedTasks;
    document.getElementById('completedTasks').textContent = completedTasks;
    document.getElementById('pendingDocuments').textContent = pendingDocuments;
    document.getElementById('overdueTasks').textContent = overdueTasks;
}

// Placeholder functions
function updateTasksUI() {
    // Implement based on your staff dashboard
    console.log('Update tasks UI with:', staffData.tasks);
}

function updateVisitsUI() {
    // Implement based on your staff dashboard
    console.log('Update visits UI with:', staffData.visits);
}

function updateDocumentsUI() {
    // Implement based on your staff dashboard
    console.log('Update documents UI with:', staffData.documents);
} 
