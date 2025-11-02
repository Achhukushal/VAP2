const mysql = require('mysql2');
require('dotenv').config();

const connection = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'adoptlink_db',
  connectTimeout: 60000
});

connection.connect((err) => {
  if (err) {
    console.error('❌ Database connection failed:', err.message);
    console.log('💡 Please check:');
    console.log('   - Is MySQL running?');
    console.log('   - Are database credentials correct?');
    console.log('   - Does the database exist?');
    process.exit(1);
  }
  console.log('✅ Connected to MySQL database as id ' + connection.threadId);
});

// Handle connection errors
connection.on('error', (err) => {
  console.error('❌ Database error:', err);
  if (err.code === 'PROTOCOL_CONNECTION_LOST') {
    console.log('Database connection was closed.');
  } else if (err.code === 'ER_CON_COUNT_ERROR') {
    console.log('Database has too many connections.');
  } else if (err.code === 'ECONNREFUSED') {
    console.log('Database connection was refused.');
  }
});

module.exports = connection;