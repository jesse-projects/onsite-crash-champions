-- OnSite Demo Seed Data
-- Created: 2026-01-15
-- Updated: Adding more account managers and current IVRs
-- Description: Sample data for Monday demo

-- ========================================
-- CHECKLISTS
-- ========================================
INSERT INTO checklists (checklist_id, checklist_name, client_code, checklist_config, is_active) VALUES
('CC_HOUSEKEEPING', 'Crash Champions Housekeeping', 'CC', '{
    "header_fields": [
        {"id": "cleaner_first_name", "label": "Cleaner First Name", "type": "text", "required": true},
        {"id": "cleaner_last_name", "label": "Cleaner Last Name", "type": "text", "required": true},
        {"id": "cleaning_company_name", "label": "Cleaning Company Name", "type": "text", "required": true},
        {"id": "cleaning_date", "label": "Cleaning Date", "type": "date", "required": true},
        {"id": "start_time", "label": "Start Time", "type": "time", "required": true}
    ],
    "sections": [
        {
            "id": "front_of_house",
            "title": "FRONT OF HOUSE - RECEPTION AREA - OFFICES (2)",
            "tasks": [
                "Dust Space from Top Down",
                "Dust: Desks, Shelves, Cabinets, Windowsills, Base Trim, Blinds & Walls (up to 12'')",
                "Wipe & Disinfect high-touch surfaces (Door Handles, Light Switches, Phones, etc.)",
                "Sanitize and Polish Drinking Fountain (If Applicable)",
                "Empty all Trash Bins, Clean and Sanitize Interior & Exterior, Replace Liners",
                "Remove Trash to Designated Disposal Area",
                "Clean Interior Glass Surfaces and Spot-Clean Windows; Clean both Sides of Entryway Doors and Adjacent Glass Panels",
                "Vacuum all Carpeted Areas, including Mats, Under Desks and Furniture (Where Accessible)",
                "Sweep and Mop all Non-Carpeted Flooring"
            ]
        },
        {
            "id": "breakroom",
            "title": "BREAKROOM (1)",
            "tasks": [
                "Dust Cabinets, Countertops, Appliance Surfaces, Wall Base, and Trim",
                "Spray, Wipe & Disinfect Tables, Chairs, Countertops, Appliance Handles, and other High-Touch Surfaces",
                "Clean Inside and Outside of Microwave",
                "Spot-clean Interior Glass Surfaces",
                "Sanitize and Polish Drinking Fountain (If Applicable)",
                "Clean both sides of breakroom entry doors and any adjacent glass (If Applicable)",
                "Empty all Trash Bins, Clean and Sanitize Interior & Exterior, Replace Liners",
                "Vacuum Carpeted Areas (If Applicable)",
                "Sweep and Mop Floors"
            ]
        },
        {
            "id": "restroom",
            "title": "RESTROOM CLEANING (2)",
            "tasks": [
                "Dust Vents, Ledges, Wall Base, and Trim",
                "Disinfect Toilets, Urinals, Sinks, Countertops, Partitions, and Dispensers",
                "Clean Glass and Mirrors",
                "Sanitize and Polish Drinking Fountain (If Applicable)",
                "Empty all Trash Bins, Clean and Sanitize Interior & Exterior, Replace Liners",
                "Clean both Sides of Restroom Entry Doors and Any Glass Panels",
                "Refill Soap, Toilet Paper, and Paper Towel Dispensers",
                "Sweep and Mop Floors with Disinfectant Solution"
            ]
        },
        {
            "id": "closing_duties",
            "title": "CLOSING DUTIES",
            "tasks": [
                "Turn Off Lights",
                "Set Alarm",
                "Lock Doors",
                "Service to be completed by shop opening (7:30 AM)",
                "Keep Janitorial Closet Clean and Organized",
                "Report Damage or Maintenance Issues to OnSite"
            ]
        }
    ],
    "validation": {
        "min_photos": 3
    }
}', true);

-- ========================================
-- ACCOUNT MANAGERS
-- ========================================
INSERT INTO account_managers (account_manager_id, first_name, last_name, email, phone, password_hash, is_active) VALUES
('AM_JACKIE', 'Jackie', 'Smith', 'jackie@onsitefm.net', '555-0101', '$2b$10$demo.hash.for.password.demo', true),
('AM_001', 'Account', 'Manager 1', 'am1@onsitefm.net', '555-0102', '$2b$10$demo.hash.for.password.demo', true),
('AM_002', 'Account', 'Manager 2', 'am2@onsitefm.net', '555-0103', '$2b$10$demo.hash.for.password.demo', true),
('AM_003', 'Account', 'Manager 3', 'am3@onsitefm.net', '555-0104', '$2b$10$demo.hash.for.password.demo', true);

