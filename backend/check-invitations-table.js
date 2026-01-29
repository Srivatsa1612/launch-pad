const sql = require('mssql');

async function checkTable() {
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
    
    const result = await pool.request().query(`
      SELECT COLUMN_NAME, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH, IS_NULLABLE
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'invitations'
      ORDER BY ORDINAL_POSITION
    `);
    
    console.log('Invitations table columns:');
    console.table(result.recordset);
    
    await pool.close();
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkTable();
