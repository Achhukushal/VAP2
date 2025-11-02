// backend/controllers/userController.js
const { pool } = require('../config/database');
const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');

const updateProfile = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { name, phone, address, marital_status, spouse_name, children_count, occupation, annual_income, home_type } = req.body;

        const connection = await pool.getConnection();
        await connection.beginTransaction();

        try {
            // Update basic user info
            await connection.execute(
                'UPDATE users SET name = ?, phone = ?, address = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
                [name, phone, address, req.user.id]
            );

            // Update parent profile if user is parent
            if (req.user.user_type === 'parent') {
                await connection.execute(
                    `UPDATE parent_profiles 
                     SET marital_status = ?, spouse_name = ?, children_count = ?, 
                         occupation = ?, annual_income = ?, home_type = ?
                     WHERE user_id = ?`,
                    [marital_status, spouse_name, children_count, occupation, annual_income, home_type, req.user.id]
                );
            }

            await connection.commit();
            connection.release();

            res.json({
                success: true,
                message: 'Profile updated successfully'
            });

        } catch (error) {
            await connection.rollback();
            connection.release();
            throw error;
        }

    } catch (error) {
        console.error('Profile update error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while updating profile'
        });
    }
};

const changePassword = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { currentPassword, newPassword } = req.body;

        // Get current password
        const [users] = await pool.execute(
            'SELECT password FROM users WHERE id = ?',
            [req.user.id]
        );

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Verify current password
        const validPassword = await bcrypt.compare(currentPassword, users[0].password);
        if (!validPassword) {
            return res.status(401).json({
                success: false,
                message: 'Current password is incorrect'
            });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update password
        await pool.execute(
            'UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [hashedPassword, req.user.id]
        );

        res.json({
            success: true,
            message: 'Password updated successfully'
        });

    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while changing password'
        });
    }
};

module.exports = { updateProfile, changePassword };