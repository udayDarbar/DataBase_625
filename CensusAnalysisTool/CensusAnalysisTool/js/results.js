/**
 * Census Data Analysis Tool
 * Results Handling and Visualization
 * 
 * This script handles the results display and visualization:
 * - Formats data for different data types
 * - Creates table views of procedure results
 * - Handles data visualization through charts
 * - Manages export functionality
 */

// Global results state
const resultsState = {
    currentProcedure: null,
    currentResults: null,
    pageSize: 25,
    currentPage: 1
};

// DOM Elements
const resultsPanels = document.querySelectorAll('.results-container');

/**
 * Initialize results handling
 */
function initResultsHandling() {
    // Add event listeners for export buttons
    document.querySelectorAll('.btn-export').forEach(button => {
        button.addEventListener('click', handleExportResults);
    });
    
    // Add event listeners for clear buttons
    document.querySelectorAll('.btn-clear').forEach(button => {
        button.addEventListener('click', handleClearResults);
    });
}

/**
 * Display procedure execution results
 * @param {HTMLElement} procedurePanel - The procedure panel element
 * @param {Object} results - Results data object
 */
function displayResults(procedurePanel, results) {
    // Find results containers
    const resultsData = procedurePanel.querySelector('.results-data');
    const emptyState = procedurePanel.querySelector('.results-empty-state');
    
    // Update results state
    resultsState.currentProcedure = procedurePanel.id;
    resultsState.currentResults = results;
    resultsState.currentPage = 1;
    
    // Hide empty state, show results data
    emptyState.style.display = 'none';
    resultsData.style.display = 'block';
    
    // Create results content
    const resultsContent = document.createElement('div');
    resultsContent.className = 'results-content-inner';
    
    // Add results summary
    const summaryElement = createResultsSummary(results);
    resultsContent.appendChild(summaryElement);
    
    // Create and add the results table
    const tableElement = createResultsTable(results);
    resultsContent.appendChild(tableElement);
    
    // Create pagination if needed
    if (results.rows.length > resultsState.pageSize) {
        const paginationElement = createPagination(results.rows.length);
        resultsContent.appendChild(paginationElement);
    }
    
    // Clear previous results and add new content
    resultsData.innerHTML = '';
    resultsData.appendChild(resultsContent);
}

/**
 * Create a summary element for the results
 * @param {Object} results - Results data
 * @returns {HTMLElement} Summary element
 */
function createResultsSummary(results) {
    const summary = document.createElement('div');
    summary.className = 'results-summary';
    
    // Create summary text
    let summaryText = `<strong>${results.rows.length}</strong> records found`;
    
    // Add additional stats based on procedure type
    const procedureId = resultsState.currentProcedure;
    if (procedureId) {
        const meta = window.CensusProcedures.getProcedureMetadata(procedureId);
        if (meta) {
            // Add specific stats based on procedure
            switch (procedureId) {
                case 'sp_IdentifyHighPovertyAreas':
                    if (results.rows.length > 0) {
                        // Calculate average poverty rate
                        const avgChildPoverty = results.rows.reduce((sum, row) => sum + row.ChildPovertyRate, 0) / results.rows.length;
                        summaryText += ` with an average child poverty rate of <strong>${avgChildPoverty.toFixed(1)}%</strong>`;
                    }
                    break;
                    
                case 'sp_AssessHousingAffordability':
                    if (results.rows.length > 0) {
                        // Calculate average rent-to-income ratio
                        const avgRatio = results.rows.reduce((sum, row) => sum + row.RentToIncomeRatio, 0) / results.rows.length;
                        summaryText += ` with an average rent-to-income ratio of <strong>${(avgRatio * 100).toFixed(1)}%</strong>`;
                    }
                    break;
                    
                case 'sp_GetYearlyPopulationTrends':
                    if (results.rows.length > 0) {
                        // Calculate total population change
                        const totalChange = results.rows.reduce((sum, row) => sum + row.YearlyChange, 0);
                        const changeDirection = totalChange >= 0 ? 'increase' : 'decrease';
                        summaryText += ` with a net population <strong>${changeDirection}</strong> of <strong>${Math.abs(totalChange).toLocaleString()}</strong>`;
                    }
                    break;
                    
                default:
                    // No additional stats for other procedures
                    break;
            }
        }
    }
    
    summary.innerHTML = summaryText;
    return summary;
}

