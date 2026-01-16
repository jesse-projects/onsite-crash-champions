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
-- NOTE: Today is 2026-01-16
-- Current = 0-7 days ago | Stale = 8-10 days ago | Overdue = 11+ days ago or never

-- ========================================
-- CC-02015-SAN-JOSE (CURRENT - last service 6 days ago)
-- ========================================
INSERT INTO submissions (submission_id, location_id, checklist_id, ivr_id, subcontractor_id, account_manager_id, submitted_by, submitted_date, checklist_data, photo_count, notes) VALUES
-- Most recent: Jan 10 (6 days ago) - CURRENT
('SUB-CC-SJ-003', 'CC-02015-SAN-JOSE', 'CC_HOUSEKEEPING', 'IVR-CC-202601-CC-02015-SAN-JOSE', 'SUB-SPARKLE-002', 'AM_002',
'John Doe - Sparkle Pro', '2026-01-10 14:30:00', '{"header": {"cleaner_first_name": "John", "cleaner_last_name": "Doe", "cleaning_company_name": "Sparkle Pro Janitorial", "cleaning_date": "2026-01-10", "start_time": "13:00"}, "tasks": {"front_of_house_task_0": "complete", "front_of_house_task_1": "complete", "front_of_house_task_2": "complete", "front_of_house_task_3": "na", "front_of_house_task_4": "complete", "front_of_house_task_5": "complete", "front_of_house_task_6": "complete", "front_of_house_task_7": "complete", "front_of_house_task_8": "complete", "breakroom_task_0": "complete", "breakroom_task_1": "complete", "breakroom_task_2": "complete", "breakroom_task_3": "complete", "breakroom_task_4": "na", "breakroom_task_5": "na", "breakroom_task_6": "complete", "breakroom_task_7": "na", "breakroom_task_8": "complete", "restroom_task_0": "complete", "restroom_task_1": "complete", "restroom_task_2": "complete", "restroom_task_3": "na", "restroom_task_4": "complete", "restroom_task_5": "complete", "restroom_task_6": "complete", "restroom_task_7": "complete", "closing_duties_task_0": "complete", "closing_duties_task_1": "complete", "closing_duties_task_2": "complete", "closing_duties_task_3": "complete", "closing_duties_task_4": "complete", "closing_duties_task_5": "complete"}, "sectionNotes": {"front_of_house": "", "breakroom": "Microwave needs deep cleaning next visit", "restroom": "", "closing_duties": ""}, "signature": "John Doe"}', 4, 'Microwave needs deep cleaning next visit'),
-- Previous: Jan 3 (13 days ago) - from current IVR period
('SUB-CC-SJ-002', 'CC-02015-SAN-JOSE', 'CC_HOUSEKEEPING', 'IVR-CC-202601-CC-02015-SAN-JOSE', 'SUB-SPARKLE-002', 'AM_002',
'John Doe - Sparkle Pro', '2026-01-03 10:15:00', '{"header": {"cleaner_first_name": "John", "cleaner_last_name": "Doe", "cleaning_company_name": "Sparkle Pro Janitorial", "cleaning_date": "2026-01-03", "start_time": "09:00"}, "tasks": {"front_of_house_task_0": "complete", "front_of_house_task_1": "complete", "front_of_house_task_2": "complete", "front_of_house_task_3": "complete", "front_of_house_task_4": "complete", "front_of_house_task_5": "complete", "front_of_house_task_6": "complete", "front_of_house_task_7": "complete", "front_of_house_task_8": "complete", "breakroom_task_0": "complete", "breakroom_task_1": "complete", "breakroom_task_2": "complete", "breakroom_task_3": "complete", "breakroom_task_4": "complete", "breakroom_task_5": "complete", "breakroom_task_6": "complete", "breakroom_task_7": "complete", "breakroom_task_8": "complete", "restroom_task_0": "complete", "restroom_task_1": "complete", "restroom_task_2": "complete", "restroom_task_3": "complete", "restroom_task_4": "complete", "restroom_task_5": "complete", "restroom_task_6": "complete", "restroom_task_7": "complete", "closing_duties_task_0": "complete", "closing_duties_task_1": "complete", "closing_duties_task_2": "complete", "closing_duties_task_3": "complete", "closing_duties_task_4": "complete", "closing_duties_task_5": "complete"}, "sectionNotes": {"front_of_house": "", "breakroom": "", "restroom": "", "closing_duties": ""}, "signature": "John Doe"}', 3, ''),
-- Historical: Dec 27 (20 days ago) - from expired IVR period
('SUB-CC-SJ-001', 'CC-02015-SAN-JOSE', 'CC_HOUSEKEEPING', 'IVR-CC-202512-CC-02015-SAN-JOSE', 'SUB-SPARKLE-002', 'AM_002',
'John Doe - Sparkle Pro', '2025-12-27 11:45:00', '{"header": {"cleaner_first_name": "John", "cleaner_last_name": "Doe", "cleaning_company_name": "Sparkle Pro Janitorial", "cleaning_date": "2025-12-27", "start_time": "10:30"}, "tasks": {"front_of_house_task_0": "complete", "front_of_house_task_1": "complete", "front_of_house_task_2": "complete", "front_of_house_task_3": "complete", "front_of_house_task_4": "complete", "front_of_house_task_5": "complete", "front_of_house_task_6": "complete", "front_of_house_task_7": "complete", "front_of_house_task_8": "complete", "breakroom_task_0": "complete", "breakroom_task_1": "complete", "breakroom_task_2": "complete", "breakroom_task_3": "complete", "breakroom_task_4": "complete", "breakroom_task_5": "complete", "breakroom_task_6": "complete", "breakroom_task_7": "complete", "breakroom_task_8": "complete", "restroom_task_0": "complete", "restroom_task_1": "complete", "restroom_task_2": "complete", "restroom_task_3": "complete", "restroom_task_4": "complete", "restroom_task_5": "complete", "restroom_task_6": "complete", "restroom_task_7": "complete", "closing_duties_task_0": "complete", "closing_duties_task_1": "complete", "closing_duties_task_2": "complete", "closing_duties_task_3": "complete", "closing_duties_task_4": "complete", "closing_duties_task_5": "complete"}, "sectionNotes": {"front_of_house": "", "breakroom": "", "restroom": "", "closing_duties": ""}, "signature": "John Doe"}', 3, '');

