-- This part will create the database and tables

create DATABASE CensusData
go
use CensusData
-- Create Geoid_info table (now includes Year as part of PK for FK references)
CREATE TABLE Geoid_info (
    Year INT,
    StatFP VARCHAR(10),
    CountyFP VARCHAR(10),
    Tract VARCHAR(20),
    PRIMARY KEY (Year, StatFP, CountyFP, Tract)
);

-- Population_Demographics
CREATE TABLE Population_Demographics (
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
CREATE TABLE Socioeconomic_Factors (
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
CREATE TABLE Transportation_Mobility (
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
CREATE TABLE Housing_Data (
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

--  storage procedure
--  PROCEDURE
use CensusData
go 
---1)
CREATE PROCEDURE sp_IdentifyHighPovertyAreas
    @StartYear INT,
    @EndYear   INT,
    @PovertyThreshold INT
AS
BEGIN
    SELECT 
        gi.Year,
        gi.StatFP AS StateFP,
        gi.CountyFP,
        gi.Tract,
        sf.PeopleBelowPovertyLine,
        sf.ChildPovertyRate
    FROM Socioeconomic_Factors sf
    JOIN Geoid_info gi 
        ON sf.Year = gi.Year
       AND sf.StatFP = gi.StatFP
       AND sf.CountyFP = gi.CountyFP
       AND sf.Tract = gi.Tract
    WHERE gi.Year BETWEEN @StartYear AND @EndYear
      AND sf.PeopleBelowPovertyLine >= @PovertyThreshold
    ORDER BY gi.Year, sf.PeopleBelowPovertyLine DESC;
END;
GO



--2)

CREATE PROCEDURE sp_IdentifyLowCoverageParishes
    @Year INT,
    @CoverageThreshold INT
AS
BEGIN
    SELECT 
        gi.Year,
        gi.StatFP AS StateFP,
        gi.CountyFP,
        gi.Tract,
        pd.WithHealthInsurance,
        (pd.TotalMalePopulation + pd.TotalFemalePopulation) AS TotalPop
    FROM Population_Demographics pd
    JOIN Geoid_info gi 
        ON pd.Year = gi.Year
       AND pd.StatFP = gi.StatFP
       AND pd.CountyFP = gi.CountyFP
       AND pd.Tract = gi.Tract
    WHERE gi.Year = @Year
      AND pd.WithHealthInsurance < @CoverageThreshold
    ORDER BY pd.WithHealthInsurance ASC;
END;
GO



--3)
CREATE PROCEDURE sp_AnalyzeStoreLocationPotential
    @Year INT,
    @MinPopulation INT,
    @MinMedianIncome FLOAT
AS
BEGIN
    SELECT 
        gi.Year,
        gi.StatFP AS StateFP,
        gi.CountyFP,
        gi.Tract,
        pd.White + pd.BlackorAfricanAmerican + pd.HispanicorLatino + pd.Asian
            + pd.AmericanIndian + pd.NativeHawaiian AS TotalPop,
        sf.MedianHouseholdIncome,
        tm.CarOwnershipperHousehold
    FROM Geoid_info gi
    JOIN Population_Demographics pd 
        ON gi.Year = pd.Year
       AND gi.StatFP = pd.StatFP
       AND gi.CountyFP = pd.CountyFP
       AND gi.Tract = pd.Tract
    JOIN Socioeconomic_Factors sf
        ON gi.Year = sf.Year
       AND gi.StatFP = sf.StatFP
       AND gi.CountyFP = sf.CountyFP
       AND gi.Tract = sf.Tract
    JOIN Transportation_Mobility tm
        ON gi.Year = tm.Year
       AND gi.StatFP = tm.StatFP
       AND gi.CountyFP = tm.CountyFP
       AND gi.Tract = tm.Tract
    WHERE gi.Year = @Year
      AND (
         pd.White + pd.BlackorAfricanAmerican + pd.HispanicorLatino + 
         pd.Asian + pd.AmericanIndian + pd.NativeHawaiian
      ) >= @MinPopulation
      AND sf.MedianHouseholdIncome >= @MinMedianIncome
    ORDER BY sf.MedianHouseholdIncome DESC;
END;
GO


--4)

CREATE PROCEDURE sp_ExportCensusDataForHealthStudy
    @StartYear INT,
    @EndYear   INT
