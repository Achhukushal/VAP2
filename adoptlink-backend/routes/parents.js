const express = require('express');
const parentController = require('../controllers/parentController');
const { auth, requireRole } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication and parent role
router.use(auth);
router.use(requireRole(['parent']));

router.get('/my-applications', parentController.getApplications);
router.get('/my-visits', parentController.getVisits);
router.get('/my-documents', parentController.getDocuments);

module.exports = router;