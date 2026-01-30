-- flowCUSTODIAN Staging & Approval Workflow Schema
-- Created: January 29, 2026
-- Purpose: Staging table for admin pre-setup with review/approval workflow before final submission

USE flowCUSTODIAN;
GO

-- =====================================================
-- STAGING TABLES FOR PRE-SETUP WORKFLOW
-- =====================================================

-- Staging table for customer profiles awaiting review
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'customer_profiles_staging')
BEGIN
    CREATE TABLE customer_profiles_staging (
        staging_id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        profile_code NVARCHAR(50) NOT NULL UNIQUE,
        
        -- Company & Primary Contact
        company_name NVARCHAR(255) NOT NULL,
        contact_name NVARCHAR(255),
        contact_email NVARCHAR(255),
        contact_phone NVARCHAR(50),
        
        -- Key Contacts (denormalized for easier querying)
        billing_name NVARCHAR(255),
        billing_email NVARCHAR(255),
        billing_phone NVARCHAR(50),
        tech_name NVARCHAR(255),
        tech_email NVARCHAR(255),
        tech_phone NVARCHAR(50),
        emergency_name NVARCHAR(255),
        emergency_email NVARCHAR(255),
        emergency_phone NVARCHAR(50),
        
        -- Service Order
        service_tier NVARCHAR(100),
        start_date DATE,
        contract_term INT,
        monthly_commitment DECIMAL(10,2),
        
        -- HR Setup
        hris_system NVARCHAR(100),
        update_method NVARCHAR(100),
        sync_frequency NVARCHAR(50),
        
        -- Hardware Preferences
        device_choice NVARCHAR(255),
        gift_choice NVARCHAR(255),
        
        -- Support & Scheduling
        support_level NVARCHAR(100),
        preferred_meeting_date DATETIME2,
        preferred_meeting_time NVARCHAR(50),
        timezone NVARCHAR(100),
        
        -- Custom fields and notes
        custom_fields NVARCHAR(MAX), -- JSON array
        notes NVARCHAR(MAX),
        admin_notes NVARCHAR(MAX), -- Internal notes not visible to customer
        
        -- Workflow tracking
        status NVARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'pending_review', 'approved', 'rejected', 'completed')),
        submitted_at DATETIME2,
        submitted_by NVARCHAR(255),
        reviewed_at DATETIME2,
        reviewed_by NVARCHAR(255),
        review_notes NVARCHAR(MAX),
        approved_at DATETIME2,
        approved_by NVARCHAR(255),
        
        -- Invitation tracking
        invitation_sent BIT DEFAULT 0,
        invitation_sent_at DATETIME2,
        customer_viewed_at DATETIME2,
        customer_modified BIT DEFAULT 0,
        customer_modified_at DATETIME2,
        customer_confirmed_at DATETIME2,
        
        -- Metadata
        created_at DATETIME2 DEFAULT GETUTCDATE(),
        updated_at DATETIME2 DEFAULT GETUTCDATE(),
        created_by NVARCHAR(255),
        
        -- Full profile JSON (backup of all data)
        profile_json NVARCHAR(MAX)
    );
    
    CREATE INDEX idx_status ON customer_profiles_staging(status);
    CREATE INDEX idx_profile_code ON customer_profiles_staging(profile_code);
    CREATE INDEX idx_submitted_at ON customer_profiles_staging(submitted_at);
    CREATE INDEX idx_company_name ON customer_profiles_staging(company_name);
END
GO

-- Audit log for profile changes
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'profile_audit_log')
BEGIN
    CREATE TABLE profile_audit_log (
        audit_id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        staging_id UNIQUEIDENTIFIER,
        profile_code NVARCHAR(50) NOT NULL,
        action NVARCHAR(50) NOT NULL, -- 'created', 'updated', 'submitted', 'reviewed', 'approved', 'rejected', 'customer_viewed', 'customer_modified', 'completed'
        changed_fields NVARCHAR(MAX), -- JSON object of what changed
        previous_values NVARCHAR(MAX), -- JSON object of old values
        new_values NVARCHAR(MAX), -- JSON object of new values
        performed_by NVARCHAR(255),
        performed_at DATETIME2 DEFAULT GETUTCDATE(),
        notes NVARCHAR(MAX),
        FOREIGN KEY (staging_id) REFERENCES customer_profiles_staging(staging_id) ON DELETE CASCADE
    );
    
    CREATE INDEX idx_profile_code ON profile_audit_log(profile_code);
    CREATE INDEX idx_action ON profile_audit_log(action);
    CREATE INDEX idx_performed_at ON profile_audit_log(performed_at);
END
GO