-- ========================================
-- CC-01005-ALAMEDA (STALE - last service 8 days ago)
-- ========================================
INSERT INTO submissions (submission_id, location_id, checklist_id, ivr_id, subcontractor_id, account_manager_id, submitted_by, submitted_date, checklist_data, photo_count, notes) VALUES
-- Most recent: Jan 8 (8 days ago) - STALE
('SUB-CC-AL-003', 'CC-01005-ALAMEDA', 'CC_HOUSEKEEPING', 'IVR-CC-202601-CC-01005-ALAMEDA', 'SUB-ACME-001', 'AM_001',
'Jane Smith - ACME', '2026-01-08 09:15:00', '{"header": {"cleaner_first_name": "Jane", "cleaner_last_name": "Smith", "cleaning_company_name": "ACME Cleaning Services", "cleaning_date": "2026-01-08", "start_time": "08:00"}, "tasks": {"front_of_house_task_0": "complete", "front_of_house_task_1": "complete", "front_of_house_task_2": "complete", "front_of_house_task_3": "complete", "front_of_house_task_4": "complete", "front_of_house_task_5": "complete", "front_of_house_task_6": "complete", "front_of_house_task_7": "complete", "front_of_house_task_8": "complete", "breakroom_task_0": "complete", "breakroom_task_1": "complete", "breakroom_task_2": "complete", "breakroom_task_3": "complete", "breakroom_task_4": "complete", "breakroom_task_5": "complete", "breakroom_task_6": "complete", "breakroom_task_7": "complete", "breakroom_task_8": "complete", "restroom_task_0": "complete", "restroom_task_1": "complete", "restroom_task_2": "complete", "restroom_task_3": "complete", "restroom_task_4": "complete", "restroom_task_5": "complete", "restroom_task_6": "complete", "restroom_task_7": "complete", "closing_duties_task_0": "complete", "closing_duties_task_1": "complete", "closing_duties_task_2": "complete", "closing_duties_task_3": "complete", "closing_duties_task_4": "complete", "closing_duties_task_5": "complete"}, "sectionNotes": {"front_of_house": "", "breakroom": "", "restroom": "", "closing_duties": ""}, "signature": "Jane Smith"}', 3, ''),
-- Previous: Jan 1 (15 days ago) - from current IVR period
('SUB-CC-AL-002', 'CC-01005-ALAMEDA', 'CC_HOUSEKEEPING', 'IVR-CC-202601-CC-01005-ALAMEDA', 'SUB-ACME-001', 'AM_001',
'Jane Smith - ACME', '2026-01-01 13:20:00', '{"header": {"cleaner_first_name": "Jane", "cleaner_last_name": "Smith", "cleaning_company_name": "ACME Cleaning Services", "cleaning_date": "2026-01-01", "start_time": "12:00"}, "tasks": {"front_of_house_task_0": "complete", "front_of_house_task_1": "complete", "front_of_house_task_2": "complete", "front_of_house_task_3": "complete", "front_of_house_task_4": "complete", "front_of_house_task_5": "complete", "front_of_house_task_6": "complete", "front_of_house_task_7": "complete", "front_of_house_task_8": "complete", "breakroom_task_0": "complete", "breakroom_task_1": "complete", "breakroom_task_2": "complete", "breakroom_task_3": "complete", "breakroom_task_4": "complete", "breakroom_task_5": "complete", "breakroom_task_6": "complete", "breakroom_task_7": "complete", "breakroom_task_8": "complete", "restroom_task_0": "complete", "restroom_task_1": "complete", "restroom_task_2": "complete", "restroom_task_3": "complete", "restroom_task_4": "complete", "restroom_task_5": "complete", "restroom_task_6": "complete", "restroom_task_7": "complete", "closing_duties_task_0": "complete", "closing_duties_task_1": "complete", "closing_duties_task_2": "complete", "closing_duties_task_3": "complete", "closing_duties_task_4": "complete", "closing_duties_task_5": "complete"}, "sectionNotes": {"front_of_house": "", "breakroom": "", "restroom": "", "closing_duties": ""}, "signature": "Jane Smith"}', 3, ''),
-- Historical: Dec 24 (23 days ago) - from expired IVR period
('SUB-CC-AL-001', 'CC-01005-ALAMEDA', 'CC_HOUSEKEEPING', 'IVR-CC-202512-CC-01005-ALAMEDA', 'SUB-ACME-001', 'AM_001',
'Jane Smith - ACME', '2025-12-24 10:30:00', '{"header": {"cleaner_first_name": "Jane", "cleaner_last_name": "Smith", "cleaning_company_name": "ACME Cleaning Services", "cleaning_date": "2025-12-24", "start_time": "09:15"}, "tasks": {"front_of_house_task_0": "complete", "front_of_house_task_1": "complete", "front_of_house_task_2": "complete", "front_of_house_task_3": "complete", "front_of_house_task_4": "complete", "front_of_house_task_5": "complete", "front_of_house_task_6": "complete", "front_of_house_task_7": "complete", "front_of_house_task_8": "complete", "breakroom_task_0": "complete", "breakroom_task_1": "complete", "breakroom_task_2": "complete", "breakroom_task_3": "complete", "breakroom_task_4": "complete", "breakroom_task_5": "complete", "breakroom_task_6": "complete", "breakroom_task_7": "complete", "breakroom_task_8": "complete", "restroom_task_0": "complete", "restroom_task_1": "complete", "restroom_task_2": "complete", "restroom_task_3": "complete", "restroom_task_4": "complete", "restroom_task_5": "complete", "restroom_task_6": "complete", "restroom_task_7": "complete", "closing_duties_task_0": "complete", "closing_duties_task_1": "complete", "closing_duties_task_2": "complete", "closing_duties_task_3": "complete", "closing_duties_task_4": "complete", "closing_duties_task_5": "complete"}, "sectionNotes": {"front_of_house": "", "breakroom": "", "restroom": "", "closing_duties": ""}, "signature": "Jane Smith"}', 3, '');

