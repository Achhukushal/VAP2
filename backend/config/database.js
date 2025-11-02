// backend/config/database.js
const mysql = require('mysql2/promise');
require('dotenv').config();

// Database configuration
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'adoptlink',
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

// Create connection pool
const pool = mysql.createPool(dbConfig);

// Test database connection
const testConnection = async () => {
    try {
        const connection = await pool.getConnection();
        console.log('✅ Database connected successfully');
        connection.release();
        
        // Check if we need to initialize the database
        await checkAndInitializeDatabase();
        return true;
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
        console.log('\n💡 Please make sure:');
        console.log('   1. MySQL server is running');
        console.log('   2. Database "' + (process.env.DB_NAME || 'adoptlink') + '" exists');
        console.log('   3. Check your .env file credentials');
        return false;
    }
};

// Check if database needs initialization
const checkAndInitializeDatabase = async () => {
    try {
        // Check if users table exists
        const [tables] = await pool.execute(`
            SELECT TABLE_NAME 
            FROM information_schema.TABLES 
            WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'users'
        `, [process.env.DB_NAME || 'adoptlink']);

        if (tables.length === 0) {
            console.log('📦 Initializing database with tables and sample data...');
            await createTables();
            await insertSampleData();
            console.log('✅ Database initialization completed');
        } else {
            console.log('✅ Database already initialized');
        }
    } catch (error) {
        console.error('❌ Database initialization check failed:', error.message);
    }
};