AS
BEGIN
    SELECT 
        gi.Year,
        gi.StatFP AS StateFP,
        gi.CountyFP,
        gi.Tract,
        pd.MedianAge,
        pd.TotalMalePopulation,
        pd.TotalFemalePopulation,
        pd.WithHealthInsurance,
        sf.MedianHouseholdIncome,
        sf.PeopleBelowPovertyLine,
        tm.PublicTransportation,
        tm.AverageTravelTimetoWork,
        hd.MedianHomeValue,
        hd.MedianGrossRent
    FROM Geoid_info gi
    JOIN Population_Demographics pd 
        ON gi.Year = pd.Year
       AND gi.StatFP = pd.StatFP
       AND gi.CountyFP = pd.CountyFP
       AND gi.Tract = pd.Tract
    JOIN Socioeconomic_Factors sf
        ON gi.Year = sf.Year
       AND gi.StatFP = sf.StatFP
       AND gi.CountyFP = sf.CountyFP
       AND gi.Tract = sf.Tract
    JOIN Transportation_Mobility tm
        ON gi.Year = tm.Year
       AND gi.StatFP = tm.StatFP
       AND gi.CountyFP = tm.CountyFP
       AND gi.Tract = tm.Tract
    JOIN Housing_Data hd
        ON gi.Year = hd.Year
       AND gi.StatFP = hd.StatFP
       AND gi.CountyFP = hd.CountyFP
       AND gi.Tract = hd.Tract
    WHERE gi.Year BETWEEN @StartYear AND @EndYear
    ORDER BY gi.Year, gi.StatFP, gi.CountyFP, gi.Tract;
END;
GO


--5)
CREATE PROCEDURE sp_GetYearlyPopulationTrends
    @StartYear INT,
    @EndYear   INT
AS
BEGIN
    WITH PopTotals AS (
        SELECT 
            Year,
            StatFP,
            CountyFP,
            Tract,
            (White + BlackorAfricanAmerican + HispanicorLatino + Asian 
             + AmericanIndian + NativeHawaiian) AS TotalPop
        FROM Population_Demographics
    )
    SELECT 
        p1.Year AS CurrentYear,
        p1.StatFP AS StateFP,
        p1.CountyFP,
        p1.Tract,
        p1.TotalPop AS PopulationThisYear,
        p2.TotalPop AS PopulationLastYear,
        (p1.TotalPop - p2.TotalPop) AS YearlyChange
    FROM PopTotals p1
    LEFT JOIN PopTotals p2
        ON p1.StatFP = p2.StatFP
       AND p1.CountyFP = p2.CountyFP
       AND p1.Tract = p2.Tract
       AND p1.Year = p2.Year + 1
    WHERE p1.Year BETWEEN @StartYear AND @EndYear
    ORDER BY p1.Year, p1.StatFP, p1.CountyFP, p1.Tract;
END;
GO


--6)
CREATE PROCEDURE sp_IdentifyTransportGaps
    @Year INT,
    @MaxTravelTime FLOAT,
    @MinPublicTransportUsage INT
AS
BEGIN
    SELECT 
        gi.Year,
        gi.StatFP AS StateFP,
        gi.CountyFP,
        gi.Tract,
        tm.WorkedatHome,
        tm.PublicTransportation,
        tm.AverageTravelTimetoWork,
        tm.NoVehicleAvailable
    FROM Transportation_Mobility tm
    JOIN Geoid_info gi
        ON tm.Year = gi.Year
       AND tm.StatFP = gi.StatFP
       AND tm.CountyFP = gi.CountyFP
       AND tm.Tract = gi.Tract
    WHERE gi.Year = @Year
      AND tm.AverageTravelTimetoWork > @MaxTravelTime
      AND tm.PublicTransportation < @MinPublicTransportUsage
    ORDER BY tm.NoVehicleAvailable DESC;
END;
GO


--7)
CREATE PROCEDURE sp_AssessHousingAffordability
    @Year INT,
    @RentToIncomeRatioThreshold FLOAT
AS
BEGIN
    SELECT
        gi.Year,
        gi.StatFP AS StateFP,
        gi.CountyFP,
        gi.Tract,
        hd.MedianGrossRent,
        sf.MedianHouseholdIncome,
        (hd.MedianGrossRent * 12.0) / NULLIF(sf.MedianHouseholdIncome, 0) 
            AS RentToIncomeRatio
    FROM Housing_Data hd
    JOIN Socioeconomic_Factors sf
        ON hd.Year = sf.Year
       AND hd.StatFP = sf.StatFP
       AND hd.CountyFP = sf.CountyFP
       AND hd.Tract = sf.Tract
    JOIN Geoid_info gi
        ON hd.Year = gi.Year
       AND hd.StatFP = gi.StatFP
       AND hd.CountyFP = gi.CountyFP
       AND hd.Tract = gi.Tract
    WHERE gi.Year = @Year
      AND ((hd.MedianGrossRent * 12.0) / NULLIF(sf.MedianHouseholdIncome, 0))
            >= @RentToIncomeRatioThreshold
    ORDER BY (hd.MedianGrossRent * 12.0) / NULLIF(sf.MedianHouseholdIncome, 0) DESC;
