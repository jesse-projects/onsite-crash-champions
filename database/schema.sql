-- OnSite Checklist System Database Schema
-- Created: 2026-01-15
-- Description: Multi-tenant checklist management for service tracking

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ========================================
-- TABLE: Checklists (Multi-Tenant Support)
-- ========================================
CREATE TABLE IF NOT EXISTS checklists (
    checklist_id VARCHAR(50) PRIMARY KEY,
    checklist_name VARCHAR(255) NOT NULL,
    client_code VARCHAR(10) NOT NULL,
    checklist_config JSONB NOT NULL DEFAULT '{}', -- Field definitions, validation rules
    is_active BOOLEAN DEFAULT true,
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    modified_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE checklists IS 'Multi-tenant checklist types (e.g., CC_HOUSEKEEPING for Crash Champions)';
COMMENT ON COLUMN checklists.checklist_config IS 'JSON configuration for checklist fields and validation rules';

-- ========================================
-- TABLE: AccountManagers
-- ========================================
CREATE TABLE IF NOT EXISTS account_managers (
    account_manager_id VARCHAR(50) PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(20),
    password_hash VARCHAR(255), -- For login authentication
    is_active BOOLEAN DEFAULT true,
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE account_managers IS 'Account managers who oversee locations and services';

-- ========================================
-- TABLE: Subcontractors
-- ========================================
CREATE TABLE IF NOT EXISTS subcontractors (
    subcontractor_id VARCHAR(50) PRIMARY KEY,
    subcontractor_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    is_active BOOLEAN DEFAULT true,
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE subcontractors IS 'Subcontractors who perform services at locations';

-- ========================================
-- TABLE: Locations
-- ========================================
CREATE TABLE IF NOT EXISTS locations (
    location_id VARCHAR(50) PRIMARY KEY, -- Human-readable: CC-01005-ALAMEDA
    checklist_id VARCHAR(50) NOT NULL,
    location_name VARCHAR(255) NOT NULL,
    address VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(10),
    zip VARCHAR(10),
    region VARCHAR(100),
    subcontractor_id VARCHAR(50),
    account_manager_id VARCHAR(50),
    internal_wo VARCHAR(50) NOT NULL, -- Static work order number (financial anchor)
    monthly_cost DECIMAL(10,2),
    is_active BOOLEAN DEFAULT true,
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    modified_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (checklist_id) REFERENCES checklists(checklist_id) ON DELETE RESTRICT,
    FOREIGN KEY (subcontractor_id) REFERENCES subcontractors(subcontractor_id) ON DELETE SET NULL,
    FOREIGN KEY (account_manager_id) REFERENCES account_managers(account_manager_id) ON DELETE SET NULL
);

COMMENT ON TABLE locations IS 'Service locations (e.g., Crash Champions sites)';
COMMENT ON COLUMN locations.internal_wo IS 'Static internal work order number - financial anchor for billing';

-- ========================================
-- TABLE: IVRs (ServiceChannel Integration)
-- ========================================
CREATE TABLE IF NOT EXISTS ivrs (
    ivr_id VARCHAR(50) PRIMARY KEY,
    location_id VARCHAR(50) NOT NULL,
    ivr_ticket_number VARCHAR(100) NOT NULL,
    start_date DATE NOT NULL, -- When this IVR becomes active
    expiration_date DATE NOT NULL, -- When this IVR expires
    period_label VARCHAR(50), -- e.g., "2025-02", "Q1-2025"
    import_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (location_id) REFERENCES locations(location_id) ON DELETE CASCADE
);

COMMENT ON TABLE ivrs IS 'ServiceChannel IVR tickets (1 per location per period)';
COMMENT ON COLUMN ivrs.start_date IS 'Date when this IVR becomes active for new services';
COMMENT ON COLUMN ivrs.expiration_date IS 'Date when this IVR expires (show warning in UI)';

-- ========================================
-- TABLE: Services (Flexible Intervals)
-- ========================================
CREATE TABLE IF NOT EXISTS services (
    service_id VARCHAR(100) PRIMARY KEY, -- Human-readable: CC-01005-ALAMEDA_SUB-ACME-001_00042
    location_id VARCHAR(50) NOT NULL,
    checklist_id VARCHAR(50) NOT NULL,
    ivr_id VARCHAR(50),
    internal_wo VARCHAR(50) NOT NULL, -- Denormalized for easy billing export
    subcontractor_id VARCHAR(50),
    account_manager_id VARCHAR(50), -- Denormalized from location
    period_label VARCHAR(50), -- e.g., "2025-02", "Week 1"
    service_number INT, -- Sequence within period
    scheduled_date DATE,
    status VARCHAR(50) DEFAULT 'Not Started', -- Not Started, In Progress, Completed, Incomplete, Overdue
    submitted_date TIMESTAMP,
    validated_date TIMESTAMP,
    validated_by VARCHAR(50), -- AccountManagerID who validated
    error_flag BOOLEAN DEFAULT false,
    error_notes TEXT,
    service_channel_upload_status VARCHAR(50) DEFAULT 'Pending', -- Pending, Sent, Failed
    cloud_storage_path VARCHAR(500),
    billing_status VARCHAR(50) DEFAULT 'Not Billable', -- Not Billable, Staged, Invoiced
    evergreen_link VARCHAR(255), -- Permanent link: /checklist/CC-01005-ALAMEDA
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    modified_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (location_id) REFERENCES locations(location_id) ON DELETE CASCADE,
    FOREIGN KEY (checklist_id) REFERENCES checklists(checklist_id) ON DELETE RESTRICT,
    FOREIGN KEY (ivr_id) REFERENCES ivrs(ivr_id) ON DELETE SET NULL,
    FOREIGN KEY (subcontractor_id) REFERENCES subcontractors(subcontractor_id) ON DELETE SET NULL,
    FOREIGN KEY (account_manager_id) REFERENCES account_managers(account_manager_id) ON DELETE SET NULL
);

COMMENT ON TABLE services IS 'Service instances - one per scheduled service at a location';
COMMENT ON COLUMN services.evergreen_link IS 'Permanent URL subcontractors can bookmark';

-- ========================================
-- TABLE: ChecklistSubmissions
-- ========================================
CREATE TABLE IF NOT EXISTS checklist_submissions (
    submission_id VARCHAR(50) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    service_id VARCHAR(100) NOT NULL,
    submitted_by VARCHAR(255), -- Subcontractor name/email
    submitted_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    checklist_data JSONB NOT NULL DEFAULT '{}', -- Serialized checklist responses
    photo_count INT DEFAULT 0,
    notes TEXT,

    FOREIGN KEY (service_id) REFERENCES services(service_id) ON DELETE CASCADE
);

COMMENT ON TABLE checklist_submissions IS 'Actual submitted checklists from subcontractors';
COMMENT ON COLUMN checklist_submissions.checklist_data IS 'JSON containing all checklist field responses';

-- ========================================
-- TABLE: Photos
-- ========================================
CREATE TABLE IF NOT EXISTS photos (
    photo_id VARCHAR(50) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    submission_id VARCHAR(50) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size INT, -- Bytes
    upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    photo_type VARCHAR(50), -- Before, After, Area Specific
    retention_expiry DATE, -- 30-day rolling retention

    FOREIGN KEY (submission_id) REFERENCES checklist_submissions(submission_id) ON DELETE CASCADE
);

COMMENT ON TABLE photos IS 'Photos attached to checklist submissions';
COMMENT ON COLUMN photos.retention_expiry IS 'Date after which photo can be deleted (30-day retention)';

-- ========================================
-- TABLE: BillingStagingTable
-- ========================================
CREATE TABLE IF NOT EXISTS billing_staging (
    billing_id VARCHAR(50) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    service_id VARCHAR(100) NOT NULL,
    internal_wo VARCHAR(50) NOT NULL, -- Financial anchor
    location_id VARCHAR(50) NOT NULL,
    service_date DATE NOT NULL,
    period_label VARCHAR(50),
    service_number INT,
    billing_status VARCHAR(50) DEFAULT 'Staged', -- Staged, Exported, Invoiced
    export_date TIMESTAMP,
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (service_id) REFERENCES services(service_id) ON DELETE CASCADE
);

COMMENT ON TABLE billing_staging IS 'Staging table for WOMS billing integration';
COMMENT ON COLUMN billing_staging.internal_wo IS 'Financial anchor - drives payment/invoicing';

-- ========================================
-- INDEXES
-- ========================================

-- Locations indexes
CREATE INDEX idx_locations_checklist ON locations(checklist_id);
CREATE INDEX idx_locations_subcontractor ON locations(subcontractor_id);
CREATE INDEX idx_locations_account_manager ON locations(account_manager_id);
CREATE INDEX idx_locations_active ON locations(is_active);

-- IVRs indexes
CREATE INDEX idx_ivrs_location ON ivrs(location_id);
CREATE INDEX idx_ivrs_dates ON ivrs(start_date, expiration_date);
CREATE INDEX idx_ivrs_period ON ivrs(period_label);

-- Services indexes
CREATE INDEX idx_services_location ON services(location_id);
CREATE INDEX idx_services_checklist ON services(checklist_id);
CREATE INDEX idx_services_ivr ON services(ivr_id);
CREATE INDEX idx_services_status ON services(status);
CREATE INDEX idx_services_account_manager ON services(account_manager_id);
CREATE INDEX idx_services_scheduled_date ON services(scheduled_date);
CREATE INDEX idx_services_evergreen ON services(evergreen_link);

-- Submissions indexes
CREATE INDEX idx_submissions_service ON checklist_submissions(service_id);
CREATE INDEX idx_submissions_date ON checklist_submissions(submitted_date);

-- Photos indexes
CREATE INDEX idx_photos_submission ON photos(submission_id);
CREATE INDEX idx_photos_retention ON photos(retention_expiry);

-- Billing indexes
CREATE INDEX idx_billing_service ON billing_staging(service_id);
CREATE INDEX idx_billing_status ON billing_staging(billing_status);
CREATE INDEX idx_billing_internal_wo ON billing_staging(internal_wo);

-- ========================================
-- FUNCTIONS & TRIGGERS
-- ========================================

-- Update modified_date trigger
CREATE OR REPLACE FUNCTION update_modified_date()
RETURNS TRIGGER AS $$
BEGIN
    NEW.modified_date = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_checklists_modified
    BEFORE UPDATE ON checklists
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_date();

CREATE TRIGGER trigger_locations_modified
    BEFORE UPDATE ON locations
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_date();

CREATE TRIGGER trigger_services_modified
    BEFORE UPDATE ON services
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_date();

-- ========================================
-- GRANTS (if needed for specific user)
-- ========================================

-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO onsite;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO onsite;

-- ========================================
-- COMPLETION MESSAGE
-- ========================================

DO $$
BEGIN
    RAISE NOTICE 'OnSite database schema created successfully!';
    RAISE NOTICE 'Tables: checklists, account_managers, subcontractors, locations, ivrs, services, checklist_submissions, photos, billing_staging';
END $$;
