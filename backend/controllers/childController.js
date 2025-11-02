// backend/controllers/childController.js
const { pool } = require('../config/database');

const getAllChildren = async (req, res) => {
    try {
        const [children] = await pool.execute(`
            SELECT c.*, 
                   a.status as application_status,
                   a.id as application_id
            FROM children c
            LEFT JOIN adoption_applications a ON c.id = a.child_id AND a.parent_id = ?
            WHERE c.status != 'adopted' OR a.parent_id = ?
        `, [req.user.id, req.user.id]);

        res.json({
            success: true,
            data: children
        });
    } catch (error) {
        console.error('Get children error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch children'
        });
    }
};

const getChildById = async (req, res) => {
    try {
        const [children] = await pool.execute(
            'SELECT * FROM children WHERE id = ?',
            [req.params.id]
        );

        if (children.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Child not found'
            });
        }

        const child = children[0];

        // Get related data
        const [healthRecords] = await pool.execute(
            'SELECT * FROM health_records WHERE child_id = ? ORDER BY record_date DESC',
            [req.params.id]
        );

        const [immunizations] = await pool.execute(
            'SELECT * FROM immunization_records WHERE child_id = ? ORDER BY administered_date DESC',
            [req.params.id]
        );

        const [education] = await pool.execute(
            'SELECT * FROM education_records WHERE child_id = ?',
            [req.params.id]
        );

        const [academic] = await pool.execute(
            'SELECT * FROM academic_performance WHERE child_id = ? ORDER BY record_date DESC',
            [req.params.id]
        );

        const [activities] = await pool.execute(
            'SELECT * FROM extracurricular_activities WHERE child_id = ?',
            [req.params.id]
        );

        res.json({
            success: true,
            data: {
                ...child,
                health_records: healthRecords,
                immunizations: immunizations,
                education: education[0] || {},
                academic_performance: academic,
                activities: activities
            }
        });

    } catch (error) {
        console.error('Get child error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch child details'
        });
    }
};

module.exports = { getAllChildren, getChildById };