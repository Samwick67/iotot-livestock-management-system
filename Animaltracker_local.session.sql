-- ======================
-- Farms Table
-- ======================
CREATE TABLE farms (
    farm_code VARCHAR(20) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    location VARCHAR(150) NOT NULL
);
-- ======================
-- Users Table
-- ======================
CREATE TABLE users (
    user_code VARCHAR(20) PRIMARY KEY,
    farm_code VARCHAR(20) REFERENCES farms(farm_code) ON DELETE CASCADE,
    email VARCHAR(100) UNIQUE NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    role VARCHAR(50) NOT NULL
);

-- ======================
-- Animals Table
-- ======================
CREATE TABLE animals (
    animal_code VARCHAR(20) PRIMARY KEY,
    farm_code VARCHAR(20) REFERENCES farms(farm_code) ON DELETE CASCADE,
    tag_number VARCHAR(50) UNIQUE NOT NULL,
    species VARCHAR(50) NOT NULL,
    breed VARCHAR(50),
    sex VARCHAR(10),
    dob DATE
);

-- ======================
-- Devices Table
-- ======================
CREATE TABLE devices (
    device_code VARCHAR(20) PRIMARY KEY,
    animal_code VARCHAR(20) REFERENCES animals(animal_code) ON DELETE CASCADE,
    serial_number VARCHAR(50) UNIQUE NOT NULL,
    last_seen TIMESTAMP,
    status VARCHAR(20)
);

-- ======================
-- Telemetry Table
-- ======================
CREATE TABLE telemetry (
    telemetry_code VARCHAR(30) PRIMARY KEY,
    device_code VARCHAR(20) REFERENCES devices(device_code) ON DELETE CASCADE,
    animal_code VARCHAR(20) REFERENCES animals(animal_code) ON DELETE CASCADE,
    recorded_at TIMESTAMP NOT NULL,
    latitude DECIMAL(9,6),
    longitude DECIMAL(9,6),
    temperature_c DECIMAL(4,1),
    heart_rate_bpm INT,
    orientation_deg INT,
    battery_pct INT,
    raw_payload JSONB
);

-- ======================
-- Alerts Table
-- ======================
CREATE TABLE alerts (
    alert_code VARCHAR(30) PRIMARY KEY,
    farm_code VARCHAR(20) REFERENCES farms(farm_code) ON DELETE CASCADE,
    animal_code VARCHAR(20) REFERENCES animals(animal_code) ON DELETE CASCADE,
    device_code VARCHAR(20) REFERENCES devices(device_code) ON DELETE CASCADE,
    alert_type VARCHAR(50),
    message TEXT,
    severity VARCHAR(20),
    telemetry_code VARCHAR(30) REFERENCES telemetry(telemetry_code)
);

-- ======================
-- Event Logs Table
-- ======================
CREATE TABLE event_logs (
    log_code VARCHAR(30) PRIMARY KEY,
    farm_code VARCHAR(20) REFERENCES farms(farm_code) ON DELETE CASCADE,
    device_code VARCHAR(20) REFERENCES devices(device_code) ON DELETE CASCADE,
    animal_code VARCHAR(20) REFERENCES animals(animal_code) ON DELETE CASCADE,
    event_type VARCHAR(50),
    details JSONB,
    created_at TIMESTAMP DEFAULT now()
);

-- Farms
INSERT INTO farms(farm_code, name, location) VALUES
('FARM-001', 'Sedgefield Farm', 'Western Cape, South Africa'),
('FARM-002', 'Meadowview Ranch', 'KwaZulu-Natal, South Africa'),
('FARM-003', 'Sunrise Pastures', 'Eastern Cape, South Africa'),
('FARM-004', 'Green Valley', 'Gauteng, South Africa'),
('FARM-005', 'Blue Hills', 'Free State, South Africa');

-- Users
INSERT INTO users(user_code, farm_code, email, display_name, role) VALUES
('USR-001', 'FARM-001', 'owner1@sedgefield.com', 'Samuel Owner', 'owner'),
('USR-002', 'FARM-001', 'manager1@sedgefield.com', 'Maya Manager', 'manager'),
('USR-003', 'FARM-002', 'owner2@meadowview.com', 'Alice Owner', 'owner'),
('USR-004', 'FARM-003', 'staff1@sunrisepastures.com', 'Bob Staff', 'staff'),
('USR-005', 'FARM-004', 'owner3@greenvalley.com', 'Charlie Owner', 'owner');

