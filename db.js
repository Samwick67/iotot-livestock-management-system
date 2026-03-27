// db.js
const { Pool } = require('pg');

// Change these values to your PostgreSQL credentials
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'animaltrack',
    password: 'sam',
    port: 5432,
});

module.exports = pool;
