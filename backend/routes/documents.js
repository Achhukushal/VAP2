const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { pool } = require('../config/database');

const router = express.Router();

// Get user documents
router.get('/my-documents', authenticateToken, async (req, res) => {
    try {
        const [documents] = await pool.execute(
            'SELECT * FROM documents WHERE user_id = ? ORDER BY submitted_at DESC',
            [req.user.id]
        );

        res.json({
            success: true,
            data: documents
        });

    } catch (error) {
        console.error('Documents error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch documents'
        });
    }
});

module.exports = router;