-- ========================================
-- CC-01042-OAKLAND (CURRENT - last service 5 days ago)
-- ========================================
INSERT INTO submissions (submission_id, location_id, checklist_id, ivr_id, subcontractor_id, account_manager_id, submitted_by, submitted_date, checklist_data, photo_count, notes) VALUES
-- Most recent: Jan 11 (5 days ago) - CURRENT
('SUB-CC-OK-002', 'CC-01042-OAKLAND', 'CC_HOUSEKEEPING', 'IVR-CC-202601-CC-01042-OAKLAND', 'SUB-ACME-001', 'AM_001',
'Carlos Rodriguez - ACME', '2026-01-11 08:45:00', '{"header": {"cleaner_first_name": "Carlos", "cleaner_last_name": "Rodriguez", "cleaning_company_name": "ACME Cleaning Services", "cleaning_date": "2026-01-11", "start_time": "07:30"}, "tasks": {"front_of_house_task_0": "complete", "front_of_house_task_1": "complete", "front_of_house_task_2": "complete", "front_of_house_task_3": "complete", "front_of_house_task_4": "complete", "front_of_house_task_5": "complete", "front_of_house_task_6": "complete", "front_of_house_task_7": "complete", "front_of_house_task_8": "complete", "breakroom_task_0": "complete", "breakroom_task_1": "complete", "breakroom_task_2": "complete", "breakroom_task_3": "complete", "breakroom_task_4": "complete", "breakroom_task_5": "complete", "breakroom_task_6": "complete", "breakroom_task_7": "complete", "breakroom_task_8": "complete", "restroom_task_0": "complete", "restroom_task_1": "complete", "restroom_task_2": "complete", "restroom_task_3": "complete", "restroom_task_4": "complete", "restroom_task_5": "complete", "restroom_task_6": "complete", "restroom_task_7": "complete", "closing_duties_task_0": "complete", "closing_duties_task_1": "complete", "closing_duties_task_2": "complete", "closing_duties_task_3": "complete", "closing_duties_task_4": "complete", "closing_duties_task_5": "complete"}, "sectionNotes": {"front_of_house": "", "breakroom": "", "restroom": "Sink drain slow - may need maintenance", "closing_duties": ""}, "signature": "Carlos Rodriguez"}', 3, 'Sink drain slow'),
-- Previous: Jan 4 (12 days ago)
('SUB-CC-OK-001', 'CC-01042-OAKLAND', 'CC_HOUSEKEEPING', 'IVR-CC-202601-CC-01042-OAKLAND', 'SUB-ACME-001', 'AM_001',
'Carlos Rodriguez - ACME', '2026-01-04 09:00:00', '{"header": {"cleaner_first_name": "Carlos", "cleaner_last_name": "Rodriguez", "cleaning_company_name": "ACME Cleaning Services", "cleaning_date": "2026-01-04", "start_time": "08:00"}, "tasks": {"front_of_house_task_0": "complete", "front_of_house_task_1": "complete", "front_of_house_task_2": "complete", "front_of_house_task_3": "complete", "front_of_house_task_4": "complete", "front_of_house_task_5": "complete", "front_of_house_task_6": "complete", "front_of_house_task_7": "complete", "front_of_house_task_8": "complete", "breakroom_task_0": "complete", "breakroom_task_1": "complete", "breakroom_task_2": "complete", "breakroom_task_3": "complete", "breakroom_task_4": "complete", "breakroom_task_5": "complete", "breakroom_task_6": "complete", "breakroom_task_7": "complete", "breakroom_task_8": "complete", "restroom_task_0": "complete", "restroom_task_1": "complete", "restroom_task_2": "complete", "restroom_task_3": "complete", "restroom_task_4": "complete", "restroom_task_5": "complete", "restroom_task_6": "complete", "restroom_task_7": "complete", "closing_duties_task_0": "complete", "closing_duties_task_1": "complete", "closing_duties_task_2": "complete", "closing_duties_task_3": "complete", "closing_duties_task_4": "complete", "closing_duties_task_5": "complete"}, "sectionNotes": {"front_of_house": "", "breakroom": "", "restroom": "", "closing_duties": ""}, "signature": "Carlos Rodriguez"}', 3, '');

