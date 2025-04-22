/**
 * SQL Server Connection Test Script
 * This script tests various connection methods to help diagnose SQL Server connection issues
 */

const sql = require('mssql');

// Configuration options to test
const connectionConfigs = [
  {
    name: 'Windows Authentication (local)',
    config: {
      server: 'localhost',
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
    }
  },
  {
    name: 'Windows Authentication (named instance)',
    config: {
      server: 'localhost\\SQLEXPRESS', // Common default instance name, modify if needed
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
    }
  },
  {
    name: 'SQL Authentication',
    config: {
      server: 'localhost', // Or hostname/IP
      database: 'CensusData',
      authentication: {
        type: 'default',
        options: {
          userName: 'ViewerUserLogin', // From login.html example data
          password: 'StrongP@ssword1!' // From login.html example data
        }
      },
      options: {
        trustServerCertificate: true,
        encrypt: true
      }
    }
  }
];

/**
 * Tests a specific connection configuration
 * @param {Object} connectionOption - Connection option to test
 */
async function testConnection(connectionOption) {
  console.log(`\nTesting connection: ${connectionOption.name}`);
  console.log('-'.repeat(50));
  
  try {
    // Try to connect with this config
    console.log('Attempting connection...');
    const pool = await sql.connect(connectionOption.config);
    
    // If we got here, connection succeeded
    console.log('CONNECTION SUCCESSFUL!');
    
    // Try a basic query to verify the connection works
    const result = await pool.request().query('SELECT @@VERSION AS Version');
    console.log('SQL Server Version:');
    console.log(result.recordset[0].Version);
    
    // Close the connection
    await pool.close();
    console.log('Connection closed successfully.');
    
    return true;
  } catch (err) {
    console.error('CONNECTION FAILED:');
    console.error(`Error code: ${err.code}`);
    console.error(`Error message: ${err.message}`);
    
    // Additional diagnostic information
    if (err.code === 'ESOCKET') {
      console.log('\nPossible issues:');
      console.log('- SQL Server service is not running');
      console.log('- Firewall is blocking the connection');
      console.log('- Incorrect server name or instance name');
    } else if (err.code === 'ELOGIN') {
      console.log('\nPossible issues:');
      console.log('- Incorrect username or password');
      console.log('- User does not have permission to access the database');
      console.log('- SQL Server not configured for SQL Authentication');
    } else if (err.code === 'ETIMEOUT') {
      console.log('\nPossible issues:');
      console.log('- SQL Server is not reachable on the specified address/port');
      console.log('- Network connectivity issue between client and server');
      console.log('- SQL Server Browser service is not running (for named instances)');
    }
    
    return false;
  }
}

/**
 * Main function to test all connection methods
 */
async function runAllTests() {
  console.log('SQL SERVER CONNECTION TESTER');
  console.log('===========================');
  console.log('Testing multiple connection methods to diagnose issues...');
  
  let anySuccessful = false;
  
  // Test each connection option
  for (const connectionOption of connectionConfigs) {
    const success = await testConnection(connectionOption);
    if (success) anySuccessful = true;
  }
  
  console.log('\nTEST SUMMARY');
  console.log('===========');
  if (anySuccessful) {
    console.log('At least one connection method succeeded!');
    console.log('Use the successful configuration in your application.');
  } else {
    console.log('All connection attempts failed.');
    console.log('\nTROUBLESHOOTING TIPS:');
    console.log('1. Verify SQL Server is running (Services app or SQL Server Configuration Manager)');
    console.log('2. Ensure the correct server name/instance name is specified');
    console.log('3. Check if Windows Firewall is blocking SQL Server ports (default: 1433)');
    console.log('4. For named instances, ensure SQL Server Browser service is running');
    console.log('5. Verify the user has appropriate permissions to the database');
  }
}

// Run all the tests
runAllTests().catch(err => {
  console.error('Test script encountered an error:', err);
});