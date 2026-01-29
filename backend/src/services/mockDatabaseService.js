// services/mockDatabaseService.js
/**
 * Mock Database Service
 * 
 * Since Fabric's Livy API is unreliable, this service provides an in-memory
 * mock database that stores wizard session data locally.
 * 
 * In production, you would replace this with:
 * - Direct API calls to your Lakehouse
 * - A separate backend database (SQL Server, PostgreSQL, etc)
 * - Azure Cosmos DB or similar
 */

const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Data storage directory
const DATA_DIR = path.join(__dirname, '../../data');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  console.log('📁 Created data directory:', DATA_DIR);
}

class MockDatabase {
  constructor() {
    this.tables = {
      wizard_sessions: new Map(),
      key_contacts: new Map(),
      service_orders: new Map(),
      hr_setup: new Map(),
      hardware_preferences: new Map(),
      support_connections: new Map(),
      file_uploads: new Map(),
      wizard_audit_log: new Map()
    };
    
    this.loadFromDisk();
  }

  /**
   * Load data from disk on startup
   */
  loadFromDisk() {
    try {
      const dataFile = path.join(DATA_DIR, 'database.json');
      if (fs.existsSync(dataFile)) {
        const data = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
        
        // Convert arrays back to Maps
        for (const [tableName, records] of Object.entries(data)) {
          if (records && Array.isArray(records)) {
            this.tables[tableName] = new Map(records.map(r => [r.id || r.session_id || r.contact_id, r]));
          }
        }
        
        console.log('✓ Loaded data from disk');
      }
    } catch (error) {
      console.warn('⚠️  Could not load data from disk:', error.message);
    }
  }

  /**
   * Save all data to disk
   */
  saveToDisk() {
    try {
      const dataFile = path.join(DATA_DIR, 'database.json');
      const data = {};
      
      // Convert Maps to arrays
      for (const [tableName, map] of Object.entries(this.tables)) {
        data[tableName] = Array.from(map.values());
      }
      
      fs.writeFileSync(dataFile, JSON.stringify(data, null, 2), 'utf8');
    } catch (error) {
      console.error('Error saving data to disk:', error.message);
    }
  }

  /**
   * Insert data into a table
   */
  async insert(tableName, data) {
    try {
      if (!this.tables[tableName]) {
        throw new Error(`Table ${tableName} does not exist`);
      }

      // Generate ID if not provided
      const id = data.session_id || data.contact_id || data.order_id || data.hr_id || data.hardware_id || data.support_id || data.file_id || data.log_id || uuidv4();
      
      const record = { ...data, id, timestamp: new Date().toISOString() };
      this.tables[tableName].set(id, record);
      
      console.log(`✓ Inserted into ${tableName}:`, id);
      this.saveToDisk();
      
      return record;
    } catch (error) {
      console.error(`Error inserting into ${tableName}:`, error.message);
      throw error;
    }
  }

  /**
   * Select data from a table
   */
  async select(tableName, columns = '*', whereClause = '') {
    try {
      if (!this.tables[tableName]) {
        throw new Error(`Table ${tableName} does not exist`);
      }

      let results = Array.from(this.tables[tableName].values());

      // Simple WHERE clause parsing
      if (whereClause) {
        results = results.filter(record => {
          // Parse simple WHERE conditions like "session_id = 'value'"
          const match = whereClause.match(/(\w+)\s*=\s*'([^']*)'/);
          if (match) {
            const [, field, value] = match;
            return record[field] === value;
          }
          return true;
        });
      }

      // Handle column selection
      if (columns !== '*') {
        const columnList = columns.split(',').map(c => c.trim());
        results = results.map(r => {
          const obj = {};
          columnList.forEach(col => {
            obj[col] = r[col];
          });
          return obj;
        });
      }

      console.log(`✓ Selected ${results.length} records from ${tableName}`);
      return results;
    } catch (error) {
      console.error(`Error selecting from ${tableName}:`, error.message);
      throw error;
    }
  }

  /**
   * Update data in a table
   */
  async update(tableName, data, whereClause) {
    try {
      if (!this.tables[tableName]) {
        throw new Error(`Table ${tableName} does not exist`);
      }

      let updated = 0;
      
      for (const record of this.tables[tableName].values()) {
        // Parse simple WHERE conditions
        const match = whereClause.match(/(\w+)\s*=\s*'([^']*)'/);
        if (match) {
          const [, field, value] = match;
          if (record[field] === value) {
            Object.assign(record, data, { timestamp: new Date().toISOString() });
            updated++;
          }
        }
      }

      console.log(`✓ Updated ${updated} records in ${tableName}`);
      this.saveToDisk();
      
      return updated;
    } catch (error) {
      console.error(`Error updating ${tableName}:`, error.message);
      throw error;
    }
  }

  /**
   * Delete data from a table
   */
  async delete(tableName, whereClause) {
    try {
      if (!this.tables[tableName]) {
        throw new Error(`Table ${tableName} does not exist`);
      }

      let deleted = 0;
      const toDelete = [];

      for (const [key, record] of this.tables[tableName].entries()) {
        const match = whereClause.match(/(\w+)\s*=\s*'([^']*)'/);
        if (match) {
          const [, field, value] = match;
          if (record[field] === value) {
            toDelete.push(key);
            deleted++;
          }
        }
      }

      toDelete.forEach(key => this.tables[tableName].delete(key));

      console.log(`✓ Deleted ${deleted} records from ${tableName}`);
      this.saveToDisk();
      
      return deleted;
    } catch (error) {
      console.error(`Error deleting from ${tableName}:`, error.message);
      throw error;
    }
  }

  /**
   * Get total table stats for debugging
   */
  getStats() {
    const stats = {};
    for (const [tableName, map] of Object.entries(this.tables)) {
      stats[tableName] = map.size;
    }
    return stats;
  }
}

// Singleton instance
const mockDb = new MockDatabase();

module.exports = mockDb;
