const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function initializeDatabase() {
  let connection;

  try {
    // Connect to MySQL server first
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      multipleStatements: true
    });

    console.log('Connected to MySQL server');

    // Read SQL file
    const sqlFile = path.join(__dirname, '../scripts/init-database.sql');
    const sqlContent = fs.readFileSync(sqlFile, 'utf8');

    // Run full SQL script
    await connection.query(sqlContent);

    console.log('✓ Database initialization completed successfully!');

    await connection.end();

  } catch (error) {
    console.error('Database initialization failed:', error.message);

    if (connection) {
      await connection.end();
    }

    process.exit(1);
  }
}

initializeDatabase();