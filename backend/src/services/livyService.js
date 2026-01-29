// services/livyService.js
const mockDb = require('./mockDatabaseService');

/**
 * LivyService - Database Abstraction Layer
 * 
 * This service abstracts database operations. Due to Fabric Livy API reliability issues,
 * it currently uses a mock in-memory database with file persistence.
 * 
 * To switch back to Fabric Livy, replace the method implementations with axios calls.
 */

class LivyService {
  /**
   * Insert data into table
   */
  async insert(tableName, data) {
    return await mockDb.insert(tableName, data);
  }

  /**
   * Select data from table
   */
  async select(tableName, columns = '*', whereClause = '', orderBy = '') {
    return await mockDb.select(tableName, columns, whereClause);
  }

  /**
   * Update data in table
   */
  async update(tableName, data, whereClause) {
    return await mockDb.update(tableName, data, whereClause);
  }

  /**
   * Delete data from table
   */
  async delete(tableName, whereClause) {
    return await mockDb.delete(tableName, whereClause);
  }

  /**
   * Initialize database schema
   */
  async initializeSchema() {
    console.log('✓ Database ready (using mock database with file persistence)');
    console.log(`📊 Table stats:`, mockDb.getStats());
  }
}

module.exports = new LivyService();