-- ========================================
-- CC-02088-FREMONT (OVERDUE - last service 12 days ago)
-- ========================================
INSERT INTO submissions (submission_id, location_id, checklist_id, ivr_id, subcontractor_id, account_manager_id, submitted_by, submitted_date, checklist_data, photo_count, notes) VALUES
-- Most recent: Jan 4 (12 days ago) - OVERDUE
('SUB-CC-FR-001', 'CC-02088-FREMONT', 'CC_HOUSEKEEPING', 'IVR-CC-202601-CC-02088-FREMONT', 'SUB-SPARKLE-002', 'AM_002',
'Maria Garcia - Sparkle Pro', '2026-01-04 15:20:00', '{"header": {"cleaner_first_name": "Maria", "cleaner_last_name": "Garcia", "cleaning_company_name": "Sparkle Pro Janitorial", "cleaning_date": "2026-01-04", "start_time": "14:00"}, "tasks": {"front_of_house_task_0": "complete", "front_of_house_task_1": "complete", "front_of_house_task_2": "complete", "front_of_house_task_3": "complete", "front_of_house_task_4": "complete", "front_of_house_task_5": "complete", "front_of_house_task_6": "complete", "front_of_house_task_7": "complete", "front_of_house_task_8": "complete", "breakroom_task_0": "complete", "breakroom_task_1": "complete", "breakroom_task_2": "incomplete", "breakroom_task_3": "complete", "breakroom_task_4": "complete", "breakroom_task_5": "complete", "breakroom_task_6": "complete", "breakroom_task_7": "complete", "breakroom_task_8": "complete", "restroom_task_0": "complete", "restroom_task_1": "complete", "restroom_task_2": "complete", "restroom_task_3": "complete", "restroom_task_4": "complete", "restroom_task_5": "complete", "restroom_task_6": "complete", "restroom_task_7": "complete", "closing_duties_task_0": "complete", "closing_duties_task_1": "complete", "closing_duties_task_2": "complete", "closing_duties_task_3": "complete", "closing_duties_task_4": "complete", "closing_duties_task_5": "complete"}, "sectionNotes": {"front_of_house": "", "breakroom": "Microwave broken - needs replacement", "restroom": "", "closing_duties": ""}, "signature": "Maria Garcia"}', 3, 'Microwave broken');