/**
 * Create a results table element
 * @param {Object} results - Results data
 * @returns {HTMLElement} Table element
 */
function createResultsTable(results) {
    const tableContainer = document.createElement('div');
    tableContainer.className = 'results-table-container';
    
    // Create table
    const table = document.createElement('table');
    table.className = 'results-table';
    
    // Create header
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    
    results.columns.forEach(column => {
        const th = document.createElement('th');
        th.textContent = formatColumnName(column);
        headerRow.appendChild(th);
    });
    
    thead.appendChild(headerRow);
    table.appendChild(thead);
    
    // Create body
    const tbody = document.createElement('tbody');
    
    // Get current page of rows
    const startIndex = (resultsState.currentPage - 1) * resultsState.pageSize;
    const endIndex = Math.min(startIndex + resultsState.pageSize, results.rows.length);
    const displayRows = results.rows.slice(startIndex, endIndex);
    
    // Create rows
    displayRows.forEach(row => {
        const tr = document.createElement('tr');
        
        results.columns.forEach(column => {
            const td = document.createElement('td');
            
            // Format cell value based on column type
            td.textContent = formatCellValue(row[column], column);
            
            // Add appropriate cell class
            td.className = getCellClass(column, row[column]);
            
            tr.appendChild(td);
        });
        
        tbody.appendChild(tr);
    });
    
    table.appendChild(tbody);
    tableContainer.appendChild(table);
    
    return tableContainer;
}

/**
 * Format a column name for display
 * @param {string} columnName - Raw column name
 * @returns {string} Formatted column name
 */
function formatColumnName(columnName) {
    // Split camelCase
    return columnName
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, str => str.toUpperCase());
}

/**
 * Format a cell value based on data type and column name
 * @param {*} value - Cell value
 * @param {string} columnName - Column name
 * @returns {string} Formatted value
 */
function formatCellValue(value, columnName) {
    if (value === null || value === undefined) {
        return '-';
    }
    
    // Check column name patterns
    if (/income|rent|value|price|cost/i.test(columnName)) {
        // Currency format
        return '$' + value.toLocaleString('en-US');
    }
    
    if (/ratio|rate|percent/i.test(columnName) && typeof value === 'number' && value <= 1) {
        // Percentage format
        return (value * 100).toFixed(1) + '%';
    }
    
    if (/population|pop|people|count/i.test(columnName) && typeof value === 'number') {
        // Population number format
        return value.toLocaleString('en-US');
    }
    
    if (typeof value === 'number') {
        // General number format
        if (value % 1 !== 0) {
            return value.toFixed(1);
        }
        return value.toLocaleString('en-US');
    }
    
    // String values (potentially FIPS codes)
    if (columnName === 'StateFP') {
        // Get state name from FIPS code
        return window.CensusProcedures.getFIPSDisplayName(value, 'state');
    }
    
    return value.toString();
}

/**
 * Get CSS class for a table cell based on column and value
 * @param {string} column - Column name
 * @param {*} value - Cell value
 * @returns {string} CSS class
 */
function getCellClass(column, value) {
    if (value === null || value === undefined) {
        return '';
    }
    
    // Number formats
    if (typeof value === 'number') {
        if (/income|rent|value|price|cost/i.test(column)) {
            return 'cell-number cell-currency';
        }
        
        if (/ratio|rate|percent/i.test(column)) {
            return 'cell-percent';
        }
        
        return 'cell-number';
    }
    
    // Date formats
    if (value instanceof Date || column.includes('Date') || column.includes('Year')) {
        return 'cell-date';
    }
    
    return '';
}

