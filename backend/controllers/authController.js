const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');

const register = async (req, res) => {
    try {
        const { name, email, password, user_type, phone, address } = req.body;

        console.log('Registration attempt:', { name, email, user_type });

        // Check if user already exists
        const [existingUsers] = await pool.execute(
            'SELECT id FROM users WHERE email = ?',
            [email]
        );

        if (existingUsers.length > 0) {
            return res.status(409).json({
                success: false,
                message: 'User with this email already exists'
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Auto-verify all users for demo purposes
        const status = 'verified';

        const connection = await pool.getConnection();
        await connection.beginTransaction();

        try {
            // Insert user with verified status
            const [userResult] = await connection.execute(
                `INSERT INTO users (name, email, password, user_type, phone, address, status) 
                 VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [
                    name, 
                    email, 
                    hashedPassword, 
                    user_type, 
                    phone || null,
                    address || null,
                    status // Auto-verify
                ]
            );

            const userId = userResult.insertId;

            // Create parent profile if user is parent
            if (user_type === 'parent') {
                await connection.execute(
                    'INSERT INTO parent_profiles (user_id) VALUES (?)',
                    [userId]
                );
            }

            await connection.commit();
            connection.release();

            console.log('User registered successfully:', { userId, email, user_type });

            res.status(201).json({
                success: true,
                message: 'User registered successfully! You can now login.',
                data: { userId }
            });

        } catch (error) {
            await connection.rollback();
            connection.release();
            console.error('Database error during registration:', error);
            throw error;
        }

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error during registration'
        });
    }
};

const login = async (req, res) => {
    try {
        const { email, password, user_type } = req.body;

        console.log('Login attempt:', { email, user_type });

        // Find user - simplified query
        const [users] = await pool.execute(
            `SELECT id, name, email, password, user_type, phone, address, status, created_at 
             FROM users WHERE email = ?`,
            [email]
        );

        if (users.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        const user = users[0];

        // Check if user type matches (except for admin who can login as staff)
        if (user_type !== user.user_type && !(user_type === 'staff' && user.user_type === 'admin')) {
            return res.status(401).json({
                success: false,
                message: 'Invalid user type for this account'
            });
        }

        // Check password
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Check if user is verified/approved
        if (user.status !== 'verified' && user.status !== 'approved') {
            return res.status(403).json({
                success: false,
                message: 'Your account is pending verification. Please contact administrator.'
            });
        }

        // Generate token
        const token = jwt.sign(
            { 
                id: user.id, 
                email: user.email, 
                user_type: user.user_type 
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Remove password from response
        const { password: _, ...userWithoutPassword } = user;

        console.log('Login successful:', { userId: user.id, email, user_type: user.user_type });

        res.json({
            success: true,
            message: 'Login successful',
            data: {
                token,
                user: userWithoutPassword
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error during login'
        });
    }
};

const getProfile = async (req, res) => {
    try {
        const [users] = await pool.execute(
            `SELECT id, name, email, phone, address, user_type, status, created_at 
             FROM users WHERE id = ?`,
            [req.user.id]
        );

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        let profile = users[0];

        // Get additional profile data based on user type
        if (req.user.user_type === 'parent') {
            const [parentProfiles] = await pool.execute(
                `SELECT marital_status, spouse_name, children_count, occupation, 
                        annual_income, home_type, family_background 
                 FROM parent_profiles WHERE user_id = ?`,
                [req.user.id]
            );
            profile.parent_info = parentProfiles[0] || {};
        }

        res.json({
            success: true,
            data: profile
        });

    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while fetching profile'
        });
    }
};

module.exports = { register, login, getProfile };