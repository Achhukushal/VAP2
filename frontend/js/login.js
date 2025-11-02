// login.js - Login page specific functions

// Tab switching function
function showForm(formType) {
    // Hide all forms
    document.querySelectorAll('.form').forEach(form => {
        form.classList.remove('active');
    });
    
    // Remove active class from all tabs
    document.querySelectorAll('.tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Show selected form and activate tab
    if (formType === 'login') {
        document.getElementById('login-form').classList.add('active');
        document.querySelectorAll('.tab')[0].classList.add('active');
    } else {
        document.getElementById('signup-form').classList.add('active');
        document.querySelectorAll('.tab')[1].classList.add('active');
    }
}

// Login form handler
function handleLogin() {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const userType = document.querySelector('input[name="user-type"]:checked').value;
    
    if (!email || !password) {
        showNotification('Please fill in all fields', 'error');
        return;
    }
    
    login(email, password, userType);
}

// Signup form handler
function handleSignup() {
    const name = document.getElementById('signup-name').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    const confirmPassword = document.getElementById('signup-confirm').value;
    const phone = document.getElementById('signup-phone').value;
    const userType = document.querySelector('input[name="signup-user-type"]:checked').value;

    // Validation
    if (!name || !email || !password || !confirmPassword || !userType) {
        showNotification('Please fill in all required fields', 'error');
        return;
    }

    if (password !== confirmPassword) {
        showNotification('Passwords do not match', 'error');
        return;
    }

    if (password.length < 6) {
        showNotification('Password must be at least 6 characters long', 'error');
        return;
    }

    if (!isValidEmail(email)) {
        showNotification('Please enter a valid email address', 'error');
        return;
    }

    const userData = {
        name: name.trim(),
        email: email.trim(),
        password: password,
        user_type: userType,
        phone: phone ? phone.trim() : '',
        address: ''
    };

    register(userData);
}

// Enter key support
document.addEventListener('DOMContentLoaded', function() {
    // Login form enter key
    document.getElementById('login-password').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            handleLogin();
        }
    });

    // Signup form enter key
    document.getElementById('signup-confirm').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            handleSignup();
        }
    });

    // Check if user is already logged in (at the bottom of login.js)
document.addEventListener('DOMContentLoaded', function() {
    // Login form enter key
    document.getElementById('login-password').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            handleLogin();
        }
    });

    // Signup form enter key
    document.getElementById('signup-confirm').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            handleSignup();
        }
    });

    // Check if user is already logged in - BUT don't redirect from login page
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    
    console.log('Login page loaded - Current user:', user);
    
    // Only redirect if we have valid auth data AND we're on login page
    if (token && user && window.location.pathname.includes('login.html')) {
        console.log('Already logged in, redirecting to dashboard...');
        // Small delay to let page load completely
        setTimeout(() => {
            if (user.user_type === 'staff' || user.user_type === 'admin') {
                window.location.href = 'staff.html';
            } else if (user.user_type === 'parent') {
                window.location.href = 'parent.html';
            }
        }, 1000);
    }
});
});