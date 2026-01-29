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
      const started_at = new Date();
      
      await sqlService.query(`
        INSERT INTO wizard_sessions (session_id, company_name, started_at, status)
        VALUES (@sessionId, @companyName, @startedAt, 'in_progress')
      `, {
        sessionId,
        companyName: data.company_name || 'New Customer',
        startedAt: started_at
      });
      
      console.log('✓ Created wizard session:', sessionId);
      return { session_id: sessionId, started_at };
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
      
      // Delete existing contacts for this session
      await sqlService.query(
        'DELETE FROM key_contacts WHERE session_id = @sessionId',
        { sessionId }
      );
      
      // Insert new contacts
      for (const contact of contacts) {
        await sqlService.query(`
          INSERT INTO key_contacts (session_id, role, name, email, phone)
          VALUES (@sessionId, @role, @name, @email, @phone)
        `, {
          sessionId,
          role: contact.role,
          name: contact.name,
          email: contact.email,
          phone: contact.phone || null
        });
      }
      
      console.log(`✓ Saved ${contacts.length} contacts for session:`, sessionId);
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
      
      return result || [];
    } catch (error) {
      console.error('Error getting contacts:', error);
      return [];
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
          SET concierge_id = @conciergeId, 
              tier_id = @tierId,
              user_count = @userCount,
              start_date = @startDate,
              special_requirements = @specialRequirements
          WHERE session_id = @sessionId
        `, {
          sessionId,
          conciergeId: order.concierge_id,
          tierId: order.tier_id,
          userCount: order.user_count,
          startDate: order.start_date || null,
          specialRequirements: order.special_requirements || null
        });
      } else {
        // Insert new order
        await sqlService.query(`
          INSERT INTO service_orders (session_id, concierge_id, tier_id, user_count, start_date, special_requirements)
          VALUES (@sessionId, @conciergeId, @tierId, @userCount, @startDate, @specialRequirements)
        `, {
          sessionId,
          conciergeId: order.concierge_id,
          tierId: order.tier_id,
          userCount: order.user_count,
          startDate: order.start_date || null,
          specialRequirements: order.special_requirements || null
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
        'SELECT hr_id FROM hr_setup WHERE session_id = @sessionId',
        { sessionId }
      );
      
      if (existing && existing.length > 0) {
        // Update existing setup
        await sqlService.query(`
          UPDATE hr_setup
          SET hris_system_id = @hrisSystemId,
              update_method_id = @updateMethodId,
              update_frequency = @updateFrequency,
              api_credentials_provided = @apiCredentialsProvided,
              notes = @notes
          WHERE session_id = @sessionId
        `, {
          sessionId,
          hrisSystemId: hrData.hris_system_id,
          updateMethodId: hrData.update_method_id,
          updateFrequency: hrData.update_frequency || null,
          apiCredentialsProvided: hrData.api_credentials_provided || false,
          notes: hrData.notes || null
        });
      } else {
        // Insert new setup
        await sqlService.query(`
          INSERT INTO hr_setup (session_id, hris_system_id, update_method_id, update_frequency, api_credentials_provided, notes)
          VALUES (@sessionId, @hrisSystemId, @updateMethodId, @updateFrequency, @apiCredentialsProvided, @notes)
        `, {
          sessionId,
          hrisSystemId: hrData.hris_system_id,
          updateMethodId: hrData.update_method_id,
          updateFrequency: hrData.update_frequency || null,
          apiCredentialsProvided: hrData.api_credentials_provided || false,
          notes: hrData.notes || null
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
        'SELECT hardware_id FROM hardware_preferences WHERE session_id = @sessionId',
        { sessionId }
      );
      
      if (existing && existing.length > 0) {
        // Update existing preferences
        await sqlService.query(`
          UPDATE hardware_preferences
          SET device_procurement_id = @deviceProcurementId,
              welcome_gift_id = @welcomeGiftId,
              additional_requirements = @additionalRequirements
          WHERE session_id = @sessionId
        `, {
          sessionId,
          deviceProcurementId: hardware.device_procurement_id,
          welcomeGiftId: hardware.welcome_gift_id,
          additionalRequirements: hardware.additional_requirements || null
        });
      } else {
        // Insert new preferences
        await sqlService.query(`
          INSERT INTO hardware_preferences (session_id, device_procurement_id, welcome_gift_id, additional_requirements)
          VALUES (@sessionId, @deviceProcurementId, @welcomeGiftId, @additionalRequirements)
        `, {
          sessionId,
          deviceProcurementId: hardware.device_procurement_id,
          welcomeGiftId: hardware.welcome_gift_id,
          additionalRequirements: hardware.additional_requirements || null
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
          SET primary_channel = @primaryChannel,
              sla_tier = @slaTier,
              escalation_contact = @escalationContact,
              special_instructions = @specialInstructions
          WHERE session_id = @sessionId
        `, {
          sessionId,
          primaryChannel: support.primary_channel,
          slaTier: support.sla_tier,
          escalationContact: support.escalation_contact || null,
          specialInstructions: support.special_instructions || null
        });
      } else {
        // Insert new connection
        await sqlService.query(`
          INSERT INTO support_connections (session_id, primary_channel, sla_tier, escalation_contact, special_instructions)
          VALUES (@sessionId, @primaryChannel, @slaTier, @escalationContact, @specialInstructions)
        `, {
          sessionId,
          primaryChannel: support.primary_channel,
          slaTier: support.sla_tier,
          escalationContact: support.escalation_contact || null,
          specialInstructions: support.special_instructions || null
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
        'SELECT * FROM wizard_sessions ORDER BY started_at DESC'
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
        INSERT INTO audit_log (session_id, action, details, timestamp)
        VALUES (@sessionId, @action, @details, @timestamp)
      `, {
        sessionId,
        action,
        details: JSON.stringify(details),
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Error logging audit:', error);
    }
  }
}

module.exports = new WizardDatabaseService();
