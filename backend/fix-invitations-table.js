const sql = require('mssql');

async function fixInvitationsTable() {
  const config = {
    server: 'MTCG-SQL-DEV',
    database: 'flowCUSTODIAN',
    authentication: {
      type: 'default',
      options: {
        userName: 'fccollector',
        password: 'B00tlegger!2'
      }
    },
    options: {
      encrypt: true,
      trustServerCertificate: true
    }
  };

  try {
    const pool = await sql.connect(config);
    
    // Add missing columns
    console.log('Adding code and customer_profile columns...');
    await pool.request().query(`
      ALTER TABLE invitations 
      ADD code NVARCHAR(50), 
          customer_profile NVARCHAR(MAX)
    `);
    
    console.log('✓ Columns added successfully');
    
    await pool.close();
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

fixInvitationsTable();