-- Animals
INSERT INTO animals(animal_code, farm_code, tag_number, species, breed, sex, dob) VALUES
('COW-001', 'FARM-001', 'RFID-001', 'Cattle', 'Angus', 'male', '2020-03-15'),
('COW-002', 'FARM-001', 'RFID-002', 'Cattle', 'Holstein', 'female', '2021-06-20'),
('SHP-001', 'FARM-001', 'RFID-003', 'Sheep', 'Merino', 'female', '2022-02-10'),
('GOAT-001', 'FARM-002', 'RFID-101', 'Goat', 'Boer', 'male', '2021-11-01'),
('COW-003', 'FARM-003', 'RFID-201', 'Cattle', 'Jersey', 'female', '2022-05-05');

-- Devices
INSERT INTO devices(device_code, animal_code, serial_number, last_seen, status) VALUES
('DEV-001', 'COW-001', 'ESP32-0001', now(), 'active'),
('DEV-002', 'COW-002', 'ESP32-0002', now(), 'active'),
('DEV-003', 'SHP-001', 'ESP32-0003', now(), 'active'),
('DEV-004', 'GOAT-001', 'ESP32-0101', now(), 'active'),
('DEV-005', 'COW-003', 'ESP32-0201', now(), 'active');

-- Telemetry
INSERT INTO telemetry(telemetry_code, device_code, animal_code, recorded_at, latitude, longitude, temperature_c, heart_rate_bpm, orientation_deg, battery_pct, raw_payload) VALUES
('TEL-001', 'DEV-001', 'COW-001', now() - interval '1 hour', -34.05, 22.45, 38.5, 72, 0, 90, '{"temp":38.5,"hr":72}'),
('TEL-002', 'DEV-002', 'COW-002', now() - interval '50 minutes', -34.06, 22.46, 39.2, 80, 5, 88, '{"temp":39.2,"hr":80}'),
('TEL-003', 'DEV-003', 'SHP-001', now() - interval '40 minutes', -34.07, 22.47, 37.8, 65, 2, 85, '{"temp":37.8,"hr":65}'),
('TEL-004', 'DEV-004', 'GOAT-001', now() - interval '30 minutes', -29.85, 31.03, 40.5, 78, 0, 92, '{"temp":40.5,"hr":78}'),
('TEL-005', 'DEV-005', 'COW-003', now() - interval '20 minutes', -33.90, 25.45, 37.2, 70, 1, 87, '{"temp":37.2,"hr":70}');

-- Alerts
INSERT INTO alerts(alert_code, farm_code, animal_code, device_code, alert_type, message, severity, telemetry_code) VALUES
('ALRT-001', 'FARM-001', 'COW-002', 'DEV-002', 'high_temp', 'High temperature 39.2°C detected', 'high', 'TEL-002'),
('ALRT-002', 'FARM-002', 'GOAT-001', 'DEV-004', 'low_battery', 'Battery dropped below 50%', 'medium', 'TEL-004'),
('ALRT-003', 'FARM-001', 'SHP-001', 'DEV-003', 'lost_signal', 'Device lost connection', 'high', 'TEL-003'),
('ALRT-004', 'FARM-003', 'COW-003', 'DEV-005', 'high_temp', 'Temperature exceeded 39°C', 'high', 'TEL-005'),
('ALRT-005', 'FARM-001', 'COW-001', 'DEV-001', 'low_battery', 'Battery below 50%', 'medium', 'TEL-001');

-- Event Logs
INSERT INTO event_logs(log_code, farm_code, device_code, animal_code, event_type, details) VALUES
('LOG-001', 'FARM-001', 'DEV-001', 'COW-001', 'device_connected', '{"message":"Device came online"}'),
('LOG-002', 'FARM-001', 'DEV-002', 'COW-002', 'device_connected', '{"message":"Device came online"}'),
('LOG-003', 'FARM-001', 'DEV-003', 'SHP-001', 'device_connected', '{"message":"Device came online"}'),
('LOG-004', 'FARM-002', 'DEV-004', 'GOAT-001', 'device_connected', '{"message":"Device came online"}'),
('LOG-005', 'FARM-003', 'DEV-005', 'COW-003', 'device_connected', '{"message":"Device came online"}');


