const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');

const authController = {
  register: (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { name, email, password, user_type, phone, address } = req.body;

    // Prevent admin registration through normal signup
    if (user_type === 'admin') {
      return res.status(400).json({
        success: false,
        message: 'Admin accounts cannot be created through registration'
      });
    }

    // Check if user already exists
    User.findByEmail(email, (error, results) => {
      if (error) {
        console.error('Database error:', error);
        return res.status(500).json({
          success: false,
          message: 'Database error'
        });
      }

      if (results.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'User already exists with this email'
        });
      }

      // Create new user
      User.create({ name, email, password, user_type, phone, address }, (error, results) => {
        if (error) {
          console.error('Error creating user:', error);
          return res.status(500).json({
            success: false,
            message: 'Error creating user'
          });
        }

        res.status(201).json({
          success: true,
          message: 'User registered successfully. Please wait for verification.',
          data: {
            userId: results.insertId
          }
        });
      });
    });
  },

  login: (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { email, password, user_type } = req.body;

    User.findByEmail(email, (error, results) => {
      if (error) {
        console.error('Database error:', error);
        return res.status(500).json({
          success: false,
          message: 'Database error'
        });
      }

      if (results.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Invalid email or password'
        });
      }

      const user = results[0];

      // Check user type
      if (user.user_type !== user_type) {
        return res.status(400).json({
          success: false,
          message: `This account is registered as ${user.user_type}, not ${user_type}`
        });
      }

      // Check password
      bcrypt.compare(password, user.password, (err, isMatch) => {
        if (err) {
          console.error('Password comparison error:', err);
          return res.status(500).json({
            success: false,
            message: 'Authentication error'
          });
        }

        if (!isMatch) {
          return res.status(400).json({
            success: false,
            message: 'Invalid email or password'
          });
        }

        // Check if user is verified (for parents)
        if (user.user_type === 'parent' && user.status !== 'verified') {
          return res.status(400).json({
            success: false,
            message: 'Your account is pending verification. Please contact administrator.'
          });
        }

        // Check if staff/admin is active
        if ((user.user_type === 'staff' || user.user_type === 'admin') && user.status !== 'verified') {
          return res.status(400).json({
            success: false,
            message: 'Your account is not active. Please contact administrator.'
          });
        }

        // Create token
        const token = jwt.sign(
          { userId: user.id },
          process.env.JWT_SECRET,
          { expiresIn: process.env.JWT_EXPIRES_IN }
        );

        res.json({
          success: true,
          message: 'Login successful',
          data: {
            token,
            user: {
              id: user.id,
              name: user.name,
              email: user.email,
              user_type: user.user_type,
              status: user.status,
              phone: user.phone,
              address: user.address
            }
          }
        });
      });
    });
  },

  getProfile: (req, res) => {
    User.findById(req.user.id, (error, results) => {
      if (error) {
        console.error('Database error:', error);
        return res.status(500).json({
          success: false,
          message: 'Database error'
        });
      }

      if (results.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      const user = results[0];
      
      // Parse parent_info if it exists
      if (user.parent_info && typeof user.parent_info === 'string') {
        try {
          user.parent_info = JSON.parse(user.parent_info);
        } catch (e) {
          user.parent_info = null;
        }
      }

      res.json({
        success: true,
        data: user
      });
    });
  },

  updateProfile: (req, res) => {
    const { name, phone, address, parent_info } = req.body;

    User.updateProfile(req.user.id, { name, phone, address, parent_info }, (error, results) => {
      if (error) {
        console.error('Error updating profile:', error);
        return res.status(500).json({
          success: false,
          message: 'Error updating profile'
        });
      }

      res.json({
        success: true,
        message: 'Profile updated successfully'
      });
    });
  }
};

module.exports = authController;