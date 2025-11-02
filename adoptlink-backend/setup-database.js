const bcrypt = require('bcryptjs');
const db = require('./config/database');

// Generate hash for password123
bcrypt.hash('password123', 10, (err, hash) => {
    if (err) {
        console.error('Error generating hash:', err);
        return;
    }
    
    console.log('Generated hash:', hash);
    
    // Insert admin user
    const insertAdmin = `
        INSERT INTO users (name, email, password, user_type, status) 
        VALUES ('Admin User', 'admin@adoptlink.com', ?, 'admin', 'verified')
        ON DUPLICATE KEY UPDATE password = VALUES(password)
    `;
    
    // Insert staff user
    const insertStaff = `
        INSERT INTO users (name, email, password, user_type, status) 
        VALUES ('Staff User', 'staff@adoptlink.com', ?, 'staff', 'verified')
        ON DUPLICATE KEY UPDATE password = VALUES(password)
    `;
    
    db.query(insertAdmin, [hash], (error) => {
        if (error) console.error('Error inserting admin:', error);
        else console.log('Admin user created/updated');
    });
    
    db.query(insertStaff, [hash], (error) => {
        if (error) console.error('Error inserting staff:', error);
        else console.log('Staff user created/updated');
    });
});