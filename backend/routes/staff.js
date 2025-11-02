// backend/routes/staff.js
const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { getStaffTasks, updateTaskStatus, getStaffDocuments } = require('../controllers/staffController');
const { body } = require('express-validator');

const router = express.Router();

const updateTaskValidation = [
    body('status').isIn(['pending', 'in_progress', 'completed', 'on_hold']).withMessage('Valid status is required')
];

router.get('/tasks', authenticateToken, getStaffTasks);
router.put('/tasks/:id', authenticateToken, updateTaskValidation, updateTaskStatus);
router.get('/documents', authenticateToken, getStaffDocuments);

module.exports = router;