-- Reviewer assignments and permissions
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'profile_reviewers')
BEGIN
    CREATE TABLE profile_reviewers (
        reviewer_id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        user_email NVARCHAR(255) NOT NULL UNIQUE,
        user_name NVARCHAR(255) NOT NULL,
        role NVARCHAR(50) DEFAULT 'reviewer' CHECK (role IN ('reviewer', 'approver', 'admin')),
        can_approve BIT DEFAULT 0,
        can_reject BIT DEFAULT 0,
        can_edit BIT DEFAULT 1,
        active BIT DEFAULT 1,
        created_at DATETIME2 DEFAULT GETUTCDATE()
    );
    
    CREATE INDEX idx_user_email ON profile_reviewers(user_email);
    CREATE INDEX idx_active ON profile_reviewers(active);
END
GO

-- =====================================================
-- STORED PROCEDURES
-- =====================================================

-- Create or update profile in staging
IF OBJECT_ID('sp_SaveProfileToStaging', 'P') IS NOT NULL
    DROP PROCEDURE sp_SaveProfileToStaging;
GO

CREATE PROCEDURE sp_SaveProfileToStaging
    @profileCode NVARCHAR(50),
    @companyName NVARCHAR(255),
    @contactName NVARCHAR(255) = NULL,
    @contactEmail NVARCHAR(255) = NULL,
    @contactPhone NVARCHAR(50) = NULL,
    @billingName NVARCHAR(255) = NULL,
    @billingEmail NVARCHAR(255) = NULL,
    @billingPhone NVARCHAR(50) = NULL,
    @techName NVARCHAR(255) = NULL,
    @techEmail NVARCHAR(255) = NULL,
    @techPhone NVARCHAR(50) = NULL,
    @emergencyName NVARCHAR(255) = NULL,
    @emergencyEmail NVARCHAR(255) = NULL,
    @emergencyPhone NVARCHAR(50) = NULL,
    @serviceTier NVARCHAR(100) = NULL,
    @startDate DATE = NULL,
    @contractTerm INT = NULL,
    @monthlyCommitment DECIMAL(10,2) = NULL,
    @hrisSystem NVARCHAR(100) = NULL,
    @updateMethod NVARCHAR(100) = NULL,
    @syncFrequency NVARCHAR(50) = NULL,
    @deviceChoice NVARCHAR(255) = NULL,
    @giftChoice NVARCHAR(255) = NULL,
    @supportLevel NVARCHAR(100) = NULL,
    @notes NVARCHAR(MAX) = NULL,
    @adminNotes NVARCHAR(MAX) = NULL,
    @profileJson NVARCHAR(MAX) = NULL,
    @createdBy NVARCHAR(255) = NULL,
    @status NVARCHAR(50) = 'draft'
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @stagingId UNIQUEIDENTIFIER;
    DECLARE @action NVARCHAR(50);
    
    -- Check if profile exists
    SELECT @stagingId = staging_id 
    FROM customer_profiles_staging 
    WHERE profile_code = @profileCode;
    
    IF @stagingId IS NULL
    BEGIN
        -- Insert new profile
        SET @stagingId = NEWID();
        SET @action = 'created';
        
        INSERT INTO customer_profiles_staging (
            staging_id, profile_code, company_name, contact_name, contact_email, contact_phone,
            billing_name, billing_email, billing_phone,
            tech_name, tech_email, tech_phone,
            emergency_name, emergency_email, emergency_phone,
            service_tier, start_date, contract_term, monthly_commitment,
            hris_system, update_method, sync_frequency,
            device_choice, gift_choice, support_level,
            notes, admin_notes, profile_json, created_by, status, created_at, updated_at
        ) VALUES (
            @stagingId, @profileCode, @companyName, @contactName, @contactEmail, @contactPhone,
            @billingName, @billingEmail, @billingPhone,
            @techName, @techEmail, @techPhone,
            @emergencyName, @emergencyEmail, @emergencyPhone,
            @serviceTier, @startDate, @contractTerm, @monthlyCommitment,
            @hrisSystem, @updateMethod, @syncFrequency,
            @deviceChoice, @giftChoice, @supportLevel,
            @notes, @adminNotes, @profileJson, @createdBy, @status, GETUTCDATE(), GETUTCDATE()
        );
    END
    ELSE
    BEGIN
        -- Update existing profile
        SET @action = 'updated';
        
        UPDATE customer_profiles_staging
        SET company_name = @companyName,
            contact_name = @contactName,
            contact_email = @contactEmail,
            contact_phone = @contactPhone,
            billing_name = @billingName,
            billing_email = @billingEmail,
            billing_phone = @billingPhone,
            tech_name = @techName,
            tech_email = @techEmail,
            tech_phone = @techPhone,
            emergency_name = @emergencyName,
            emergency_email = @emergencyEmail,
            emergency_phone = @emergencyPhone,
            service_tier = @serviceTier,
            start_date = @startDate,
            contract_term = @contractTerm,
            monthly_commitment = @monthlyCommitment,
            hris_system = @hrisSystem,
            update_method = @updateMethod,
            sync_frequency = @syncFrequency,
            device_choice = @deviceChoice,
            gift_choice = @giftChoice,
            support_level = @supportLevel,
            notes = @notes,
            admin_notes = @adminNotes,
            profile_json = @profileJson,
            status = @status,
            updated_at = GETUTCDATE()
        WHERE staging_id = @stagingId;
    END
    
    -- Log the action
    INSERT INTO profile_audit_log (staging_id, profile_code, action, performed_by, performed_at, notes)
    VALUES (@stagingId, @profileCode, @action, @createdBy, GETUTCDATE(), 'Profile saved to staging');
    
    -- Return the staging ID
    SELECT @stagingId AS staging_id, @profileCode AS profile_code, @action AS action;
