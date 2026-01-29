// Test SQL Server connection
require('dotenv').config();
const sqlService = require('./src/services/sqlService');

async function testConnection() {
    try {
        console.log('Testing connection to SQL Server...');
        console.log(`Server: ${process.env.DB_SERVER}`);
        console.log(`Database: ${process.env.DB_NAME}`);
        console.log(`User: ${process.env.DB_USER}`);
        
        // Connect to database
        await sqlService.connect();
        console.log('✓ Connection established successfully!\n');
        
        // Test query: Get count of all tables
        const tableCountResult = await sqlService.query(`
            SELECT COUNT(*) as table_count
            FROM INFORMATION_SCHEMA.TABLES
            WHERE TABLE_TYPE = 'BASE TABLE'
        `);
        console.log(`✓ Tables found: ${tableCountResult[0].table_count}\n`);
        
        // Test query: List all tables
        const tablesResult = await sqlService.query(`
            SELECT TABLE_NAME
            FROM INFORMATION_SCHEMA.TABLES
            WHERE TABLE_TYPE = 'BASE TABLE'
            ORDER BY TABLE_NAME
        `);
        console.log('✓ Table list:');
        tablesResult.forEach(row => {
            console.log(`  - ${row.TABLE_NAME}`);
        });
        
        // Test query: Get concierges
        console.log('\n✓ Testing data retrieval - Concierges:');
        const conciergesResult = await sqlService.query('SELECT * FROM concierges');
        conciergesResult.forEach(c => {
            console.log(`  - ${c.name} (${c.email})`);
        });
        
        // Test query: Get service tiers
        console.log('\n✓ Testing data retrieval - Service Tiers:');
        const tiersResult = await sqlService.query('SELECT tier_id, name, monthly_price FROM service_tiers ORDER BY monthly_price');
        tiersResult.forEach(t => {
            console.log(`  - ${t.name}: $${t.monthly_price}/mo`);
        });
        
        // Test stored procedure
        console.log('\n✓ Testing stored procedure - Get all sessions:');
        const sessionsResult = await sqlService.execute('sp_GetAllSessions', {});
        console.log(`  Found ${sessionsResult.length} sessions`);
        
        console.log('\n✅ All database connectivity tests passed!');
        
    } catch (error) {
        console.error('❌ Database connection test failed:');
        console.error(error.message);
        console.error(error);
    } finally {
        await sqlService.disconnect();
        console.log('\nConnection closed.');
    }
}

testConnection();
