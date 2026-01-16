-- OnSite Demo Seed Data V2
-- Created: 2026-01-16
-- Updated: Removed Services table, added expired/future IVRs
-- Description: Simplified model - Location → Submissions

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
-- LOCATIONS (with service_interval_days)
-- ========================================
INSERT INTO locations (location_id, checklist_id, location_name, address, city, state, zip, region, subcontractor_id, account_manager_id, internal_wo, monthly_cost, service_interval_days, is_active) VALUES
-- AM_001 locations (2) - weekly service
('CC-01005-ALAMEDA', 'CC_HOUSEKEEPING', 'Crash Champions - Alameda', '123 Main Street', 'Alameda', 'CA', '94501', 'Northern California', 'SUB-ACME-001', 'AM_001', 'WO-CC-001005', 520.00, 7, true),
('CC-01042-OAKLAND', 'CC_HOUSEKEEPING', 'Crash Champions - Oakland', '456 Broadway Ave', 'Oakland', 'CA', '94612', 'Northern California', 'SUB-ACME-001', 'AM_001', 'WO-CC-001042', 520.00, 7, true),

-- AM_002 locations (2) - weekly service
('CC-02015-SAN-JOSE', 'CC_HOUSEKEEPING', 'Crash Champions - San Jose', '789 First Street', 'San Jose', 'CA', '95110', 'Northern California', 'SUB-SPARKLE-002', 'AM_002', 'WO-CC-002015', 575.00, 7, true),
('CC-02088-FREMONT', 'CC_HOUSEKEEPING', 'Crash Champions - Fremont', '321 Fremont Blvd', 'Fremont', 'CA', '94536', 'Northern California', 'SUB-SPARKLE-002', 'AM_002', 'WO-CC-002088', 550.00, 7, true),

-- AM_003 locations (2) - weekly service
('CC-03024-SACRAMENTO', 'CC_HOUSEKEEPING', 'Crash Champions - Sacramento', '555 Capitol Mall', 'Sacramento', 'CA', '95814', 'Sacramento Valley', 'SUB-CLEANTEAM-003', 'AM_003', 'WO-CC-003024', 600.00, 7, true),
('CC-03056-ROSEVILLE', 'CC_HOUSEKEEPING', 'Crash Champions - Roseville', '888 Douglas Blvd', 'Roseville', 'CA', '95678', 'Sacramento Valley', 'SUB-CLEANTEAM-003', 'AM_003', 'WO-CC-003056', 590.00, 7, true);

-- ========================================
-- IVRs (EXPIRED, CURRENT, FUTURE for demo)
-- ========================================

-- EXPIRED IVRs (December 2025)
INSERT INTO ivrs (ivr_id, location_id, ivr_ticket_number, start_date, expiration_date, period_label, import_date) VALUES
('IVR-CC-202512-CC-01005-ALAMEDA', 'CC-01005-ALAMEDA', 'SC-IVR-254801', '2025-12-01', '2025-12-31', '2025-12', '2025-11-28 10:00:00'),
('IVR-CC-202512-CC-01042-OAKLAND', 'CC-01042-OAKLAND', 'SC-IVR-254802', '2025-12-01', '2025-12-31', '2025-12', '2025-11-28 10:00:00'),
('IVR-CC-202512-CC-02015-SAN-JOSE', 'CC-02015-SAN-JOSE', 'SC-IVR-254803', '2025-12-01', '2025-12-31', '2025-12', '2025-11-28 10:00:00'),
('IVR-CC-202512-CC-02088-FREMONT', 'CC-02088-FREMONT', 'SC-IVR-254804', '2025-12-01', '2025-12-31', '2025-12', '2025-11-28 10:00:00'),
('IVR-CC-202512-CC-03024-SACRAMENTO', 'CC-03024-SACRAMENTO', 'SC-IVR-254805', '2025-12-01', '2025-12-31', '2025-12', '2025-11-28 10:00:00'),
('IVR-CC-202512-CC-03056-ROSEVILLE', 'CC-03056-ROSEVILLE', 'SC-IVR-254806', '2025-12-01', '2025-12-31', '2025-12', '2025-11-28 10:00:00');

-- CURRENT IVRs (January 2026 - ACTIVE NOW)
INSERT INTO ivrs (ivr_id, location_id, ivr_ticket_number, start_date, expiration_date, period_label, import_date) VALUES
('IVR-CC-202601-CC-01005-ALAMEDA', 'CC-01005-ALAMEDA', 'SC-IVR-254891', '2026-01-01', '2026-01-31', '2026-01', '2025-12-28 10:00:00'),
('IVR-CC-202601-CC-01042-OAKLAND', 'CC-01042-OAKLAND', 'SC-IVR-254892', '2026-01-01', '2026-01-31', '2026-01', '2025-12-28 10:00:00'),
('IVR-CC-202601-CC-02015-SAN-JOSE', 'CC-02015-SAN-JOSE', 'SC-IVR-254893', '2026-01-01', '2026-01-31', '2026-01', '2025-12-28 10:00:00'),
('IVR-CC-202601-CC-02088-FREMONT', 'CC-02088-FREMONT', 'SC-IVR-254894', '2026-01-01', '2026-01-31', '2026-01', '2025-12-28 10:00:00'),
('IVR-CC-202601-CC-03024-SACRAMENTO', 'CC-03024-SACRAMENTO', 'SC-IVR-254895', '2026-01-01', '2026-01-31', '2026-01', '2025-12-28 10:00:00'),
('IVR-CC-202601-CC-03056-ROSEVILLE', 'CC-03056-ROSEVILLE', 'SC-IVR-254896', '2026-01-01', '2026-01-31', '2026-01', '2025-12-28 10:00:00');

