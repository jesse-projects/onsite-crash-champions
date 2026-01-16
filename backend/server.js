const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs').promises;
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Database connection
const pool = new Pool({
    host: process.env.DB_HOST || 'postgres',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'onsite',
    user: process.env.DB_USER || 'onsite',
    password: process.env.DB_PASSWORD,
});

// Test database connection
pool.connect((err, client, release) => {
    if (err) {
        console.error('Error connecting to database:', err.stack);
    } else {
        console.log('✓ Database connected successfully');
        release();
    }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: async (req, file, cb) => {
        const uploadDir = path.join(__dirname, 'uploads');
        try {
            await fs.mkdir(uploadDir, { recursive: true });
            cb(null, uploadDir);
        } catch (error) {
            cb(error);
        }
    },
    filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}-${uuidv4()}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|pdf/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        if (extname && mimetype) {
            cb(null, true);
        } else {
            cb(new Error('Only images and PDFs are allowed'));
        }
    }
});

// JWT Authentication Middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid or expired token' });
        }
        req.user = user;
        next();
    });
};

// ========================================
// ROUTES
// ========================================

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// ========================================
// AUTH ROUTES
// ========================================

// Login
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password required' });
        }

        // Get account manager
        const result = await pool.query(
            'SELECT * FROM account_managers WHERE email = $1 AND is_active = true',
            [email]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const user = result.rows[0];

        // For demo, accept 'demo' as password OR check hash
        const validPassword = password === 'demo' || await bcrypt.compare(password, user.password_hash);

        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Generate JWT
        const token = jwt.sign(
            {
                id: user.account_manager_id,
                email: user.email,
                name: `${user.first_name} ${user.last_name}`
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            token,
            user: {
                id: user.account_manager_id,
                email: user.email,
                firstName: user.first_name,
                lastName: user.last_name
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// ========================================
// CHECKLIST ROUTES (PUBLIC - No Auth Required)
// ========================================

// Get checklist for evergreen link
app.get('/api/checklist/:locationId', async (req, res) => {
    try {
        const { locationId } = req.params;

        // Get location details
        const locationResult = await pool.query(`
            SELECT l.*, c.checklist_name, c.checklist_config, s.subcontractor_name
            FROM locations l
            JOIN checklists c ON l.checklist_id = c.checklist_id
            LEFT JOIN subcontractors s ON l.subcontractor_id = s.subcontractor_id
            WHERE l.location_id = $1 AND l.is_active = true
        `, [locationId]);

        if (locationResult.rows.length === 0) {
            return res.status(404).json({ error: 'Location not found' });
        }

        const location = locationResult.rows[0];

        // Get current active IVR
        const ivrResult = await pool.query(`
            SELECT * FROM ivrs
            WHERE location_id = $1
            AND start_date <= CURRENT_DATE
            AND expiration_date >= CURRENT_DATE
            ORDER BY start_date DESC
            LIMIT 1
        `, [locationId]);

        let currentIvr = null;
        if (ivrResult.rows.length > 0) {
            currentIvr = ivrResult.rows[0];
        }

        // Get or create current service
        let service = null;
        if (currentIvr) {
            const serviceResult = await pool.query(`
                SELECT * FROM services
                WHERE location_id = $1
                AND ivr_id = $2
                AND status IN ('Not Started', 'In Progress')
                ORDER BY created_date DESC
                LIMIT 1
            `, [locationId, currentIvr.ivr_id]);

            if (serviceResult.rows.length > 0) {
                service = serviceResult.rows[0];
            } else {
                // Create new service (just-in-time)
                const serviceCount = await pool.query(
                    'SELECT COUNT(*) as count FROM services WHERE location_id = $1',
                    [locationId]
                );
                const nextNumber = parseInt(serviceCount.rows[0].count) + 1;
                const serviceId = `${locationId}_${location.subcontractor_id}_${String(nextNumber).padStart(5, '0')}`;

                const insertResult = await pool.query(`
                    INSERT INTO services (
                        service_id, location_id, checklist_id, ivr_id, internal_wo,
                        subcontractor_id, account_manager_id, period_label, service_number,
                        evergreen_link, status
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'Not Started')
                    RETURNING *
                `, [
                    serviceId,
                    locationId,
                    location.checklist_id,
                    currentIvr.ivr_id,
                    location.internal_wo,
                    location.subcontractor_id,
                    location.account_manager_id,
                    currentIvr.period_label,
                    nextNumber,
                    `/checklist/${locationId}`
                ]);

                service = insertResult.rows[0];
            }
        }

        res.json({
            location: {
                id: location.location_id,
                name: location.location_name,
                address: location.address,
                city: location.city,
                state: location.state,
                zip: location.zip,
                internalWo: location.internal_wo
            },
            ivr: currentIvr ? {
                id: currentIvr.ivr_id,
                ticketNumber: currentIvr.ivr_ticket_number,
                startDate: currentIvr.start_date,
                expirationDate: currentIvr.expiration_date,
                periodLabel: currentIvr.period_label
            } : null,
            service: service ? {
                id: service.service_id,
                status: service.status,
                serviceNumber: service.service_number
            } : null,
            checklist: {
                id: location.checklist_id,
                name: location.checklist_name,
                config: location.checklist_config
            },
            subcontractor: location.subcontractor_name
        });
    } catch (error) {
        console.error('Get checklist error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Submit checklist
app.post('/api/checklist/:locationId/submit', upload.array('photos', 10), async (req, res) => {
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        const { locationId } = req.params;
        const { serviceId, checklistData, notes, submittedBy } = req.body;
        const photos = req.files || [];

        // Parse checklist data if it's a string
        let parsedChecklistData = checklistData;
        if (typeof checklistData === 'string') {
            parsedChecklistData = JSON.parse(checklistData);
        }

        // Validate photo count (minimum 3 for demo)
        if (photos.length < 3) {
            await client.query('ROLLBACK');
            return res.status(400).json({ error: 'Minimum 3 photos required' });
        }

        // Create submission
        const submissionId = uuidv4();
        const submissionResult = await client.query(`
            INSERT INTO checklist_submissions (
                submission_id, service_id, submitted_by, checklist_data, photo_count, notes
            ) VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *
        `, [submissionId, serviceId, submittedBy, parsedChecklistData, photos.length, notes]);

        const submission = submissionResult.rows[0];

        // Save photos
        for (let i = 0; i < photos.length; i++) {
            const photo = photos[i];
            await client.query(`
                INSERT INTO photos (
                    submission_id, file_name, file_path, file_size, photo_type, retention_expiry
                ) VALUES ($1, $2, $3, $4, $5, CURRENT_DATE + INTERVAL '30 days')
            `, [
                submissionId,
                photo.filename,
                `/uploads/${photo.filename}`,
                photo.size,
                i === 0 ? 'Before' : i === 1 ? 'After' : 'Area Specific'
            ]);
        }

        // Update service status
        await client.query(`
            UPDATE services
            SET status = 'Completed', submitted_date = CURRENT_TIMESTAMP
            WHERE service_id = $1
        `, [serviceId]);

        await client.query('COMMIT');

        res.json({
            success: true,
            submissionId: submission.submission_id,
            message: 'Checklist submitted successfully'
        });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Submit checklist error:', error);
        res.status(500).json({ error: 'Failed to submit checklist' });
    } finally {
        client.release();
    }
});

// ========================================
// DASHBOARD ROUTES (Require Auth)
// ========================================

// Get dashboard data (everyone sees all locations now)
app.get('/api/dashboard', authenticateToken, async (req, res) => {
    try {
        // Get ALL locations (no filtering by account manager)
        const locationsResult = await pool.query(`
            SELECT l.*, s.subcontractor_name,
                   am.account_manager_id, am.first_name as am_first_name, am.last_name as am_last_name
            FROM locations l
            LEFT JOIN subcontractors s ON l.subcontractor_id = s.subcontractor_id
            LEFT JOIN account_managers am ON l.account_manager_id = am.account_manager_id
            WHERE l.is_active = true
            ORDER BY l.location_name
        `);

        // Get ALL services (no filtering by account manager)
        const servicesResult = await pool.query(`
            SELECT sv.*, l.location_name, sub.subcontractor_name, i.ivr_ticket_number, i.period_label,
                   am.account_manager_id, am.first_name as am_first_name, am.last_name as am_last_name
            FROM services sv
            JOIN locations l ON sv.location_id = l.location_id
            LEFT JOIN subcontractors sub ON sv.subcontractor_id = sub.subcontractor_id
            LEFT JOIN ivrs i ON sv.ivr_id = i.ivr_id
            LEFT JOIN account_managers am ON sv.account_manager_id = am.account_manager_id
            ORDER BY sv.scheduled_date DESC, sv.created_date DESC
            LIMIT 100
        `);

        // Get list of account managers for filter
        const accountManagersResult = await pool.query(`
            SELECT DISTINCT am.account_manager_id, am.first_name, am.last_name
            FROM account_managers am
            JOIN locations l ON am.account_manager_id = l.account_manager_id
            WHERE am.is_active = true
            ORDER BY am.first_name, am.last_name
        `);

        // Calculate statistics (frontend will filter these based on selected AM)
        const stats = {
            totalLocations: locationsResult.rows.length,
            pendingServices: servicesResult.rows.filter(s => s.status === 'Not Started').length,
            completedServices: servicesResult.rows.filter(s => s.status === 'Completed').length,
            overdueServices: servicesResult.rows.filter(s => s.status === 'Overdue').length
        };

        res.json({
            stats,
            locations: locationsResult.rows,
            services: servicesResult.rows,
            accountManagers: accountManagersResult.rows
        });
    } catch (error) {
        console.error('Dashboard error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get service details
app.get('/api/services/:serviceId', authenticateToken, async (req, res) => {
    try {
        const { serviceId } = req.params;

        // Get service with all related data
        const serviceResult = await pool.query(`
            SELECT
                sv.*,
                l.location_name, l.address, l.city, l.state,
                sub.subcontractor_name,
                i.ivr_ticket_number, i.period_label,
                cs.submission_id, cs.submitted_by, cs.submitted_date, cs.checklist_data, cs.notes
            FROM services sv
            JOIN locations l ON sv.location_id = l.location_id
            LEFT JOIN subcontractors sub ON sv.subcontractor_id = sub.subcontractor_id
            LEFT JOIN ivrs i ON sv.ivr_id = i.ivr_id
            LEFT JOIN checklist_submissions cs ON sv.service_id = cs.service_id
            WHERE sv.service_id = $1
        `, [serviceId]);

        if (serviceResult.rows.length === 0) {
            return res.status(404).json({ error: 'Service not found' });
        }

        const service = serviceResult.rows[0];

        // Get photos if submission exists
        let photos = [];
        if (service.submission_id) {
            const photosResult = await pool.query(
                'SELECT * FROM photos WHERE submission_id = $1',
                [service.submission_id]
            );
            photos = photosResult.rows;
        }

        res.json({
            ...service,
            photos
        });
    } catch (error) {
        console.error('Get service error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// ========================================
// LOCATIONS ROUTES
// ========================================

// Get all locations (everyone sees all locations now)
app.get('/api/locations', authenticateToken, async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT l.*, s.subcontractor_name, c.checklist_name,
                   am.first_name as am_first_name, am.last_name as am_last_name
            FROM locations l
            LEFT JOIN subcontractors s ON l.subcontractor_id = s.subcontractor_id
            LEFT JOIN checklists c ON l.checklist_id = c.checklist_id
            LEFT JOIN account_managers am ON l.account_manager_id = am.account_manager_id
            WHERE l.is_active = true
            ORDER BY l.location_name
        `);

        res.json(result.rows);
    } catch (error) {
        console.error('Get locations error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// ========================================
// VENDORS (SUBCONTRACTORS) ROUTES
// ========================================

// Get all vendors with their assigned locations
app.get('/api/vendors', authenticateToken, async (req, res) => {
    try {
        const vendorsResult = await pool.query(`
            SELECT s.*,
                   json_agg(
                       json_build_object(
                           'location_id', l.location_id,
                           'location_name', l.location_name,
                           'city', l.city,
                           'state', l.state
                       ) ORDER BY l.location_name
                   ) FILTER (WHERE l.location_id IS NOT NULL) as locations
            FROM subcontractors s
            LEFT JOIN locations l ON s.subcontractor_id = l.subcontractor_id AND l.is_active = true
            WHERE s.is_active = true
            GROUP BY s.subcontractor_id
            ORDER BY s.subcontractor_name
        `);

        res.json(vendorsResult.rows);
    } catch (error) {
        console.error('Vendors error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// ========================================
// IVRS ROUTES
// ========================================

// Get all IVRs with location details
app.get('/api/ivrs', authenticateToken, async (req, res) => {
    try {
        const ivrsResult = await pool.query(`
            SELECT i.*, l.location_name, l.location_id
            FROM ivrs i
            JOIN locations l ON i.location_id = l.location_id
            ORDER BY i.start_date DESC, l.location_name
        `);

        res.json(ivrsResult.rows);
    } catch (error) {
        console.error('IVRs error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// ========================================
// DEBUG ROUTES
// ========================================

// Debug endpoint - get all tables data
app.get('/api/debug', authenticateToken, async (req, res) => {
    try {
        const checklists = await pool.query('SELECT * FROM checklists ORDER BY checklist_id');
        const accountManagers = await pool.query('SELECT account_manager_id, first_name, last_name, email, phone, is_active FROM account_managers ORDER BY account_manager_id');
        const subcontractors = await pool.query('SELECT * FROM subcontractors ORDER BY subcontractor_id');
        const locations = await pool.query('SELECT * FROM locations ORDER BY location_id');
        const ivrs = await pool.query('SELECT * FROM ivrs ORDER BY start_date DESC');
        const services = await pool.query('SELECT * FROM services ORDER BY created_date DESC LIMIT 50');
        const submissions = await pool.query('SELECT * FROM checklist_submissions ORDER BY submitted_date DESC LIMIT 20');
        const photos = await pool.query('SELECT * FROM photos ORDER BY upload_date DESC LIMIT 50');

        res.json({
            checklists: checklists.rows,
            account_managers: accountManagers.rows,
            subcontractors: subcontractors.rows,
            locations: locations.rows,
            ivrs: ivrs.rows,
            services: services.rows,
            checklist_submissions: submissions.rows,
            photos: photos.rows
        });
    } catch (error) {
        console.error('Debug error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// ========================================
// ERROR HANDLING
// ========================================

// 404 handler - MUST BE LAST
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ error: err.message || 'Internal server error' });
});

// ========================================
// SERVER START
// ========================================

app.listen(PORT, '0.0.0.0', () => {
    console.log(`✓ Server running on port ${PORT}`);
    console.log(`✓ Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    pool.end(() => {
        console.log('Database pool closed');
        process.exit(0);
    });
});
