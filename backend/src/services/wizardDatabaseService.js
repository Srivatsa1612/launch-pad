// services/wizardDatabaseService.js
/**
 * Wizard Database Service
 * 
 * Handles all wizard session data storage using SQL Server.
 * Replaces the in-memory mockDatabaseService with persistent database storage.
 */

const sqlService = require('./sqlService');
const { v4: uuidv4 } = require('uuid');

class WizardDatabaseService {
  async ensureConnection() {
    if (!sqlService.getPool()) {
      await sqlService.connect();
    }
  }

  /**
   * Create a new wizard session
   */
  async createSession(data) {
    try {
      await this.ensureConnection();
      
      const sessionId = data.session_id || uuidv4();
      const createdAt = new Date();
      
      await sqlService.query(`
        INSERT INTO wizard_sessions (session_id, company_name, created_at, updated_at, status, current_step)
        VALUES (@sessionId, @companyName, @createdAt, @updatedAt, 'in_progress', 1)
      `, {
        sessionId,
        companyName: data.company_name || 'New Customer',
        createdAt,
        updatedAt: createdAt
      });
      
      console.log('✓ Created wizard session:', sessionId);
      return { session_id: sessionId, created_at: createdAt };
    } catch (error) {
      console.error('Error creating session:', error);
      throw error;
    }
  }

  /**
   * Get a wizard session by ID
   */
  async getSession(sessionId) {
    try {
      await this.ensureConnection();
      
      const result = await sqlService.query(
        'SELECT * FROM wizard_sessions WHERE session_id = @sessionId',
        { sessionId }
      );
      
      if (!result || result.length === 0) {
        return null;
      }
      
      const session = result[0];
      
      // Load related data
      const [contacts, serviceOrder, hrSetup, hardware, support] = await Promise.all([
        this.getKeyContacts(sessionId),
        this.getServiceOrder(sessionId),
        this.getHRSetup(sessionId),
        this.getHardwarePreferences(sessionId),
        this.getSupportConnection(sessionId)
      ]);
      
      return {
        ...session,
        key_contacts: contacts,
        service_order: serviceOrder,
        hr_setup: hrSetup,
        hardware_preferences: hardware,
        support_connection: support
      };
    } catch (error) {
      console.error('Error getting session:', error);
      throw error;
    }
  }

  /**
   * Update wizard session
   */
  async updateSession(sessionId, data) {
    try {
      await this.ensureConnection();
      
      const updates = [];
      const params = { sessionId };
      
      if (data.company_name) {
        updates.push('company_name = @companyName');
        params.companyName = data.company_name;
      }
      if (data.status) {
        updates.push('status = @status');
        params.status = data.status;
      }
      if (data.current_step !== undefined) {
        updates.push('current_step = @currentStep');
        params.currentStep = data.current_step;
      }
      if (data.status === 'completed') {
        updates.push('completed_at = @completedAt');
        params.completedAt = new Date();
      }
      updates.push('updated_at = @updatedAt');
      params.updatedAt = new Date();
      
      if (updates.length > 0) {
        await sqlService.query(
          `UPDATE wizard_sessions SET ${updates.join(', ')} WHERE session_id = @sessionId`,
          params
        );
      }
      
      console.log('✓ Updated session:', sessionId);
      return await this.getSession(sessionId);
    } catch (error) {
      console.error('Error updating session:', error);
      throw error;
    }
  }

