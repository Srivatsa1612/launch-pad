// services/wizardService.js
const { v4: uuidv4 } = require('uuid');
const dbService = require('./wizardDatabaseService');

class WizardService {
  /**
   * Create a new wizard session
   */
  async createSession(companyName) {
    try {
      const sessionId = uuidv4();

      await dbService.createSession({
        session_id: sessionId,
        company_name: companyName
      });

      return { sessionId, companyName, currentStep: 1 };
    } catch (error) {
      console.error('Error creating session:', error.message);
      throw new Error(`Failed to create session: ${error.message}`);
    }
  }

  /**
   * Get session by ID
   */
  async getSession(sessionId) {
    const session = await dbService.getSession(sessionId);

    if (!session) {
      throw new Error('Session not found');
    }

    return session;
  }

  /**
   * Update session progress
   */
  async updateSessionProgress(sessionId, currentStep) {
    await dbService.updateSession(sessionId, {
      current_step: currentStep
    });
  }

  /**
   * Mark session as complete
   */
  async completeSession(sessionId) {
    await dbService.updateSession(sessionId, {
      status: 'completed'
    });
  }

  /**
   * Save key contacts
   */
  async saveContacts(sessionId, contacts) {
    // Convert contacts object to array format
    const contactsArray = Object.entries(contacts).map(([role, data]) => ({
      role,
      name: data.name,
      email: data.email,
      phone: data.phone || ''
    }));

    await dbService.saveKeyContacts(sessionId, contactsArray);
    await this.updateSessionProgress(sessionId, 3);
    return { success: true, contacts };
  }

  /**
   * Get contacts for session
   */
  async getContacts(sessionId) {
    const contactsArray = await dbService.getKeyContacts(sessionId);

    if (!contactsArray || contactsArray.length === 0) {
      return null;
    }

    // Convert array back to object format
    const contacts = {};
    contactsArray.forEach(contact => {
      contacts[contact.role] = {
        name: contact.name,
        email: contact.email,
        phone: contact.phone
      };
    });

    return contacts;
  }

  /**
   * Save service order
   */
  async saveServiceOrder(sessionId, order) {
    await dbService.saveServiceOrder(sessionId, {
      concierge_id: order.concierge_id || order.conciergeId,
      tier_id: order.tier_id || order.tierId || order.serviceTier,
      user_count: order.user_count || order.userCount,
      start_date: order.start_date || order.startDate,
      special_requirements: order.special_requirements || order.specialRequirements
    });

    await this.updateSessionProgress(sessionId, 4);
    return { success: true };
  }

  /**
   * Get service order
   */
  async getServiceOrder(sessionId) {
    const order = await dbService.getServiceOrder(sessionId);

    if (!order) {
      return null;
    }

    return {
      conciergeId: order.concierge_id,
      tierId: order.tier_id,
      serviceTier: order.tier_id,
      userCount: order.user_count,
      startDate: order.start_date,
      specialRequirements: order.special_requirements
    };
  }

  /**
   * Save HR setup
   */
  async saveHRSetup(sessionId, hrSetup) {
    await dbService.saveHRSetup(sessionId, {
      hris_system_id: hrSetup.hris_system_id || hrSetup.hrisSystem,
      update_method_id: hrSetup.update_method_id || hrSetup.updateMethod,
      update_frequency: hrSetup.update_frequency || hrSetup.updateFrequency,
      api_credentials_provided: hrSetup.api_credentials_provided || hrSetup.apiCredentialsProvided || false,
      notes: hrSetup.notes || null
    });

    await this.updateSessionProgress(sessionId, 5);
    return { success: true };
  }

  /**
   * Get HR setup
   */
  async getHRSetup(sessionId) {
    const hrSetup = await dbService.getHRSetup(sessionId);

    if (!hrSetup) {
      return null;
    }

    return {
      hrisSystem: hrSetup.hris_system_id,
      updateMethod: hrSetup.update_method_id,
      updateFrequency: hrSetup.update_frequency,
      apiCredentialsProvided: hrSetup.api_credentials_provided,
      notes: hrSetup.notes
    };
  }

  /**
   * Save hardware preferences
   */
  async saveHardware(sessionId, hardware) {
    await dbService.saveHardwarePreferences(sessionId, {
      device_procurement_id: hardware.device_procurement_id || hardware.deviceProcurement,
      welcome_gift_id: hardware.welcome_gift_id || hardware.welcomeGift,
      additional_requirements: hardware.additional_requirements || hardware.additionalRequirements
    });

    await this.updateSessionProgress(sessionId, 6);
    return { success: true };
  }

  /**
   * Get hardware preferences
   */
  async getHardware(sessionId) {
    const hardware = await dbService.getHardwarePreferences(sessionId);

    if (!hardware) {
      return null;
    }

    return {
      deviceProcurement: hardware.device_procurement_id,
      welcomeGift: hardware.welcome_gift_id,
      additionalRequirements: hardware.additional_requirements
    };
  }

  /**
   * Save support connections
   */
  async saveSupportConnections(sessionId, support) {
    await dbService.saveSupportConnection(sessionId, {
      primary_channel: support.primary_channel || support.primaryChannel,
      sla_tier: support.sla_tier || support.slaTier,
      escalation_contact: support.escalation_contact || support.escalationContact,
      special_instructions: support.special_instructions || support.specialInstructions
    });

    await this.updateSessionProgress(sessionId, 7);
    return { success: true };
  }

  /**
   * Get support connections
   */
  async getSupportConnections(sessionId) {
    const support = await dbService.getSupportConnection(sessionId);

    if (!support) {
      return null;
    }

    return {
      primaryChannel: support.primary_channel,
      slaTier: support.sla_tier,
      escalationContact: support.escalation_contact,
      specialInstructions: support.special_instructions
    };
  }

  /**
   * Get complete wizard data for a session
   */
  async getCompleteWizardData(sessionId) {
    const session = await dbService.getSession(sessionId);

    if (!session) {
      throw new Error('Session not found');
    }

    const [contacts, serviceOrder, hrSetup, hardware, support] = await Promise.all([
      this.getContacts(sessionId),
      this.getServiceOrder(sessionId),
      this.getHRSetup(sessionId),
      this.getHardware(sessionId),
      this.getSupportConnections(sessionId)
    ]);

    return {
      sessionId: session.session_id,
      companyName: session.company_name,
      status: session.status,
      currentStep: session.current_step,
      startedAt: session.started_at,
      completedAt: session.completed_at,
      contacts,
      serviceOrder,
      hrSetup,
      hardware,
      support
    };
  }

  /**
   * Upload a file
   */
  async uploadFile(sessionId, category, file) {
    // For now, just return success - file is already saved by multer
    await dbService.logAudit(sessionId, 'file_upload', {
      category,
      filename: file.filename,
      originalname: file.originalname,
      size: file.size
    });

    return {
      success: true,
      file: {
        name: file.originalname,
        category,
        uploadedAt: new Date()
      }
    };
  }
}

module.exports = new WizardService();
