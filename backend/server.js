const express = require('express');
const path = require('path');
const cors = require('cors');
require('dotenv').config();

// Import database configuration
const { testConnection } = require('./config/database');

const app = express();

// ===============================
// 🔧 Middleware
// ===============================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the frontend folder
app.use(express.static(path.join(__dirname, '../frontend')));

// ===============================
// 🚀 Initialize Server
// ===============================
const initializeServer = async () => {
    console.log('🚀 Starting AdoptLink Server...');
    console.log('📁 Environment:', process.env.NODE_ENV || 'development');

    // Test database connection
    const dbConnected = await testConnection();

    if (!dbConnected) {
        console.log('❌ Server cannot start without database connection');
        process.exit(1);
    }

    console.log('✅ Database connected successfully');

    // ===============================
    // 🧩 API Routes
    // ===============================
    app.use('/api/auth', require('./routes/auth'));
    app.use('/api/users', require('./routes/users'));
    app.use('/api/children', require('./routes/children'));
    app.use('/api/applications', require('./routes/applications'));
    app.use('/api/staff', require('./routes/staff'));
    app.use('/api/documents', require('./routes/documents'));
    app.use('/api/visits', require('./routes/visits'));
    app.use('/api/admin', require('./routes/admin'));

    // ===============================
    // ❤️ Health Check
    // ===============================
    app.get('/api/health', (req, res) => {
        res.json({
            success: true,
            message: 'AdoptLink API is running!',
            timestamp: new Date().toISOString(),
            version: '1.0.0',
        });
    });

    // ===============================
    // 🌐 Frontend Routes
    // ===============================
    app.get('/', (req, res) => {
        res.sendFile(path.join(__dirname, '../frontend/login.html'));
    });

    // ✅ Universal Catch-All (no wildcard errors)
    app.use((req, res) => {
        if (req.path.startsWith('/api/')) {
            // API endpoint not found
            return res.status(404).json({
                success: false,
                message: 'API endpoint not found',
            });
        }

        // Serve the frontend for all other routes (SPA behavior)
        res.sendFile(path.join(__dirname, '../frontend/login.html'));
    });

    // ===============================
    // 🖥️ Start Server
    // ===============================
    const PORT = process.env.PORT || 5000;

    app.listen(PORT, () => {
        console.log('\n🎉 Server started successfully!');
        console.log(`📍 Port: ${PORT}`);
        console.log(`📁 Frontend: http://localhost:${PORT}`);
        console.log(`🔗 API: http://localhost:${PORT}/api`);
        console.log(`❤️  Health check: http://localhost:${PORT}/api/health`);
        console.log('\n👤 Demo Credentials:');
        console.log('   Parent: parent@example.com / password123');
        console.log('   Staff: staff@example.com / password123');
        console.log('   Admin: admin@example.com / password123');
        console.log('\n📝 Note: Use "Staff" type for admin login');
    });
};

// ===============================
// ⚠️ Global Error Handlers
// ===============================
process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught Exception:', error);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});

// ===============================
// 🚀 Start Initialization
// ===============================
initializeServer().catch((error) => {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
});
