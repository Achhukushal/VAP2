const db = require('../config/database');
const bcrypt = require('bcryptjs');

const User = {
  create: (userData, callback) => {
    const { name, email, password, user_type, phone, address } = userData;
    
    bcrypt.hash(password, 10, (err, hashedPassword) => {
      if (err) return callback(err);
      
      const query = `
        INSERT INTO users (name, email, password, user_type, phone, address) 
        VALUES (?, ?, ?, ?, ?, ?)
      `;
      
      db.query(query, [name, email, hashedPassword, user_type, phone, address], callback);
    });
  },

  findByEmail: (email, callback) => {
    const query = 'SELECT * FROM users WHERE email = ?';
    db.query(query, [email], callback);
  },

  findById: (id, callback) => {
    const query = 'SELECT id, name, email, user_type, phone, address, status, parent_info, created_at FROM users WHERE id = ?';
    db.query(query, [id], callback);
  },

  updateProfile: (userId, updateData, callback) => {
    const { name, phone, address, parent_info } = updateData;
    const query = `
      UPDATE users 
      SET name = ?, phone = ?, address = ?, parent_info = ?, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `;
    db.query(query, [name, phone, address, JSON.stringify(parent_info), userId], callback);
  }
};

module.exports = User;