const express = require('express');
const { auth, requireRole } = require('../middleware/auth');

const router = express.Router();

router.use(auth);
router.use(requireRole(['staff', 'admin']));

// Basic staff routes
router.get('/tasks', (req, res) => {
  res.json({
    success: true,
    data: [],
    message: 'Staff tasks endpoint'
  });
});

router.get('/visits', (req, res) => {
  res.json({
    success: true,
    data: [],
    message: 'Staff visits endpoint'
  });
});

router.get('/documents', (req, res) => {
  res.json({
    success: true,
    data: [],
    message: 'Staff documents endpoint'
  });
});

module.exports = router;