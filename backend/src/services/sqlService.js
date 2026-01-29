// backend/src/services/sqlService.js
const sql = require('mssql');

class SQLService {
  constructor() {
    this.pool = null;
    this.config = {
      server: process.env.DB_SERVER || 'localhost',
      authentication: {
        type: 'default',
        options: {
          userName: process.env.DB_USER || 'sa',
          password: process.env.DB_PASSWORD || '',
        }
      },
      options: {
        database: process.env.DB_NAME || 'FlowCustodian',
        trustServerCertificate: true,  // For development only
        encrypt: true,
        connectionTimeout: 15000,
        requestTimeout: 30000,
      }
    };
  }

  async connect() {
    try {
      this.pool = new sql.ConnectionPool(this.config);
      await this.pool.connect();
      console.log('✓ Connected to SQL Server: ' + this.config.options.database);
      return this.pool;
    } catch (error) {
      console.error('✗ SQL Server connection failed:', error.message);
      throw error;
    }
  }

  async disconnect() {
    try {
      if (this.pool) {
        await this.pool.close();
        console.log('✓ Disconnected from SQL Server');
      }
    } catch (error) {
      console.error('Error disconnecting from SQL Server:', error);
    }
  }

  async query(queryString, params = {}) {
    try {
      const request = this.pool.request();
      
      // Add parameters to request
      Object.keys(params).forEach(key => {
        request.input(key, params[key]);
      });

      const result = await request.query(queryString);
      return result.recordset || result;
    } catch (error) {
      console.error('SQL Query Error:', error);
      throw error;
    }
  }

  async execute(procedureName, params = {}) {
    try {
      const request = this.pool.request();
      
      // Add parameters to request
      Object.keys(params).forEach(key => {
        request.input(key, params[key]);
      });

      const result = await request.execute(procedureName);
      return result.recordset || result;
    } catch (error) {
      console.error('Stored Procedure Error:', error);
      throw error;
    }
  }

  getPool() {
    return this.pool;
  }

  async ensureConnection() {
    if (!this.pool) {
      await this.connect();
    }
  }
}

module.exports = new SQLService();
