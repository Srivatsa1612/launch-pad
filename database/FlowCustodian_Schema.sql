-- flowCUSTODIAN Database Schema for SQL Server
-- Created: January 28, 2026
-- Database for wizard sessions, configuration, and customer data

-- Create database if it doesn't exist
IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'flowCUSTODIAN')
BEGIN
    CREATE DATABASE flowCUSTODIAN;
END
GO

USE flowCUSTODIAN;
GO

-- =====================================================
-- WIZARD SESSIONS AND CORE DATA
-- =====================================================

-- Wizard sessions table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'wizard_sessions')
BEGIN
    CREATE TABLE wizard_sessions (
        session_id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        company_name NVARCHAR(255) NOT NULL,
        created_at DATETIME2 DEFAULT GETUTCDATE(),
        updated_at DATETIME2 DEFAULT GETUTCDATE(),
        completed_at DATETIME2 NULL,
        current_step INT DEFAULT 1 CHECK (current_step BETWEEN 1 AND 7),
        status NVARCHAR(50) DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'abandoned'))
    );
    
    CREATE INDEX idx_company ON wizard_sessions(company_name);
    CREATE INDEX idx_status ON wizard_sessions(status);
END
GO

-- Key contacts table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'key_contacts')
BEGIN
    CREATE TABLE key_contacts (
        contact_id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        session_id UNIQUEIDENTIFIER NOT NULL,
        billing_name NVARCHAR(255),
        billing_email NVARCHAR(255),
        billing_phone NVARCHAR(20),
        tech_name NVARCHAR(255),
        tech_email NVARCHAR(255),
        tech_phone NVARCHAR(20),
        emergency_name NVARCHAR(255),
        emergency_email NVARCHAR(255),
        emergency_phone NVARCHAR(20),
        created_at DATETIME2 DEFAULT GETUTCDATE(),
        updated_at DATETIME2 DEFAULT GETUTCDATE(),
        FOREIGN KEY (session_id) REFERENCES wizard_sessions(session_id) ON DELETE CASCADE
    );
    
    CREATE INDEX idx_session ON key_contacts(session_id);
END
GO

-- Service orders table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'service_orders')
BEGIN
    CREATE TABLE service_orders (
        order_id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        session_id UNIQUEIDENTIFIER NOT NULL,
        service_tier NVARCHAR(100),
        start_date DATE,
        contract_term INT CHECK (contract_term > 0),
        monthly_commitment DECIMAL(10,2),
        included_features NVARCHAR(MAX),  -- JSON array as string
        confirmation_accepted BIT DEFAULT 0,
        created_at DATETIME2 DEFAULT GETUTCDATE(),
        updated_at DATETIME2 DEFAULT GETUTCDATE(),
        FOREIGN KEY (session_id) REFERENCES wizard_sessions(session_id) ON DELETE CASCADE
    );
    
    CREATE INDEX idx_session ON service_orders(session_id);
END
GO

-- HR Setup table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'hr_setup')
BEGIN
    CREATE TABLE hr_setup (
        hr_setup_id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        session_id UNIQUEIDENTIFIER NOT NULL,
        hris_system NVARCHAR(100),
        update_method NVARCHAR(100),
        file_uploaded NVARCHAR(MAX),  -- filename or path
        sync_frequency NVARCHAR(50),
        created_at DATETIME2 DEFAULT GETUTCDATE(),
        updated_at DATETIME2 DEFAULT GETUTCDATE(),
        FOREIGN KEY (session_id) REFERENCES wizard_sessions(session_id) ON DELETE CASCADE
    );
    
    CREATE INDEX idx_session ON hr_setup(session_id);
END
GO

-- Hardware preferences table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'hardware_preferences')
BEGIN
    CREATE TABLE hardware_preferences (
        hw_pref_id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        session_id UNIQUEIDENTIFIER NOT NULL,
        device_choice NVARCHAR(100),
        welcome_gift_choice NVARCHAR(100),
        created_at DATETIME2 DEFAULT GETUTCDATE(),
        updated_at DATETIME2 DEFAULT GETUTCDATE(),
        FOREIGN KEY (session_id) REFERENCES wizard_sessions(session_id) ON DELETE CASCADE
    );
    
    CREATE INDEX idx_session ON hardware_preferences(session_id);
END
GO

-- Support connections table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'support_connections')
BEGIN
    CREATE TABLE support_connections (
        support_id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        session_id UNIQUEIDENTIFIER NOT NULL,
        assigned_concierge NVARCHAR(255),
        concierge_email NVARCHAR(255),
        concierge_phone NVARCHAR(20),
        calendar_url NVARCHAR(MAX),
        created_at DATETIME2 DEFAULT GETUTCDATE(),
        FOREIGN KEY (session_id) REFERENCES wizard_sessions(session_id) ON DELETE CASCADE
    );
    
    CREATE INDEX idx_session ON support_connections(session_id);
END
GO

-- =====================================================
-- CONFIGURATION TABLES (for admin management)
-- =====================================================

