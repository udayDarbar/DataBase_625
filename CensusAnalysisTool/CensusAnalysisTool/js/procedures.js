/**
 * Census Data Analysis Tool
 * Stored Procedure Integration
 * 
 * This script provides integration with SQL Server stored procedures:
 * - Defines procedure metadata
 * - Handles parameter preparation
 * - Processes SQL Server specific data types
 */

// Procedure definitions with metadata
const procedureDefinitions = {
    sp_AnalyzeStoreLocationPotential: {
        name: 'sp_AnalyzeStoreLocationPotential',
        displayName: 'Store Location Analysis',
        description: 'Analyzes geographic areas to find good potential locations for stores based on population and income filters.',
        parameters: [
            { name: 'Year', type: 'INT', defaultValue: 2020 },
            { name: 'MinPopulation', type: 'INT', defaultValue: 5000 },
            { name: 'MinMedianIncome', type: 'FLOAT', defaultValue: 50000 }
        ],
        resultColumns: [
            { name: 'StateFP', displayName: 'State FIPS Code', type: 'string' },
            { name: 'CountyFP', displayName: 'County FIPS Code', type: 'string' },
            { name: 'Tract', displayName: 'Census Tract', type: 'string' },
            { name: 'TotalPop', displayName: 'Total Population', type: 'number' },
            { name: 'MedianHouseholdIncome', displayName: 'Median Income ($)', type: 'currency' },
            { name: 'CarOwnershipperHousehold', displayName: 'Cars per Household', type: 'decimal' }
        ]
    },
    
    sp_AssessHousingAffordability: {
        name: 'sp_AssessHousingAffordability',
        displayName: 'Housing Affordability',
        description: 'Calculates rent-to-income ratios to assess if housing is affordable in a given area.',
        parameters: [
            { name: 'Year', type: 'INT', defaultValue: 2020 },
            { name: 'RentToIncomeRatioThreshold', type: 'FLOAT', defaultValue: 0.3 }
        ],
        resultColumns: [
            { name: 'StateFP', displayName: 'State FIPS Code', type: 'string' },
            { name: 'CountyFP', displayName: 'County FIPS Code', type: 'string' },
            { name: 'Tract', displayName: 'Census Tract', type: 'string' },
            { name: 'MedianGrossRent', displayName: 'Median Rent ($)', type: 'currency' },
            { name: 'MedianHouseholdIncome', displayName: 'Median Income ($)', type: 'currency' },
            { name: 'RentToIncomeRatio', displayName: 'Rent-to-Income Ratio', type: 'percent' }
        ]
    },
    
    sp_ExportCensusDataForHealthStudy: {
        name: 'sp_ExportCensusDataForHealthStudy',
        displayName: 'Export Health Data',
        description: 'Combines key demographic, housing, and transportation data for export and use in health-related studies.',
        parameters: [
            { name: 'StartYear', type: 'INT', defaultValue: 2018 },
            { name: 'EndYear', type: 'INT', defaultValue: 2020 }
        ],
        resultColumns: [
            { name: 'Year', displayName: 'Census Year', type: 'number' },
            { name: 'StateFP', displayName: 'State FIPS Code', type: 'string' },
            { name: 'CountyFP', displayName: 'County FIPS Code', type: 'string' },
            { name: 'Tract', displayName: 'Census Tract', type: 'string' },
            { name: 'MedianAge', displayName: 'Median Age', type: 'decimal' },
            { name: 'TotalMalePopulation', displayName: 'Male Population', type: 'number' },
            { name: 'TotalFemalePopulation', displayName: 'Female Population', type: 'number' },
            { name: 'WithHealthInsurance', displayName: 'With Health Insurance', type: 'number' },
            { name: 'MedianHouseholdIncome', displayName: 'Median Income ($)', type: 'currency' }
        ]
    },
    
    sp_GetYearlyPopulationTrends: {
        name: 'sp_GetYearlyPopulationTrends',
        displayName: 'Population Trends',
        description: 'Tracks changes in population year over year for each tract, showing demographic growth or decline.',
        parameters: [
            { name: 'StartYear', type: 'INT', defaultValue: 2018 },
            { name: 'EndYear', type: 'INT', defaultValue: 2020 }
        ],
        resultColumns: [
            { name: 'CurrentYear', displayName: 'Year', type: 'number' },
            { name: 'StateFP', displayName: 'State FIPS Code', type: 'string' },
            { name: 'CountyFP', displayName: 'County FIPS Code', type: 'string' },
            { name: 'Tract', displayName: 'Census Tract', type: 'string' },
            { name: 'PopulationThisYear', displayName: 'Current Population', type: 'number' },
            { name: 'PopulationLastYear', displayName: 'Previous Population', type: 'number' },
            { name: 'YearlyChange', displayName: 'Population Change', type: 'number' }
        ]
    },
    
    sp_IdentifyHighPovertyAreas: {
        name: 'sp_IdentifyHighPovertyAreas',
        displayName: 'High Poverty Areas',
        description: 'Identifies tracts with a high number of people living below the poverty line.',
        parameters: [
            { name: 'StartYear', type: 'INT', defaultValue: 2018 },
            { name: 'EndYear', type: 'INT', defaultValue: 2020 },
            { name: 'PovertyThreshold', type: 'INT', defaultValue: 1000 }
        ],
        resultColumns: [
            { name: 'Year', displayName: 'Census Year', type: 'number' },
            { name: 'StateFP', displayName: 'State FIPS Code', type: 'string' },
            { name: 'CountyFP', displayName: 'County FIPS Code', type: 'string' },
            { name: 'Tract', displayName: 'Census Tract', type: 'string' },
            { name: 'PeopleBelowPovertyLine', displayName: 'People in Poverty', type: 'number' },
            { name: 'ChildPovertyRate', displayName: 'Child Poverty Rate', type: 'percent' }
        ]
    },
    
    sp_IdentifyLowCoverageParishes: {
        name: 'sp_IdentifyLowCoverageParishes',
        displayName: 'Low Insurance Coverage',
        description: 'Finds parishes where health insurance coverage is below a given threshold.',
        parameters: [
            { name: 'Year', type: 'INT', defaultValue: 2020 },
            { name: 'CoverageThreshold', type: 'INT', defaultValue: 5000 }
        ],
        resultColumns: [
            { name: 'Year', displayName: 'Census Year', type: 'number' },
            { name: 'StateFP', displayName: 'State FIPS Code', type: 'string' },
            { name: 'CountyFP', displayName: 'County FIPS Code', type: 'string' },
            { name: 'Tract', displayName: 'Census Tract', type: 'string' },
            { name: 'WithHealthInsurance', displayName: 'With Health Insurance', type: 'number' },
            { name: 'TotalPop', displayName: 'Total Population', type: 'number' }
        ]
    },
    
    sp_IdentifyTransportGaps: {
        name: 'sp_IdentifyTransportGaps',
        displayName: 'Transportation Gaps',
        description: 'Highlights areas with poor public transportation and long commute times.',
        parameters: [
            { name: 'Year', type: 'INT', defaultValue: 2020 },
            { name: 'MaxTravelTime', type: 'FLOAT', defaultValue: 45 },
            { name: 'MinPublicTransportUsage', type: 'INT', defaultValue: 500 }
        ],
        resultColumns: [
            { name: 'Year', displayName: 'Census Year', type: 'number' },
            { name: 'StateFP', displayName: 'State FIPS Code', type: 'string' },
            { name: 'CountyFP', displayName: 'County FIPS Code', type: 'string' },
            { name: 'Tract', displayName: 'Census Tract', type: 'string' },
            { name: 'WorkedatHome', displayName: 'Work at Home', type: 'number' },
            { name: 'PublicTransportation', displayName: 'Public Transit Users', type: 'number' },
            { name: 'AverageTravelTimetoWork', displayName: 'Avg Commute (min)', type: 'decimal' },
            { name: 'NoVehicleAvailable', displayName: 'No Vehicle', type: 'number' }
        ]
    },
    
    sp_IdentifyUnderinsuredPopulations: {
        name: 'sp_IdentifyUnderinsuredPopulations',
        displayName: 'Underinsured Populations',
        description: 'Estimates the number of underinsured individuals with disabilities in each area.',
        parameters: [
            { name: 'Year', type: 'INT', defaultValue: 2020 }
        ],
        resultColumns: [
            { name: 'Year', displayName: 'Census Year', type: 'number' },
            { name: 'StateFP', displayName: 'State FIPS Code', type: 'string' },
            { name: 'CountyFP', displayName: 'County FIPS Code', type: 'string' },
            { name: 'Tract', displayName: 'Census Tract', type: 'string' },
            { name: 'WithDisability', displayName: 'People with Disability', type: 'number' },
            { name: 'WithHealthInsurance', displayName: 'With Health Insurance', type: 'number' },
            { name: 'EstimatedUninsuredWithDisability', displayName: 'Est. Uninsured w/ Disability', type: 'number' }
        ]
    }
};