-- FUTURE IVRs (February 2026)
INSERT INTO ivrs (ivr_id, location_id, ivr_ticket_number, start_date, expiration_date, period_label, import_date) VALUES
('IVR-CC-202602-CC-01005-ALAMEDA', 'CC-01005-ALAMEDA', 'SC-IVR-254991', '2026-02-01', '2026-02-28', '2026-02', CURRENT_TIMESTAMP),
('IVR-CC-202602-CC-01042-OAKLAND', 'CC-01042-OAKLAND', 'SC-IVR-254992', '2026-02-01', '2026-02-28', '2026-02', CURRENT_TIMESTAMP),
('IVR-CC-202602-CC-02015-SAN-JOSE', 'CC-02015-SAN-JOSE', 'SC-IVR-254993', '2026-02-01', '2026-02-28', '2026-02', CURRENT_TIMESTAMP),
('IVR-CC-202602-CC-02088-FREMONT', 'CC-02088-FREMONT', 'SC-IVR-254994', '2026-02-01', '2026-02-28', '2026-02', CURRENT_TIMESTAMP),
('IVR-CC-202602-CC-03024-SACRAMENTO', 'CC-03024-SACRAMENTO', 'SC-IVR-254995', '2026-02-01', '2026-02-28', '2026-02', CURRENT_TIMESTAMP),
('IVR-CC-202602-CC-03056-ROSEVILLE', 'CC-03056-ROSEVILLE', 'SC-IVR-254996', '2026-02-01', '2026-02-28', '2026-02', CURRENT_TIMESTAMP);

-- ========================================
-- SAMPLE SUBMISSIONS (Completed Checklists)
-- ========================================

-- San Jose: One completed submission from last week (Current)
INSERT INTO submissions (submission_id, location_id, checklist_id, ivr_id, subcontractor_id, account_manager_id, submitted_by, submitted_date, checklist_data, photo_count, notes) VALUES
('SUB-DEMO-001', 'CC-02015-SAN-JOSE', 'CC_HOUSEKEEPING', 'IVR-CC-202601-CC-02015-SAN-JOSE', 'SUB-SPARKLE-002', 'AM_002',
'John Doe - Sparkle Pro', '2026-01-10 14:30:00', '{
    "header": {
        "cleaner_first_name": "John",
        "cleaner_last_name": "Doe",
        "cleaning_company_name": "Sparkle Pro Janitorial",
        "cleaning_date": "2026-01-10",
        "start_time": "13:00"
    },
    "tasks": {
        "front_of_house_task_0": "complete",
        "front_of_house_task_1": "complete",
        "front_of_house_task_2": "complete",
        "front_of_house_task_3": "na",
        "front_of_house_task_4": "complete",
        "front_of_house_task_5": "complete",
        "front_of_house_task_6": "complete",
        "front_of_house_task_7": "complete",
        "front_of_house_task_8": "complete",
        "breakroom_task_0": "complete",
        "breakroom_task_1": "complete",
        "breakroom_task_2": "complete",
        "breakroom_task_3": "complete",
        "breakroom_task_4": "na",
        "breakroom_task_5": "na",
        "breakroom_task_6": "complete",
        "breakroom_task_7": "na",
        "breakroom_task_8": "complete",
        "restroom_task_0": "complete",
        "restroom_task_1": "complete",
        "restroom_task_2": "complete",
        "restroom_task_3": "na",
        "restroom_task_4": "complete",
        "restroom_task_5": "complete",
        "restroom_task_6": "complete",
        "restroom_task_7": "complete",
        "closing_duties_task_0": "complete",
        "closing_duties_task_1": "complete",
        "closing_duties_task_2": "complete",
        "closing_duties_task_3": "complete",
        "closing_duties_task_4": "complete",
        "closing_duties_task_5": "complete"
    },
    "sectionNotes": {
        "front_of_house": "",
        "breakroom": "Microwave needs deep cleaning next visit",
        "restroom": "",
        "closing_duties": ""
    },
    "signature": "John Doe"
}', 4, 'Microwave needs deep cleaning next visit');