-- ========================================
-- SUBCONTRACTORS
-- ========================================
INSERT INTO subcontractors (subcontractor_id, subcontractor_name, email, phone, is_active) VALUES
('SUB-ACME-001', 'ACME Cleaning Services', 'dispatch@acmecleaning.com', '555-1001', true),
('SUB-SPARKLE-002', 'Sparkle Pro Janitorial', 'info@sparklepro.com', '555-1002', true),
('SUB-CLEANTEAM-003', 'CleanTeam Solutions', 'jobs@cleanteam.com', '555-1003', true),
('SUB-PRISTINE-004', 'Pristine Services', 'contact@pristine.com', '555-1004', true);

-- ========================================
-- LOCATIONS (Jackie sees ALL)
-- ========================================
INSERT INTO locations (location_id, checklist_id, location_name, address, city, state, zip, region, subcontractor_id, account_manager_id, internal_wo, monthly_cost, is_active) VALUES
-- AM_001 locations (2)
('CC-01005-ALAMEDA', 'CC_HOUSEKEEPING', 'Crash Champions - Alameda', '123 Main Street', 'Alameda', 'CA', '94501', 'Northern California', 'SUB-ACME-001', 'AM_001', 'WO-CC-001005', 520.00, true),
('CC-01042-OAKLAND', 'CC_HOUSEKEEPING', 'Crash Champions - Oakland', '456 Broadway Ave', 'Oakland', 'CA', '94612', 'Northern California', 'SUB-ACME-001', 'AM_001', 'WO-CC-001042', 520.00, true),

-- AM_002 locations (2)
('CC-02015-SAN-JOSE', 'CC_HOUSEKEEPING', 'Crash Champions - San Jose', '789 First Street', 'San Jose', 'CA', '95110', 'Northern California', 'SUB-SPARKLE-002', 'AM_002', 'WO-CC-002015', 575.00, true),
('CC-02088-FREMONT', 'CC_HOUSEKEEPING', 'Crash Champions - Fremont', '321 Fremont Blvd', 'Fremont', 'CA', '94536', 'Northern California', 'SUB-SPARKLE-002', 'AM_002', 'WO-CC-002088', 550.00, true),

-- AM_003 locations (2)
('CC-03024-SACRAMENTO', 'CC_HOUSEKEEPING', 'Crash Champions - Sacramento', '555 Capitol Mall', 'Sacramento', 'CA', '95814', 'Sacramento Valley', 'SUB-CLEANTEAM-003', 'AM_003', 'WO-CC-003024', 600.00, true),
('CC-03056-ROSEVILLE', 'CC_HOUSEKEEPING', 'Crash Champions - Roseville', '888 Douglas Blvd', 'Roseville', 'CA', '95678', 'Sacramento Valley', 'SUB-CLEANTEAM-003', 'AM_003', 'WO-CC-003056', 590.00, true);

-- ========================================
-- IVRs (Current Month: January 2026 - ACTIVE NOW)
-- ========================================
INSERT INTO ivrs (ivr_id, location_id, ivr_ticket_number, start_date, expiration_date, period_label, import_date) VALUES
('IVR-CC-202601-CC-01005-ALAMEDA', 'CC-01005-ALAMEDA', 'SC-IVR-254891', '2026-01-01', '2026-01-31', '2026-01', CURRENT_TIMESTAMP),
('IVR-CC-202601-CC-01042-OAKLAND', 'CC-01042-OAKLAND', 'SC-IVR-254892', '2026-01-01', '2026-01-31', '2026-01', CURRENT_TIMESTAMP),
('IVR-CC-202601-CC-02015-SAN-JOSE', 'CC-02015-SAN-JOSE', 'SC-IVR-254893', '2026-01-01', '2026-01-31', '2026-01', CURRENT_TIMESTAMP),
('IVR-CC-202601-CC-02088-FREMONT', 'CC-02088-FREMONT', 'SC-IVR-254894', '2026-01-01', '2026-01-31', '2026-01', CURRENT_TIMESTAMP),
('IVR-CC-202601-CC-03024-SACRAMENTO', 'CC-03024-SACRAMENTO', 'SC-IVR-254895', '2026-01-01', '2026-01-31', '2026-01', CURRENT_TIMESTAMP),
('IVR-CC-202601-CC-03056-ROSEVILLE', 'CC-03056-ROSEVILLE', 'SC-IVR-254896', '2026-01-01', '2026-01-31', '2026-01', CURRENT_TIMESTAMP);

-- ========================================
-- SERVICES (Current week services)
-- ========================================
INSERT INTO services (service_id, location_id, checklist_id, ivr_id, internal_wo, subcontractor_id, account_manager_id, period_label, service_number, scheduled_date, status, evergreen_link) VALUES
-- Alameda services
('CC-01005-ALAMEDA_SUB-ACME-001_00001', 'CC-01005-ALAMEDA', 'CC_HOUSEKEEPING', 'IVR-CC-202601-CC-01005-ALAMEDA', 'WO-CC-001005', 'SUB-ACME-001', 'AM_001', '2026-01', 1, '2026-01-20', 'Not Started', '/checklist/CC-01005-ALAMEDA'),