/**
 * Prepare parameters for a stored procedure execution
 * @param {string} procedureName - Name of the stored procedure
 * @param {Object} paramValues - Parameter values provided by the user
 * @returns {Array} Array of parameter objects for SQL execution
 */
function prepareProcedureParameters(procedureName, paramValues) {
    // Get procedure definition
    const procedure = procedureDefinitions[procedureName];
    if (!procedure) {
        throw new Error(`Unknown procedure: ${procedureName}`);
    }
    
    // Prepare parameters
    const parameters = [];
    
    procedure.parameters.forEach(param => {
        // Get value from provided values or use default
        const value = paramValues[param.name] !== undefined ? 
            paramValues[param.name] : 
            param.defaultValue;
        
        // Create parameter object
        parameters.push({
            name: param.name,
            type: param.type,
            value: convertToSqlType(value, param.type)
        });
    });
    
    return parameters;
}

/**
 * Convert a JavaScript value to the appropriate SQL Server data type
 * @param {*} value - JavaScript value
 * @param {string} sqlType - SQL Server data type
 * @returns {*} Converted value
 */
function convertToSqlType(value, sqlType) {
    switch (sqlType) {
        case 'INT':
            return parseInt(value, 10);
        case 'FLOAT':
        case 'DECIMAL':
        case 'MONEY':
            return parseFloat(value);
        case 'BIT':
            return Boolean(value);
        case 'DATE':
        case 'DATETIME':
            return new Date(value);
        default:
            return value;
    }
}

