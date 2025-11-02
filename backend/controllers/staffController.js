// backend/controllers/staffController.js
const { pool } = require('../config/database');

const getStaffTasks = async (req, res) => {
    try {
        const [tasks] = await pool.execute(`
            SELECT st.*, u.name as assigned_by_name, aa.id as application_id
            FROM staff_tasks st
            LEFT JOIN users u ON st.assigned_by = u.id
            LEFT JOIN adoption_applications aa ON st.related_application_id = aa.id
            WHERE st.staff_id = ?
            ORDER BY st.due_date ASC
        `, [req.user.id]);

        res.json({
            success: true,
            data: tasks
        });

    } catch (error) {
        console.error('Get staff tasks error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch tasks'
        });
    }
};

const updateTaskStatus = async (req, res) => {
    try {
        const { status, notes } = req.body;
        const taskId = req.params.id;

        await pool.execute(
            'UPDATE staff_tasks SET status = ?, notes = ? WHERE id = ? AND staff_id = ?',
            [status, notes, taskId, req.user.id]
        );

        res.json({
            success: true,
            message: 'Task updated successfully'
        });

    } catch (error) {
        console.error('Update task error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update task'
        });
    }
};

const getStaffDocuments = async (req, res) => {
    try {
        const [documents] = await pool.execute(`
            SELECT d.*, u.name as parent_name
            FROM documents d
            JOIN users u ON d.user_id = u.id
            WHERE d.status = 'pending'
            ORDER BY d.submitted_at DESC
        `);

        res.json({
            success: true,
            data: documents
        });

    } catch (error) {
        console.error('Get staff documents error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch documents'
        });
    }
};

module.exports = { getStaffTasks, updateTaskStatus, getStaffDocuments };