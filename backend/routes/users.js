// backend/routes/users.js
const express = require('express');
const { updateProfile, changePassword } = require('../controllers/userController');
const { authenticateToken } = require('../middleware/auth');
const { body } = require('express-validator');

const router = express.Router();

const updateProfileValidation = [
    body('name').notEmpty().withMessage('Name is required'),
    body('phone').optional().isLength({ min: 10 }).withMessage('Valid phone number is required')
];

const changePasswordValidation = [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
];

router.put('/profile', authenticateToken, updateProfileValidation, updateProfile);
router.put('/change-password', authenticateToken, changePasswordValidation, changePassword);

module.exports = router;