END
GO

-- Submit profile for review
IF OBJECT_ID('sp_SubmitProfileForReview', 'P') IS NOT NULL
    DROP PROCEDURE sp_SubmitProfileForReview;
GO

CREATE PROCEDURE sp_SubmitProfileForReview
    @profileCode NVARCHAR(50),
    @submittedBy NVARCHAR(255)
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @stagingId UNIQUEIDENTIFIER;
    
    SELECT @stagingId = staging_id 
    FROM customer_profiles_staging 
    WHERE profile_code = @profileCode;
    
    IF @stagingId IS NULL
    BEGIN
        RAISERROR('Profile not found in staging', 16, 1);
        RETURN;
    END
    
    UPDATE customer_profiles_staging
    SET status = 'pending_review',
        submitted_at = GETUTCDATE(),
        submitted_by = @submittedBy,
        updated_at = GETUTCDATE()
    WHERE staging_id = @stagingId;
    
    -- Log the submission
    INSERT INTO profile_audit_log (staging_id, profile_code, action, performed_by, performed_at)
    VALUES (@stagingId, @profileCode, 'submitted', @submittedBy, GETUTCDATE());
    
    SELECT 'success' AS result, @stagingId AS staging_id;
END
GO

-- Approve profile and move to production
IF OBJECT_ID('sp_ApproveProfile', 'P') IS NOT NULL
    DROP PROCEDURE sp_ApproveProfile;
GO

CREATE PROCEDURE sp_ApproveProfile
    @profileCode NVARCHAR(50),
    @approvedBy NVARCHAR(255),
    @reviewNotes NVARCHAR(MAX) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRANSACTION;
    
    DECLARE @stagingId UNIQUEIDENTIFIER;
    DECLARE @profileJson NVARCHAR(MAX);
    
    SELECT @stagingId = staging_id, @profileJson = profile_json
    FROM customer_profiles_staging 
    WHERE profile_code = @profileCode;
    
    IF @stagingId IS NULL
    BEGIN
        ROLLBACK;
        RAISERROR('Profile not found in staging', 16, 1);
        RETURN;
    END
    
    -- Update staging status
    UPDATE customer_profiles_staging
    SET status = 'approved',
        approved_at = GETUTCDATE(),
        approved_by = @approvedBy,
        reviewed_at = GETUTCDATE(),
        reviewed_by = @approvedBy,
        review_notes = @reviewNotes,
        updated_at = GETUTCDATE()
    WHERE staging_id = @stagingId;
    
    -- Copy to production customer_profiles table
    IF NOT EXISTS (SELECT 1 FROM customer_profiles WHERE profile_code = @profileCode)
    BEGIN
        INSERT INTO customer_profiles (profile_code, profile_json, created_at, updated_at, used)
        SELECT profile_code, profile_json, created_at, GETUTCDATE(), 0
        FROM customer_profiles_staging
        WHERE staging_id = @stagingId;
    END
    ELSE
    BEGIN
        UPDATE customer_profiles
        SET profile_json = @profileJson,
            updated_at = GETUTCDATE()
        WHERE profile_code = @profileCode;
    END
    
    -- Ensure invitation exists
    IF NOT EXISTS (SELECT 1 FROM invitations WHERE invitation_id = @profileCode)
    BEGIN
        INSERT INTO invitations (invitation_id, company_name, contact_name, contact_email, contact_phone, notes, created_at, used)
        SELECT profile_code, company_name, contact_name, contact_email, contact_phone, notes, created_at, 0
        FROM customer_profiles_staging
        WHERE staging_id = @stagingId;
    END
    ELSE
    BEGIN
        UPDATE invitations
        SET company_name = (SELECT company_name FROM customer_profiles_staging WHERE staging_id = @stagingId),
            contact_name = (SELECT contact_name FROM customer_profiles_staging WHERE staging_id = @stagingId),
            contact_email = (SELECT contact_email FROM customer_profiles_staging WHERE staging_id = @stagingId),
            contact_phone = (SELECT contact_phone FROM customer_profiles_staging WHERE staging_id = @stagingId)
        WHERE invitation_id = @profileCode;
    END
    
    -- Log the approval
    INSERT INTO profile_audit_log (staging_id, profile_code, action, performed_by, performed_at, notes)
    VALUES (@stagingId, @profileCode, 'approved', @approvedBy, GETUTCDATE(), @reviewNotes);
    
    COMMIT;
    
    SELECT 'success' AS result, @stagingId AS staging_id, @profileCode AS profile_code;