-- ========================================
-- CC-03056-ROSEVILLE (STALE - last service 9 days ago)
-- ========================================
INSERT INTO submissions (submission_id, location_id, checklist_id, ivr_id, subcontractor_id, account_manager_id, submitted_by, submitted_date, checklist_data, photo_count, notes) VALUES
-- Most recent: Jan 7 (9 days ago) - STALE
('SUB-CC-RV-002', 'CC-03056-ROSEVILLE', 'CC_HOUSEKEEPING', 'IVR-CC-202601-CC-03056-ROSEVILLE', 'SUB-CLEANTEAM-003', 'AM_003',
'David Lee - CleanTeam', '2026-01-07 11:00:00', '{"header": {"cleaner_first_name": "David", "cleaner_last_name": "Lee", "cleaning_company_name": "CleanTeam Solutions", "cleaning_date": "2026-01-07", "start_time": "10:00"}, "tasks": {"front_of_house_task_0": "complete", "front_of_house_task_1": "complete", "front_of_house_task_2": "complete", "front_of_house_task_3": "complete", "front_of_house_task_4": "complete", "front_of_house_task_5": "complete", "front_of_house_task_6": "complete", "front_of_house_task_7": "complete", "front_of_house_task_8": "complete", "breakroom_task_0": "complete", "breakroom_task_1": "complete", "breakroom_task_2": "complete", "breakroom_task_3": "complete", "breakroom_task_4": "complete", "breakroom_task_5": "complete", "breakroom_task_6": "complete", "breakroom_task_7": "complete", "breakroom_task_8": "complete", "restroom_task_0": "complete", "restroom_task_1": "complete", "restroom_task_2": "complete", "restroom_task_3": "complete", "restroom_task_4": "complete", "restroom_task_5": "complete", "restroom_task_6": "complete", "restroom_task_7": "complete", "closing_duties_task_0": "complete", "closing_duties_task_1": "complete", "closing_duties_task_2": "complete", "closing_duties_task_3": "complete", "closing_duties_task_4": "complete", "closing_duties_task_5": "complete"}, "sectionNotes": {"front_of_house": "", "breakroom": "", "restroom": "", "closing_duties": ""}, "signature": "David Lee"}', 3, ''),
-- Previous: Dec 30 (17 days ago)
('SUB-CC-RV-001', 'CC-03056-ROSEVILLE', 'CC_HOUSEKEEPING', 'IVR-CC-202512-CC-03056-ROSEVILLE', 'SUB-CLEANTEAM-003', 'AM_003',
'David Lee - CleanTeam', '2025-12-30 12:15:00', '{"header": {"cleaner_first_name": "David", "cleaner_last_name": "Lee", "cleaning_company_name": "CleanTeam Solutions", "cleaning_date": "2025-12-30", "start_time": "11:00"}, "tasks": {"front_of_house_task_0": "complete", "front_of_house_task_1": "complete", "front_of_house_task_2": "complete", "front_of_house_task_3": "complete", "front_of_house_task_4": "complete", "front_of_house_task_5": "complete", "front_of_house_task_6": "complete", "front_of_house_task_7": "complete", "front_of_house_task_8": "complete", "breakroom_task_0": "complete", "breakroom_task_1": "complete", "breakroom_task_2": "complete", "breakroom_task_3": "complete", "breakroom_task_4": "complete", "breakroom_task_5": "complete", "breakroom_task_6": "complete", "breakroom_task_7": "complete", "breakroom_task_8": "complete", "restroom_task_0": "complete", "restroom_task_1": "complete", "restroom_task_2": "complete", "restroom_task_3": "complete", "restroom_task_4": "complete", "restroom_task_5": "complete", "restroom_task_6": "complete", "restroom_task_7": "complete", "closing_duties_task_0": "complete", "closing_duties_task_1": "complete", "closing_duties_task_2": "complete", "closing_duties_task_3": "complete", "closing_duties_task_4": "complete", "closing_duties_task_5": "complete"}, "sectionNotes": {"front_of_house": "", "breakroom": "", "restroom": "", "closing_duties": ""}, "signature": "David Lee"}', 3, '');

