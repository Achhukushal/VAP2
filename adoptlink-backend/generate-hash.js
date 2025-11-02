const bcrypt = require('bcryptjs');

// Generate hash for password123
bcrypt.hash('password123', 10, (err, hash) => {
    if (err) throw err;
    console.log('Hash for password123:', hash);
    
    // Verify the hash works
    bcrypt.compare('password123', hash, (err, result) => {
        console.log('Password verification:', result);
    });
});