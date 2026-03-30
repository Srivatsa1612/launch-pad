// server.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const config = require('./config');
const routes = require('./routes');
const sqlService = require('./services/sqlService');
const multer = require('multer');
const path = require('path');

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

// Serve React frontend in production
const frontendBuildPath = path.join(__dirname, '../../frontend/build');
app.use(express.static(frontendBuildPath));
app.get('*', (req, res) => {
  res.sendFile(path.join(frontendBuildPath, 'index.html'));
});

// Initialize database on startup
async function initializeDatabase() {
  try {
    console.log('🔌 Connecting to SQL Server...');
    await sqlService.connect();
    console.log('✓ SQL Server connection established');
    console.log('✓ Database ready');
  } catch (error) {
    console.error('❌ Failed to connect to SQL Server:', error.message);
    console.error('Please check your database configuration in .env file');
    throw error;
  }
}

// Start server
const PORT = config.port;

app.listen(PORT, async () => {
  console.log(`🚀 flowCUSTODIAN Wizard API running on port ${PORT}`);
  console.log(`📊 Environment: ${config.nodeEnv}`);
  console.log(`�️  Database: ${process.env.DB_SERVER}/${process.env.DB_NAME}`);
  
  // Initialize database
  await initializeDatabase();
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM signal received: closing HTTP server');
  await sqlService.disconnect();
  process.exit(0);
});

module.exports = app;
