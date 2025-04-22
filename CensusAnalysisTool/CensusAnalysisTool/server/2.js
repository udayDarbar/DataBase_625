const sql = require('mssql');

const config = {
  server: 'DESKTOP-32I8LFV',
  database: 'CensusData',
  authentication: {
    type: 'default',
    options: {
      trustedConnection: true
    }
  },
  options: {
    trustServerCertificate: true,
    encrypt: true
  }
};

async function testConnection() {
  try {
    await sql.connect(config);
    console.log('Connected successfully!');
  } catch (err) {
    console.error('Connection failed:', err);
  } finally {
    sql.close();
  }
}

testConnection();