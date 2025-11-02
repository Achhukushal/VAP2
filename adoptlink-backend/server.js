const express = require('express');
const cors = require('cors');
require('dotenv').config();
// Add these imports after the existing imports
const staffRoutes = require('./routes/staff');
const adminRoutes = require('./routes/admin');

// Add these routes after the existing routes
app.use('/api/staff', staffRoutes);
app.use('/api/admin', adminRoutes);
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Import routes
const authRoutes = require('./routes/auth');
const parentRoutes = require('./routes/parents');

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/applications', parentRoutes);
app.use('/api/visits', parentRoutes);
app.use('/api/documents', parentRoutes);

// Health check route
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'AdoptLink API is running',
    timestamp: new Date().toISOString()
  });
});

// Handle undefined routes - FIXED: Don't use '*'
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API route not found'
  });
});

// Handle all other routes - Serve frontend or show message
app.get('*', (req, res) => {
  if (req.url.startsWith('/api/')) {
    return res.status(404).json({
      success: false,
      message: 'API endpoint not found'
    });
  }
  
  // For non-API routes, you can serve your frontend or show a message
  res.status(404).send(`
    <html>
      <body>
        <h1>AdoptLink Frontend</h1>
        <p>This is the backend server. Please open the frontend HTML files directly.</p>
        <p>If you're seeing this, make sure you're accessing the frontend files through a web server.</p>
      </body>
    </html>
  `);
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server Error:', error.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!'
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🔐 Auth routes: http://localhost:${PORT}/api/auth`);
});