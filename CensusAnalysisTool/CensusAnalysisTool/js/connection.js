/**
 * Census Data Analysis Tool
 * Session Management and Procedure Execution
 * 
 * This script handles:
 * - User authentication and session management
 * - Database connection
 * - Stored procedure execution
 * - Results display integration
 */

// API endpoint base URL
const API_BASE_URL = 'http://localhost:3000';

// Global connection state object
const connectionState = {
    isConnected: false,
    userRole: null,
    username: null
};

// DOM Elements
const connectionStatus = document.getElementById('connection-status');
const procedureList = document.getElementById('procedure-list');
const procedurePanels = document.querySelectorAll('.procedure-panel');
const loadingOverlay = document.getElementById('loading-overlay');
const userInfo = document.getElementById('user-info');
const logoutButton = document.getElementById('logout-button');

// Define a flag for testing mode
const isTestingMode = true; // Set to true for testing, false for production

// Pre-defined test users with roles
const testUsers = {
    viewer: {
        username: 'demo',
        role: 'CensusData_Viewer', // Viewer role
        authenticated: true
    },
    admin: {
        username: 'uday',
        role: 'CensusData_Admin', // Admin role
        authenticated: true
    }
};

// Current test user (set to 'viewer' or 'admin' for testing)
const currentTestUser = testUsers.admin;

/**
 * Initialize application
 */
function initApplication() {
    // Check user session
    checkUserSession();
    
    // Add event listeners
    procedureList.addEventListener('click', handleProcedureSelect);
    
    // Add click handlers for all procedure execution buttons
    document.querySelectorAll('.procedure-form').forEach(form => {
        form.addEventListener('submit', handleProcedureExecute);
    });
    
    // Logout button handler
    logoutButton.addEventListener('click', handleLogout);
}

/**
 * Check if user has an active session
 */
function checkUserSession() {
    if (isTestingMode) {
        console.warn(`Using test user (${currentTestUser.username}) for session in testing mode`);
        connectionState.isConnected = true;
        connectionState.userRole = currentTestUser.role;
        connectionState.username = currentTestUser.username;

        // Update UI
        updateConnectionStatus(true);
        updateUserInfo({
            username: connectionState.username,
            role: connectionState.userRole
        });
        updateUIForRole(connectionState.userRole);

        // Enable procedure selection

        enableProcedureSelection();

        // Select the first procedure by default
        if (procedureList.querySelector('li')) {
            procedureList.querySelector('li').click();
        }
    } else {
        // Normal session check logic for production
        fetch(`${API_BASE_URL}/api/session`, {
            method: 'GET',
            credentials: 'include'
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                connectionState.isConnected = true;
                connectionState.userRole = data.user.role;
                connectionState.username = data.user.username;

                // Update UI
                updateConnectionStatus(true);
                updateUserInfo(data.user);
                updateUIForRole(data.user.role);

                // Enable procedure selection
                enableProcedureSelection();

                // Select the first procedure by default
                if (procedureList.querySelector('li')) {
                    procedureList.querySelector('li').click();
                }
            } else {
                throw new Error('No active session');
            }
        })
        .catch(error => {
            console.error('Session check failed:', error);
            updateConnectionStatus(false, error);
        });
    }
}

/**
 * Simulate a session for development/testing
 * This is used when the API is not available
 */
function simulateSession() {
    console.warn('Using simulated session for development');
    
    // Set simulated connection state
    connectionState.isConnected = true;
    connectionState.userRole = 'admin'; // Can be 'viewer' or 'admin'
    connectionState.username = 'TestUser';
    
    // Update UI
    updateConnectionStatus(true);
    updateUserInfo({
        username: connectionState.username,
        role: connectionState.userRole
    });
    updateUIForRole(connectionState.userRole);
    
    // Enable procedure selection
    enableProcedureSelection();
    
    // Select the first procedure by default
    if (procedureList.querySelector('li')) {
        procedureList.querySelector('li').click();
    }
}

/**
 * Update user information in sidebar
 * @param {Object} user - User data
 */
function updateUserInfo(user) {
    userInfo.innerHTML = `
        <div class="user-detail">
            <strong>Username:</strong> ${user.username}
        </div>
        <div class="user-detail">
            <strong>Role:</strong> ${user.role}
        </div>
    `;
}

/**
 * Update the connection status UI element
 * @param {boolean} isConnected - Whether the connection is established
 * @param {Error} error - Error object if connection failed
 */
function updateConnectionStatus(isConnected, error = null) {
    if (isConnected) {
        connectionStatus.innerHTML = `<i class="fas fa-user-check"></i> Logged in as ${connectionState.username} (${connectionState.userRole})`;
        connectionStatus.className = 'connection-status connected';
    } else {
        const errorMessage = error ? error.message : 'Not Connected';
        connectionStatus.innerHTML = `<i class="fas fa-plug-circle-xmark"></i> ${errorMessage}`;
        connectionStatus.className = 'connection-status error';
    }
}

/**
 * Update UI based on user role
 * @param {string} role - User role
 */