-- ========================================
-- CC-03024-SACRAMENTO (OVERDUE - never serviced)
-- ========================================
-- NO SUBMISSIONS - This location has never been serviced (will show as OVERDUE)

-- ========================================
-- SAMPLE PHOTOS (for demo submissions)
-- ========================================

-- Photos for San Jose most recent submission
INSERT INTO photos (photo_id, submission_id, file_name, file_path, file_size, photo_type, retention_expiry) VALUES
('PHOTO-SJ-003-001', 'SUB-CC-SJ-003', 'san-jose-before-20260110.jpg', '/uploads/san-jose-before-20260110.jpg', 245678, 'Before', CURRENT_DATE + INTERVAL '30 days'),
('PHOTO-SJ-003-002', 'SUB-CC-SJ-003', 'san-jose-after-20260110.jpg', '/uploads/san-jose-after-20260110.jpg', 234567, 'After', CURRENT_DATE + INTERVAL '30 days'),
('PHOTO-SJ-003-003', 'SUB-CC-SJ-003', 'san-jose-restroom-20260110.jpg', '/uploads/san-jose-restroom-20260110.jpg', 198765, 'Area Specific', CURRENT_DATE + INTERVAL '30 days'),
('PHOTO-SJ-003-004', 'SUB-CC-SJ-003', 'san-jose-breakroom-20260110.jpg', '/uploads/san-jose-breakroom-20260110.jpg', 213456, 'Area Specific', CURRENT_DATE + INTERVAL '30 days');