/**
 * Create a SQL Server stored procedure execution query
 * @param {string} procedureName - Name of the stored procedure
 * @param {Array} parameters - Prepared parameters
 * @returns {string} T-SQL query string
 */
function createProcedureQuery(procedureName, parameters) {
    // Create parameter declarations
    const paramDeclarations = parameters.map(param => {
        return `@${param.name} = ${formatSqlValue(param.value, param.type)}`;
    }).join(', ');
    
    // Create T-SQL query
    return `EXEC ${procedureName} ${paramDeclarations}`;
}

/**
 * Format a value for use in a T-SQL query
 * @param {*} value - Value to format
 * @param {string} sqlType - SQL Server data type
 * @returns {string} Formatted value
 */
function formatSqlValue(value, sqlType) {
    if (value === null || value === undefined) {
        return 'NULL';
    }
    
    switch (sqlType) {
        case 'INT':
        case 'FLOAT':
        case 'DECIMAL':
        case 'MONEY':
        case 'BIT':
            return value.toString();
        case 'DATE':
        case 'DATETIME':
            return `'${value.toISOString().slice(0, 19).replace('T', ' ')}'`;
        default:
            return `'${value.toString().replace(/'/g, "''")}'`;
    }
}

/**
 * Get metadata for a stored procedure
 * @param {string} procedureName - Name of the stored procedure
 * @returns {Object} Procedure metadata
 */
function getProcedureMetadata(procedureName) {
    return procedureDefinitions[procedureName] || null;
}

/**
 * Get user-friendly display name for a FIPS code
 * @param {string} fipsCode - FIPS code
 * @param {string} type - Type of code ('state' or 'county')
 * @returns {string} Display name
 */
function getFIPSDisplayName(fipsCode, type) {
    // State FIPS codes to names
    const stateFIPS = {
        '01': 'Alabama',
        '02': 'Alaska',
        '04': 'Arizona',
        '05': 'Arkansas',
        '06': 'California',
        '08': 'Colorado',
        '09': 'Connecticut',
        '10': 'Delaware',
        '11': 'District of Columbia',
        '12': 'Florida',
        '13': 'Georgia',
        '15': 'Hawaii',
        '16': 'Idaho',
        '17': 'Illinois',
        '18': 'Indiana',
        '19': 'Iowa',
        '20': 'Kansas',
        '21': 'Kentucky',
        '22': 'Louisiana',
        '23': 'Maine',
        '24': 'Maryland',
        '25': 'Massachusetts',
        '26': 'Michigan',
        '27': 'Minnesota',
        '28': 'Mississippi',
        '29': 'Missouri',
        '30': 'Montana',
        '31': 'Nebraska',
        '32': 'Nevada',
        '33': 'New Hampshire',
        '34': 'New Jersey',
        '35': 'New Mexico',
        '36': 'New York',
        '37': 'North Carolina',
        '38': 'North Dakota',
        '39': 'Ohio',
        '40': 'Oklahoma',
        '41': 'Oregon',
        '42': 'Pennsylvania',
        '44': 'Rhode Island',
        '45': 'South Carolina',
        '46': 'South Dakota',
        '47': 'Tennessee',
        '48': 'Texas',
        '49': 'Utah',
        '50': 'Vermont',
        '51': 'Virginia',
        '53': 'Washington',
        '54': 'West Virginia',
        '55': 'Wisconsin',
        '56': 'Wyoming'
    };
    
    if (type === 'state') {
        return stateFIPS[fipsCode] || fipsCode;
    }
    
    // For counties, we'd need a more extensive lookup that would require an API call
    // or a large data file. For now, we'll return the code.
    return fipsCode;
}

// Export functions for use in other scripts
window.CensusProcedures = {
    definitions: procedureDefinitions,
    prepareProcedureParameters,
    createProcedureQuery,
    getProcedureMetadata,
    getFIPSDisplayName
};