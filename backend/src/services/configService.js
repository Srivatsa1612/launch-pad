// services/configService.js
const fs = require('fs');
const path = require('path');

class ConfigService {
  constructor() {
    this.configPath = path.join(__dirname, '../../data/wizard-config.json');
    this.config = this.loadConfig();
  }

  loadConfig() {
    try {
      if (fs.existsSync(this.configPath)) {
        const data = fs.readFileSync(this.configPath, 'utf8');
        return JSON.parse(data);
      }
    } catch (error) {
      console.error('Error loading configuration:', error);
    }
    
    // Return default configuration if file doesn't exist or error
    return this.getDefaultConfig();
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
      hardwareOptions: {
        deviceProcurement: [
          { id: 'standard', name: 'Standard', description: 'Pre-configured business laptops' },
          { id: 'custom', name: 'Custom', description: 'Specify custom hardware requirements' },
          { id: 'none', name: 'None', description: 'Employees use their own devices' }
        ],
        welcomeGifts: [
          { id: 'premium', name: 'Premium', description: 'Branded merchandise bundle + tech accessories', value: 150 },
          { id: 'standard', name: 'Standard', description: 'Branded welcome kit', value: 75 },
          { id: 'minimal', name: 'Minimal', description: 'Welcome card only', value: 0 },
          { id: 'none', name: 'None', description: 'No welcome gift', value: 0 }
        ]
      },
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
    return this.config;
  }

  getConcierges() {
    return this.config.concierges;
  }

  getServiceTiers() {
    return this.config.serviceTiers;
  }

  getHRISSystems() {
    return this.config.hrisSystems;
  }

  getUpdateMethods() {
    return this.config.updateMethods;
  }

  getHardwareOptions() {
    return this.config.hardwareOptions;
  }

  getSupportOptions() {
    return this.config.supportOptions;
  }

  getInvitations() {
    return this.config.invitations || [];
  }

  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
    this.saveConfig();
  }

  saveConfig() {
    try {
      const dir = path.dirname(this.configPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(this.configPath, JSON.stringify(this.config, null, 2));
      console.log('✓ Configuration saved to disk');
    } catch (error) {
      console.error('Error saving configuration:', error);
    }
  }
}

module.exports = new ConfigService();
