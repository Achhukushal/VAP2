const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { pool } = require('../config/database');

const router = express.Router();

// Admin dashboard stats
router.get('/dashboard', authenticateToken, async (req, res) => {
    try {
        if (req.user.user_type !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        // Get statistics
        const [[{ total_children }]] = await pool.execute('SELECT COUNT(*) as total_children FROM children');
        const [[{ adopted_children }]] = await pool.execute('SELECT COUNT(*) as adopted_children FROM children WHERE status = "adopted"');
        const [[{ verified_parents }]] = await pool.execute('SELECT COUNT(*) as verified_parents FROM users WHERE user_type = "parent" AND status = "verified"');
        const [[{ pending_documents }]] = await pool.execute('SELECT COUNT(*) as pending_documents FROM documents WHERE status = "pending"');
        const [[{ pending_applications }]] = await pool.execute('SELECT COUNT(*) as pending_applications FROM adoption_applications WHERE status = "pending"');

        res.json({
            success: true,
            data: {
                total_children,
                adopted_children,
                verified_parents,
                pending_documents,
                pending_applications
            }
        });

    } catch (error) {
        console.error('Admin dashboard error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch dashboard data'
        });
    }
});

module.exports = router;