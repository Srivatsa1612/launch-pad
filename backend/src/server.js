// server.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const config = require('./config');
const routes = require('./routes');
const livyService = require('./services/livyService');
const authService = require('./services/authService');

const app = express();

// Middleware
app.use(helmet());
app.use(cors(config.cors));
app.use(compression());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use('/uploads', express.static('uploads'));

// API routes
app.use('/api', routes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ error: err.message });
  }
  
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Initialize database on startup
async function initializeDatabase() {
  try {
    console.log('Initializing database schema...');
    await livyService.initializeSchema();
    console.log('Database schema initialized successfully');
  } catch (error) {
    console.error('Failed to initialize database:', error);
    console.log('Continuing without schema initialization - tables may need to be created manually');
  }
}

// Start server
const PORT = config.port;

app.listen(PORT, async () => {
  console.log(`🚀 flowCUSTODIAN Wizard API running on port ${PORT}`);
  console.log(`📊 Environment: ${config.nodeEnv}`);
  console.log(`🔗 Livy Endpoint: ${config.fabric.livyEndpoint}`);
  
  // Initialize authentication
  try {
    console.log(`🔐 Initializing Fabric authentication (${config.fabric.authType})...`);
    await authService.initialize();
    console.log('✓ Fabric authentication initialized');
  } catch (error) {
    console.error('❌ Failed to initialize authentication:', error.message);
    console.error('Please check your Fabric credentials in .env file');
  }
  
  // Initialize database
  await initializeDatabase();
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  authService.cleanup();
  server.close(() => {
    console.log('HTTP server closed');
  });
});

module.exports = app;