-- Concierges table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'concierges')
BEGIN
    CREATE TABLE concierges (
        concierge_id NVARCHAR(100) PRIMARY KEY,
        name NVARCHAR(255) NOT NULL,
        email NVARCHAR(255) NOT NULL UNIQUE,
        phone NVARCHAR(20),
        specialties NVARCHAR(MAX),  -- JSON array as string
        is_active BIT DEFAULT 1,
        created_at DATETIME2 DEFAULT GETUTCDATE(),
        updated_at DATETIME2 DEFAULT GETUTCDATE()
    );
    
    CREATE INDEX idx_active ON concierges(is_active);
END
GO

-- Service tiers table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'service_tiers')
BEGIN
    CREATE TABLE service_tiers (
        tier_id NVARCHAR(100) PRIMARY KEY,
        name NVARCHAR(255) NOT NULL,
        monthly_price DECIMAL(10,2),
        features NVARCHAR(MAX),  -- JSON array as string
        is_recommended BIT DEFAULT 0,
        created_at DATETIME2 DEFAULT GETUTCDATE(),
        updated_at DATETIME2 DEFAULT GETUTCDATE()
    );
    
    CREATE INDEX idx_recommended ON service_tiers(is_recommended);
END
GO

-- HRIS Systems table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'hris_systems')
BEGIN
    CREATE TABLE hris_systems (
        system_id NVARCHAR(100) PRIMARY KEY,
        name NVARCHAR(255) NOT NULL,
        api_supported BIT DEFAULT 0,
        created_at DATETIME2 DEFAULT GETUTCDATE(),
        updated_at DATETIME2 DEFAULT GETUTCDATE()
    );
END
GO

-- Update methods table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'update_methods')
BEGIN
    CREATE TABLE update_methods (
        method_id NVARCHAR(100) PRIMARY KEY,
        name NVARCHAR(255) NOT NULL,
        description NVARCHAR(MAX),
        created_at DATETIME2 DEFAULT GETUTCDATE(),
        updated_at DATETIME2 DEFAULT GETUTCDATE()
    );
END
GO

-- Hardware options table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'hardware_options')
BEGIN
    CREATE TABLE hardware_options (
        option_id NVARCHAR(100) PRIMARY KEY,
        option_type NVARCHAR(50),  -- 'device' or 'gift'
        name NVARCHAR(255) NOT NULL,
        description NVARCHAR(MAX),
        estimated_value DECIMAL(10,2),
        created_at DATETIME2 DEFAULT GETUTCDATE(),
        updated_at DATETIME2 DEFAULT GETUTCDATE()
    );
    
    CREATE INDEX idx_type ON hardware_options(option_type);
END
GO

-- =====================================================
-- INVITATIONS TABLE
-- =====================================================

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'invitations')
BEGIN
    CREATE TABLE invitations (
        invitation_id NVARCHAR(50) PRIMARY KEY,
        company_name NVARCHAR(255) NOT NULL,
        contact_name NVARCHAR(255),
        contact_email NVARCHAR(255),
        contact_phone NVARCHAR(20),
        notes NVARCHAR(MAX),
        created_at DATETIME2 DEFAULT GETUTCDATE(),
        used_at DATETIME2 NULL,
        used BIT DEFAULT 0
    );
    
    CREATE INDEX idx_company ON invitations(company_name);
    CREATE INDEX idx_used ON invitations(used);
END
GO

-- =====================================================
-- CUSTOMER PRE-SETUP PROFILES
-- =====================================================

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'customer_profiles')
BEGIN
    CREATE TABLE customer_profiles (
        profile_code NVARCHAR(50) PRIMARY KEY,
        profile_json NVARCHAR(MAX),
        created_at DATETIME2 DEFAULT GETUTCDATE(),
        updated_at DATETIME2 DEFAULT GETUTCDATE(),
        used BIT DEFAULT 0,
        used_at DATETIME2 NULL
    );
END
GO

-- =====================================================
-- AUDIT LOGGING TABLE
-- =====================================================

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'audit_log')
BEGIN
    CREATE TABLE audit_log (
        log_id BIGINT PRIMARY KEY IDENTITY(1,1),
        action NVARCHAR(100),
        table_name NVARCHAR(100),
        record_id NVARCHAR(255),
        changed_by NVARCHAR(255),
        changed_at DATETIME2 DEFAULT GETUTCDATE(),
        changes NVARCHAR(MAX)  -- JSON of changes
    );
    
    CREATE INDEX idx_table ON audit_log(table_name);
    CREATE INDEX idx_timestamp ON audit_log(changed_at);
END
GO

-- =====================================================
-- INSERT DEFAULT DATA
-- =====================================================

-- Insert default concierges
IF NOT EXISTS (SELECT 1 FROM concierges WHERE concierge_id = 'julian-sterling')
BEGIN
    INSERT INTO concierges (concierge_id, name, email, phone, specialties)
    VALUES 
        ('raffi-parikian', 'Raffi Parikian', 'rparikian@m-theorygrp.com', '+1-555-CONCIERGE', '["Enterprise Onboarding", "Technical Integration", "Executive Support"]'),
        ('Christian-Keamy', 'Christian Keamy', 'ckeamy@m-theorygrp.com', '+1-555-SUPPORT', '["Customer Success", "Training", "Process Optimization"]');