  /**
   * Save key contacts for a session
   */
  async saveKeyContacts(sessionId, contacts) {
    try {
      await this.ensureConnection();
      
      const existing = await sqlService.query(
        'SELECT contact_id FROM key_contacts WHERE session_id = @sessionId',
        { sessionId }
      );

      const params = {
        sessionId,
        billingName: contacts?.billing?.name || null,
        billingEmail: contacts?.billing?.email || null,
        billingPhone: contacts?.billing?.phone || null,
        techName: contacts?.tech?.name || null,
        techEmail: contacts?.tech?.email || null,
        techPhone: contacts?.tech?.phone || null,
        emergencyName: contacts?.emergency?.name || null,
        emergencyEmail: contacts?.emergency?.email || null,
        emergencyPhone: contacts?.emergency?.phone || null
      };

      if (existing && existing.length > 0) {
        await sqlService.query(`
          UPDATE key_contacts
          SET billing_name = @billingName,
              billing_email = @billingEmail,
              billing_phone = @billingPhone,
              tech_name = @techName,
              tech_email = @techEmail,
              tech_phone = @techPhone,
              emergency_name = @emergencyName,
              emergency_email = @emergencyEmail,
              emergency_phone = @emergencyPhone,
              updated_at = GETUTCDATE()
          WHERE session_id = @sessionId
        `, params);
      } else {
        await sqlService.query(`
          INSERT INTO key_contacts (
            session_id,
            billing_name,
            billing_email,
            billing_phone,
            tech_name,
            tech_email,
            tech_phone,
            emergency_name,
            emergency_email,
            emergency_phone,
            created_at,
            updated_at
          ) VALUES (
            @sessionId,
            @billingName,
            @billingEmail,
            @billingPhone,
            @techName,
            @techEmail,
            @techPhone,
            @emergencyName,
            @emergencyEmail,
            @emergencyPhone,
            GETUTCDATE(),
            GETUTCDATE()
          )
        `, params);
      }

      console.log('✓ Saved contacts for session:', sessionId);
      return contacts;
    } catch (error) {
      console.error('Error saving contacts:', error);
      throw error;
    }
  }

  /**
   * Get key contacts for a session
   */
  async getKeyContacts(sessionId) {
    try {
      await this.ensureConnection();
      
      const result = await sqlService.query(
        'SELECT * FROM key_contacts WHERE session_id = @sessionId',
        { sessionId }
      );
      
      return result && result.length > 0 ? result[0] : null;
    } catch (error) {
      console.error('Error getting contacts:', error);
      return null;
    }
  }

  /**
   * Save service order for a session
   */
  async saveServiceOrder(sessionId, order) {
    try {
      await this.ensureConnection();
      
      // Check if order exists
      const existing = await sqlService.query(
        'SELECT order_id FROM service_orders WHERE session_id = @sessionId',
        { sessionId }
      );
      
      if (existing && existing.length > 0) {
        // Update existing order
        await sqlService.query(`
          UPDATE service_orders
          SET service_tier = @serviceTier,
              start_date = @startDate,
              contract_term = @contractTerm,
              monthly_commitment = @monthlyCommitment,
              included_features = @includedFeatures,
              confirmation_accepted = @confirmationAccepted,
              updated_at = GETUTCDATE()
          WHERE session_id = @sessionId
        `, {
          sessionId,
          serviceTier: order.service_tier,
          startDate: order.start_date || null,
          contractTerm: order.contract_term || null,
          monthlyCommitment: order.monthly_commitment || null,
          includedFeatures: order.included_features || null,
          confirmationAccepted: order.confirmation_accepted ? 1 : 0
        });
      } else {
        // Insert new order
        await sqlService.query(`
          INSERT INTO service_orders (
            session_id,
            service_tier,
            start_date,
            contract_term,
            monthly_commitment,
            included_features,
            confirmation_accepted,
            created_at,
            updated_at
          ) VALUES (
            @sessionId,
            @serviceTier,
            @startDate,
            @contractTerm,
            @monthlyCommitment,
            @includedFeatures,
            @confirmationAccepted,
            GETUTCDATE(),
            GETUTCDATE()
          )
        `, {
          sessionId,
          serviceTier: order.service_tier,
          startDate: order.start_date || null,
          contractTerm: order.contract_term || null,
          monthlyCommitment: order.monthly_commitment || null,
          includedFeatures: order.included_features || null,
          confirmationAccepted: order.confirmation_accepted ? 1 : 0
        });
      }
      
      console.log('✓ Saved service order for session:', sessionId);
      return order;
    } catch (error) {
      console.error('Error saving service order:', error);
      throw error;
    }
  }

