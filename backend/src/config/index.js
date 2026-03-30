// config/index.js
require('dotenv').config();

module.exports = {
  port: process.env.PORT || 3001,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  fabric: {
    livyEndpoint: process.env.LIVY_ENDPOINT,
    token: process.env.FABRIC_TOKEN,
    workspaceId: process.env.WORKSPACE_ID,
    lakehouseId: process.env.LAKEHOUSE_ID,
    authType: process.env.FABRIC_AUTH_TYPE || 'user', // 'user' or 'service-principal'
    servicePrincipal: {
      clientId: process.env.AZURE_CLIENT_ID,
      clientSecret: process.env.AZURE_CLIENT_SECRET,
      tenantId: process.env.AZURE_TENANT_ID,
    },
  },
  
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
  },
  
  upload: {
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedMimeTypes: [
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/pdf'
    ],
  },
  
  session: {
    timeoutMinutes: 30,
  },
};