END
GO

-- Insert default service tiers
IF NOT EXISTS (SELECT 1 FROM service_tiers WHERE tier_id = 'core')
BEGIN
    INSERT INTO service_tiers (tier_id, name, monthly_price, features, is_recommended)
    VALUES 
        ('core', 'Core', 850, '["Microsoft 365 Integration", "Basic Workflow Automation", "Email Support"]', 0),
        ('professional', 'Professional', 1250, '["Everything in Core", "Advanced Automation", "Priority Support", "Custom Workflows"]', 0),
        ('elite', 'Enterprise Elite', 2000, '["Everything in Professional", "Dedicated Concierge", "24/7 Phone Support", "Advanced Analytics", "Custom Integration"]', 1);
END
GO

-- Insert default HRIS systems
IF NOT EXISTS (SELECT 1 FROM hris_systems WHERE system_id = 'workday')
BEGIN
    INSERT INTO hris_systems (system_id, name, api_supported)
    VALUES 
        ('workday', 'Workday', 1),
        ('bamboohr', 'BambooHR', 1),
        ('adp', 'ADP', 1),
        ('rippling', 'Rippling', 1),
        ('gusto', 'Gusto', 1),
        ('namely', 'Namely', 1),
        ('ukgpro', 'UKG Pro', 1),
        ('other', 'Other', 0);
END
GO

-- Insert default update methods
IF NOT EXISTS (SELECT 1 FROM update_methods WHERE method_id = 'api')
BEGIN
    INSERT INTO update_methods (method_id, name, description)
    VALUES 
        ('api', 'Direct API Integration', 'Real-time sync through API'),
        ('csv-weekly', 'Weekly CSV Upload', 'Upload updated employee data weekly'),
        ('csv-monthly', 'Monthly CSV Upload', 'Upload updated employee data monthly'),
        ('manual', 'Manual Updates', 'Manually update employee information');
END
GO

-- Insert default hardware options
IF NOT EXISTS (SELECT 1 FROM hardware_options WHERE option_id = 'laptop-standard')
BEGIN
    INSERT INTO hardware_options (option_id, option_type, name, description, estimated_value)
    VALUES 
        ('laptop-standard', 'device', 'Standard Laptop', 'Dell XPS 13 or MacBook Air', 1200),
        ('laptop-premium', 'device', 'Premium Laptop', 'Dell XPS 15 or MacBook Pro', 1800),
        ('monitor', 'device', 'Secondary Monitor', '27" 4K Monitor', 400),
        
        ('gift-premium', 'gift', 'Premium Bundle', 'Gift basket with tech accessories', 150),
        ('gift-classic', 'gift', 'Classic Bundle', 'Branded merchandise and desk accessories', 75);
END
GO

-- =====================================================
-- CREATE STORED PROCEDURES FOR COMMON OPERATIONS
-- =====================================================

-- Stored procedure to get session summary
IF OBJECT_ID('sp_GetSessionSummary', 'P') IS NOT NULL
    DROP PROCEDURE sp_GetSessionSummary;
GO

CREATE PROCEDURE sp_GetSessionSummary
    @SessionId UNIQUEIDENTIFIER
AS
BEGIN
    SELECT 
        ws.session_id,
        ws.company_name,
        ws.current_step,
        ws.status,
        ws.created_at,
        ws.completed_at,
        (SELECT COUNT(*) FROM key_contacts WHERE session_id = @SessionId) AS contacts_count,
        (SELECT COUNT(*) FROM service_orders WHERE session_id = @SessionId) AS orders_count
    FROM wizard_sessions ws
    WHERE ws.session_id = @SessionId;
END
GO

-- Stored procedure to get all sessions
IF OBJECT_ID('sp_GetAllSessions', 'P') IS NOT NULL
    DROP PROCEDURE sp_GetAllSessions;
GO

CREATE PROCEDURE sp_GetAllSessions
    @Status NVARCHAR(50) = NULL
AS
BEGIN
    SELECT 
        session_id,
        company_name,
        current_step,
        status,
        created_at,
        completed_at
    FROM wizard_sessions
    WHERE (@Status IS NULL OR status = @Status)
    ORDER BY created_at DESC;
END
GO

-- Stored procedure to mark session as completed
IF OBJECT_ID('sp_CompleteSession', 'P') IS NOT NULL
    DROP PROCEDURE sp_CompleteSession;
GO

CREATE PROCEDURE sp_CompleteSession
    @SessionId UNIQUEIDENTIFIER
AS
BEGIN
    UPDATE wizard_sessions
    SET status = 'completed', current_step = 7, completed_at = GETUTCDATE(), updated_at = GETUTCDATE()
    WHERE session_id = @SessionId;
END
GO

-- Create additional composite index for faster queries
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_wizard_sessions_status_created' AND object_id = OBJECT_ID('wizard_sessions'))
BEGIN
    CREATE NONCLUSTERED INDEX idx_wizard_sessions_status_created 
    ON wizard_sessions (status, created_at DESC);
END
GO

PRINT 'FlowCustodian database schema created successfully!';
GO
