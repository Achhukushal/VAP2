const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { pool } = require('../config/database');

const router = express.Router();

// Get user visits
router.get('/my-visits', authenticateToken, async (req, res) => {
    try {
        let visits;
        
        if (req.user.user_type === 'parent') {
            [visits] = await pool.execute(`
                SELECT hv.*, u.name as staff_name, c.name as child_name
                FROM home_visits hv
                JOIN adoption_applications aa ON hv.application_id = aa.id
                JOIN users u ON hv.staff_id = u.id
                JOIN children c ON aa.child_id = c.id
                WHERE aa.parent_id = ?
                ORDER BY hv.scheduled_date DESC
            `, [req.user.id]);
        } else {
            [visits] = await pool.execute(`
                SELECT hv.*, u.name as parent_name, c.name as child_name
                FROM home_visits hv
                JOIN adoption_applications aa ON hv.application_id = aa.id
                JOIN users u ON aa.parent_id = u.id
                JOIN children c ON aa.child_id = c.id
                WHERE hv.staff_id = ?
                ORDER BY hv.scheduled_date DESC
            `, [req.user.id]);
        }

        res.json({
            success: true,
            data: visits
        });

    } catch (error) {
        console.error('Visits error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch visits'
        });
    }
});

module.exports = router;