-- Photos for San Jose previous submission
INSERT INTO photos (photo_id, submission_id, file_name, file_path, file_size, photo_type, retention_expiry) VALUES
('PHOTO-SJ-002-001', 'SUB-CC-SJ-002', 'san-jose-before-20260103.jpg', '/uploads/san-jose-before-20260103.jpg', 245678, 'Before', CURRENT_DATE + INTERVAL '30 days'),
('PHOTO-SJ-002-002', 'SUB-CC-SJ-002', 'san-jose-after-20260103.jpg', '/uploads/san-jose-after-20260103.jpg', 234567, 'After', CURRENT_DATE + INTERVAL '30 days'),
('PHOTO-SJ-002-003', 'SUB-CC-SJ-002', 'san-jose-office-20260103.jpg', '/uploads/san-jose-office-20260103.jpg', 198765, 'Area Specific', CURRENT_DATE + INTERVAL '30 days');

-- Photos for Alameda most recent submission
INSERT INTO photos (photo_id, submission_id, file_name, file_path, file_size, photo_type, retention_expiry) VALUES
('PHOTO-AL-003-001', 'SUB-CC-AL-003', 'alameda-before-20260108.jpg', '/uploads/alameda-before-20260108.jpg', 256789, 'Before', CURRENT_DATE + INTERVAL '30 days'),
('PHOTO-AL-003-002', 'SUB-CC-AL-003', 'alameda-after-20260108.jpg', '/uploads/alameda-after-20260108.jpg', 243210, 'After', CURRENT_DATE + INTERVAL '30 days'),
('PHOTO-AL-003-003', 'SUB-CC-AL-003', 'alameda-office-20260108.jpg', '/uploads/alameda-office-20260108.jpg', 221234, 'Area Specific', CURRENT_DATE + INTERVAL '30 days');

-- Photos for Alameda previous submission
INSERT INTO photos (photo_id, submission_id, file_name, file_path, file_size, photo_type, retention_expiry) VALUES
('PHOTO-AL-002-001', 'SUB-CC-AL-002', 'alameda-before-20260101.jpg', '/uploads/alameda-before-20260101.jpg', 256789, 'Before', CURRENT_DATE + INTERVAL '30 days'),
('PHOTO-AL-002-002', 'SUB-CC-AL-002', 'alameda-after-20260101.jpg', '/uploads/alameda-after-20260101.jpg', 243210, 'After', CURRENT_DATE + INTERVAL '30 days'),
('PHOTO-AL-002-003', 'SUB-CC-AL-002', 'alameda-breakroom-20260101.jpg', '/uploads/alameda-breakroom-20260101.jpg', 221234, 'Area Specific', CURRENT_DATE + INTERVAL '30 days');

-- Photos for Oakland most recent submission
INSERT INTO photos (photo_id, submission_id, file_name, file_path, file_size, photo_type, retention_expiry) VALUES
('PHOTO-OK-002-001', 'SUB-CC-OK-002', 'oakland-before-20260111.jpg', '/uploads/oakland-before-20260111.jpg', 245678, 'Before', CURRENT_DATE + INTERVAL '30 days'),
('PHOTO-OK-002-002', 'SUB-CC-OK-002', 'oakland-after-20260111.jpg', '/uploads/oakland-after-20260111.jpg', 234567, 'After', CURRENT_DATE + INTERVAL '30 days'),
('PHOTO-OK-002-003', 'SUB-CC-OK-002', 'oakland-restroom-20260111.jpg', '/uploads/oakland-restroom-20260111.jpg', 198765, 'Area Specific', CURRENT_DATE + INTERVAL '30 days');

-- Photos for Oakland previous submission
INSERT INTO photos (photo_id, submission_id, file_name, file_path, file_size, photo_type, retention_expiry) VALUES
('PHOTO-OK-001-001', 'SUB-CC-OK-001', 'oakland-before-20260104.jpg', '/uploads/oakland-before-20260104.jpg', 245678, 'Before', CURRENT_DATE + INTERVAL '30 days'),
('PHOTO-OK-001-002', 'SUB-CC-OK-001', 'oakland-after-20260104.jpg', '/uploads/oakland-after-20260104.jpg', 234567, 'After', CURRENT_DATE + INTERVAL '30 days'),
('PHOTO-OK-001-003', 'SUB-CC-OK-001', 'oakland-office-20260104.jpg', '/uploads/oakland-office-20260104.jpg', 198765, 'Area Specific', CURRENT_DATE + INTERVAL '30 days');

