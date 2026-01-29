// routes/index.js
const express = require('express');
const { body, param, validationResult } = require('express-validator');
const wizardService = require('../services/wizardService');
const livyService = require('../services/livyService');
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

module.exports = router;