  /**
   * Get service order for a session
   */
  async getServiceOrder(sessionId) {
    try {
      await this.ensureConnection();
      
      const result = await sqlService.query(
        'SELECT * FROM service_orders WHERE session_id = @sessionId',
        { sessionId }
      );
      
      return result && result.length > 0 ? result[0] : null;
    } catch (error) {
      console.error('Error getting service order:', error);
      return null;
    }
  }

  /**
   * Save HR setup for a session
   */
  async saveHRSetup(sessionId, hrData) {
    try {
      await this.ensureConnection();
      
      // Check if HR setup exists
      const existing = await sqlService.query(
        'SELECT hr_setup_id FROM hr_setup WHERE session_id = @sessionId',
        { sessionId }
      );
      
      if (existing && existing.length > 0) {
        // Update existing setup
        await sqlService.query(`
          UPDATE hr_setup
          SET hris_system = @hrisSystem,
              update_method = @updateMethod,
              file_uploaded = @fileUploaded,
              sync_frequency = @syncFrequency,
              updated_at = GETUTCDATE()
          WHERE session_id = @sessionId
        `, {
          sessionId,
          hrisSystem: hrData.hris_system,
          updateMethod: hrData.update_method,
          fileUploaded: hrData.file_uploaded || null,
          syncFrequency: hrData.sync_frequency || null
        });
      } else {
        // Insert new setup
        await sqlService.query(`
          INSERT INTO hr_setup (
            session_id,
            hris_system,
            update_method,
            file_uploaded,
            sync_frequency,
            created_at,
            updated_at
          ) VALUES (
            @sessionId,
            @hrisSystem,
            @updateMethod,
            @fileUploaded,
            @syncFrequency,
            GETUTCDATE(),
            GETUTCDATE()
          )
        `, {
          sessionId,
          hrisSystem: hrData.hris_system,
          updateMethod: hrData.update_method,
          fileUploaded: hrData.file_uploaded || null,
          syncFrequency: hrData.sync_frequency || null
        });
      }
      
      console.log('✓ Saved HR setup for session:', sessionId);
      return hrData;
    } catch (error) {
      console.error('Error saving HR setup:', error);
      throw error;
    }
  }

  /**
   * Get HR setup for a session
   */
  async getHRSetup(sessionId) {
    try {
      await this.ensureConnection();
      
      const result = await sqlService.query(
        'SELECT * FROM hr_setup WHERE session_id = @sessionId',
        { sessionId }
      );
      
      return result && result.length > 0 ? result[0] : null;
    } catch (error) {
      console.error('Error getting HR setup:', error);
      return null;
    }
  }

  /**
   * Save hardware preferences for a session
   */
  async saveHardwarePreferences(sessionId, hardware) {
    try {
      await this.ensureConnection();
      
      // Check if preferences exist
      const existing = await sqlService.query(
        'SELECT hw_pref_id FROM hardware_preferences WHERE session_id = @sessionId',
        { sessionId }
      );
      
      if (existing && existing.length > 0) {
        // Update existing preferences
        await sqlService.query(`
          UPDATE hardware_preferences
          SET device_choice = @deviceChoice,
              welcome_gift_choice = @welcomeGiftChoice,
              updated_at = GETUTCDATE()
          WHERE session_id = @sessionId
        `, {
          sessionId,
          deviceChoice: hardware.device_choice,
          welcomeGiftChoice: hardware.welcome_gift_choice
        });
      } else {
        // Insert new preferences
        await sqlService.query(`
          INSERT INTO hardware_preferences (
            session_id,
            device_choice,
            welcome_gift_choice,
            created_at,
            updated_at
          ) VALUES (
            @sessionId,
            @deviceChoice,
            @welcomeGiftChoice,
            GETUTCDATE(),
            GETUTCDATE()
          )
        `, {
          sessionId,
          deviceChoice: hardware.device_choice,
          welcomeGiftChoice: hardware.welcome_gift_choice
        });
      }
      
      console.log('✓ Saved hardware preferences for session:', sessionId);
      return hardware;
    } catch (error) {
      console.error('Error saving hardware preferences:', error);
      throw error;
    }
  }

