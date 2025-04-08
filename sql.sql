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