-- Oakland services
('CC-01042-OAKLAND_SUB-ACME-001_00001', 'CC-01042-OAKLAND', 'CC_HOUSEKEEPING', 'IVR-CC-202601-CC-01042-OAKLAND', 'WO-CC-001042', 'SUB-ACME-001', 'AM_001', '2026-01', 1, '2026-01-20', 'Not Started', '/checklist/CC-01042-OAKLAND'),

-- San Jose services (one completed for demo)
('CC-02015-SAN-JOSE_SUB-SPARKLE-002_00001', 'CC-02015-SAN-JOSE', 'CC_HOUSEKEEPING', 'IVR-CC-202601-CC-02015-SAN-JOSE', 'WO-CC-002015', 'SUB-SPARKLE-002', 'AM_002', '2026-01', 1, '2026-01-15', 'Completed', '/checklist/CC-02015-SAN-JOSE'),

-- Fremont services
('CC-02088-FREMONT_SUB-SPARKLE-002_00001', 'CC-02088-FREMONT', 'CC_HOUSEKEEPING', 'IVR-CC-202601-CC-02088-FREMONT', 'WO-CC-002088', 'SUB-SPARKLE-002', 'AM_002', '2026-01', 1, '2026-01-22', 'Not Started', '/checklist/CC-02088-FREMONT'),

-- Sacramento services
('CC-03024-SACRAMENTO_SUB-CLEANTEAM-003_00001', 'CC-03024-SACRAMENTO', 'CC_HOUSEKEEPING', 'IVR-CC-202601-CC-03024-SACRAMENTO', 'WO-CC-003024', 'SUB-CLEANTEAM-003', 'AM_003', '2026-01', 1, '2026-01-23', 'Not Started', '/checklist/CC-03024-SACRAMENTO'),

-- Roseville services
('CC-03056-ROSEVILLE_SUB-CLEANTEAM-003_00001', 'CC-03056-ROSEVILLE', 'CC_HOUSEKEEPING', 'IVR-CC-202601-CC-03056-ROSEVILLE', 'WO-CC-003056', 'SUB-CLEANTEAM-003', 'AM_003', '2026-01', 1, '2026-01-23', 'Not Started', '/checklist/CC-03056-ROSEVILLE');

-- ========================================
-- SAMPLE COMPLETED CHECKLIST (for demo)
-- ========================================
INSERT INTO checklist_submissions (submission_id, service_id, submitted_by, submitted_date, checklist_data, photo_count, notes) VALUES
('DEMO-SUB-001', 'CC-02015-SAN-JOSE_SUB-SPARKLE-002_00001', 'John Doe - Sparkle Pro', '2026-01-15 14:30:00', '{
    "bathrooms_cleaned": "complete",
    "floors_swept": "complete",
    "trash_removed": "complete",
    "glass_cleaned": "complete",
    "lobby_cleaned": "complete",
    "shop_floor_cleaned": "complete"
}', 4, 'Service completed without issues.');

-- Update the San Jose service to reflect completion
UPDATE services
SET status = 'Completed',
    submitted_date = '2026-01-15 14:30:00'
WHERE service_id = 'CC-02015-SAN-JOSE_SUB-SPARKLE-002_00001';

-- ========================================
-- SAMPLE PHOTOS (for demo completed checklist)
-- ========================================
INSERT INTO photos (photo_id, submission_id, file_name, file_path, file_size, photo_type, retention_expiry) VALUES
('PHOTO-001', 'DEMO-SUB-001', 'Crash_02015_254893_20260115_W01_Photo_01.jpg', '/uploads/demo/lobby_before.jpg', 245600, 'Before', '2026-02-14'),
('PHOTO-002', 'DEMO-SUB-001', 'Crash_02015_254893_20260115_W01_Photo_02.jpg', '/uploads/demo/lobby_after.jpg', 238900, 'After', '2026-02-14'),
('PHOTO-003', 'DEMO-SUB-001', 'Crash_02015_254893_20260115_W01_Photo_03.jpg', '/uploads/demo/shop_floor.jpg', 312400, 'Area Specific', '2026-02-14'),
('PHOTO-004', 'DEMO-SUB-001', 'Crash_02015_254893_20260115_W01_Photo_04.jpg', '/uploads/demo/bathrooms.jpg', 198700, 'Area Specific', '2026-02-14');

-- ========================================
-- COMPLETION MESSAGE
-- ========================================

DO $$
BEGIN
    RAISE NOTICE 'Demo seed data created successfully!';
    RAISE NOTICE '✓ 1 checklist type (Crash Champions Housekeeping)';
    RAISE NOTICE '✓ 4 account managers (Jackie sees ALL, AM1/AM2/AM3 see 2 each)';
    RAISE NOTICE '✓ 4 subcontractors';
    RAISE NOTICE '✓ 6 Crash Champions locations';
    RAISE NOTICE '✓ 6 IVRs for January 2026 (ACTIVE NOW)';
    RAISE NOTICE '✓ 6 pending services (1 completed for demo)';
    RAISE NOTICE '✓ 1 completed submission with 4 photos';
END $$;
