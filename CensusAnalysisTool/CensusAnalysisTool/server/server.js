const express = require('express');
const cors = require('cors');
const sql = require('mssql');
const bodyParser = require('body-parser');
const session = require('express-session');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
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
      trustedConnection: true
    }
  },
  options: {
    trustServerCertificate: true,
    encrypt: true,
    enableArithAbort: true,
    integratedSecurity: true
  }
};

// Global pool for database connection
let globalPool = null;

// Initialize database connection on server start
async function initializeDatabase() {
  try {
    console.log('Initializing background database connection...');
    // For Windows Authentication
    const winAuthConfig = {
      ...sqlConfig,
      authentication: {
        type: 'ntlm',
        options: {
          domain: 'DESKTOP-32I8LFV', // Replace with your Windows domain
        }
      },
      options: {
        ...sqlConfig.options,
        trustedConnection: true
      }
    };
    
    globalPool = await new sql.ConnectionPool(winAuthConfig).connect();
    console.log('Database connection established successfully!');
  } catch (error) {
    console.error('Failed to establish database connection:', error);
  }
}

// User login endpoint
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Update connection config with user credentials
    const userConfig = {
      ...sqlConfig,
      authentication: {
        type: 'default',
        options: {
          userName: username,
          password: password
        }
      }
    };
    
    // Try to connect with these credentials
    const userPool = await new sql.ConnectionPool(userConfig).connect();
    
    // Check user role
    const roleResult = await userPool.request()
      .query("SELECT IS_MEMBER('CensusData_Admin') as isAdmin, IS_MEMBER('CensusData_Viewer') as isViewer");
    
    const userRole = roleResult.recordset[0].isAdmin ? 'admin' : 
                    (roleResult.recordset[0].isViewer ? 'viewer' : 'unknown');
    
    if (userRole === 'unknown') {
      await userPool.close();
      return res.status(403).json({
        success: false,
        message: 'User has no valid role assignments'
      });
    }
    
    // Store user session
    req.session.user = {
      username,
      role: userRole,
      authenticated: true
    };
    
    // Return success with role information
    res.json({
      success: true,
      role: userRole,
      username: username
    });
    
    // Close user pool - we'll use the global one for operations
    await userPool.close();
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(401).json({
      success: false,
      message: 'Invalid username or password'
    });
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

// Execute stored procedure endpoint - requires authentication
app.post('/api/execute-procedure', authMiddleware, async (req, res) => {
  try {
    if (!globalPool) {
      return res.status(500).json({ 
        success: false, 
        message: 'Database connection not available' 
      });
    }
    
    const { procedure, parameters } = req.body;
    
    // Check if procedure execution is allowed for this role
    // Viewer role can only execute read-only procedures
    if (req.session.user.role === 'viewer' && procedure.toLowerCase().startsWith('sp_update')) {
      return res.status(403).json({
        success: false,
        message: 'This procedure requires admin privileges'
      });
    }
    
    // Create a new request
    const request = globalPool.request();
    
    // Add parameters to request
    if (parameters && Array.isArray(parameters)) {
      parameters.forEach(param => {
        request.input(param.name, param.value);
      });
    }
    
    // Execute stored procedure
    const result = await request.execute(procedure);
    
    // Format the response
    const formattedResults = {
      columns: result.recordset && result.recordset.length > 0 ? Object.keys(result.recordset[0]) : [],
      rows: result.recordset || []
    };
    
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

// Serve static files from the parent directory
app.use(express.static('../'));

// Start the server and initialize database
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  initializeDatabase();
});