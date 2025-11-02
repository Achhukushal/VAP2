// backend/routes/applications.js
const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { submitApplication, getUserApplications } = require('../controllers/applicationController');
const { body } = require('express-validator');

const router = express.Router();

const applicationValidation = [
    body('child_id').isInt({ min: 1 }).withMessage('Valid child ID is required')
];

router.post('/', authenticateToken, applicationValidation, submitApplication);
router.get('/my-applications', authenticateToken, getUserApplications);

module.exports = router;