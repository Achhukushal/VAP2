const db = require('../config/database');

const parentController = {
  getApplications: (req, res) => {
    const query = `
      SELECT a.*, c.name as child_name 
      FROM applications a 
      LEFT JOIN children c ON a.child_id = c.id 
      WHERE a.parent_id = ?
      ORDER BY a.application_date DESC
    `;
    
    db.query(query, [req.user.id], (error, results) => {
      if (error) {
        return res.status(500).json({
          success: false,
          message: 'Database error'
        });
      }

      res.json({
        success: true,
        data: results
      });
    });
  },

  getVisits: (req, res) => {
    const query = `
      SELECT v.*, u.name as staff_name 
      FROM visits v 
      LEFT JOIN users u ON v.staff_id = u.id 
      WHERE v.parent_id = ?
      ORDER BY v.visit_date DESC
    `;
    
    db.query(query, [req.user.id], (error, results) => {
      if (error) {
        return res.status(500).json({
          success: false,
          message: 'Database error'
        });
      }

      res.json({
        success: true,
        data: results
      });
    });
  },

  getDocuments: (req, res) => {
    const query = 'SELECT * FROM documents WHERE user_id = ? ORDER BY uploaded_at DESC';
    
    db.query(query, [req.user.id], (error, results) => {
      if (error) {
        return res.status(500).json({
          success: false,
          message: 'Database error'
        });
      }

      res.json({
        success: true,
        data: results
      });
    });
  }
};

module.exports = parentController;