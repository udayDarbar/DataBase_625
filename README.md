# Census Data Analysis Tool

A web-based tool for analyzing US Census data using stored procedures in SQL Server. This application provides a user-friendly interface to execute stored procedures, view results, and export data.

## Features

- Connection to SQL Server database with secure authentication
- Interface for 8 pre-defined stored procedures for census data analysis
- Parameter forms for each procedure with sensible defaults
- Results display with proper formatting for different data types
- Export functionality to CSV
- Responsive design that works on desktop and mobile devices

## Stored Procedures

This tool interfaces with the following stored procedures:

1. **sp_AnalyzeStoreLocationPotential**: Identifies potential store locations based on population and income criteria
2. **sp_AssessHousingAffordability**: Evaluates housing affordability based on rent-to-income ratios
3. **sp_ExportCensusDataForHealthStudy**: Combines demographic, housing, and health data for studies
4. **sp_GetYearlyPopulationTrends**: Tracks population changes year over year
5. **sp_IdentifyHighPovertyAreas**: Finds areas with high poverty rates and counts
6. **sp_IdentifyLowCoverageParishes**: Locates areas with low health insurance coverage
7. **sp_IdentifyTransportGaps**: Highlights areas with transportation challenges
8. **sp_IdentifyUnderinsuredPopulations**: Estimates underinsured populations with disabilities

## Setup Instructions

1. Download or clone this repository to your local machine
2. Open `index.html` in your web browser
3. Connect to your SQL Server database with credentials:
   - Server: Your SQL Server host (e.g., localhost)
   - Database: Database name (e.g., CensusData2)
   - Username: SQL Server login with appropriate permissions
   - Password: Your password
   - Port: Optional, defaults to 1433

## Connection Requirements

- SQL Server 2012 or later
- A user account with EXECUTE permissions on the stored procedures
- Network access to the SQL Server instance

## For Developers

If you need to modify how the application connects to the database, edit the `connection.js` file. This file contains the simulated API connection logic, which you can replace with actual SQL Server connection code.

The main files in this project:

- `index.html`: Main application HTML structure
- `css/main.css`: Primary CSS styling
- `css/results.css`: Results display styling
- `js/connection.js`: Database connection handling
- `js/procedures.js`: Stored procedure definitions and handling
- `js/results.js`: Results display and export functionality

## Note on Database Connection

This interface is designed to connect to a database where the listed stored procedures are already defined. These procedures should match the parameter definitions in the `procedures.js` file.

In a production environment, you would need to create an API gateway or backend service that securely connects to SQL Server and executes these procedures. The current implementation simulates these connections for demonstration purposes.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
