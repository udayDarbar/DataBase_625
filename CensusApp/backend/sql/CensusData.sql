-- This part will create the database and tables
CREATE DATABASE IF NOT EXISTS CensusData;
USE CensusData;

-- Create Users table for authentication
CREATE TABLE IF NOT EXISTS Users (
    user_id VARCHAR(255) PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL, 
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'User'
);

-- Create Geoid_info table (includes Year as part of PK for FK references)
CREATE TABLE IF NOT EXISTS Geoid_info (
    Year INT,
    StatFP VARCHAR(10),
    CountyFP VARCHAR(10),
    Tract VARCHAR(20),
    PRIMARY KEY (Year, StatFP, CountyFP, Tract)
);

-- Population_Demographics
CREATE TABLE IF NOT EXISTS Population_Demographics (
    Year INT,
    StatFP VARCHAR(10),
    CountyFP VARCHAR(10),
    Tract VARCHAR(20),
    MedianAge FLOAT,
    White INT,
    BlackorAfricanAmerican INT,
    HispanicorLatino INT,
    Asian INT,
    AmericanIndian INT,
    NativeHawaiian INT,
    TotalMalePopulation INT,
    TotalFemalePopulation INT,
    WithDisability INT,
    WithHealthInsurance INT,
    PRIMARY KEY (Year, StatFP, CountyFP, Tract),
    FOREIGN KEY (Year, StatFP, CountyFP, Tract) REFERENCES Geoid_info(Year, StatFP, CountyFP, Tract)
);

-- Socioeconomic_Factors
CREATE TABLE IF NOT EXISTS Socioeconomic_Factors (
    Year INT,
    StatFP VARCHAR(10),
    CountyFP VARCHAR(10),
    Tract VARCHAR(20),
    MedianHouseholdIncome FLOAT,
    PerCapitaIncome FLOAT,
    PeopleBelowPovertyLine INT,
    ChildPovertyRate FLOAT,
    HighSchoolGraduate INT,
    SomeCollege INT,
    BachelorsDegreeorHigher INT,
    InLaborForce INT,
    CivilianLaborForce INT,
    Employed INT,
    Unemployed INT,
    NotinLaborForce INT,
    PRIMARY KEY (Year, StatFP, CountyFP, Tract),
    FOREIGN KEY (Year, StatFP, CountyFP, Tract) REFERENCES Geoid_info(Year, StatFP, CountyFP, Tract)
);

-- Transportation_Mobility
CREATE TABLE IF NOT EXISTS Transportation_Mobility (
    Year INT,
    StatFP VARCHAR(10),
    CountyFP VARCHAR(10),
    Tract VARCHAR(20),
    WorkedatHome INT,
    PublicTransportation INT,
    AverageTravelTimetoWork FLOAT,
    NoVehicleAvailable INT,
    OneVehicleAvailable INT,
    TwoVehiclesAvailable INT,
    ThreeorMoreVehiclesAvailable INT,
    CarOwnershipperHousehold FLOAT,
    PRIMARY KEY (Year, StatFP, CountyFP, Tract),
    FOREIGN KEY (Year, StatFP, CountyFP, Tract) REFERENCES Geoid_info(Year, StatFP, CountyFP, Tract)
);

-- Housing_Data
CREATE TABLE IF NOT EXISTS Housing_Data (
    Year INT,
    StatFP VARCHAR(10),
    CountyFP VARCHAR(10),
    Tract VARCHAR(20),
    VacantHousingUnits INT,
    OwnerOccupiedUnits INT,
    RenterOccupiedUnits INT,
    MedianHomeValue FLOAT,
    MedianGrossRent FLOAT,
    HouseholdSize FLOAT,
    PRIMARY KEY (Year, StatFP, CountyFP, Tract),
    FOREIGN KEY (Year, StatFP, CountyFP, Tract) REFERENCES Geoid_info(Year, StatFP, CountyFP, Tract)
);

-- Insert sample data for users
INSERT INTO Users (user_id, username, first_name, last_name, email, role)
VALUES 
('user_sample_1', 'admin', 'Admin', 'User', 'admin@example.com', 'Admin'),
('user_sample_2', 'analyst', 'Data', 'Analyst', 'analyst@example.com', 'Analyst'),
('user_sample_3', 'user', 'Regular', 'User', 'user@example.com', 'User');

-- Insert some sample Geoid_info data
INSERT INTO Geoid_info (Year, StatFP, CountyFP, Tract) VALUES 
(2020, '06', '001', '000100'),
(2020, '06', '001', '000200'),
(2020, '06', '001', '000300'),
(2020, '36', '001', '000100'),
(2020, '36', '001', '000200');

-- Insert some sample Population_Demographics data
INSERT INTO Population_Demographics (Year, StatFP, CountyFP, Tract, MedianAge, White, BlackorAfricanAmerican, HispanicorLatino, Asian, AmericanIndian, NativeHawaiian, TotalMalePopulation, TotalFemalePopulation, WithDisability, WithHealthInsurance) VALUES 
(2020, '06', '001', '000100', 35.6, 2500, 1200, 800, 1500, 100, 50, 3500, 3600, 800, 6500),
(2020, '06', '001', '000200', 42.1, 3000, 800, 600, 1800, 80, 30, 3200, 3300, 750, 6000),
(2020, '06', '001', '000300', 29.8, 2200, 1500, 1200, 900, 120, 40, 3100, 3200, 700, 5800),
(2020, '36', '001', '000100', 38.2, 2800, 1000, 700, 600, 90, 20, 2600, 2700, 600, 5000),
(2020, '36', '001', '000200', 45.3, 3500, 600, 500, 400, 70, 10, 2500, 2600, 550, 4900);

