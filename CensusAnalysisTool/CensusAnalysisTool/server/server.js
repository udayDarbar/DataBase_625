const express = require('express');
const cors = require('cors');
const sql = require('mssql');
const bodyParser = require('body-parser');
const session = require('express-session');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:5500'],
  credentials: true
}));
app.use(bodyParser.json());
app.use(session({
  secret: 'census-data-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 } // 24 hours
}));

// Database configuration
let sqlConfig = {
  server: 'DESKTOP-32I8LFV',
  database: 'CensusData',
  authentication: {
    type: 'default',
    options: {
      userName: 't2', // Replace with SQL Server username
      password: 't2'  // Replace with SQL Server password
    }
  },
  options: {
    trustServerCertificate: true,
    encrypt: true,
    enableArithAbort: true
  }
};

console.log('Using SQL Config:', sqlConfig);

// Role-based SQL Server credentials
const roleBasedCredentials = {
  viewer: {
    user: 'ViewerUserLogin', // Replace with actual viewer login
    password: 'StrongP@ssword1!' // Replace with actual viewer password
  },
  admin: {
    user: 'AdminUserLogin', // Replace with actual admin login
    password: 'StrongP@ssword2!' // Replace with actual admin password
  }
};

// Function to get SQL Server config based on role
function getSqlConfigForRole(role) {
  const credentials = roleBasedCredentials[role];
  if (!credentials) {
    throw new Error(`No credentials found for role: ${role}`);
  }

  return {
    ...sqlConfig,
    authentication: {
      type: 'default',
      options: {
        userName: credentials.user,
        password: credentials.password
      }
    }
  };
}

// Global pool for database connection
let globalPool = null;

// Initialize database connection on server start
async function initializeDatabase() {
  try {
    console.log('Attempting Windows Authentication...');
    const windowsAuthConfig = {
      ...sqlConfig,
      authentication: {
        type: 'ntlm', // Use NTLM for Windows Authentication
        options: {
          domain: process.env.COMPUTERNAME || 'localhost', // Use your machine's name or domain
          userName: '', // Leave empty for the current Windows user
          password: ''  // Leave empty for the current Windows user
        }
      }
    };

    globalPool = await new sql.ConnectionPool(windowsAuthConfig).connect();
    console.log('Database connection established successfully using Windows Authentication!');
  } catch (windowsAuthError) {
    console.error('Windows Authentication failed:', windowsAuthError.message);

    try {
      console.log('Attempting SQL Server Authentication...');
      globalPool = await new sql.ConnectionPool(sqlConfig).connect();
      console.log('Database connection established successfully using SQL Server Authentication!');
    } catch (sqlAuthError) {
      console.error('SQL Server Authentication failed:', sqlAuthError.message);
      throw new Error('Failed to establish database connection using both Windows and SQL Server Authentication.');
    }
  }
}

// User login endpoint
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    console.log('Login attempt:', { username, password }); // Debugging log

    if (username === 'ViewerUserLogin' && password === 'StrongP@ssword1!') {
      req.session.user = {
        username,
        role: 'viewer',
        authenticated: true
      };
      console.log('Login successful for Viewer'); // Debugging log
      res.json({ success: true, message: 'Login successful' });
    } else if (username === 'AdminUserLogin' && password === 'StrongP@ssword2!') {
      req.session.user = {
        username,
        role: 'admin',
        authenticated: true
      };
      console.log('Login successful for Admin'); // Debugging log
      res.json({ success: true, message: 'Login successful' });
    } else {
      console.log('Invalid credentials'); // Debugging log
      res.status(401).json({ success: false, message: 'Invalid username or password' });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'An error occurred during login' });
  }
});

// Auth middleware to check if user is logged in
const authMiddleware = (req, res, next) => {
  if (req.session && req.session.user && req.session.user.authenticated) {
    next();
  } else {
    res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }
};

// Role middleware to check if user has required role
const roleMiddleware = (roles) => {
  return (req, res, next) => {
    if (req.session && req.session.user && roles.includes(req.session.user.role)) {
      next();
    } else {
      res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      });
    }
  };
};

// Logout endpoint
app.post('/api/logout', (req, res) => {
  req.session.destroy();
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
});

// Get current user session
app.get('/api/session', (req, res) => {
  if (req.session && req.session.user) {
    res.json({
      success: true,
      user: {
        username: req.session.user.username,
        role: req.session.user.role
      }
    });
  } else {
    res.json({
      success: false,
      message: 'No active session'
    });
  }
});

// Execute stored procedure endpoint - refined for proper execution
// Remove authMiddleware from this endpoint for testing
app.post('/api/execute-procedure', async (req, res) => {  // Removed authMiddleware
  try {
    const { procedure, parameters } = req.body;

    console.log(`Executing procedure: ${procedure}`);

    if (!globalPool) {
      console.error('Database connection not available');
      return res.status(500).json({
        success: false,
        message: 'Database connection not available',
      });
    }

    // Create a new request
    const request = globalPool.request();

    // Add parameters to the request
    if (parameters && Array.isArray(parameters)) {
      parameters.forEach(param => {
        console.log(`Adding parameter: ${param.name} = ${param.value}`);
        request.input(param.name, param.value);
      });
    }

    // Execute the stored procedure
    const result = await request.execute(procedure);

    // Format the response
    const formattedResults = {
      columns: result.recordset && result.recordset.length > 0 ? Object.keys(result.recordset[0]) : [],
      rows: result.recordset || []
    };

    console.log('Procedure executed successfully:', formattedResults);

    res.json({
      success: true,
      results: formattedResults
    });
  } catch (error) {
    console.error('Procedure execution error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// New endpoint to execute stored procedure with parameters
app.post('/api/procedure/:procedure', async (req, res) => {
  const { procedure } = req.params;
  const params = req.body;

  if (!procedure) {
    return res.status(400).json({
      success: false,
      message: 'Procedure name is required'
    });
  }

  console.log(`Executing procedure: ${procedure}`);

  if (!globalPool) {
    console.error('Database connection not available');
    return res.status(500).json({
      success: false,
      message: 'Database connection not available',
    });
  }

  try {
    const request = globalPool.request();

    // Convert flat params object to array of { name, value } and add inputs
    Object.keys(params).forEach((key) => {
      console.log(`Adding parameter: ${key} = ${params[key]}`);
      request.input(key, params[key]);
    });

    // Execute the stored procedure
    const result = await request.execute(procedure);

    // Format the response
    const formattedResults = {
      columns: result.recordset && result.recordset.length > 0 ? Object.keys(result.recordset[0]) : [],
      rows: result.recordset || []
    };

    console.log('Procedure executed successfully:', formattedResults);

    res.json({
      success: true,
      results: formattedResults
    });
  } catch (error) {
    console.error('Error executing procedure:', error);

    // Return a more descriptive error message
    res.status(500).json({
      success: false,
      message: error.originalError ? error.originalError.message : error.message
    });
  }
});

// Serve static files from the parent directory
app.use(express.static('../'));

// Start the server and initialize database
initializeDatabase()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Server is running on http://localhost:${PORT}`);
        });
    })
    .catch((error) => {
        console.error('Failed to initialize database:', error.message);
        process.exit(1); // Exit the process if the database connection fails
    });