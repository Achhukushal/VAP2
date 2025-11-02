// backend/routes/children.js
const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { getAllChildren, getChildById } = require('../controllers/childController');

const router = express.Router();

router.get('/', authenticateToken, getAllChildren);
router.get('/:id', authenticateToken, getChildById);

module.exports = router;