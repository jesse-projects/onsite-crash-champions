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

// Get checklist for evergreen link (V2 - no Services table)
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

// Submit checklist (V2 - creates Submission directly, no Service)
app.post('/api/checklist/:locationId/submit', upload.array('photos', 10), async (req, res) => {
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        const { locationId } = req.params;
        const { checklistData, notes, submittedBy } = req.body;
        const photos = req.files || [];

        // Parse checklist data if it's a string
        let parsedChecklistData = checklistData;
        if (typeof checklistData === 'string') {
            parsedChecklistData = JSON.parse(checklistData);
        }

        // Validate photo count (minimum 3)
        if (photos.length < 3) {
            await client.query('ROLLBACK');
            return res.status(400).json({ error: 'Minimum 3 photos required' });
        }

        // Get location and current IVR
        const locationResult = await client.query(
            'SELECT * FROM locations WHERE location_id = $1',
            [locationId]
        );

        if (locationResult.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ error: 'Location not found' });
        }

        const location = locationResult.rows[0];

        // Get current active IVR
        const ivrResult = await client.query(`
            SELECT * FROM ivrs
            WHERE location_id = $1
            AND start_date <= CURRENT_DATE
            AND expiration_date >= CURRENT_DATE
            ORDER BY start_date DESC
            LIMIT 1
        `, [locationId]);

        const currentIvr = ivrResult.rows.length > 0 ? ivrResult.rows[0] : null;

        // Create submission
        const submissionId = uuidv4();
        const submissionResult = await client.query(`
            INSERT INTO submissions (
                submission_id, location_id, checklist_id, ivr_id, subcontractor_id,
                account_manager_id, submitted_by, checklist_data, photo_count, notes
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            RETURNING *
        `, [
            submissionId,
            locationId,
            location.checklist_id,
            currentIvr?.ivr_id || null,
            location.subcontractor_id,
            location.account_manager_id,
            submittedBy,
            parsedChecklistData,
            photos.length,
            notes
        ]);

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

// Get dashboard data (V2 - calculates staleness from submissions)
app.get('/api/dashboard', authenticateToken, async (req, res) => {
    try {
        // Get ALL locations (everyone sees all)
        const locationsResult = await pool.query(`
            SELECT l.*, s.subcontractor_name,
                   am.account_manager_id, am.first_name as am_first_name, am.last_name as am_last_name,
                   sub_latest.submitted_date as last_submission_date,
                   sub_latest.submission_id as last_submission_id
            FROM locations l
            LEFT JOIN subcontractors s ON l.subcontractor_id = s.subcontractor_id
            LEFT JOIN account_managers am ON l.account_manager_id = am.account_manager_id
            LEFT JOIN LATERAL (
                SELECT submission_id, submitted_date
                FROM submissions
                WHERE location_id = l.location_id
                ORDER BY submitted_date DESC
                LIMIT 1
            ) sub_latest ON true
            WHERE l.is_active = true
            ORDER BY l.location_name
        `);

        // Get ALL recent submissions (limit to last 100)
        const submissionsResult = await pool.query(`
            SELECT sub.*, l.location_name, l.location_id, l.service_interval_days,
                   s.subcontractor_name, i.ivr_ticket_number, i.period_label,
                   am.account_manager_id, am.first_name as am_first_name, am.last_name as am_last_name
            FROM submissions sub
            JOIN locations l ON sub.location_id = l.location_id
            LEFT JOIN subcontractors s ON sub.subcontractor_id = s.subcontractor_id
            LEFT JOIN ivrs i ON sub.ivr_id = i.ivr_id
            LEFT JOIN account_managers am ON sub.account_manager_id = am.account_manager_id
            ORDER BY sub.submitted_date DESC
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

        // Calculate staleness statistics
        const now = new Date();
        let currentCount = 0;
        let staleCount = 0;
        let overdueCount = 0;

        locationsResult.rows.forEach(loc => {
            if (!loc.last_submission_date) {
                overdueCount++; // Never serviced = overdue
                return;
            }

            const lastService = new Date(loc.last_submission_date);
            const daysSinceService = Math.floor((now - lastService) / (1000 * 60 * 60 * 24));
            const interval = loc.service_interval_days || 7;

            if (daysSinceService <= interval) {
                currentCount++; // Within interval = current
            } else if (daysSinceService <= interval * 1.5) {
                staleCount++; // Up to 50% overdue = stale
            } else {
                overdueCount++; // More than 50% overdue = overdue
            }
        });

        const stats = {
            totalLocations: locationsResult.rows.length,
            currentServices: currentCount,
            staleServices: staleCount,
            overdueServices: overdueCount
        };

        res.json({
            stats,
            locations: locationsResult.rows,
            submissions: submissionsResult.rows,
            accountManagers: accountManagersResult.rows
        });
    } catch (error) {
        console.error('Dashboard error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get submission details
app.get('/api/submissions/:submissionId', authenticateToken, async (req, res) => {
    try {
        const { submissionId } = req.params;

        // Get submission with all related data
        const submissionResult = await pool.query(`
            SELECT
                sub.*,
                l.location_name, l.address, l.city, l.state,
                s.subcontractor_name,
                i.ivr_ticket_number, i.period_label,
                c.checklist_config
            FROM submissions sub
            JOIN locations l ON sub.location_id = l.location_id
            LEFT JOIN subcontractors s ON sub.subcontractor_id = s.subcontractor_id
            LEFT JOIN ivrs i ON sub.ivr_id = i.ivr_id
            LEFT JOIN checklists c ON sub.checklist_id = c.checklist_id
            WHERE sub.submission_id = $1
        `, [submissionId]);

        if (submissionResult.rows.length === 0) {
            return res.status(404).json({ error: 'Submission not found' });
        }

        const submission = submissionResult.rows[0];

        // Get photos
        const photosResult = await pool.query(
            'SELECT * FROM photos WHERE submission_id = $1',
            [submissionId]
        );

        res.json({
            ...submission,
            photos: photosResult.rows
        });
    } catch (error) {
        console.error('Get submission error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// ========================================
// LOCATIONS ROUTES
// ========================================

// Get all locations (everyone sees all)
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
        const submissions = await pool.query('SELECT * FROM submissions ORDER BY submitted_date DESC LIMIT 20');
        const photos = await pool.query('SELECT * FROM photos ORDER BY upload_date DESC LIMIT 50');

        res.json({
            checklists: checklists.rows,
            account_managers: accountManagers.rows,
            subcontractors: subcontractors.rows,
            locations: locations.rows,
            ivrs: ivrs.rows,
            submissions: submissions.rows,
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