-- Alameda: One stale submission (8 days ago - should trigger yellow/orange warning)
INSERT INTO submissions (submission_id, location_id, checklist_id, ivr_id, subcontractor_id, account_manager_id, submitted_by, submitted_date, checklist_data, photo_count, notes) VALUES
('SUB-DEMO-002', 'CC-01005-ALAMEDA', 'CC_HOUSEKEEPING', 'IVR-CC-202601-CC-01005-ALAMEDA', 'SUB-ACME-001', 'AM_001',
'Jane Smith - ACME', '2026-01-08 09:15:00', '{
    "header": {
        "cleaner_first_name": "Jane",
        "cleaner_last_name": "Smith",
        "cleaning_company_name": "ACME Cleaning Services",
        "cleaning_date": "2026-01-08",
        "start_time": "08:00"
    },
    "tasks": {
        "front_of_house_task_0": "complete",
        "front_of_house_task_1": "complete",
        "front_of_house_task_2": "complete",
        "front_of_house_task_3": "complete",
        "front_of_house_task_4": "complete",
        "front_of_house_task_5": "complete",
        "front_of_house_task_6": "complete",
        "front_of_house_task_7": "complete",
        "front_of_house_task_8": "complete",
        "breakroom_task_0": "complete",
        "breakroom_task_1": "complete",
        "breakroom_task_2": "complete",
        "breakroom_task_3": "complete",
        "breakroom_task_4": "complete",
        "breakroom_task_5": "complete",
        "breakroom_task_6": "complete",
        "breakroom_task_7": "complete",
        "breakroom_task_8": "complete",
        "restroom_task_0": "complete",
        "restroom_task_1": "complete",
        "restroom_task_2": "complete",
        "restroom_task_3": "complete",
        "restroom_task_4": "complete",
        "restroom_task_5": "complete",
        "restroom_task_6": "complete",
        "restroom_task_7": "complete",
        "closing_duties_task_0": "complete",
        "closing_duties_task_1": "complete",
        "closing_duties_task_2": "complete",
        "closing_duties_task_3": "complete",
        "closing_duties_task_4": "complete",
        "closing_duties_task_5": "complete"
    },
    "sectionNotes": {
        "front_of_house": "",
        "breakroom": "",
        "restroom": "",
        "closing_duties": ""
    },
    "signature": "Jane Smith"
}', 3, '');

-- ========================================
-- SAMPLE PHOTOS (for demo submissions)
-- ========================================

-- Photos for San Jose submission
INSERT INTO photos (photo_id, submission_id, file_name, file_path, file_size, photo_type, retention_expiry) VALUES
('PHOTO-001', 'SUB-DEMO-001', 'san-jose-before-1.jpg', '/uploads/demo-san-jose-before-1.jpg', 245678, 'Before', CURRENT_DATE + INTERVAL '30 days'),
('PHOTO-002', 'SUB-DEMO-001', 'san-jose-after-1.jpg', '/uploads/demo-san-jose-after-1.jpg', 234567, 'After', CURRENT_DATE + INTERVAL '30 days'),
('PHOTO-003', 'SUB-DEMO-001', 'san-jose-restroom.jpg', '/uploads/demo-san-jose-restroom.jpg', 198765, 'Area Specific', CURRENT_DATE + INTERVAL '30 days'),
('PHOTO-004', 'SUB-DEMO-001', 'san-jose-breakroom.jpg', '/uploads/demo-san-jose-breakroom.jpg', 213456, 'Area Specific', CURRENT_DATE + INTERVAL '30 days');

-- Photos for Alameda submission
INSERT INTO photos (photo_id, submission_id, file_name, file_path, file_size, photo_type, retention_expiry) VALUES
('PHOTO-005', 'SUB-DEMO-002', 'alameda-before-1.jpg', '/uploads/demo-alameda-before-1.jpg', 256789, 'Before', CURRENT_DATE + INTERVAL '30 days'),
('PHOTO-006', 'SUB-DEMO-002', 'alameda-after-1.jpg', '/uploads/demo-alameda-after-1.jpg', 243210, 'After', CURRENT_DATE + INTERVAL '30 days'),
('PHOTO-007', 'SUB-DEMO-002', 'alameda-office.jpg', '/uploads/demo-alameda-office.jpg', 221234, 'Area Specific', CURRENT_DATE + INTERVAL '30 days');

-- Update photo counts
UPDATE submissions SET photo_count = 4 WHERE submission_id = 'SUB-DEMO-001';
UPDATE submissions SET photo_count = 3 WHERE submission_id = 'SUB-DEMO-002';

-- ========================================
-- COMPLETION MESSAGE
-- ========================================

DO $$
BEGIN
    RAISE NOTICE 'Demo seed data V2 created successfully!';
    RAISE NOTICE '✓ 1 checklist type (Crash Champions Housekeeping)';
    RAISE NOTICE '✓ 4 account managers (Jackie sees ALL, AM1/AM2/AM3 each manage 2)';
    RAISE NOTICE '✓ 4 subcontractors';
    RAISE NOTICE '✓ 6 Crash Champions locations (7-day service interval)';
    RAISE NOTICE '✓ 18 IVRs (6 expired Dec 2025, 6 current Jan 2026, 6 future Feb 2026)';
    RAISE NOTICE '✓ 2 sample submissions (San Jose: current, Alameda: stale)';
    RAISE NOTICE '✓ 7 photos attached to submissions';
END $$;
