// services/configService.js
const sqlService = require('./sqlService');

class ConfigService {
  constructor() {
    this.defaultConfig = this.getDefaultConfig();
  }

  async ensureConnection() {
    if (!sqlService.getPool()) {
      await sqlService.connect();
    }
  }

  getDefaultConfig() {
    return {
      concierges: [
        {
          id: 'julian-sterling',
          name: 'Julian Sterling',
          email: 'julian.sterling@m-theorygrp.com',
          phone: '+1-555-CONCIERGE',
          avatar: null,
          specialties: ['Enterprise Onboarding', 'Technical Integration', 'Executive Support']
        },
        {
          id: 'sophia-chen',
          name: 'Sophia Chen',
          email: 'sophia.chen@m-theorygrp.com',
          phone: '+1-555-SUPPORT',
          avatar: null,
          specialties: ['Customer Success', 'Training', 'Process Optimization']
        }
      ],
      serviceTiers: [
        {
          id: 'core',
          name: 'Core',
          monthlyPrice: 850,
          features: [
            'Basic M365 Management',
            'Email Support',
            'Monthly Reports',
            'Standard SLA'
          ],
          recommended: false
        },
        {
          id: 'plus',
          name: 'Plus',
          monthlyPrice: 1450,
          features: [
            'Enhanced M365 Management',
            'Priority Support',
            'Weekly Reports',
            'Enhanced SLA',
            'Basic Automation'
          ],
          recommended: false
        },
        {
          id: 'premium',
          name: 'Premium',
          monthlyPrice: 2050,
          features: [
            'Full M365 Management',
            '24/7 Priority Support',
            'Daily Reports',
            'Premium SLA',
            'Advanced Automation',
            'Dedicated Account Manager'
          ],
          recommended: true
        },
        {
          id: 'enterprise-elite',
          name: 'Enterprise Elite',
          monthlyPrice: 2450,
          features: [
            '24/7 Concierge',
            'Priority Patching',
            'Custom Modules',
            'White-Glove Service',
            'Executive Briefings',
            'Custom Integrations',
            'Dedicated Team'
          ],
          recommended: false
        }
      ],
      hrisSystems: [
        { id: 'workday', name: 'Workday', apiSupported: true },
        { id: 'bamboohr', name: 'BambooHR', apiSupported: true },
        { id: 'adp', name: 'ADP', apiSupported: true },
        { id: 'rippling', name: 'Rippling', apiSupported: true },
        { id: 'gusto', name: 'Gusto', apiSupported: true },
        { id: 'namely', name: 'Namely', apiSupported: false },
        { id: 'other', name: 'Other', apiSupported: false }
      ],
      updateMethods: [
        { id: 'api', name: 'API Integration', description: 'Automated sync via API' },
        { id: 'file', name: 'File Upload', description: 'Upload CSV/Excel files' },
        { id: 'manual', name: 'Manual', description: 'Manual entry and updates' }
      ],
      hardwareOptions: [
        { id: 'standard-device', name: 'Standard', description: 'Pre-configured business laptops', option_type: 'device', estimated_value: 0 },
        { id: 'custom-device', name: 'Custom', description: 'Specify custom hardware requirements', option_type: 'device', estimated_value: 0 },
        { id: 'none-device', name: 'None', description: 'Employees use their own devices', option_type: 'device', estimated_value: 0 },
        { id: 'premium-gift', name: 'Premium', description: 'Branded merchandise bundle + tech accessories', option_type: 'gift', estimated_value: 150 },
        { id: 'standard-gift', name: 'Standard', description: 'Branded welcome kit', option_type: 'gift', estimated_value: 75 },
        { id: 'minimal-gift', name: 'Minimal', description: 'Welcome card only', option_type: 'gift', estimated_value: 0 },
        { id: 'none-gift', name: 'None', description: 'No welcome gift', option_type: 'gift', estimated_value: 0 }
      ],
      supportOptions: {
        ticketSeverity: [
          { id: 'critical', name: 'Critical', sla: '15 minutes', description: 'System down, business impact' },
          { id: 'high', name: 'High', sla: '2 hours', description: 'Significant functionality impaired' },
          { id: 'medium', name: 'Medium', sla: '8 hours', description: 'Minor functionality issues' },
          { id: 'low', name: 'Low', sla: '24 hours', description: 'General questions, feature requests' }
        ],
        contactChannels: [
          { id: 'email', name: 'Email', available24x7: true },
          { id: 'teams', name: 'Microsoft Teams', available24x7: true },
          { id: 'slack', name: 'Slack', available24x7: false },
          { id: 'phone', name: 'Phone', available24x7: true }
        ]
      },
      company: {
        name: 'M-Theory',
        website: 'https://mtheorygroup.com',
        supportEmail: 'support@m-theorygrp.com',
        salesEmail: 'sales@m-theorygrp.com'
      }
    };
  }

