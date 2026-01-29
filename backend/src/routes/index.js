// routes/index.js
const express = require('express');
const { body, param, validationResult } = require('express-validator');
const wizardService = require('../services/wizardService');
const livyService = require('../services/livyService');
const configService = require('../services/configService');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /csv|xlsx|xls|pdf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only CSV, Excel, and PDF files are allowed'));
    }
  }
});

// Validation middleware
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Health check
router.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Initialize database schema (bootstrap endpoint)
router.post('/admin/initialize-db', async (req, res) => {
  try {
    console.log('📊 Starting database initialization...');
    await livyService.initializeSchema();
    res.json({ 
      message: 'Database schema initialized successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error initializing database:', error);
    res.status(500).json({ 
      error: 'Failed to initialize database',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Create new session
router.post('/sessions',
  body('companyName').notEmpty().trim().escape(),
  validate,
  async (req, res) => {
    try {
      const { companyName } = req.body;
      const session = await wizardService.createSession(companyName);
      res.status(201).json(session);
    } catch (error) {
      console.error('Error creating session:', error);
      res.status(500).json({ 
        error: 'Failed to create session',
        details: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }
);

// Get session
router.get('/sessions/:sessionId',
  param('sessionId').isUUID(),
  validate,
  async (req, res) => {
    try {
      const { sessionId } = req.params;
      const data = await wizardService.getCompleteWizardData(sessionId);
      res.json(data);
    } catch (error) {
      console.error('Error getting session:', error);
      if (error.message === 'Session not found') {
        res.status(404).json({ error: 'Session not found' });
      } else {
        res.status(500).json({ error: 'Failed to retrieve session' });
      }
    }
  }
);

// Complete session
router.post('/sessions/:sessionId/complete',
  param('sessionId').isUUID(),
  validate,
  async (req, res) => {
    try {
      const { sessionId } = req.params;
      await wizardService.completeSession(sessionId);
      res.json({ message: 'Session completed successfully' });
    } catch (error) {
      console.error('Error completing session:', error);
      res.status(500).json({ error: 'Failed to complete session' });
    }
  }
);

// Save contacts
router.post('/contacts',
  body('sessionId').isUUID(),
  body('contacts.billing.name').notEmpty().trim(),
  body('contacts.billing.email').isEmail(),
  body('contacts.billing.phone').notEmpty().trim(),
  body('contacts.tech.name').notEmpty().trim(),
  body('contacts.tech.email').isEmail(),
  body('contacts.tech.phone').notEmpty().trim(),
  body('contacts.emergency.name').notEmpty().trim(),
  body('contacts.emergency.email').isEmail(),
  body('contacts.emergency.phone').notEmpty().trim(),
  validate,
  async (req, res) => {
    try {
      const { sessionId, contacts } = req.body;
      await wizardService.saveContacts(sessionId, contacts);
      res.json({ message: 'Contacts saved successfully' });
    } catch (error) {
      console.error('Error saving contacts:', error);
      res.status(500).json({ error: 'Failed to save contacts' });
    }
  }
);

// Get contacts
router.get('/contacts/:sessionId',
  param('sessionId').isUUID(),
  validate,
  async (req, res) => {
    try {
      const { sessionId } = req.params;
      const contacts = await wizardService.getContacts(sessionId);
      res.json(contacts || {});
    } catch (error) {
      console.error('Error getting contacts:', error);
      res.status(500).json({ error: 'Failed to retrieve contacts' });
    }
  }
);

// Save service order
router.post('/service-order',
  body('sessionId').isUUID(),
  body('order.serviceTier').notEmpty().trim(),
  body('order.startDate').isISO8601(),
  body('order.contractTerm').isInt({ min: 1 }),
  body('order.monthlyCommitment').isFloat({ min: 0 }),
  body('order.confirmationAccepted').isBoolean(),
  validate,
  async (req, res) => {
    try {
      const { sessionId, order } = req.body;
      await wizardService.saveServiceOrder(sessionId, order);
      res.json({ message: 'Service order saved successfully' });
    } catch (error) {
      console.error('Error saving service order:', error);
      res.status(500).json({ error: 'Failed to save service order' });
    }
  }
);

// Get service order
router.get('/service-order/:sessionId',
  param('sessionId').isUUID(),
  validate,
  async (req, res) => {
    try {
      const { sessionId } = req.params;
      const order = await wizardService.getServiceOrder(sessionId);
      res.json(order || {});
    } catch (error) {
      console.error('Error getting service order:', error);
      res.status(500).json({ error: 'Failed to retrieve service order' });
    }
  }
);

// Save HR setup
router.post('/hr-setup',
  body('sessionId').isUUID(),
  body('hrSetup.hrisSystem').notEmpty().trim(),
  body('hrSetup.updateMethod').notEmpty().trim(),
  validate,
  async (req, res) => {
    try {
      const { sessionId, hrSetup } = req.body;
      await wizardService.saveHRSetup(sessionId, hrSetup);
      res.json({ message: 'HR setup saved successfully' });
    } catch (error) {
      console.error('Error saving HR setup:', error);
      res.status(500).json({ error: 'Failed to save HR setup' });
    }
  }
);

// Upload employee file
router.post('/hr-setup/:sessionId/upload',
  param('sessionId').isUUID(),
  validate,
  upload.single('employeeFile'),
  async (req, res) => {
    try {
      const { sessionId } = req.params;
      
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      const filePath = `/uploads/${req.file.filename}`;
      
      // Update HR setup with file path
      const hrSetup = await wizardService.getHRSetup(sessionId);
      await wizardService.saveHRSetup(sessionId, {
        ...hrSetup,
        employeeFilePath: filePath
      });

      res.json({ 
        message: 'File uploaded successfully',
        filePath: filePath,
        fileName: req.file.originalname
      });
    } catch (error) {
      console.error('Error uploading file:', error);
      res.status(500).json({ error: 'Failed to upload file' });
    }
  }
);

// Get HR setup
router.get('/hr-setup/:sessionId',
  param('sessionId').isUUID(),
  validate,
  async (req, res) => {
    try {
      const { sessionId } = req.params;
      const hrSetup = await wizardService.getHRSetup(sessionId);
      res.json(hrSetup || {});
    } catch (error) {
      console.error('Error getting HR setup:', error);
      res.status(500).json({ error: 'Failed to retrieve HR setup' });
    }
  }
);

// Save hardware preferences
router.post('/hardware',
  body('sessionId').isUUID(),
  body('hardware.deviceProcurement').notEmpty().trim(),
  body('hardware.welcomeGift').notEmpty().trim(),
  validate,
  async (req, res) => {
    try {
      const { sessionId, hardware } = req.body;
      await wizardService.saveHardware(sessionId, hardware);
      res.json({ message: 'Hardware preferences saved successfully' });
    } catch (error) {
      console.error('Error saving hardware preferences:', error);
      res.status(500).json({ error: 'Failed to save hardware preferences' });
    }
  }
);

// Get hardware preferences
router.get('/hardware/:sessionId',
  param('sessionId').isUUID(),
  validate,
  async (req, res) => {
    try {
      const { sessionId } = req.params;
      const hardware = await wizardService.getHardware(sessionId);
      res.json(hardware || {});
    } catch (error) {
      console.error('Error getting hardware preferences:', error);
      res.status(500).json({ error: 'Failed to retrieve hardware preferences' });
    }
  }
);

// Save support connections
router.post('/support',
  body('sessionId').isUUID(),
  body('support.conciergeName').notEmpty().trim(),
  body('support.conciergeEmail').isEmail(),
  body('support.conciergePhone').notEmpty().trim(),
  body('support.leadershipName').notEmpty().trim(),
  body('support.leadershipEmail').isEmail(),
  body('support.supportProcedureAcknowledged').isBoolean(),
  validate,
  async (req, res) => {
    try {
      const { sessionId, support } = req.body;
      await wizardService.saveSupportConnections(sessionId, support);
      res.json({ message: 'Support connections saved successfully' });
    } catch (error) {
      console.error('Error saving support connections:', error);
      res.status(500).json({ error: 'Failed to save support connections' });
    }
  }
);

// Get support connections
router.get('/support/:sessionId',
  param('sessionId').isUUID(),
  validate,
  async (req, res) => {
    try {
      const { sessionId } = req.params;
      const support = await wizardService.getSupportConnections(sessionId);
      res.json(support || {});
    } catch (error) {
      console.error('Error getting support connections:', error);
      res.status(500).json({ error: 'Failed to retrieve support connections' });
    }
  }
);
// ==================== Configuration Endpoints ====================

/**
 * GET /api/config - Get all wizard configuration
 */
router.get('/config', async (req, res) => {
  try {
    const config = configService.getConfig();
    res.json(config);
  } catch (error) {
    console.error('Error getting configuration:', error);
    res.status(500).json({ error: 'Failed to retrieve configuration' });
  }
});

/**
 * GET /api/config/concierges - Get available concierges
 */
router.get('/config/concierges', async (req, res) => {
  try {
    const concierges = await configService.getConcierges();
    res.json(concierges);
  } catch (error) {
    console.error('Error getting concierges:', error);
    res.status(500).json({ error: 'Failed to retrieve concierges' });
  }
});

/**
 * GET /api/config/service-tiers - Get available service tiers
 */
router.get('/config/service-tiers', async (req, res) => {
  try {
    const serviceTiers = await configService.getServiceTiers();
    res.json(serviceTiers);
  } catch (error) {
    console.error('Error getting service tiers:', error);
    res.status(500).json({ error: 'Failed to retrieve service tiers' });
  }
});

// ==================== Admin Configuration Management ====================

/**
 * POST /api/admin/config/concierges - Add new concierge
 */
router.post('/admin/config/concierges', (req, res) => {
  try {
    const config = configService.getConfig();
    const newConcierge = {
      id: req.body.id || req.body.name.toLowerCase().replace(/\s+/g, '-'),
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      avatar: req.body.avatar || null,
      specialties: req.body.specialties || []
    };
    config.concierges.push(newConcierge);
    configService.updateConfig(config);
    res.json(newConcierge);
  } catch (error) {
    console.error('Error adding concierge:', error);
    res.status(500).json({ error: 'Failed to add concierge' });
  }
});

/**
 * PUT /api/admin/config/concierges/:id - Update concierge
 */
router.put('/admin/config/concierges/:id', (req, res) => {
  try {
    const config = configService.getConfig();
    const index = config.concierges.findIndex(c => c.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: 'Concierge not found' });
    }
    config.concierges[index] = { ...config.concierges[index], ...req.body };
    configService.updateConfig(config);
    res.json(config.concierges[index]);
  } catch (error) {
    console.error('Error updating concierge:', error);
    res.status(500).json({ error: 'Failed to update concierge' });
  }
});

/**
 * DELETE /api/admin/config/concierges/:id - Delete concierge
 */
router.delete('/admin/config/concierges/:id', (req, res) => {
  try {
    const config = configService.getConfig();
    config.concierges = config.concierges.filter(c => c.id !== req.params.id);
    configService.updateConfig(config);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting concierge:', error);
    res.status(500).json({ error: 'Failed to delete concierge' });
  }
});

/**
 * POST /api/admin/config/service-tiers - Add service tier
 */
router.post('/admin/config/service-tiers', (req, res) => {
  try {
    const config = configService.getConfig();
    const newTier = {
      id: req.body.id || req.body.name.toLowerCase().replace(/\s+/g, '-'),
      name: req.body.name,
      monthlyPrice: req.body.monthlyPrice,
      features: req.body.features || [],
      recommended: req.body.recommended || false
    };
    config.serviceTiers.push(newTier);
    configService.updateConfig(config);
    res.json(newTier);
  } catch (error) {
    console.error('Error adding service tier:', error);
    res.status(500).json({ error: 'Failed to add service tier' });
  }
});

/**
 * PUT /api/admin/config/service-tiers/:id - Update service tier
 */
router.put('/admin/config/service-tiers/:id', (req, res) => {
  try {
    const config = configService.getConfig();
    const index = config.serviceTiers.findIndex(t => t.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: 'Service tier not found' });
    }
    config.serviceTiers[index] = { ...config.serviceTiers[index], ...req.body };
    configService.updateConfig(config);
    res.json(config.serviceTiers[index]);
  } catch (error) {
    console.error('Error updating service tier:', error);
    res.status(500).json({ error: 'Failed to update service tier' });
  }
});

/**
 * DELETE /api/admin/config/service-tiers/:id - Delete service tier
 */
router.delete('/admin/config/service-tiers/:id', (req, res) => {
  try {
    const config = configService.getConfig();
    config.serviceTiers = config.serviceTiers.filter(t => t.id !== req.params.id);
    configService.updateConfig(config);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting service tier:', error);
    res.status(500).json({ error: 'Failed to delete service tier' });
  }
});

/**
 * PUT /api/admin/config/hris-systems - Update HRIS systems list
 */
router.put('/admin/config/hris-systems', (req, res) => {
  try {
    const config = configService.getConfig();
    config.hrisSystems = req.body;
    configService.updateConfig(config);
    res.json(config.hrisSystems);
  } catch (error) {
    console.error('Error updating HRIS systems:', error);
    res.status(500).json({ error: 'Failed to update HRIS systems' });
  }
});

/**
 * PUT /api/admin/config/hardware-options - Update hardware options
 */
router.put('/admin/config/hardware-options', (req, res) => {
  try {
    const config = configService.getConfig();
    config.hardwareOptions = req.body;
    configService.updateConfig(config);
    res.json(config.hardwareOptions);
  } catch (error) {
    console.error('Error updating hardware options:', error);
    res.status(500).json({ error: 'Failed to update hardware options' });
  }
});

/**
 * POST /api/admin/config/invitations - Add new invitation
 */
router.post('/admin/config/invitations', (req, res) => {
  try {
    const config = configService.getConfig();
    if (!config.invitations) {
      config.invitations = [];
    }
    const newInvitation = req.body;
    config.invitations.push(newInvitation);
    configService.updateConfig(config);
    res.status(201).json(newInvitation);
  } catch (error) {
    console.error('Error adding invitation:', error);
    res.status(500).json({ error: 'Failed to add invitation' });
  }
});

/**
 * DELETE /api/admin/config/invitations/:id - Delete invitation
 */
router.delete('/admin/config/invitations/:id', (req, res) => {
  try {
    const config = configService.getConfig();
    config.invitations = (config.invitations || []).filter(i => i.id !== req.params.id);
    configService.updateConfig(config);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting invitation:', error);
    res.status(500).json({ error: 'Failed to delete invitation' });
  }
});

// =====================================================
// CUSTOMER PRE-SETUP PROFILES
// =====================================================

/**
 * POST /api/admin/customer-profiles - Save complete customer profile
 */
router.post('/admin/customer-profiles', async (req, res) => {
  try {
    const profile = req.body;
    if (!profile.code) {
      return res.status(400).json({ error: 'Profile code is required' });
    }

    const sqlService = require('../services/sqlService');
    await sqlService.ensureConnection();

    // Check if invitation already exists
    const existing = await sqlService.query(
      'SELECT id FROM invitations WHERE code = @code',
      { code: profile.code }
    );

    if (existing && existing.length > 0) {
      // Update existing invitation
      await sqlService.query(`
        UPDATE invitations
        SET customer_profile = @profile, updated_at = @updatedAt
        WHERE code = @code
      `, {
        code: profile.code,
        profile: JSON.stringify(profile),
        updatedAt: new Date()
      });
    } else {
      // Insert new invitation
      await sqlService.query(`
        INSERT INTO invitations (code, customer_profile, used, created_at)
        VALUES (@code, @profile, 0, @createdAt)
      `, {
        code: profile.code,
        profile: JSON.stringify(profile),
        createdAt: new Date()
      });
    }

    res.status(201).json(profile);
  } catch (error) {
    console.error('Error saving customer profile:', error);
    res.status(500).json({ error: 'Failed to save profile' });
  }
});

/**
 * GET /api/admin/customer-profiles - Get all customer profiles
 */
router.get('/admin/customer-profiles', async (req, res) => {
  try {
    const profiles = await configService.getInvitations();
    res.json(profiles);
  } catch (error) {
    console.error('Error fetching profiles:', error);
    res.status(500).json({ error: 'Failed to fetch profiles' });
  }
});

/**
 * GET /api/admin/customer-profiles/:code - Get profile by invitation code
 */
router.get('/admin/customer-profiles/:code', async (req, res) => {
  try {
    const sqlService = require('../services/sqlService');
    await sqlService.ensureConnection();

    const result = await sqlService.query(
      'SELECT * FROM invitations WHERE code = @code',
      { code: req.params.code }
    );

    if (!result || result.length === 0) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    const invitation = result[0];
    const profile = invitation.customer_profile ? JSON.parse(invitation.customer_profile) : {};

    res.json({
      ...profile,
      used: invitation.used,
      usedAt: invitation.used_at,
      createdAt: invitation.created_at
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

/**
 * PUT /api/admin/customer-profiles/:code - Update customer profile
 */
router.put('/admin/customer-profiles/:code', async (req, res) => {
  try {
    const sqlService = require('../services/sqlService');
    await sqlService.ensureConnection();

    const existing = await sqlService.query(
      'SELECT * FROM invitations WHERE code = @code',
      { code: req.params.code }
    );

    if (!existing || existing.length === 0) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    const currentProfile = existing[0].customer_profile ? JSON.parse(existing[0].customer_profile) : {};
    const updatedProfile = { ...currentProfile, ...req.body };

    await sqlService.query(`
      UPDATE invitations
      SET customer_profile = @profile, updated_at = @updatedAt
      WHERE code = @code
    `, {
      code: req.params.code,
      profile: JSON.stringify(updatedProfile),
      updatedAt: new Date()
    });

    res.json(updatedProfile);
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

/**
 * DELETE /api/admin/customer-profiles/:code - Delete customer profile
 */
router.delete('/admin/customer-profiles/:code', async (req, res) => {
  try {
    const sqlService = require('../services/sqlService');
    await sqlService.ensureConnection();

    await sqlService.query(
      'DELETE FROM invitations WHERE code = @code',
      { code: req.params.code }
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting profile:', error);
    res.status(500).json({ error: 'Failed to delete profile' });
  }
});

module.exports = router;