function updateUIForRole(role) {
    if (role === 'viewer') {
        // Hide admin-only elements
        document.querySelectorAll('.admin-only').forEach(el => {
            el.style.display = 'none';
        });
    }
}

/**
 * Handle logout button click
 */
function handleLogout() {
    fetch(`${API_BASE_URL}/api/logout`, {
        method: 'POST',
        credentials: 'include'
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Redirect to login page
            window.location.href = 'login.html';
        } else {
            showNotification('error', data.message || 'Logout failed');
        }
    })
    .catch(error => {
        console.error('Logout error:', error);
        showNotification('error', 'An error occurred during logout');
    });
}

/**
 * Enable procedure selection in the sidebar
 */
function enableProcedureSelection() {
    procedureList.querySelectorAll('li').forEach(item => {
        item.classList.add('selectable');
    });
}

/**
 * Handle procedure selection from the sidebar
 * @param {Event} event - Click event
 */
function handleProcedureSelect(event) {
    const item = event.target.closest('li');
    if (!item || !connectionState.isConnected) return;
    
    // Get procedure name from data attribute
    const procedureName = item.dataset.procedure;
    
    // Update active state in sidebar
    procedureList.querySelectorAll('li').forEach(li => {
        li.classList.remove('active');
    });
    item.classList.add('active');
    
    // Show corresponding procedure panel
    updateProcedurePanels(procedureName);
}

/**
 * Update procedure panels visibility based on selected procedure
 * @param {string} activeProcedure - Name of the active procedure
 */
function updateProcedurePanels(activeProcedure = null) {
    procedurePanels.forEach(panel => {
        if (activeProcedure && panel.id === activeProcedure) {
            panel.classList.add('active');
        } else {
            panel.classList.remove('active');
        }
    });
    
    // If no procedure is active and we're connected, show the first one
    if (!activeProcedure && connectionState.isConnected) {
        procedurePanels[0].classList.add('active');
    }
}

/**
 * Handle procedure execution form submission
 * @param {Event} event - Form submission event
 */
function handleProcedureExecute(event) {
    event.preventDefault();
    
    // Check if we're connected
    if (!connectionState.isConnected) {
        showNotification('error', 'Not logged in');
        return;
    }
    
    // Show loading overlay
    toggleLoadingOverlay(true);
    
    // Get the procedure panel and name
    const procedurePanel = event.target.closest('.procedure-panel');
    const procedureName = procedurePanel.id;
    
    // Get form data
    const formData = new FormData(event.target);
    const parameters = {};
    
    // Convert form data to parameter object
    formData.forEach((value, key) => {
        // Convert numeric values
        if (!isNaN(value) && value !== '') {
            parameters[key] = Number(value);
        } else {
            parameters[key] = value;
        }
    });
    
    // Execute the stored procedure
    executeProcedure(procedureName, parameters)
        .then(results => {
            // Display results
            displayResults(procedurePanel, results);
            showNotification('success', 'Procedure executed successfully');
        })
        .catch(error => {
            showNotification('error', `Execution failed: ${error.message}`);
        })
        .finally(() => {
            toggleLoadingOverlay(false);
        });
}

/**
 * Execute a stored procedure
 * @param {string} procedure - Name of the stored procedure
 * @param {Object} parameters - Parameter values
 * @returns {Promise} Procedure execution result
 */
function executeProcedure(procedure, parameters) {
    // Convert parameters to the format expected by the server
    const formattedParams = [];
    
    for (const key in parameters) {
        formattedParams.push({
            name: key,
            value: parameters[key]
        });
    }
    
    // Include role information in the request
    const requestBody = {
        procedure: procedure,
        parameters: formattedParams,
        role: connectionState.userRole // Pass the user's role to the server
    };

    // Make an API call to execute the procedure
    return fetch(`${API_BASE_URL}/api/execute-procedure`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody),
        credentials: 'include'  // Include session cookies
    })
    .then(response => {
        if (!response.ok) {
            if (response.status === 401) {
                // Handle authentication error
                console.warn('Authentication required. Ensure the server recognizes the simulated user.');
                throw new Error('Authentication required');
            }
            return response.json().then(data => {
                throw new Error(data.message || 'Procedure execution failed');
            });
        }
        return response.json().then(data => data.results);
    })
    .then(results => {
        console.log('Fetched Results:', results);

        // Process the results to extract relevant columns
        // Use results.rows instead of results directly
        const processedResults = results.rows.map(row => {
            const keys = Object.keys(row);
            return {
                state_fp: row['state_fp'],
                county_fp: row['county_fp'],
                last_column: row[keys[keys.length - 1]]
            };
        });

        console.log('Processed Results for Visualization:', processedResults);
        displayResults(processedResults);

        return results;
    })
    .catch(error => {
        console.error('Procedure execution error:', error);
        throw error;
    });
}

/**
 * Show a notification message
 * Uses the global showNotification function from results.js if available,


/**
 * Toggle the loading overlay
 * @param {boolean} show - Whether to show the overlay
 */
function toggleLoadingOverlay(show) {
    loadingOverlay.className = show ? 'loading-overlay active' : 'loading-overlay';
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initApplication);