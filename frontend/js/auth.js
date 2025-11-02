// auth.js - Authentication related functions

// Main API call function
async function apiCall(endpoint, options = {}) {
    const token = localStorage.getItem('token');
    
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : ''
        }
    };

    // Merge options
    const finalOptions = {
        ...defaultOptions,
        ...options,
        headers: {
            ...defaultOptions.headers,
            ...options.headers
        }
    };

    try {
        showLoading();
        const response = await fetch(`${API_BASE_URL}${endpoint}`, finalOptions);
        const data = await response.json();

        if (response.status === 401) {
            // Token expired or invalid
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = 'login.html';
            return null;
        }

        if (!response.ok) {
            throw new Error(data.message || 'Request failed');
        }

        return data;
    } catch (error) {
        console.error('API call error:', error);
        showNotification(error.message || 'Network error. Please try again.', 'error');
        return null;
    } finally {
        hideLoading();
    }
}

// Login function
async function login(email, password, userType) {
    // Basic validation
    if (!email || !password || !userType) {
        showNotification('Please fill in all fields', 'error');
        return;
    }

    if (!isValidEmail(email)) {
        showNotification('Please enter a valid email address', 'error');
        return;
    }

    try {
        const data = await apiCall('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password, user_type: userType })
        });

        if (data && data.success) {
            // Store token and user data
            localStorage.setItem('token', data.data.token);
            localStorage.setItem('user', JSON.stringify(data.data.user));
            
            showNotification('Login successful!', 'success');
            
            // Redirect based on user type
            setTimeout(() => {
                if (userType === 'staff') {
                    window.location.href = 'staff.html';
                } else if (userType === 'parent') {
                    window.location.href = 'parent.html';
                } else if (userType === 'admin') {
                    window.location.href = 'admin.html';
                }
            }, 1000);
        }
    } catch (error) {
        console.error('Login error:', error);
        // Error is already handled in apiCall
    }
}

// Register function
async function register(userData) {
    // Validation
    if (!userData.name || !userData.email || !userData.password || !userData.user_type) {
        showNotification('Please fill in all required fields', 'error');
        return;
    }

    if (!isValidEmail(userData.email)) {
        showNotification('Please enter a valid email address', 'error');
        return;
    }

    if (userData.password.length < 6) {
        showNotification('Password must be at least 6 characters long', 'error');
        return;
    }

    try {
        const data = await apiCall('/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData)
        });

        if (data && data.success) {
            showNotification('Registration successful! Please login.', 'success');
            // Switch to login form and auto-fill email
            showForm('login');
            document.getElementById('login-email').value = userData.email;
            document.getElementById('login-password').value = userData.password;
        }
    } catch (error) {
        console.error('Registration error:', error);
        // Error is already handled in apiCall
    }
}