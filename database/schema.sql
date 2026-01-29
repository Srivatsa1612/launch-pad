-- flowCUSTODIAN Wizard Database Schema
-- For Microsoft Fabric Lakehouse
-- This schema will be created via Spark SQL through Livy API

-- Main wizard sessions table
CREATE TABLE IF NOT EXISTS wizard_sessions (
    session_id STRING,
    company_name STRING,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    completed_at TIMESTAMP,
    current_step INT,
    status STRING,  -- 'in_progress', 'completed', 'abandoned'
    PRIMARY KEY (session_id)
) USING DELTA;

-- Key contacts information
CREATE TABLE IF NOT EXISTS key_contacts (
    contact_id STRING,
    session_id STRING,
    billing_name STRING,
    billing_email STRING,
    billing_phone STRING,
    tech_name STRING,
    tech_email STRING,
    tech_phone STRING,
    emergency_name STRING,
    emergency_email STRING,
    emergency_phone STRING,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    PRIMARY KEY (contact_id),
    FOREIGN KEY (session_id) REFERENCES wizard_sessions(session_id)
) USING DELTA;

-- Service order details
CREATE TABLE IF NOT EXISTS service_orders (
    order_id STRING,
    session_id STRING,
    service_tier STRING,  -- 'Enterprise Elite', 'Professional', etc.
    start_date DATE,
    contract_term INT,  -- in months
    monthly_commitment DECIMAL(10,2),
    included_features STRING,  -- JSON array stored as string
    confirmation_accepted BOOLEAN,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    PRIMARY KEY (order_id),
    FOREIGN KEY (session_id) REFERENCES wizard_sessions(session_id)
) USING DELTA;

-- HR / People setup
CREATE TABLE IF NOT EXISTS hr_setup (
    hr_setup_id STRING,
    session_id STRING,
    hris_system STRING,  -- 'Workday', 'BambooHR', 'ADP', etc.
    update_method STRING,  -- 'API', 'CSV Upload', 'Manual', etc.
    employee_file_path STRING,  -- Storage path for uploaded file
    employee_count INT,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    PRIMARY KEY (hr_setup_id),
    FOREIGN KEY (session_id) REFERENCES wizard_sessions(session_id)
) USING DELTA;

-- Hardware and welcome preferences
CREATE TABLE IF NOT EXISTS hardware_preferences (
    hardware_id STRING,
    session_id STRING,
    device_procurement STRING,  -- 'standard', 'custom', 'internal'
    device_requirements STRING,  -- Text field for custom requirements
    welcome_gift STRING,  -- 'coffee_sampler', 'notebook_set', 'charity', 'wireless_charger'
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    PRIMARY KEY (hardware_id),
    FOREIGN KEY (session_id) REFERENCES wizard_sessions(session_id)
) USING DELTA;

-- Support and leadership connections
CREATE TABLE IF NOT EXISTS support_connections (
    support_id STRING,
    session_id STRING,
    concierge_name STRING,
    concierge_email STRING,
    concierge_phone STRING,
    leadership_name STRING,
    leadership_title STRING,
    leadership_email STRING,
    support_procedure_acknowledged BOOLEAN,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    PRIMARY KEY (support_id),
    FOREIGN KEY (session_id) REFERENCES wizard_sessions(session_id)
) USING DELTA;

-- Audit log for tracking changes
CREATE TABLE IF NOT EXISTS audit_log (
    log_id STRING,
    session_id STRING,
    table_name STRING,
    action STRING,  -- 'CREATE', 'UPDATE', 'DELETE'
    changed_fields STRING,  -- JSON object of changed fields
    changed_by STRING,  -- User identifier
    changed_at TIMESTAMP,
    PRIMARY KEY (log_id)
) USING DELTA;

-- Create indexes for common queries
-- Note: Delta Lake automatically optimizes queries, but we can add Z-ordering for frequently filtered columns

-- Comments for documentation
COMMENT ON TABLE wizard_sessions IS 'Main table storing wizard session metadata and progress';
COMMENT ON TABLE key_contacts IS 'Stores billing, technical, and emergency contact information';
COMMENT ON TABLE service_orders IS 'Contains service tier selection and contract details';
COMMENT ON TABLE hr_setup IS 'HR system integration configuration and employee data references';
COMMENT ON TABLE hardware_preferences IS 'Device procurement and welcome gift selections';
COMMENT ON TABLE support_connections IS 'Dedicated concierge and leadership escalation contacts';
COMMENT ON TABLE audit_log IS 'Tracks all data changes for compliance and debugging';
