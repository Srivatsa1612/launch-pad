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
    await dbService.saveKeyContacts(sessionId, contacts);
    await this.updateSessionProgress(sessionId, 3);
    return { success: true, contacts };
  }

  /**
   * Get contacts for session
   */
  async getContacts(sessionId) {
    const contactRow = await dbService.getKeyContacts(sessionId);

    if (!contactRow) {
      return null;
    }

    return {
      billing: {
        name: contactRow.billing_name || '',
        email: contactRow.billing_email || '',
        phone: contactRow.billing_phone || ''
      },
      tech: {
        name: contactRow.tech_name || '',
        email: contactRow.tech_email || '',
        phone: contactRow.tech_phone || ''
      },
      emergency: {
        name: contactRow.emergency_name || '',
        email: contactRow.emergency_email || '',
        phone: contactRow.emergency_phone || ''
      }
    };
  }

  /**
   * Save service order
   */
  async saveServiceOrder(sessionId, order) {
    await dbService.saveServiceOrder(sessionId, {
      service_tier: order.service_tier || order.serviceTier,
      start_date: order.start_date || order.startDate,
      contract_term: order.contract_term || order.contractTerm,
      monthly_commitment: order.monthly_commitment || order.monthlyCommitment,
      included_features: order.included_features || (order.includedFeatures ? JSON.stringify(order.includedFeatures) : null),
      confirmation_accepted: order.confirmation_accepted || order.confirmationAccepted || false
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
      serviceTier: order.service_tier,
      startDate: order.start_date,
      contractTerm: order.contract_term,
      monthlyCommitment: order.monthly_commitment,
      includedFeatures: order.included_features ? JSON.parse(order.included_features) : [],
      confirmationAccepted: !!order.confirmation_accepted
    };
  }

  /**
   * Save HR setup
   */
  async saveHRSetup(sessionId, hrSetup) {
    await dbService.saveHRSetup(sessionId, {
      hris_system: hrSetup.hris_system || hrSetup.hrisSystem,
      update_method: hrSetup.update_method || hrSetup.updateMethod,
      file_uploaded: hrSetup.employeeFilePath || hrSetup.fileUploaded || null,
      sync_frequency: hrSetup.update_frequency || hrSetup.updateFrequency || null
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
      hrisSystem: hrSetup.hris_system,
      updateMethod: hrSetup.update_method,
      updateFrequency: hrSetup.sync_frequency,
      employeeFilePath: hrSetup.file_uploaded || null
    };
  }

  /**
   * Save hardware preferences
   */
  async saveHardware(sessionId, hardware) {
    await dbService.saveHardwarePreferences(sessionId, {
      device_choice: hardware.device_choice || hardware.deviceProcurement,
      welcome_gift_choice: hardware.welcome_gift_choice || hardware.welcomeGift
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
      deviceProcurement: hardware.device_choice,
      welcomeGift: hardware.welcome_gift_choice
    };
  }

  /**
   * Save support connections
   */
  async saveSupportConnections(sessionId, support) {
    await dbService.saveSupportConnection(sessionId, {
      assigned_concierge: support.assigned_concierge || support.conciergeName,
      concierge_email: support.concierge_email || support.conciergeEmail,
      concierge_phone: support.concierge_phone || support.conciergePhone,
      calendar_url: support.calendar_url || support.calendarUrl || null
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
      conciergeName: support.assigned_concierge,
      conciergeEmail: support.concierge_email,
      conciergePhone: support.concierge_phone,
      calendarUrl: support.calendar_url
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
      startedAt: session.created_at,
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
