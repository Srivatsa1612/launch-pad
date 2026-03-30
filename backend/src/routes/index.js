// routes/index.js
const express = require('express');
const { body, param, validationResult } = require('express-validator');
const wizardService = require('../services/wizardService');
const configService = require('../services/configService');
const sqlService = require('../services/sqlService');
const emailService = require('../services/emailService');
const adminAuth = require('../middleware/adminAuth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const router = express.Router();

// Protect all /admin/* routes with API key authentication
router.use('/admin', adminAuth);

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

// Database diagnostics (schema verification)
router.get('/admin/db/diagnostics', async (req, res) => {
  try {
    await sqlService.ensureConnection();

    const expectedSchema = {
      wizard_sessions: ['session_id', 'company_name', 'created_at', 'updated_at', 'completed_at', 'current_step', 'status'],
      key_contacts: ['contact_id', 'session_id', 'billing_name', 'billing_email', 'billing_phone', 'tech_name', 'tech_email', 'tech_phone', 'emergency_name', 'emergency_email', 'emergency_phone', 'created_at', 'updated_at'],
      service_orders: ['order_id', 'session_id', 'service_tier', 'start_date', 'contract_term', 'monthly_commitment', 'included_features', 'confirmation_accepted', 'created_at', 'updated_at'],
      hr_setup: ['hr_setup_id', 'session_id', 'hris_system', 'update_method', 'file_uploaded', 'sync_frequency', 'created_at', 'updated_at'],
      hardware_preferences: ['hw_pref_id', 'session_id', 'device_choice', 'welcome_gift_choice', 'created_at', 'updated_at'],
      support_connections: ['support_id', 'session_id', 'assigned_concierge', 'concierge_email', 'concierge_phone', 'calendar_url', 'created_at'],
      concierges: ['concierge_id', 'name', 'email', 'phone', 'specialties', 'is_active', 'created_at', 'updated_at'],
      service_tiers: ['tier_id', 'name', 'monthly_price', 'features', 'is_recommended', 'created_at', 'updated_at'],
      hris_systems: ['system_id', 'name', 'api_supported', 'created_at', 'updated_at'],
      update_methods: ['method_id', 'name', 'description', 'created_at', 'updated_at'],
      hardware_options: ['option_id', 'option_type', 'name', 'description', 'estimated_value', 'created_at', 'updated_at'],
      invitations: ['invitation_id', 'company_name', 'contact_name', 'contact_email', 'contact_phone', 'notes', 'created_at', 'used_at', 'used'],
      customer_profiles: ['profile_code', 'profile_json', 'created_at', 'updated_at', 'used', 'used_at']
    };

    const results = {};

    for (const [tableName, requiredColumns] of Object.entries(expectedSchema)) {
      const columnsResult = await sqlService.query(
        `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = @tableName`,
        { tableName }
      );

      const existingColumns = (columnsResult || []).map(c => c.COLUMN_NAME.toLowerCase());
      const missingColumns = requiredColumns.filter(col => !existingColumns.includes(col));

      results[tableName] = {
        exists: existingColumns.length > 0,
        missingColumns
      };
    }

    res.json({
      ok: true,
      timestamp: new Date().toISOString(),
      results
    });
  } catch (error) {
    console.error('Error running DB diagnostics:', error);
    res.status(500).json({ error: 'Failed to run diagnostics', details: error.message });
  }
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
  body('companyName').optional().trim().escape(),
  body('inviteCode').optional().isString().trim(),
  validate,
  async (req, res) => {
    try {
      let { companyName, inviteCode } = req.body;

      // Require invitation code for session creation
      if (!inviteCode) {
        return res.status(403).json({
          error: 'Invitation code required',
          message: 'Session creation requires a valid invitation code'
        });
      }

      // If invite code is a full URL (user pasted URL), extract the actual code
      try {
        if (inviteCode.startsWith('http://') || inviteCode.startsWith('https://')) {
          const parsedUrl = new URL(inviteCode);
          const nestedCode = parsedUrl.searchParams.get('invite');
          if (nestedCode) {
            inviteCode = nestedCode;
          }
        }
      } catch (e) {
        // Not a valid URL, use as-is
      }

      // Validate invitation code and get company name from it
      let invitation;
      try {
        const invitations = await configService.getInvitations();
        invitation = invitations.find(inv => inv.code === inviteCode);
        if (!invitation) {
          return res.status(403).json({
            error: 'Invalid invitation',
            message: 'The provided invitation code is invalid or has expired'
          });
        }
      } catch (error) {
        return res.status(500).json({
          error: 'Validation error',
          message: 'Could not validate invitation'
        });
      }

      // Use invitation's company name if frontend didn't provide one
      if (!companyName && invitation.companyName) {
        companyName = invitation.companyName;
      }
      if (!companyName) {
        companyName = 'Customer';
      }

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

      // Send completion notification email to concierge (non-blocking)
      try {
        const sessionData = await wizardService.getSession(sessionId);
        const companyName = sessionData?.session?.company_name || sessionData?.company_name || 'Customer';
        const supportData = await wizardService.getSupportConnections(sessionId);
        const conciergeEmail = supportData?.concierge_email || supportData?.conciergeEmail;
        if (conciergeEmail) {
          await emailService.sendCompletionNotification({
            sessionId,
            companyName,
            conciergeEmail,
          });
        }
      } catch (emailError) {
        // Don't fail the completion if email fails
        console.error('Email notification failed (non-critical):', emailError.message);
      }

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
  body('contacts.billing.email').notEmpty().trim(),
  body('contacts.billing.phone').notEmpty().trim(),
  body('contacts.tech.name').notEmpty().trim(),
  body('contacts.tech.email').notEmpty().trim(),
  body('contacts.tech.phone').notEmpty().trim(),
  body('contacts.emergency.name').notEmpty().trim(),
  body('contacts.emergency.email').notEmpty().trim(),
  body('contacts.emergency.phone').notEmpty().trim(),
  validate,
  async (req, res) => {
    try {
      console.log('Received contacts payload:', JSON.stringify(req.body, null, 2));
      const { sessionId, contacts } = req.body;
      
      // Verify session exists before trying to save contacts
      const sessionCheck = await sqlService.query(
        'SELECT session_id, company_name, status FROM wizard_sessions WHERE session_id = @sessionId',
        { sessionId }
      );
      
      if (!sessionCheck || sessionCheck.length === 0) {
        console.error('Session not found:', sessionId);
        return res.status(404).json({ 
          error: 'Session not found',
          details: `The session ${sessionId} does not exist. Please start the wizard from the beginning.`,
          timestamp: new Date().toISOString()
        });
      }
      
      console.log('Session found:', sessionCheck[0]);
      await wizardService.saveContacts(sessionId, contacts);
      res.json({ message: 'Contacts saved successfully' });
    } catch (error) {
      console.error('Error saving contacts:', error);
      console.error('Error stack:', error.stack);
      res.status(500).json({ 
        error: 'Failed to save contacts',
        details: error.message,
        timestamp: new Date().toISOString()
      });
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
  body('support.conciergeEmail').optional().isEmail(),
  body('support.conciergePhone').optional().trim(),
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
    const concierges = await configService.getConcierges();
    const serviceTiers = await configService.getServiceTiers();
    const hrisSystems = await configService.getHRISSystems();
    const updateMethods = await configService.getUpdateMethods();
    const hardwareOptions = await configService.getHardwareOptions();
    const invitations = await configService.getInvitations();

    res.json({
      concierges,
      serviceTiers,
      hrisSystems,
      updateMethods,
      hardwareOptions,
      invitations
    });
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
  (async () => {
    try {
      await sqlService.ensureConnection();
      const conciergeId = req.body.id || req.body.name.toLowerCase().replace(/\s+/g, '-');
      const specialties = Array.isArray(req.body.specialties) ? req.body.specialties : [];

      await sqlService.query(`
        IF EXISTS (SELECT 1 FROM concierges WHERE concierge_id = @conciergeId)
          UPDATE concierges
          SET name = @name,
              email = @email,
              phone = @phone,
              specialties = @specialties,
              is_active = 1,
              updated_at = GETUTCDATE()
          WHERE concierge_id = @conciergeId
        ELSE
          INSERT INTO concierges (concierge_id, name, email, phone, specialties, is_active, created_at, updated_at)
          VALUES (@conciergeId, @name, @email, @phone, @specialties, 1, GETUTCDATE(), GETUTCDATE())
      `, {
        conciergeId,
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone || null,
        specialties: JSON.stringify(specialties)
      });

      res.json({
        id: conciergeId,
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone || '',
        avatar: req.body.avatar || null,
        specialties
      });
    } catch (error) {
      console.error('Error adding concierge:', error);
      res.status(500).json({ error: 'Failed to add concierge' });
    }
  })();
});

/**
 * PUT /api/admin/config/concierges/:id - Update concierge
 */
router.put('/admin/config/concierges/:id', (req, res) => {
  (async () => {
    try {
      await sqlService.ensureConnection();
      const specialties = Array.isArray(req.body.specialties) ? req.body.specialties : [];

      await sqlService.query(`
        UPDATE concierges
        SET name = @name,
            email = @email,
            phone = @phone,
            specialties = @specialties,
            updated_at = GETUTCDATE()
        WHERE concierge_id = @conciergeId
      `, {
        conciergeId: req.params.id,
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone || null,
        specialties: JSON.stringify(specialties)
      });

      res.json({
        id: req.params.id,
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone || '',
        avatar: req.body.avatar || null,
        specialties
      });
    } catch (error) {
      console.error('Error updating concierge:', error);
      res.status(500).json({ error: 'Failed to update concierge' });
    }
  })();
});

/**
 * DELETE /api/admin/config/concierges/:id - Delete concierge
 */
router.delete('/admin/config/concierges/:id', (req, res) => {
  (async () => {
    try {
      await sqlService.ensureConnection();
      await sqlService.query(
        'UPDATE concierges SET is_active = 0, updated_at = GETUTCDATE() WHERE concierge_id = @conciergeId',
        { conciergeId: req.params.id }
      );
      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting concierge:', error);
      res.status(500).json({ error: 'Failed to delete concierge' });
    }
  })();
});

/**
 * POST /api/admin/config/service-tiers - Add service tier
 */
router.post('/admin/config/service-tiers', (req, res) => {
  (async () => {
    try {
      await sqlService.ensureConnection();
      const tierId = req.body.id || req.body.name.toLowerCase().replace(/\s+/g, '-');
      const features = Array.isArray(req.body.features) ? req.body.features : [];

      await sqlService.query(`
        IF EXISTS (SELECT 1 FROM service_tiers WHERE tier_id = @tierId)
          UPDATE service_tiers
          SET name = @name,
              monthly_price = @monthlyPrice,
              features = @features,
              is_recommended = @recommended,
              updated_at = GETUTCDATE()
          WHERE tier_id = @tierId
        ELSE
          INSERT INTO service_tiers (tier_id, name, monthly_price, features, is_recommended, created_at, updated_at)
          VALUES (@tierId, @name, @monthlyPrice, @features, @recommended, GETUTCDATE(), GETUTCDATE())
      `, {
        tierId,
        name: req.body.name,
        monthlyPrice: req.body.monthlyPrice,
        features: JSON.stringify(features),
        recommended: req.body.recommended ? 1 : 0
      });

      res.json({
        id: tierId,
        name: req.body.name,
        monthlyPrice: req.body.monthlyPrice,
        features,
        recommended: !!req.body.recommended
      });
    } catch (error) {
      console.error('Error adding service tier:', error);
      res.status(500).json({ error: 'Failed to add service tier' });
    }
  })();
});

/**
 * PUT /api/admin/config/service-tiers/:id - Update service tier
 */
router.put('/admin/config/service-tiers/:id', (req, res) => {
  (async () => {
    try {
      await sqlService.ensureConnection();
      const features = Array.isArray(req.body.features) ? req.body.features : [];

      await sqlService.query(`
        UPDATE service_tiers
        SET name = @name,
            monthly_price = @monthlyPrice,
            features = @features,
            is_recommended = @recommended,
            updated_at = GETUTCDATE()
        WHERE tier_id = @tierId
      `, {
        tierId: req.params.id,
        name: req.body.name,
        monthlyPrice: req.body.monthlyPrice,
        features: JSON.stringify(features),
        recommended: req.body.recommended ? 1 : 0
      });

      res.json({
        id: req.params.id,
        name: req.body.name,
        monthlyPrice: req.body.monthlyPrice,
        features,
        recommended: !!req.body.recommended
      });
    } catch (error) {
      console.error('Error updating service tier:', error);
      res.status(500).json({ error: 'Failed to update service tier' });
    }
  })();
});

/**
 * DELETE /api/admin/config/service-tiers/:id - Delete service tier
 */
router.delete('/admin/config/service-tiers/:id', (req, res) => {
  (async () => {
    try {
      await sqlService.ensureConnection();
      await sqlService.query(
        'DELETE FROM service_tiers WHERE tier_id = @tierId',
        { tierId: req.params.id }
      );
      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting service tier:', error);
      res.status(500).json({ error: 'Failed to delete service tier' });
    }
  })();
});

/**
 * PUT /api/admin/config/hris-systems - Update HRIS systems list
 */
router.put('/admin/config/hris-systems', (req, res) => {
  (async () => {
    try {
      await sqlService.ensureConnection();
      const systems = Array.isArray(req.body) ? req.body : [];

      await sqlService.query('DELETE FROM hris_systems');

      for (const system of systems) {
        await sqlService.query(`
          INSERT INTO hris_systems (system_id, name, api_supported, created_at, updated_at)
          VALUES (@systemId, @name, @apiSupported, GETUTCDATE(), GETUTCDATE())
        `, {
          systemId: system.id,
          name: system.name,
          apiSupported: system.apiSupported ? 1 : 0
        });
      }

      res.json(systems);
    } catch (error) {
      console.error('Error updating HRIS systems:', error);
      res.status(500).json({ error: 'Failed to update HRIS systems' });
    }
  })();
});

/**
 * PUT /api/admin/config/hardware-options - Update hardware options
 */
router.put('/admin/config/hardware-options', (req, res) => {
  (async () => {
    try {
      await sqlService.ensureConnection();
      const deviceOptions = req.body?.deviceProcurement || [];
      const giftOptions = req.body?.welcomeGifts || [];

      await sqlService.query('DELETE FROM hardware_options');

      for (const option of deviceOptions) {
        await sqlService.query(`
          INSERT INTO hardware_options (option_id, option_type, name, description, estimated_value, created_at, updated_at)
          VALUES (@optionId, 'device', @name, @description, @estimatedValue, GETUTCDATE(), GETUTCDATE())
        `, {
          optionId: option.id,
          name: option.name,
          description: option.description || null,
          estimatedValue: option.value || null
        });
      }

      for (const option of giftOptions) {
        await sqlService.query(`
          INSERT INTO hardware_options (option_id, option_type, name, description, estimated_value, created_at, updated_at)
          VALUES (@optionId, 'gift', @name, @description, @estimatedValue, GETUTCDATE(), GETUTCDATE())
        `, {
          optionId: option.id,
          name: option.name,
          description: option.description || null,
          estimatedValue: option.value || null
        });
      }

      res.json({ deviceProcurement: deviceOptions, welcomeGifts: giftOptions });
    } catch (error) {
      console.error('Error updating hardware options:', error);
      res.status(500).json({ error: 'Failed to update hardware options' });
    }
  })();
});

/**
 * POST /api/admin/config/invitations - Add new invitation
 */
router.post('/admin/config/invitations', async (req, res) => {
  try {
    const { id, code, companyName, contactName, contactEmail, contactPhone, notes } = req.body;

    if (!companyName) {
      return res.status(400).json({ error: 'Company name is required' });
    }

    const invitationId = id || code || companyName.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now();

    await sqlService.query(
      `INSERT INTO invitations (invitation_id, company_name, contact_name, contact_email, contact_phone, notes, created_at, used)
       VALUES (@invitationId, @companyName, @contactName, @contactEmail, @contactPhone, @notes, GETUTCDATE(), 0)`,
      {
        invitationId,
        companyName,
        contactName: contactName || null,
        contactEmail: contactEmail || null,
        contactPhone: contactPhone || null,
        notes: notes || null
      }
    );

    // Send invitation email if contact email is provided (non-blocking)
    if (contactEmail) {
      try {
        await emailService.sendInvitation({
          to: contactEmail,
          companyName,
          contactName: contactName || companyName,
          invitationCode: invitationId,
          concierge: 'M-Theory Concierge Team',
        });
      } catch (emailError) {
        console.error('Invitation email failed (non-critical):', emailError.message);
      }
    }

    res.status(201).json({
      id: invitationId,
      code: invitationId,
      companyName,
      contactName,
      contactEmail,
      contactPhone,
      notes,
      createdAt: new Date().toISOString(),
      used: false
    });
  } catch (error) {
    console.error('Error adding invitation:', error);
    res.status(500).json({ error: 'Failed to add invitation' });
  }
});

/**
 * DELETE /api/admin/config/invitations/:id - Delete invitation
 */
router.delete('/admin/config/invitations/:id', async (req, res) => {
  try {
    await sqlService.query(
      'DELETE FROM invitations WHERE invitation_id = @invitationId',
      { invitationId: req.params.id }
    );
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting invitation:', error);
    res.status(500).json({ error: 'Failed to delete invitation' });
  }
});

// =====================================================
// CUSTOMER PRE-SETUP PROFILES
// =====================================================

const ensureCustomerProfilesTable = async () => {
  await sqlService.ensureConnection();
  await sqlService.query(`
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
  `);
};

/**
 * POST /api/admin/customer-profiles - Save complete customer profile
 */
router.post('/admin/customer-profiles', async (req, res) => {
  try {
    const profile = req.body;
    console.log('Saving customer profile with code:', profile.code);
    
    if (!profile.code) {
      return res.status(400).json({ error: 'Profile code is required' });
    }

    await ensureCustomerProfilesTable();

    const profileCode = profile.code;
    const profileJson = JSON.stringify(profile);

    const existingProfile = await sqlService.query(
      'SELECT profile_code FROM customer_profiles WHERE profile_code = @code',
      { code: profileCode }
    );

    if (existingProfile && existingProfile.length > 0) {
      console.log('Updating existing profile:', profileCode);
      await sqlService.query(`
        UPDATE customer_profiles
        SET profile_json = @profile,
            updated_at = GETUTCDATE()
        WHERE profile_code = @code
      `, {
        code: profileCode,
        profile: profileJson
      });
    } else {
      console.log('Inserting new profile:', profileCode);
      await sqlService.query(`
        INSERT INTO customer_profiles (profile_code, profile_json, created_at, updated_at, used)
        VALUES (@code, @profile, GETUTCDATE(), GETUTCDATE(), 0)
      `, {
        code: profileCode,
        profile: profileJson
      });
    }

    // Ensure invitation exists for this code so session creation works
    const invitationId = profile.id || profile.code;
    const existingInvite = await sqlService.query(
      'SELECT invitation_id FROM invitations WHERE invitation_id = @invitationId',
      { invitationId }
    );

    if (existingInvite && existingInvite.length > 0) {
      await sqlService.query(`
        UPDATE invitations
        SET company_name = @companyName,
            contact_name = @contactName,
            contact_email = @contactEmail,
            contact_phone = @contactPhone,
            notes = @notes
        WHERE invitation_id = @invitationId
      `, {
        invitationId,
        companyName: profile.companyName || '',
        contactName: profile.contactName || null,
        contactEmail: profile.contactEmail || null,
        contactPhone: profile.contactPhone || null,
        notes: profile.notes || null
      });
    } else {
      await sqlService.query(`
        INSERT INTO invitations (invitation_id, company_name, contact_name, contact_email, contact_phone, notes, created_at, used)
        VALUES (@invitationId, @companyName, @contactName, @contactEmail, @contactPhone, @notes, GETUTCDATE(), 0)
      `, {
        invitationId,
        companyName: profile.companyName || '',
        contactName: profile.contactName || null,
        contactEmail: profile.contactEmail || null,
        contactPhone: profile.contactPhone || null,
        notes: profile.notes || null
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
    await ensureCustomerProfilesTable();
    const result = await sqlService.query('SELECT * FROM customer_profiles ORDER BY created_at DESC');
    const profiles = (result || []).map(row => {
      const profile = row.profile_json ? JSON.parse(row.profile_json) : {};
      return {
        ...profile,
        code: profile.code || row.profile_code,
        id: profile.id || row.profile_code,
        used: row.used,
        usedAt: row.used_at,
        createdAt: row.created_at
      };
    });
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
    const code = req.params.code;
    console.log('Fetching customer profile for code:', code);
    
    await ensureCustomerProfilesTable();

    // Try exact match first, then try case-insensitive if no match
    let result = await sqlService.query(
      'SELECT * FROM customer_profiles WHERE profile_code = @code',
      { code: code }
    );
    
    // If no match, try case-insensitive search
    if (!result || result.length === 0) {
      console.log('No exact match, trying case-insensitive search');
      result = await sqlService.query(
        'SELECT * FROM customer_profiles WHERE LOWER(profile_code) = LOWER(@code)',
        { code: code }
      );
    }

    console.log('Query result:', result?.length ? `Found ${result.length} record(s)` : 'No records found');

    if (!result || result.length === 0) {
      console.warn('Profile not found for code:', code);
      // Also log all available codes for debugging
      const allCodes = await sqlService.query('SELECT profile_code FROM customer_profiles');
      console.warn('Available codes in database:', allCodes?.map(r => r.profile_code));
      return res.status(404).json({ error: 'Profile not found' });
    }

    const profileRow = result[0];
    const profile = profileRow.profile_json ? JSON.parse(profileRow.profile_json) : {};

    console.log('Returning profile for code:', code, 'with company:', profile.companyName);
    res.json({
      ...profile,
      code: profile.code || profileRow.profile_code,
      id: profile.id || profileRow.profile_code,
      used: profileRow.used,
      usedAt: profileRow.used_at,
      createdAt: profileRow.created_at
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
    await ensureCustomerProfilesTable();

    const existing = await sqlService.query(
      'SELECT * FROM customer_profiles WHERE profile_code = @code',
      { code: req.params.code }
    );

    if (!existing || existing.length === 0) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    const currentProfile = existing[0].profile_json ? JSON.parse(existing[0].profile_json) : {};
    const updatedProfile = { ...currentProfile, ...req.body };

    await sqlService.query(`
      UPDATE customer_profiles
      SET profile_json = @profile,
          updated_at = GETUTCDATE()
      WHERE profile_code = @code
    `, {
      code: req.params.code,
      profile: JSON.stringify(updatedProfile)
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
    await ensureCustomerProfilesTable();

    await sqlService.query(
      'DELETE FROM customer_profiles WHERE profile_code = @code',
      { code: req.params.code }
    );

    await sqlService.query(
      'DELETE FROM invitations WHERE invitation_id = @invitationId',
      { invitationId: req.params.code }
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting profile:', error);
    res.status(500).json({ error: 'Failed to delete profile' });
  }
});

// =====================================================
// STAGING & APPROVAL WORKFLOW
// =====================================================

/**
 * POST /api/admin/staging/profiles - Save profile to staging
 */
router.post('/admin/staging/profiles', async (req, res) => {
  try {
    const profile = req.body;
    const createdBy = profile.createdBy || 'admin@m-theorygrp.com';
    
    const result = await sqlService.query(`
      EXEC sp_SaveProfileToStaging
        @profileCode = @profileCode,
        @companyName = @companyName,
        @contactName = @contactName,
        @contactEmail = @contactEmail,
        @contactPhone = @contactPhone,
        @billingName = @billingName,
        @billingEmail = @billingEmail,
        @billingPhone = @billingPhone,
        @techName = @techName,
        @techEmail = @techEmail,
        @techPhone = @techPhone,
        @emergencyName = @emergencyName,
        @emergencyEmail = @emergencyEmail,
        @emergencyPhone = @emergencyPhone,
        @serviceTier = @serviceTier,
        @startDate = @startDate,
        @contractTerm = @contractTerm,
        @monthlyCommitment = @monthlyCommitment,
        @hrisSystem = @hrisSystem,
        @updateMethod = @updateMethod,
        @syncFrequency = @syncFrequency,
        @deviceChoice = @deviceChoice,
        @giftChoice = @giftChoice,
        @supportLevel = @supportLevel,
        @notes = @notes,
        @adminNotes = @adminNotes,
        @profileJson = @profileJson,
        @createdBy = @createdBy,
        @status = @status
    `, {
      profileCode: profile.code,
      companyName: profile.companyName,
      contactName: profile.contactName || null,
      contactEmail: profile.contactEmail || null,
      contactPhone: profile.contactPhone || null,
      billingName: profile.billingName || null,
      billingEmail: profile.billingEmail || null,
      billingPhone: profile.billingPhone || null,
      techName: profile.techName || null,
      techEmail: profile.techEmail || null,
      techPhone: profile.techPhone || null,
      emergencyName: profile.emergencyName || null,
      emergencyEmail: profile.emergencyEmail || null,
      emergencyPhone: profile.emergencyPhone || null,
      serviceTier: profile.serviceTier || null,
      startDate: profile.startDate || null,
      contractTerm: profile.contractTerm || null,
      monthlyCommitment: profile.monthlyCommitment || null,
      hrisSystem: profile.hrisSystem || null,
      updateMethod: profile.updateMethod || null,
      syncFrequency: profile.syncFrequency || null,
      deviceChoice: profile.deviceChoice || null,
      giftChoice: profile.giftChoice || null,
      supportLevel: profile.supportLevel || null,
      notes: profile.notes || null,
      adminNotes: profile.adminNotes || null,
      profileJson: JSON.stringify(profile),
      createdBy,
      status: profile.status || 'draft'
    });
    
    res.status(201).json({ success: true, result: result[0] });
  } catch (error) {
    console.error('Error saving profile to staging:', error);
    res.status(500).json({ error: 'Failed to save profile to staging' });
  }
});

/**
 * GET /api/admin/staging/profiles - Get staging profiles with optional filter
 */
router.get('/admin/staging/profiles', async (req, res) => {
  try {
    const { status } = req.query;
    
    let query = 'SELECT * FROM customer_profiles_staging';
    const params = {};
    
    if (status && status !== 'all') {
      query += ' WHERE status = @status';
      params.status = status;
    }
    
    query += ' ORDER BY submitted_at DESC, created_at DESC';
    
    const result = await sqlService.query(query, params);
    res.json(result || []);
  } catch (error) {
    console.error('Error fetching staging profiles:', error);
    res.status(500).json({ error: 'Failed to fetch staging profiles' });
  }
});

/**
 * GET /api/admin/staging/profiles/:code - Get single staging profile
 */
router.get('/admin/staging/profiles/:code', async (req, res) => {
  try {
    const result = await sqlService.query(
      'SELECT * FROM customer_profiles_staging WHERE profile_code = @code',
      { code: req.params.code }
    );
    
    if (!result || result.length === 0) {
      return res.status(404).json({ error: 'Profile not found in staging' });
    }
    
    res.json(result[0]);
  } catch (error) {
    console.error('Error fetching staging profile:', error);
    res.status(500).json({ error: 'Failed to fetch staging profile' });
  }
});

/**
 * POST /api/admin/staging/profiles/:code/submit - Submit profile for review
 */
router.post('/admin/staging/profiles/:code/submit', async (req, res) => {
  try {
    const { submittedBy } = req.body;
    
    const result = await sqlService.query(`
      EXEC sp_SubmitProfileForReview
        @profileCode = @profileCode,
        @submittedBy = @submittedBy
    `, {
      profileCode: req.params.code,
      submittedBy: submittedBy || 'admin@m-theorygrp.com'
    });
    
    res.json({ success: true, result: result[0] });
  } catch (error) {
    console.error('Error submitting profile for review:', error);
    res.status(500).json({ error: 'Failed to submit profile for review' });
  }
});

/**
 * POST /api/admin/staging/profiles/:code/approve - Approve profile
 */
router.post('/admin/staging/profiles/:code/approve', async (req, res) => {
  try {
    const { approvedBy, reviewNotes } = req.body;
    
    const result = await sqlService.query(`
      EXEC sp_ApproveProfile
        @profileCode = @profileCode,
        @approvedBy = @approvedBy,
        @reviewNotes = @reviewNotes
    `, {
      profileCode: req.params.code,
      approvedBy: approvedBy || 'admin@m-theorygrp.com',
      reviewNotes: reviewNotes || null
    });
    
    res.json({ success: true, result: result[0] });
  } catch (error) {
    console.error('Error approving profile:', error);
    res.status(500).json({ error: 'Failed to approve profile' });
  }
});

/**
 * POST /api/admin/staging/profiles/:code/reject - Reject profile
 */
router.post('/admin/staging/profiles/:code/reject', async (req, res) => {
  try {
    const { rejectedBy, reviewNotes } = req.body;
    
    const result = await sqlService.query(`
      EXEC sp_RejectProfile
        @profileCode = @profileCode,
        @rejectedBy = @rejectedBy,
        @reviewNotes = @reviewNotes
    `, {
      profileCode: req.params.code,
      rejectedBy: rejectedBy || 'admin@m-theorygrp.com',
      reviewNotes: reviewNotes || null
    });
    
    res.json({ success: true, result: result[0] });
  } catch (error) {
    console.error('Error rejecting profile:', error);
    res.status(500).json({ error: 'Failed to reject profile' });
  }
});

/**
 * POST /api/admin/staging/profiles/:code/archive - Archive profile
 */
router.post('/admin/staging/profiles/:code/archive', async (req, res) => {
  try {
    const { archivedBy, reason } = req.body;
    
    const result = await sqlService.query(`
      EXEC sp_ArchiveProfile
        @profileCode = @profileCode,
        @archivedBy = @archivedBy,
        @reason = @reason
    `, {
      profileCode: req.params.code,
      archivedBy: archivedBy || 'admin@m-theorygrp.com',
      reason: reason || null
    });
    
    res.json({ success: true, result: result[0] });
  } catch (error) {
    console.error('Error archiving profile:', error);
    res.status(500).json({ error: 'Failed to archive profile' });
  }
});

/**
 * GET /api/admin/staging/profiles/:code/audit - Get audit history for profile
 */
router.get('/admin/staging/profiles/:code/audit', async (req, res) => {
  try {
    const result = await sqlService.query(`
      EXEC sp_GetProfileAuditHistory @profileCode = @profileCode
    `, {
      profileCode: req.params.code
    });
    
    res.json(result || []);
  } catch (error) {
    console.error('Error fetching audit history:', error);
    res.status(500).json({ error: 'Failed to fetch audit history' });
  }
});

module.exports = router;