  getConfig() {
    return this.defaultConfig;
  }

  async getConcierges() {
    try {
      await this.ensureConnection();
      const result = await sqlService.query('SELECT * FROM concierges WHERE is_active = 1 ORDER BY name');
      return result.map(c => ({
        id: c.concierge_id,
        name: c.name,
        email: c.email,
        phone: c.phone || '',
        avatar: c.avatar,
        specialties: c.specialties ? JSON.parse(c.specialties) : []
      }));
    } catch (error) {
      console.error('Error loading concierges from SQL:', error.message);
      return this.defaultConfig.concierges;
    }
  }

  async getServiceTiers() {
    try {
      await this.ensureConnection();
      const result = await sqlService.query('SELECT * FROM service_tiers ORDER BY monthly_price');
      return result.map(t => ({
        id: t.tier_id,
        name: t.name,
        monthlyPrice: t.monthly_price,
        features: t.features ? JSON.parse(t.features) : [],
        recommended: t.is_recommended
      }));
    } catch (error) {
      console.error('Error loading service tiers from SQL:', error.message);
      return this.defaultConfig.serviceTiers;
    }
  }

  async getHRISSystems() {
    try {
      await this.ensureConnection();
      const result = await sqlService.query('SELECT * FROM hris_systems ORDER BY name');
      return result.map(h => ({
        id: h.system_id,
        name: h.name,
        apiSupported: h.api_supported
      }));
    } catch (error) {
      console.error('Error loading HRIS systems from SQL:', error.message);
      return this.defaultConfig.hrisSystems;
    }
  }

  async getUpdateMethods() {
    try {
      await this.ensureConnection();
      const result = await sqlService.query('SELECT * FROM update_methods ORDER BY name');
      return result.map(m => ({
        id: m.method_id,
        name: m.name,
        description: m.description
      }));
    } catch (error) {
      console.error('Error loading update methods from SQL:', error.message);
      return this.defaultConfig.updateMethods;
    }
  }

  async getHardwareOptions() {
    try {
      await this.ensureConnection();
      const result = await sqlService.query('SELECT * FROM hardware_options ORDER BY option_type, name');
      
      return result.map(h => ({
        id: h.option_id,
        name: h.name,
        description: h.description,
        option_type: h.option_type,
        estimated_value: h.estimated_value
      }));
    } catch (error) {
      console.error('Error loading hardware options from SQL:', error.message);
      return this.defaultConfig.hardwareOptions || [];
    }
  }

  getSupportOptions() {
    return this.defaultConfig.supportOptions;
  }

  async getInvitations() {
    try {
      await this.ensureConnection();
      const result = await sqlService.query('SELECT * FROM invitations ORDER BY created_at DESC');
      return result.map(i => ({
        id: i.invitation_id,
        code: i.invitation_id,
        companyName: i.company_name,
        contactName: i.contact_name || '',
        contactEmail: i.contact_email || '',
        contactPhone: i.contact_phone || '',
        notes: i.notes || '',
        used: i.used,
        usedAt: i.used_at,
        createdAt: i.created_at
      }));
    } catch (error) {
      console.error('Error loading invitations from SQL:', error.message);
      return [];
    }
  }

  updateConfig(newConfig) {
    console.warn('updateConfig() deprecated - data is now in SQL Server');
  }

  saveConfig() {
    console.warn('saveConfig() deprecated - data is now in SQL Server');
  }
}

module.exports = new ConfigService();