-- Photos for Fremont submission
INSERT INTO photos (photo_id, submission_id, file_name, file_path, file_size, photo_type, retention_expiry) VALUES
('PHOTO-FR-001-001', 'SUB-CC-FR-001', 'fremont-before-20260104.jpg', '/uploads/fremont-before-20260104.jpg', 245678, 'Before', CURRENT_DATE + INTERVAL '30 days'),
('PHOTO-FR-001-002', 'SUB-CC-FR-001', 'fremont-after-20260104.jpg', '/uploads/fremont-after-20260104.jpg', 234567, 'After', CURRENT_DATE + INTERVAL '30 days'),
('PHOTO-FR-001-003', 'SUB-CC-FR-001', 'fremont-breakroom-20260104.jpg', '/uploads/fremont-breakroom-20260104.jpg', 198765, 'Area Specific', CURRENT_DATE + INTERVAL '30 days');

-- Photos for Roseville most recent submission
INSERT INTO photos (photo_id, submission_id, file_name, file_path, file_size, photo_type, retention_expiry) VALUES
('PHOTO-RV-002-001', 'SUB-CC-RV-002', 'roseville-before-20260107.jpg', '/uploads/roseville-before-20260107.jpg', 245678, 'Before', CURRENT_DATE + INTERVAL '30 days'),
('PHOTO-RV-002-002', 'SUB-CC-RV-002', 'roseville-after-20260107.jpg', '/uploads/roseville-after-20260107.jpg', 234567, 'After', CURRENT_DATE + INTERVAL '30 days'),
('PHOTO-RV-002-003', 'SUB-CC-RV-002', 'roseville-office-20260107.jpg', '/uploads/roseville-office-20260107.jpg', 198765, 'Area Specific', CURRENT_DATE + INTERVAL '30 days');

-- Photos for Roseville previous submission
INSERT INTO photos (photo_id, submission_id, file_name, file_path, file_size, photo_type, retention_expiry) VALUES
('PHOTO-RV-001-001', 'SUB-CC-RV-001', 'roseville-before-20251230.jpg', '/uploads/roseville-before-20251230.jpg', 245678, 'Before', CURRENT_DATE + INTERVAL '30 days'),
('PHOTO-RV-001-002', 'SUB-CC-RV-001', 'roseville-after-20251230.jpg', '/uploads/roseville-after-20251230.jpg', 234567, 'After', CURRENT_DATE + INTERVAL '30 days'),
('PHOTO-RV-001-003', 'SUB-CC-RV-001', 'roseville-restroom-20251230.jpg', '/uploads/roseville-restroom-20251230.jpg', 198765, 'Area Specific', CURRENT_DATE + INTERVAL '30 days');

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
    RAISE NOTICE '✓ 12 submissions with service history:';
    RAISE NOTICE '  - San Jose (CURRENT): 3 submissions (6, 13, 20 days ago)';
    RAISE NOTICE '  - Alameda (STALE): 3 submissions (8, 15, 23 days ago)';
    RAISE NOTICE '  - Oakland (CURRENT): 2 submissions (5, 12 days ago)';
    RAISE NOTICE '  - Fremont (OVERDUE): 1 submission (12 days ago)';
    RAISE NOTICE '  - Roseville (STALE): 2 submissions (9, 17 days ago)';
    RAISE NOTICE '  - Sacramento (OVERDUE): Never serviced';
    RAISE NOTICE '✓ 27 photos attached to submissions';
    RAISE NOTICE '';
    RAISE NOTICE 'Status distribution (as of 2026-01-16):';
    RAISE NOTICE '  - 2 CURRENT (San Jose, Oakland)';
    RAISE NOTICE '  - 2 STALE (Alameda, Roseville)';
    RAISE NOTICE '  - 2 OVERDUE (Fremont, Sacramento)';
END $$;