// Create all tables
const createTables = async () => {
    const connection = await pool.getConnection();
    
    try {
        await connection.beginTransaction();
        console.log('Creating database tables...');

        // Users Table
        await connection.execute(`
            CREATE TABLE users (
                id INT PRIMARY KEY AUTO_INCREMENT,
                name VARCHAR(100) NOT NULL,
                email VARCHAR(100) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                user_type ENUM('parent', 'staff', 'admin') NOT NULL,
                phone VARCHAR(20),
                address TEXT,
                status ENUM('pending', 'verified', 'approved', 'rejected') DEFAULT 'pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Created users table');

        // Parent Profiles Table
        await connection.execute(`
            CREATE TABLE parent_profiles (
                id INT PRIMARY KEY AUTO_INCREMENT,
                user_id INT NOT NULL,
                marital_status ENUM('single', 'married', 'divorced', 'widowed'),
                spouse_name VARCHAR(100),
                children_count INT DEFAULT 0,
                occupation VARCHAR(100),
                annual_income DECIMAL(12,2),
                home_type ENUM('owned', 'rented'),
                family_background TEXT,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        `);
        console.log('✅ Created parent_profiles table');

        // Children Table
        await connection.execute(`
            CREATE TABLE children (
                id INT PRIMARY KEY AUTO_INCREMENT,
                name VARCHAR(100) NOT NULL,
                date_of_birth DATE NOT NULL,
                gender ENUM('male', 'female'),
                background TEXT,
                special_needs TEXT,
                status ENUM('available', 'pending', 'adopted') DEFAULT 'available',
                photo_url VARCHAR(255),
                joined_date DATE,
                adopted_date DATE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Created children table');

        // Adoption Applications Table
        await connection.execute(`
            CREATE TABLE adoption_applications (
                id INT PRIMARY KEY AUTO_INCREMENT,
                parent_id INT NOT NULL,
                child_id INT NOT NULL,
                application_date DATE NOT NULL,
                status ENUM('pending', 'under_review', 'approved', 'rejected') DEFAULT 'pending',
                assigned_staff_id INT,
                notes TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (parent_id) REFERENCES users(id),
                FOREIGN KEY (child_id) REFERENCES children(id),
                FOREIGN KEY (assigned_staff_id) REFERENCES users(id)
            )
        `);
        console.log('✅ Created adoption_applications table');

        // Documents Table
        await connection.execute(`
            CREATE TABLE documents (
                id INT PRIMARY KEY AUTO_INCREMENT,
                user_id INT NOT NULL,
                document_type ENUM('identity_proof', 'address_proof', 'income_proof', 'medical_certificate') NOT NULL,
                file_name VARCHAR(255) NOT NULL,
                file_path VARCHAR(500) NOT NULL,
                status ENUM('pending', 'verified', 'rejected') DEFAULT 'pending',
                verified_by INT,
                verified_at TIMESTAMP NULL,
                submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id),
                FOREIGN KEY (verified_by) REFERENCES users(id)
            )
        `);
        console.log('✅ Created documents table');

        // Home Visits Table
        await connection.execute(`
            CREATE TABLE home_visits (
                id INT PRIMARY KEY AUTO_INCREMENT,
                application_id INT NOT NULL,
                staff_id INT NOT NULL,
                scheduled_date DATETIME NOT NULL,
                visit_type ENUM('initial', 'follow_up', 'assessment') NOT NULL,
                purpose TEXT,
                status ENUM('scheduled', 'completed', 'cancelled', 'rescheduled') DEFAULT 'scheduled',
                report TEXT,
                completed_at TIMESTAMP NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (application_id) REFERENCES adoption_applications(id),
                FOREIGN KEY (staff_id) REFERENCES users(id)
            )
        `);
        console.log('✅ Created home_visits table');

        // Staff Tasks Table
        await connection.execute(`
            CREATE TABLE staff_tasks (
                id INT PRIMARY KEY AUTO_INCREMENT,
                staff_id INT NOT NULL,
                task_type ENUM('home_visit', 'document_verification', 'case_review', 'follow_up') NOT NULL,
                description TEXT NOT NULL,
                assigned_by INT NOT NULL,
                assigned_date DATE NOT NULL,
                due_date DATE NOT NULL,
                status ENUM('pending', 'in_progress', 'completed', 'on_hold') DEFAULT 'pending',
                priority ENUM('low', 'medium', 'high') DEFAULT 'medium',
                related_application_id INT,
                notes TEXT,
                completed_date DATE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (staff_id) REFERENCES users(id),
                FOREIGN KEY (assigned_by) REFERENCES users(id),
                FOREIGN KEY (related_application_id) REFERENCES adoption_applications(id)
            )
        `);
        console.log('✅ Created staff_tasks table');

        // Health Records Table - FIXED: changed 'condition' to 'medical_condition'
        await connection.execute(`
            CREATE TABLE health_records (
                id INT PRIMARY KEY AUTO_INCREMENT,
                child_id INT NOT NULL,
                record_date DATE NOT NULL,
                medical_condition VARCHAR(200) NOT NULL,
                treatment TEXT,
                doctor VARCHAR(100),
                status ENUM('scheduled', 'completed', 'cancelled') DEFAULT 'scheduled',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (child_id) REFERENCES children(id)
            )
        `);
        console.log('✅ Created health_records table');

        // Education Records Table
        await connection.execute(`
            CREATE TABLE education_records (
                id INT PRIMARY KEY AUTO_INCREMENT,
                child_id INT NOT NULL,
                school_name VARCHAR(200),
                grade VARCHAR(50),
                teacher VARCHAR(100),
                school_address TEXT,
                school_phone VARCHAR(20),
                enrollment_date DATE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (child_id) REFERENCES children(id)
            )
        `);
        console.log('✅ Created education_records table');

        // Academic Performance Table
        await connection.execute(`
            CREATE TABLE academic_performance (
                id INT PRIMARY KEY AUTO_INCREMENT,
                child_id INT NOT NULL,
                subject VARCHAR(100) NOT NULL,
                grade VARCHAR(10),
                teacher_comments TEXT,
                record_date DATE NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (child_id) REFERENCES children(id)
            )
        `);
        console.log('✅ Created academic_performance table');

        // Extracurricular Activities Table
        await connection.execute(`
            CREATE TABLE extracurricular_activities (
                id INT PRIMARY KEY AUTO_INCREMENT,
                child_id INT NOT NULL,
                activity_name VARCHAR(100) NOT NULL,
                schedule TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (child_id) REFERENCES children(id)
            )
        `);
        console.log('✅ Created extracurricular_activities table');

        await connection.commit();
        console.log('🎉 All tables created successfully!');

    } catch (error) {
        await connection.rollback();
        console.error('❌ Error creating tables:', error.message);
        throw error;
    } finally {
        connection.release();
    }
};

// Insert sample data
const insertSampleData = async () => {
    const connection = await pool.getConnection();
    
    try {
        await connection.beginTransaction();
        console.log('Inserting sample data...');

        // Hashed password for 'password123'
        const hashedPassword = '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi';

        // Insert sample users with VERIFIED status
        const [parentResult] = await connection.execute(
            'INSERT INTO users (name, email, password, user_type, phone, status) VALUES (?, ?, ?, ?, ?, ?)',
            ['John Parent', 'parent@example.com', hashedPassword, 'parent', '+1234567890', 'verified']
        );

        const [staffResult] = await connection.execute(
            'INSERT INTO users (name, email, password, user_type, phone, status) VALUES (?, ?, ?, ?, ?, ?)',
            ['Sarah Staff', 'staff@example.com', hashedPassword, 'staff', '+0987654321', 'verified']
        );

        const [adminResult] = await connection.execute(
            'INSERT INTO users (name, email, password, user_type, phone, status) VALUES (?, ?, ?, ?, ?, ?)',
            ['Admin User', 'admin@example.com', hashedPassword, 'staff', '+1122334455', 'verified']
        );

        // Insert parent profile
        await connection.execute(
            'INSERT INTO parent_profiles (user_id, marital_status, spouse_name, children_count, occupation, annual_income, home_type) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [parentResult.insertId, 'married', 'Jane Doe', 0, 'Software Engineer', 85000.00, 'owned']
        );

        // Insert sample children
        const [child1Result] = await connection.execute(
            'INSERT INTO children (name, date_of_birth, gender, background, special_needs, status) VALUES (?, ?, ?, ?, ?, ?)',
            ['Emma Johnson', '2016-03-12', 'female', 'Emma came to us when she was 4 years old. She is a bright and cheerful child who loves drawing and outdoor activities.', 'None', 'available']
        );

        const [child2Result] = await connection.execute(
            'INSERT INTO children (name, date_of_birth, gender, background, special_needs, status) VALUES (?, ?, ?, ?, ?, ?)',
            ['Liam Brown', '2018-07-22', 'male', 'Liam has been with us for 2 years. He loves playing outdoors and has mild asthma that requires regular medication.', 'Asthma', 'available']
        );

        // Insert sample adoption application
        await connection.execute(
            'INSERT INTO adoption_applications (parent_id, child_id, application_date, status, assigned_staff_id) VALUES (?, ?, ?, ?, ?)',
            [parentResult.insertId, child1Result.insertId, '2024-01-10', 'pending', staffResult.insertId]
        );

        // Insert sample staff task
        await connection.execute(
            'INSERT INTO staff_tasks (staff_id, task_type, description, assigned_by, assigned_date, due_date, status, priority) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [staffResult.insertId, 'home_visit', 'Conduct home assessment for John Parent family', adminResult.insertId, '2024-01-10', '2024-01-20', 'pending', 'high']
        );

        // Insert sample health record
        await connection.execute(
            'INSERT INTO health_records (child_id, record_date, medical_condition, treatment, doctor, status) VALUES (?, ?, ?, ?, ?, ?)',
            [child1Result.insertId, '2024-01-15', 'Annual Checkup', 'Routine examination and vaccination', 'Dr. Smith', 'completed']
        );

        await connection.commit();
        console.log('✅ Sample data inserted successfully');

    } catch (error) {
        await connection.rollback();
        console.error('❌ Error inserting sample data:', error.message);
        throw error;
    } finally {
        connection.release();
    }
};

// Export the functions and pool
module.exports = {
    pool,
    testConnection
};