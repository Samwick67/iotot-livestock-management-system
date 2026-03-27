// server.js
const express = require('express');
const cors = require('cors');  
const db = require('./db'); 
const bcrypt = require('bcryptjs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());           
app.use(express.json());

// -------------------- STATIC FILES --------------------
// Serve index.html + other static assets
app.use(express.static(__dirname));

// -------------------- FRONTEND --------------------
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// -------------------- DATA ENDPOINTS --------------------

// Get all farms
app.get('/farms', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM farms');
        res.json(result.rows);
    } catch (err) {
        console.error('DB ERROR (farms):', err);
        res.status(500).send('Server error');
    }
});

// Get all animals
app.get('/animals', async (req, res) => {
    try {
        const result = await db.query(`
            SELECT 
                a.animal_code,
                a.tag_number,
                a.species,
                a.breed,
                a.sex,
                a.dob,
                f.farm_code,
                f.name AS farm_name,
                f.location AS farm_location
            FROM animals a
            JOIN farms f ON a.farm_code = f.farm_code
            ORDER BY a.animal_code
        `);
        res.json(result.rows);
    } catch (err) {
        console.error('DB ERROR (animals):', err);
        res.status(500).send('Server error');
    }
});

// Telemetry logs
app.get('/telemetry', async (req, res) => {
    const { animal_code } = req.query;
    try {
        let query = `
            SELECT 
                t.telemetry_code,
                t.device_code,
                t.animal_code,
                t.recorded_at,
                t.latitude,
                t.longitude,
                t.temperature_c,
                t.heart_rate_bpm,
                t.orientation_deg,
                t.battery_pct,
                t.raw_payload,
                a.tag_number AS animal_tag,
                a.species AS animal_species,
                f.farm_code,
                f.name AS farm_name,
                f.location AS farm_location
            FROM telemetry t
            JOIN animals a ON t.animal_code = a.animal_code
            JOIN farms f ON a.farm_code = f.farm_code
        `;
        const params = [];
        if (animal_code) {
            query += ` WHERE t.animal_code = $1`;
            params.push(animal_code);
        }
        query += ` ORDER BY t.recorded_at ASC`;

        const result = await db.query(query, params);
        res.json(result.rows);
    } catch (err) {
        console.error('DB ERROR (telemetry):', err);
        res.status(500).send('Server error');
    }
});

// -------------------- AUTH --------------------

// Login
app.post('/users/login', async (req, res) => {
    const { display_name, password, idNumber } = req.body;

    try {
        const userResult = await db.query(
            'SELECT * FROM users WHERE display_name=$1',
            [display_name]
        );

        if (userResult.rows.length === 0) {
            return res.json({ success: false, message: 'User not found' });
        }

        const user = userResult.rows[0];

        if (user.id_number !== idNumber) {
            return res.json({ success: false, message: 'Invalid ID number' });
        }

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.json({ success: false, message: 'Incorrect password' });
        }

        return res.json({ success: true, message: 'Login successful', user });
    } catch (err) {
        console.error('Login ERROR:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Register (admin-only)
app.post('/users/register', async (req, res) => {
    const { adminDisplayName, adminPassword, adminIdNumber, name, email, role, farm, idNumber } = req.body;

    try {
        const adminResult = await db.query(
            'SELECT * FROM users WHERE display_name=$1 AND role=$2',
            [adminDisplayName, 'admin']
        );

        if (adminResult.rows.length === 0) {
            return res.json({ success: false, message: 'Admin not found or not authorized' });
        }

        const admin = adminResult.rows[0];

        const validAdminPassword = await bcrypt.compare(adminPassword, admin.password);
        if (!validAdminPassword) {
            return res.json({ success: false, message: 'Invalid admin password' });
        }

        if (adminIdNumber && admin.id_number !== adminIdNumber) {
            return res.json({ success: false, message: 'Invalid admin ID number' });
        }

        const exists = await db.query(
            'SELECT * FROM users WHERE email=$1 OR display_name=$2',
            [email, name]
        );

        if (exists.rows.length > 0) {
            return res.json({ success: false, message: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(idNumber, 10);

        await db.query(
            'INSERT INTO users (display_name, email, password, role, farm_code, id_number) VALUES ($1, $2, $3, $4, $5, $6)',
            [name, email, hashedPassword, role, farm, idNumber]
        );

        res.json({ success: true, message: 'User registered successfully' });

    } catch (err) {
        console.error('Register ERROR:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// -------------------- DEVICES & ALERTS --------------------
app.get('/devices', async (req, res) => {
    try {
        const result = await db.query(`
            SELECT 
                d.device_code,
                d.animal_code,
                d.serial_number,
                d.last_seen,
                d.status,
                a.tag_number AS animal_tag,
                a.species AS animal_species,
                f.farm_code,
                f.name AS farm_name,
                f.location AS farm_location
            FROM devices d
            LEFT JOIN animals a ON d.animal_code = a.animal_code
            LEFT JOIN farms f ON a.farm_code = f.farm_code
            ORDER BY d.device_code
        `);

        res.json(result.rows);
    } catch (err) {
        console.error('DB ERROR (devices):', err);
        res.status(500).send('Server error');
    }
});

app.get('/alerts', async (req, res) => {
    try {
        const result = await db.query(`
            SELECT 
                a.alert_code,
                a.farm_code,
                a.animal_code,
                a.device_code,
                a.alert_type,
                a.message,
                a.severity,
                a.telemetry_code,
                f.name AS farm_name,
                f.location AS farm_location,
                ani.tag_number AS animal_tag,
                ani.species AS animal_species
            FROM alerts a
            LEFT JOIN farms f ON a.farm_code = f.farm_code
            LEFT JOIN animals ani ON a.animal_code = ani.animal_code
            ORDER BY a.alert_code DESC
        `);

        res.json(result.rows);
    } catch (err) {
        console.error('DB ERROR (alerts):', err);
        res.status(500).send('Server error');
    }
});

// -------------------- EVENT LOGS --------------------
app.get('/event_logs', async (req, res) => {
    const { device_code, animal_code } = req.query;

    try {
        let query = `
            SELECT 
                log_code,
                farm_code,
                device_code,
                animal_code,
                event_type,
                details,
                created_at
            FROM event_logs
        `;
        const params = [];

        if (device_code && animal_code) {
            query += ` WHERE device_code = $1 AND animal_code = $2`;
            params.push(device_code, animal_code);
        } else if (device_code) {
            query += ` WHERE device_code = $1`;
            params.push(device_code);
        } else if (animal_code) {
            query += ` WHERE animal_code = $1`;
            params.push(animal_code);
        }

        query += ` ORDER BY created_at ASC`;

        const result = await db.query(query, params);
        res.json(result.rows);

    } catch (err) {
        console.error('DB ERROR (event_logs):', err);
        res.status(500).send('Server error');
    }
});

// -------------------- START SERVER --------------------
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log('Expose with: ngrok http 3000');
});
