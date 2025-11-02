// backend/controllers/applicationController.js
const { pool } = require('../config/database');

const submitApplication = async (req, res) => {
    try {
        const { child_id } = req.body;

        // Check if application already exists
        const [existingApplications] = await pool.execute(
            'SELECT id FROM adoption_applications WHERE parent_id = ? AND child_id = ?',
            [req.user.id, child_id]
        );

        if (existingApplications.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Application already submitted for this child'
            });
        }

        // Create application
        const [result] = await pool.execute(
            'INSERT INTO adoption_applications (parent_id, child_id, application_date) VALUES (?, ?, CURDATE())',
            [req.user.id, child_id]
        );

        // Update child status
        await pool.execute(
            'UPDATE children SET status = "pending" WHERE id = ?',
            [child_id]
        );

        res.status(201).json({
            success: true,
            message: 'Application submitted successfully',
            data: { applicationId: result.insertId }
        });

    } catch (error) {
        console.error('Submit application error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to submit application'
        });
    }
};

const getUserApplications = async (req, res) => {
    try {
        const [applications] = await pool.execute(`
            SELECT a.*, c.name as child_name, c.date_of_birth, c.gender, c.photo_url,
                   u.name as assigned_staff_name
            FROM adoption_applications a
            JOIN children c ON a.child_id = c.id
            LEFT JOIN users u ON a.assigned_staff_id = u.id
            WHERE a.parent_id = ?
            ORDER BY a.created_at DESC
        `, [req.user.id]);

        res.json({
            success: true,
            data: applications
        });

    } catch (error) {
        console.error('Get applications error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch applications'
        });
    }
};

module.exports = { submitApplication, getUserApplications };