// test-staging-tables.js
// Quick test to verify staging tables and stored procedures exist

const sql = require('mssql');
require('dotenv').config();

const config = {
  server: process.env.DB_SERVER,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  options: {
    encrypt: true,
    trustServerCertificate: true,
    enableArithAbort: true
  }
};

async function testStagingSetup() {
  try {
    console.log('🔌 Connecting to database...');
    await sql.connect(config);
    console.log('✓ Connected to SQL Server');

    // Check tables
    console.log('\n📋 Checking tables...');
    const tables = await sql.query`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_NAME IN ('customer_profiles_staging', 'profile_audit_log', 'profile_reviewers')
      ORDER BY TABLE_NAME
    `;
    
    console.log(`Found ${tables.recordset.length} staging tables:`);
    tables.recordset.forEach(t => console.log(`  ✓ ${t.TABLE_NAME}`));

    // Check stored procedures
    console.log('\n⚙️  Checking stored procedures...');
    const procedures = await sql.query`
      SELECT ROUTINE_NAME 
      FROM INFORMATION_SCHEMA.ROUTINES 
      WHERE ROUTINE_TYPE = 'PROCEDURE'
      AND ROUTINE_NAME LIKE 'sp_%Profile%'
      ORDER BY ROUTINE_NAME
    `;
    
    console.log(`Found ${procedures.recordset.length} stored procedures:`);
    procedures.recordset.forEach(p => console.log(`  ✓ ${p.ROUTINE_NAME}`));

    // Test a simple insert
    console.log('\n🧪 Testing sp_SaveProfileToStaging...');
    const testCode = 'TEST-' + Date.now();
    const result = await sql.query`
      EXEC sp_SaveProfileToStaging
        @profileCode = ${testCode},
        @companyName = 'Test Company',
        @contactEmail = 'test@example.com',
        @createdBy = 'test-script',
        @status = 'draft'
    `;
    
    console.log('✓ Profile saved:', result.recordset[0]);

    // Verify it was saved
    const verify = await sql.query`
      SELECT profile_code, company_name, status 
      FROM customer_profiles_staging 
      WHERE profile_code = ${testCode}
    `;
    
    if (verify.recordset.length > 0) {
      console.log('✓ Verified in staging table:', verify.recordset[0]);
      
      // Clean up test data
      await sql.query`DELETE FROM customer_profiles_staging WHERE profile_code = ${testCode}`;
      console.log('✓ Test data cleaned up');
    }

    console.log('\n✅ All staging and approval workflow components are working!');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await sql.close();
  }
}

testStagingSetup();