  /**
   * Get hardware preferences for a session
   */
  async getHardwarePreferences(sessionId) {
    try {
      await this.ensureConnection();
      
      const result = await sqlService.query(
        'SELECT * FROM hardware_preferences WHERE session_id = @sessionId',
        { sessionId }
      );
      
      return result && result.length > 0 ? result[0] : null;
    } catch (error) {
      console.error('Error getting hardware preferences:', error);
      return null;
    }
  }

  /**
   * Save support connection for a session
   */
  async saveSupportConnection(sessionId, support) {
    try {
      await this.ensureConnection();
      
      // Check if support connection exists
      const existing = await sqlService.query(
        'SELECT support_id FROM support_connections WHERE session_id = @sessionId',
        { sessionId }
      );
      
      if (existing && existing.length > 0) {
        // Update existing connection
        await sqlService.query(`
          UPDATE support_connections
          SET assigned_concierge = @assignedConcierge,
              concierge_email = @conciergeEmail,
              concierge_phone = @conciergePhone,
              calendar_url = @calendarUrl
          WHERE session_id = @sessionId
        `, {
          sessionId,
          assignedConcierge: support.assigned_concierge,
          conciergeEmail: support.concierge_email || null,
          conciergePhone: support.concierge_phone || null,
          calendarUrl: support.calendar_url || null
        });
      } else {
        // Insert new connection
        await sqlService.query(`
          INSERT INTO support_connections (
            session_id,
            assigned_concierge,
            concierge_email,
            concierge_phone,
            calendar_url,
            created_at
          ) VALUES (
            @sessionId,
            @assignedConcierge,
            @conciergeEmail,
            @conciergePhone,
            @calendarUrl,
            GETUTCDATE()
          )
        `, {
          sessionId,
          assignedConcierge: support.assigned_concierge,
          conciergeEmail: support.concierge_email || null,
          conciergePhone: support.concierge_phone || null,
          calendarUrl: support.calendar_url || null
        });
      }
      
      console.log('✓ Saved support connection for session:', sessionId);
      return support;
    } catch (error) {
      console.error('Error saving support connection:', error);
      throw error;
    }
  }

  /**
   * Get support connection for a session
   */
  async getSupportConnection(sessionId) {
    try {
      await this.ensureConnection();
      
      const result = await sqlService.query(
        'SELECT * FROM support_connections WHERE session_id = @sessionId',
        { sessionId }
      );
      
      return result && result.length > 0 ? result[0] : null;
    } catch (error) {
      console.error('Error getting support connection:', error);
      return null;
    }
  }

  /**
   * Get all wizard sessions
   */
  async getAllSessions() {
    try {
      await this.ensureConnection();
      
      const result = await sqlService.query(
        'SELECT * FROM wizard_sessions ORDER BY created_at DESC'
      );
      
      return result || [];
    } catch (error) {
      console.error('Error getting all sessions:', error);
      return [];
    }
  }

  /**
   * Log audit entry
   */
  async logAudit(sessionId, action, details) {
    try {
      await this.ensureConnection();
      
      await sqlService.query(`
        INSERT INTO audit_log (action, table_name, record_id, changed_by, changes)
        VALUES (@action, @tableName, @recordId, @changedBy, @changes)
      `, {
        action,
        tableName: details?.table || 'wizard_sessions',
        recordId: sessionId,
        changedBy: details?.changedBy || 'system',
        changes: JSON.stringify(details || {})
      });
    } catch (error) {
      console.error('Error logging audit:', error);
    }
  }
}

module.exports = new WizardDatabaseService();