END
GO

-- Reject profile
IF OBJECT_ID('sp_RejectProfile', 'P') IS NOT NULL
    DROP PROCEDURE sp_RejectProfile;
GO

CREATE PROCEDURE sp_RejectProfile
    @profileCode NVARCHAR(50),
    @rejectedBy NVARCHAR(255),
    @reviewNotes NVARCHAR(MAX) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @stagingId UNIQUEIDENTIFIER;
    
    SELECT @stagingId = staging_id 
    FROM customer_profiles_staging 
    WHERE profile_code = @profileCode;
    
    IF @stagingId IS NULL
    BEGIN
        RAISERROR('Profile not found in staging', 16, 1);
        RETURN;
    END
    
    UPDATE customer_profiles_staging
    SET status = 'rejected',
        reviewed_at = GETUTCDATE(),
        reviewed_by = @rejectedBy,
        review_notes = @reviewNotes,
        updated_at = GETUTCDATE()
    WHERE staging_id = @stagingId;
    
    -- Log the rejection
    INSERT INTO profile_audit_log (staging_id, profile_code, action, performed_by, performed_at, notes)
    VALUES (@stagingId, @profileCode, 'rejected', @rejectedBy, GETUTCDATE(), @reviewNotes);
    
    SELECT 'success' AS result, @stagingId AS staging_id;
END
GO

-- Soft delete (archive) profile from staging
IF OBJECT_ID('sp_ArchiveProfile', 'P') IS NOT NULL
    DROP PROCEDURE sp_ArchiveProfile;
GO

CREATE PROCEDURE sp_ArchiveProfile
    @profileCode NVARCHAR(50),
    @archivedBy NVARCHAR(255),
    @reason NVARCHAR(MAX) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @stagingId UNIQUEIDENTIFIER;
    
    SELECT @stagingId = staging_id 
    FROM customer_profiles_staging 
    WHERE profile_code = @profileCode;
    
    IF @stagingId IS NULL
    BEGIN
        RAISERROR('Profile not found in staging', 16, 1);
        RETURN;
    END
    
    -- Don't delete - just mark with special status or move to archive table
    -- For now, we'll log it and leave in staging with rejected status
    UPDATE customer_profiles_staging
    SET status = 'rejected',
        review_notes = 'ARCHIVED: ' + ISNULL(@reason, 'No reason provided'),
        reviewed_at = GETUTCDATE(),
        reviewed_by = @archivedBy,
        updated_at = GETUTCDATE()
    WHERE staging_id = @stagingId;
    
    -- Log the archival
    INSERT INTO profile_audit_log (staging_id, profile_code, action, performed_by, performed_at, notes)
    VALUES (@stagingId, @profileCode, 'archived', @archivedBy, GETUTCDATE(), @reason);
    
    -- Remove from invitations table only (keeps staging data)
    DELETE FROM invitations WHERE invitation_id = @profileCode;
    
    SELECT 'success' AS result, @stagingId AS staging_id;
END
GO

-- Get profiles pending review
IF OBJECT_ID('sp_GetProfilesPendingReview', 'P') IS NOT NULL
    DROP PROCEDURE sp_GetProfilesPendingReview;
GO

CREATE PROCEDURE sp_GetProfilesPendingReview
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT *
    FROM customer_profiles_staging
    WHERE status = 'pending_review'
    ORDER BY submitted_at ASC;
END
GO

-- Get profile audit history
IF OBJECT_ID('sp_GetProfileAuditHistory', 'P') IS NOT NULL
    DROP PROCEDURE sp_GetProfileAuditHistory;
GO

CREATE PROCEDURE sp_GetProfileAuditHistory
    @profileCode NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT *
    FROM profile_audit_log
    WHERE profile_code = @profileCode
    ORDER BY performed_at DESC;
END
GO

PRINT 'Staging and approval schema created successfully!';
GO