-- Insert some sample Socioeconomic_Factors data
INSERT INTO Socioeconomic_Factors (Year, StatFP, CountyFP, Tract, MedianHouseholdIncome, PerCapitaIncome, PeopleBelowPovertyLine, ChildPovertyRate, HighSchoolGraduate, SomeCollege, BachelorsDegreeorHigher, InLaborForce, CivilianLaborForce, Employed, Unemployed, NotinLaborForce) VALUES 
(2020, '06', '001', '000100', 75000.0, 35000.0, 700, 15.2, 1200, 1500, 2500, 4500, 4400, 4100, 300, 2600),
(2020, '06', '001', '000200', 85000.0, 40000.0, 500, 10.5, 1000, 1300, 3000, 4200, 4100, 3900, 200, 2300),
(2020, '06', '001', '000300', 65000.0, 30000.0, 900, 18.7, 1500, 1200, 1800, 4000, 3900, 3600, 300, 2300),
(2020, '36', '001', '000100', 70000.0, 32000.0, 600, 14.8, 1100, 1000, 1600, 3500, 3400, 3200, 200, 1800),
(2020, '36', '001', '000200', 80000.0, 38000.0, 450, 9.8, 900, 950, 2000, 3400, 3300, 3100, 200, 1700);

-- Insert some sample Housing_Data
INSERT INTO Housing_Data (Year, StatFP, CountyFP, Tract, VacantHousingUnits, OwnerOccupiedUnits, RenterOccupiedUnits, MedianHomeValue, MedianGrossRent, HouseholdSize) VALUES 
(2020, '06', '001', '000100', 200, 1500, 1300, 650000.0, 2200.0, 2.8),
(2020, '06', '001', '000200', 150, 1800, 1000, 750000.0, 2500.0, 2.6),
(2020, '06', '001', '000300', 250, 1200, 1500, 550000.0, 2000.0, 3.0),
(2020, '36', '001', '000100', 180, 1300, 1100, 450000.0, 1800.0, 2.5),
(2020, '36', '001', '000200', 120, 1500, 900, 550000.0, 2000.0, 2.4);

-- Insert some sample Transportation_Mobility data
INSERT INTO Transportation_Mobility (Year, StatFP, CountyFP, Tract, WorkedatHome, PublicTransportation, AverageTravelTimetoWork, NoVehicleAvailable, OneVehicleAvailable, TwoVehiclesAvailable, ThreeorMoreVehiclesAvailable, CarOwnershipperHousehold) VALUES 
(2020, '06', '001', '000100', 800, 1200, 35.5, 300, 1200, 1000, 300, 1.5),
(2020, '06', '001', '000200', 1000, 900, 30.2, 200, 1000, 1200, 400, 1.7),
(2020, '06', '001', '000300', 600, 1500, 40.8, 400, 1300, 800, 200, 1.3),
(2020, '36', '001', '000100', 500, 1000, 32.5, 350, 1100, 750, 200, 1.4),
(2020, '36', '001', '000200', 700, 800, 28.6, 250, 950, 950, 250, 1.6);

-- Create stored procedures for common census data analytics
-- 1. Get High Income Areas
DELIMITER //
CREATE PROCEDURE IF NOT EXISTS sp_GetHighIncomeAreas(IN min_income FLOAT)
BEGIN
    SELECT 
        gi.Year, gi.StatFP, gi.CountyFP, gi.Tract,
        sf.MedianHouseholdIncome,
        hd.MedianHomeValue,
        pd.TotalMalePopulation + pd.TotalFemalePopulation AS TotalPopulation
    FROM Geoid_info gi
    JOIN Socioeconomic_Factors sf 
        ON gi.Year = sf.Year AND gi.StatFP = sf.StatFP 
        AND gi.CountyFP = sf.CountyFP AND gi.Tract = sf.Tract
    JOIN Housing_Data hd
        ON gi.Year = hd.Year AND gi.StatFP = hd.StatFP 
        AND gi.CountyFP = hd.CountyFP AND gi.Tract = hd.Tract
    JOIN Population_Demographics pd
        ON gi.Year = pd.Year AND gi.StatFP = pd.StatFP 
        AND gi.CountyFP = pd.CountyFP AND gi.Tract = pd.Tract
    WHERE sf.MedianHouseholdIncome >= min_income
    ORDER BY sf.MedianHouseholdIncome DESC;
END //
DELIMITER ;

-- 2. Get Population By State
DELIMITER //
CREATE PROCEDURE IF NOT EXISTS sp_GetPopulationByState(IN census_year INT)
BEGIN
    SELECT 
        gi.StatFP,
        SUM(pd.TotalMalePopulation) AS MalePopulation,
        SUM(pd.TotalFemalePopulation) AS FemalePopulation,
        SUM(pd.TotalMalePopulation + pd.TotalFemalePopulation) AS TotalPopulation
    FROM Geoid_info gi
    JOIN Population_Demographics pd 
        ON gi.Year = pd.Year AND gi.StatFP = pd.StatFP 
        AND gi.CountyFP = pd.CountyFP AND gi.Tract = pd.Tract
    WHERE gi.Year = census_year
    GROUP BY gi.StatFP
    ORDER BY TotalPopulation DESC;
END //
DELIMITER ;

-- Create roles for database access
CREATE ROLE IF NOT EXISTS 'census_admin', 'census_analyst', 'census_viewer';

-- Grant appropriate permissions to roles
GRANT ALL PRIVILEGES ON CensusData.* TO 'census_admin';
GRANT SELECT, INSERT, UPDATE ON CensusData.* TO 'census_analyst';
GRANT SELECT ON CensusData.* TO 'census_viewer';