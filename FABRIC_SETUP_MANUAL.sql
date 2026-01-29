-- flowCUSTODIAN Wizard Database Schema
-- Manual Setup Script for Microsoft Fabric Lakehouse
-- 
-- Instructions:
-- 1. Go to your Fabric Lakehouse
-- 2. Create a NEW NOTEBOOK (not SQL Query) 
-- 3. Copy and paste these SQL statements
-- 4. Execute them cell by cell
--
-- This creates all necessary tables for the flowCUSTODIAN Wizard
-- Using Spark SQL compatible syntax for Delta Lake

-- Main wizard sessions table
CREATE TABLE IF NOT EXISTS wizard_sessions (
    session_id STRING,
    company_name STRING,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    completed_at TIMESTAMP,
    current_step INT,
    status STRING
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
    updated_at TIMESTAMP
) USING DELTA;

-- Service order details
CREATE TABLE IF NOT EXISTS service_orders (
    order_id STRING,
    session_id STRING,
    service_tier STRING,
    start_date DATE,
    contract_term INT,
    monthly_commitment DECIMAL(10,2),
    included_features STRING,
    confirmation_accepted BOOLEAN,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
) USING DELTA;

-- HR setup information
CREATE TABLE IF NOT EXISTS hr_setup (
    hr_id STRING,
    session_id STRING,
    employees_count INT,
    payroll_system STRING,
    hris_system STRING,
    benefits_provider STRING,
    payroll_frequency STRING,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
) USING DELTA;

-- Hardware requirements
CREATE TABLE IF NOT EXISTS hardware_setup (
    hardware_id STRING,
    session_id STRING,
    device_type STRING,
    quantity INT,
    specifications STRING,
    budget_allocated DECIMAL(10,2),
    created_at TIMESTAMP,
    updated_at TIMESTAMP
) USING DELTA;

-- Support preferences
CREATE TABLE IF NOT EXISTS support_preferences (
    support_id STRING,
    session_id STRING,
    support_level STRING,
    response_time STRING,
    support_channels STRING,
    phone_support BOOLEAN,
    email_support BOOLEAN,
    chat_support BOOLEAN,
    knowledge_base_access BOOLEAN,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
) USING DELTA;

-- File uploads for documents
CREATE TABLE IF NOT EXISTS file_uploads (
    file_id STRING,
    session_id STRING,
    file_name STRING,
    file_path STRING,
    file_type STRING,
    file_size LONG,
    uploaded_at TIMESTAMP,
    uploaded_by STRING
) USING DELTA;

-- Audit log for wizard activities
CREATE TABLE IF NOT EXISTS wizard_audit_log (
    log_id STRING,
    session_id STRING,
    action STRING,
    step INT,
    details STRING,
    user_ip STRING,
    created_at TIMESTAMP
) USING DELTA;

-- Verify all tables were created
-- Run this query after creating all tables to confirm:
-- SELECT name FROM sys.tables WHERE name LIKE 'wizard_%' OR name LIKE 'key_%' OR name LIKE 'service_%' OR name LIKE 'hr_%' OR name LIKE 'hardware_%' OR name LIKE 'support_%' OR name LIKE 'file_%';