END;
GO


--8)

CREATE PROCEDURE sp_IdentifyUnderinsuredPopulations
    @Year INT
AS
BEGIN
    SELECT 
        gi.Year,
        gi.StatFP AS StateFP,
        gi.CountyFP,
        gi.Tract,
        pd.WithDisability,
        pd.WithHealthInsurance,
        (pd.WithDisability - (pd.WithDisability 
            * (pd.WithHealthInsurance * 1.0 / 
               (pd.TotalMalePopulation + pd.TotalFemalePopulation)))) 
            AS EstimatedUninsuredWithDisability
    FROM Population_Demographics pd
    JOIN Geoid_info gi
        ON pd.Year = gi.Year
       AND pd.StatFP = gi.StatFP
       AND pd.CountyFP = gi.CountyFP
       AND pd.Tract = gi.Tract
    WHERE gi.Year = @Year
    ORDER BY EstimatedUninsuredWithDisability DESC;
END;
GO



-- This part will create the roles and assign permissions


-- Create roles
CREATE ROLE CensusData_Viewer;
CREATE ROLE CensusData_Admin;
GO

-- Optionally, create sample users if they don’t exist already.
-- Replace 'ViewerUser' and 'AdminUser' with actual logins/user names.
CREATE USER demo FOR LOGIN ViewerUserLogin;
CREATE USER uday FOR LOGIN AdminUserLogin;
GO

-- Add users to roles
EXEC sp_addrolemember 'CensusData_Viewer', 'demo';
EXEC sp_addrolemember 'CensusData_Admin', 'uday';
GO

-- Grant SELECT on tables for viewers
GRANT SELECT ON Geoid_info TO CensusData_Viewer;
GRANT SELECT ON Population_Demographics TO CensusData_Viewer;
GRANT SELECT ON Socioeconomic_Factors TO CensusData_Viewer;
GRANT SELECT ON Transportation_Mobility TO CensusData_Viewer;
GRANT SELECT ON Housing_Data TO CensusData_Viewer;
GO

-- Grant full access on tables to admins (or you can fine-tune this further)
GRANT SELECT, INSERT, UPDATE, DELETE ON Geoid_info TO CensusData_Admin;
GRANT SELECT, INSERT, UPDATE, DELETE ON Population_Demographics TO CensusData_Admin;
GRANT SELECT, INSERT, UPDATE, DELETE ON Socioeconomic_Factors TO CensusData_Admin;
GRANT SELECT, INSERT, UPDATE, DELETE ON Transportation_Mobility TO CensusData_Admin;
GRANT SELECT, INSERT, UPDATE, DELETE ON Housing_Data TO CensusData_Admin;
GO
-- Grant EXECUTE on stored procedures to viewers
GRANT EXECUTE ON sp_IdentifyHighPovertyAreas TO CensusData_Viewer;
GRANT EXECUTE ON sp_IdentifyLowCoverageParishes TO CensusData_Viewer;
GRANT EXECUTE ON sp_AnalyzeStoreLocationPotential TO CensusData_Viewer;
GRANT EXECUTE ON sp_ExportCensusDataForHealthStudy TO CensusData_Viewer;
GRANT EXECUTE ON sp_GetYearlyPopulationTrends TO CensusData_Viewer;
GRANT EXECUTE ON sp_IdentifyTransportGaps TO CensusData_Viewer;
GRANT EXECUTE ON sp_AssessHousingAffordability TO CensusData_Viewer;
GRANT EXECUTE ON sp_IdentifyUnderinsuredPopulations TO CensusData_Viewer;
GO

-- Grant EXECUTE on stored procedures to admins as well
GRANT EXECUTE ON sp_IdentifyHighPovertyAreas TO CensusData_Admin;
GRANT EXECUTE ON sp_IdentifyLowCoverageParishes TO CensusData_Admin;
GRANT EXECUTE ON sp_AnalyzeStoreLocationPotential TO CensusData_Admin;
GRANT EXECUTE ON sp_ExportCensusDataForHealthStudy TO CensusData_Admin;
GRANT EXECUTE ON sp_GetYearlyPopulationTrends TO CensusData_Admin;
GRANT EXECUTE ON sp_IdentifyTransportGaps TO CensusData_Admin;
GRANT EXECUTE ON sp_AssessHousingAffordability TO CensusData_Admin;
GRANT EXECUTE ON sp_IdentifyUnderinsuredPopulations TO CensusData_Admin;
GO