/**
 * Create pagination controls
 * @param {number} totalRecords - Total number of records
 * @returns {HTMLElement} Pagination element
 */
function createPagination(totalRecords) {
    const totalPages = Math.ceil(totalRecords / resultsState.pageSize);
    
    const paginationContainer = document.createElement('div');
    paginationContainer.className = 'results-pagination';
    
    // Add page info
    const pageInfo = document.createElement('div');
    pageInfo.className = 'pagination-info';
    const startRecord = ((resultsState.currentPage - 1) * resultsState.pageSize) + 1;
    const endRecord = Math.min(resultsState.currentPage * resultsState.pageSize, totalRecords);
    pageInfo.textContent = `Showing ${startRecord}-${endRecord} of ${totalRecords} records`;
    
    // Add page controls
    const pageControls = document.createElement('div');
    pageControls.className = 'pagination-controls';
    
    // Previous button
    const prevButton = document.createElement('button');
    prevButton.type = 'button';
    prevButton.className = 'page-button';
    prevButton.innerHTML = '&laquo;';
    prevButton.disabled = resultsState.currentPage === 1;
    prevButton.addEventListener('click', () => changePage(resultsState.currentPage - 1));
    
    // Page buttons
    const pageButtons = [];
    const maxPageButtons = 5;
    let startPage = Math.max(1, resultsState.currentPage - Math.floor(maxPageButtons / 2));
    let endPage = Math.min(totalPages, startPage + maxPageButtons - 1);
    
    // Adjust start page if we're near the end
    if (endPage - startPage + 1 < maxPageButtons) {
        startPage = Math.max(1, endPage - maxPageButtons + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
        const pageButton = document.createElement('button');
        pageButton.type = 'button';
        pageButton.className = `page-button ${i === resultsState.currentPage ? 'active' : ''}`;
        pageButton.textContent = i;
        pageButton.addEventListener('click', () => changePage(i));
        pageButtons.push(pageButton);
    }
    
    // Next button
    const nextButton = document.createElement('button');
    nextButton.type = 'button';
    nextButton.className = 'page-button';
    nextButton.innerHTML = '&raquo;';
    nextButton.disabled = resultsState.currentPage === totalPages;
    nextButton.addEventListener('click', () => changePage(resultsState.currentPage + 1));
    
    // Assemble pagination
    pageControls.appendChild(prevButton);
    pageButtons.forEach(button => pageControls.appendChild(button));
    pageControls.appendChild(nextButton);
    
    paginationContainer.appendChild(pageInfo);
    paginationContainer.appendChild(pageControls);
    
    return paginationContainer;
}

/**
 * Change the current results page
 * @param {number} page - Page number to navigate to
 */
function changePage(page) {
    // Update current page
    resultsState.currentPage = page;
    
    // Find the active procedure panel
    const procedurePanel = document.getElementById(resultsState.currentProcedure);
    if (!procedurePanel) return;
    
    // Redisplay results with new page
    const resultsData = procedurePanel.querySelector('.results-data');
    if (!resultsData) return;
    
    // Create updated results content
    resultsData.innerHTML = '';
    
    // Create new content with updated page
    const resultsContent = document.createElement('div');
    resultsContent.className = 'results-content-inner';
    
    // Add results summary
    const summaryElement = createResultsSummary(resultsState.currentResults);
    resultsContent.appendChild(summaryElement);
    
    // Create and add the results table
    const tableElement = createResultsTable(resultsState.currentResults);
    resultsContent.appendChild(tableElement);
    
    // Create pagination if needed
    if (resultsState.currentResults.rows.length > resultsState.pageSize) {
        const paginationElement = createPagination(resultsState.currentResults.rows.length);
        resultsContent.appendChild(paginationElement);
    }
    
    // Add new content
    resultsData.appendChild(resultsContent);
}

/**
 * Handle export results button click
 * @param {Event} event - Click event
 */
function handleExportResults(event) {
    // Get the procedure panel
    const procedurePanel = event.target.closest('.procedure-panel');
    if (!procedurePanel) return;
    
    // Find the results table
    const resultsTable = procedurePanel.querySelector('.results-table');
    if (!resultsTable) {
        showNotification('error', 'No results available to export');
        return;
    }
    
    // Get procedure name for filename
    const procedureName = procedurePanel.id;
    const procMetadata = window.CensusProcedures.getProcedureMetadata(procedureName);
    const filenameBase = procMetadata ? 
        procMetadata.displayName.toLowerCase().replace(/\s+/g, '_') : 
        'census_data';
    
    // Generate filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').substring(0, 19);
    const filename = `${filenameBase}_${timestamp}.csv`;
    
    // Export table data to CSV
    exportTableToCSV(resultsTable, filename);
}

/**
 * Export table data to CSV file and trigger download
 * @param {HTMLElement} table - Table element to export
 * @param {string} filename - Filename for download
 */
function exportTableToCSV(table, filename) {
    // Build CSV content from table
    const rows = [];
    
    // Add header row
    const headers = [];
    table.querySelectorAll('thead th').forEach(th => {
        headers.push(`"${th.textContent.trim()}"`);
    });
    rows.push(headers.join(','));
    
    // Add data rows
    table.querySelectorAll('tbody tr').forEach(tr => {
        const rowData = [];
        tr.querySelectorAll('td').forEach(td => {
            // Escape quotes and wrap in quotes
            const cellValue = td.textContent.trim().replace(/"/g, '""');
            rowData.push(`"${cellValue}"`);
        });
        rows.push(rowData.join(','));
    });
    
    // Create CSV content
    const csvContent = rows.join('\n');
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.display = 'none';
    
    // Append to document, trigger download, and clean up
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Show success notification
    showNotification('success', `Data exported successfully as ${filename}`);
}

/**
 * Handle clear results button click
 * @param {Event} event - Click event
 */
function handleClearResults(event) {
    // Get the procedure panel
    const procedurePanel = event.target.closest('.procedure-panel');
    if (!procedurePanel) return;
    
    // Reset results display
    const resultsData = procedurePanel.querySelector('.results-data');
    const emptyState = procedurePanel.querySelector('.results-empty-state');
    
    if (resultsData && emptyState) {
        resultsData.innerHTML = '';
        resultsData.style.display = 'none';
        emptyState.style.display = 'block';
        
        // Reset results state if this was the active procedure
        if (resultsState.currentProcedure === procedurePanel.id) {
            resultsState.currentProcedure = null;
            resultsState.currentResults = null;
            resultsState.currentPage = 1;
        }
        
        // Show notification
        showNotification('info', 'Results cleared');
    }
}

/**
 * Show a notification message
 * @param {string} type - Notification type: 'success', 'error', 'info', 'warning'
 * @param {string} message - Message text
 */
function showNotification(type, message) {
    // Check if notification function exists in global scope
    if (typeof window.showNotification === 'function') {
        window.showNotification(type, message);
    } else {
        // Fallback notification implementation
        console.log(`${type.toUpperCase()}: ${message}`);
        
        // Create notification container if it doesn't exist
        let container = document.getElementById('notification-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'notification-container';
            container.className = 'notification-container';
            document.body.appendChild(container);
        }
        
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        
        // Add icon based on type
        let icon;
        switch (type) {
            case 'success':
                icon = '<i class="fas fa-check-circle"></i>';
                break;
            case 'error':
                icon = '<i class="fas fa-times-circle"></i>';
                break;
            case 'info':
                icon = '<i class="fas fa-info-circle"></i>';
                break;
            case 'warning':
                icon = '<i class="fas fa-exclamation-triangle"></i>';
                break;
            default:
                icon = '<i class="fas fa-bell"></i>';
        }
        
        notification.innerHTML = `${icon} ${message}`;
        container.appendChild(notification);
        
        // Auto-remove after delay
        setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => {
                container.removeChild(notification);
            }, 300);
        }, 5000);
    }
}

// Initialize results handling when DOM is ready
document.addEventListener('DOMContentLoaded', initResultsHandling);