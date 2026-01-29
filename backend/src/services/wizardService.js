// services/wizardService.js
const { v4: uuidv4 } = require('uuid');
const livyService = require('./livyService');

class WizardService {
  /**
   * Create a new wizard session
   */
  async createSession(companyName) {
    try {
      const sessionId = uuidv4();
      const now = new Date();

      await livyService.insert('wizard_sessions', {
        session_id: sessionId,
        company_name: companyName,
        created_at: now,
        updated_at: now,
        completed_at: null,
        current_step: 1,
        status: 'in_progress'
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
    const sessions = await livyService.select(
      'wizard_sessions',
      '*',
      `session_id = '${sessionId}'`
    );

    if (!sessions || sessions.length === 0) {
      throw new Error('Session not found');
    }

    return sessions[0];
  }

  /**
   * Update session progress
   */
  async updateSessionProgress(sessionId, currentStep) {
    await livyService.update(
      'wizard_sessions',
      {
        current_step: currentStep,
        updated_at: new Date()
      },
      `session_id = '${sessionId}'`
    );
  }

  /**
   * Mark session as complete
   */
  async completeSession(sessionId) {
    await livyService.update(
      'wizard_sessions',
      {
        status: 'completed',
        completed_at: new Date(),
        updated_at: new Date()
      },
      `session_id = '${sessionId}'`
    );
  }

  /**
   * Save key contacts
   */
  async saveContacts(sessionId, contacts) {
    const contactId = uuidv4();
    const now = new Date();

    // Check if contacts already exist
    const existing = await livyService.select(
      'key_contacts',
      '*',
      `session_id = '${sessionId}'`
    );

    if (existing && existing.length > 0) {
      // Update existing
      await livyService.update(
        'key_contacts',
        {
          billing_name: contacts.billing.name,
          billing_email: contacts.billing.email,
          billing_phone: contacts.billing.phone,
          tech_name: contacts.tech.name,
          tech_email: contacts.tech.email,
          tech_phone: contacts.tech.phone,
          emergency_name: contacts.emergency.name,
          emergency_email: contacts.emergency.email,
          emergency_phone: contacts.emergency.phone,
          updated_at: now
        },
        `session_id = '${sessionId}'`
      );
    } else {
      // Insert new
      await livyService.insert('key_contacts', {
        contact_id: contactId,
        session_id: sessionId,
        billing_name: contacts.billing.name,
        billing_email: contacts.billing.email,
        billing_phone: contacts.billing.phone,
        tech_name: contacts.tech.name,
        tech_email: contacts.tech.email,
        tech_phone: contacts.tech.phone,
        emergency_name: contacts.emergency.name,
        emergency_email: contacts.emergency.email,
        emergency_phone: contacts.emergency.phone,
        created_at: now,
        updated_at: now
      });
    }

    await this.updateSessionProgress(sessionId, 3);
  }

  /**
   * Get contacts for session
   */
  async getContacts(sessionId) {
    const contacts = await livyService.select(
      'key_contacts',
      '*',
      `session_id = '${sessionId}'`
    );

    if (!contacts || contacts.length === 0) {
      return null;
    }

    const data = contacts[0];
    return {
      billing: {
        name: data.billing_name,
        email: data.billing_email,
        phone: data.billing_phone
      },
      tech: {
        name: data.tech_name,
        email: data.tech_email,
        phone: data.tech_phone
      },
      emergency: {
        name: data.emergency_name,
        email: data.emergency_email,
        phone: data.emergency_phone
      }
    };
  }

  /**
   * Save service order
   */
  async saveServiceOrder(sessionId, order) {
    const orderId = uuidv4();
    const now = new Date();

    const existing = await livyService.select(
      'service_orders',
      '*',
      `session_id = '${sessionId}'`
    );

    const orderData = {
      service_tier: order.serviceTier,
      start_date: new Date(order.startDate),
      contract_term: order.contractTerm,
      monthly_commitment: order.monthlyCommitment,
      included_features: JSON.stringify(order.includedFeatures),
      confirmation_accepted: order.confirmationAccepted,
      updated_at: now
    };

    if (existing && existing.length > 0) {
      await livyService.update('service_orders', orderData, `session_id = '${sessionId}'`);
    } else {
      await livyService.insert('service_orders', {
        order_id: orderId,
        session_id: sessionId,
        ...orderData,
        created_at: now
      });
    }

    await this.updateSessionProgress(sessionId, 4);
  }

  /**
   * Get service order
   */
  async getServiceOrder(sessionId) {
    const orders = await livyService.select(
      'service_orders',
      '*',
      `session_id = '${sessionId}'`
    );

    if (!orders || orders.length === 0) {
      return null;
    }

    const data = orders[0];
    return {
      serviceTier: data.service_tier,
      startDate: data.start_date,
      contractTerm: data.contract_term,
      monthlyCommitment: data.monthly_commitment,
      includedFeatures: JSON.parse(data.included_features),
      confirmationAccepted: data.confirmation_accepted
    };
  }

  /**
   * Save HR setup
   */
  async saveHRSetup(sessionId, hrSetup) {
    const hrSetupId = uuidv4();
    const now = new Date();

    const existing = await livyService.select(
      'hr_setup',
      '*',
      `session_id = '${sessionId}'`
    );

    const setupData = {
      hris_system: hrSetup.hrisSystem,
      update_method: hrSetup.updateMethod,
      employee_file_path: hrSetup.employeeFilePath || null,
      employee_count: hrSetup.employeeCount || 0,
      updated_at: now
    };

    if (existing && existing.length > 0) {
      await livyService.update('hr_setup', setupData, `session_id = '${sessionId}'`);
    } else {
      await livyService.insert('hr_setup', {
        hr_setup_id: hrSetupId,
        session_id: sessionId,
        ...setupData,
        created_at: now
      });
    }

    await this.updateSessionProgress(sessionId, 5);
  }

  /**
   * Get HR setup
   */
  async getHRSetup(sessionId) {
    const setups = await livyService.select(
      'hr_setup',
      '*',
      `session_id = '${sessionId}'`
    );

    if (!setups || setups.length === 0) {
      return null;
    }

    const data = setups[0];
    return {
      hrisSystem: data.hris_system,
      updateMethod: data.update_method,
      employeeFilePath: data.employee_file_path,
      employeeCount: data.employee_count
    };
  }

  /**
   * Save hardware preferences
   */
  async saveHardware(sessionId, hardware) {
    const hardwareId = uuidv4();
    const now = new Date();

    const existing = await livyService.select(
      'hardware_preferences',
      '*',
      `session_id = '${sessionId}'`
    );

    const hardwareData = {
      device_procurement: hardware.deviceProcurement,
      device_requirements: hardware.deviceRequirements || null,
      welcome_gift: hardware.welcomeGift,
      updated_at: now
    };

    if (existing && existing.length > 0) {
      await livyService.update('hardware_preferences', hardwareData, `session_id = '${sessionId}'`);
    } else {
      await livyService.insert('hardware_preferences', {
        hardware_id: hardwareId,
        session_id: sessionId,
        ...hardwareData,
        created_at: now
      });
    }

    await this.updateSessionProgress(sessionId, 6);
  }

  /**
   * Get hardware preferences
   */
  async getHardware(sessionId) {
    const hardware = await livyService.select(
      'hardware_preferences',
      '*',
      `session_id = '${sessionId}'`
    );

    if (!hardware || hardware.length === 0) {
      return null;
    }

    const data = hardware[0];
    return {
      deviceProcurement: data.device_procurement,
      deviceRequirements: data.device_requirements,
      welcomeGift: data.welcome_gift
    };
  }

  /**
   * Save support connections
   */
  async saveSupportConnections(sessionId, support) {
    const supportId = uuidv4();
    const now = new Date();

    const existing = await livyService.select(
      'support_connections',
      '*',
      `session_id = '${sessionId}'`
    );

    const supportData = {
      concierge_name: support.conciergeName,
      concierge_email: support.conciergeEmail,
      concierge_phone: support.conciergePhone,
      leadership_name: support.leadershipName,
      leadership_title: support.leadershipTitle,
      leadership_email: support.leadershipEmail,
      support_procedure_acknowledged: support.supportProcedureAcknowledged,
      updated_at: now
    };

    if (existing && existing.length > 0) {
      await livyService.update('support_connections', supportData, `session_id = '${sessionId}'`);
    } else {
      await livyService.insert('support_connections', {
        support_id: supportId,
        session_id: sessionId,
        ...supportData,
        created_at: now
      });
    }

    await this.updateSessionProgress(sessionId, 7);
  }

  /**
   * Get support connections
   */
  async getSupportConnections(sessionId) {
    const support = await livyService.select(
      'support_connections',
      '*',
      `session_id = '${sessionId}'`
    );

    if (!support || support.length === 0) {
      return null;
    }

    const data = support[0];
    return {
      conciergeName: data.concierge_name,
      conciergeEmail: data.concierge_email,
      conciergePhone: data.concierge_phone,
      leadershipName: data.leadership_name,
      leadershipTitle: data.leadership_title,
      leadershipEmail: data.leadership_email,
      supportProcedureAcknowledged: data.support_procedure_acknowledged
    };
  }

  /**
   * Get complete wizard data
   */
  async getCompleteWizardData(sessionId) {
    const session = await this.getSession(sessionId);
    const contacts = await this.getContacts(sessionId);
    const serviceOrder = await this.getServiceOrder(sessionId);
    const hrSetup = await this.getHRSetup(sessionId);
    const hardware = await this.getHardware(sessionId);
    const support = await this.getSupportConnections(sessionId);

    return {
      session,
      contacts,
      serviceOrder,
      hrSetup,
      hardware,
      support
    };
  }
}

module.exports = new WizardService();
