const express = require('express');
const { auth, requireRole } = require('../middleware/auth');

const router = express.Router();

router.use(auth);
router.use(requireRole(['admin']));

router.get('/dashboard', (req, res) => {
  res.json({
    success: true,
    data: {
      total_children: 0,
      adopted_children: 0,
      verified_parents: 0,
      pending_documents: 0
    },
    message: 'Admin dashboard endpoint'
  });
});

module.exports = router;