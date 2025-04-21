-- Sample queries for the Census Dashboard application

-- 1. Get total population by state for 2020
SELECT 
    gi.StatFP,
    SUM(pd.TotalMalePopulation + pd.TotalFemalePopulation) as total_population
FROM Geoid_info gi
JOIN Population_Demographics pd ON gi.Year = pd.Year
    AND gi.StatFP = pd.StatFP
    AND gi.CountyFP = pd.CountyFP
    AND gi.Tract = pd.Tract
WHERE gi.Year = 2020
GROUP BY gi.StatFP
ORDER BY total_population DESC;

-- 2. Get average median income by state for 2020
SELECT 
    gi.StatFP,
    AVG(sf.MedianHouseholdIncome) as average_median_income
FROM Geoid_info gi
JOIN Socioeconomic_Factors sf ON gi.Year = sf.Year
    AND gi.StatFP = sf.StatFP
    AND gi.CountyFP = sf.CountyFP
    AND gi.Tract = sf.Tract
WHERE gi.Year = 2020
GROUP BY gi.StatFP
ORDER BY average_median_income DESC;

-- 3. Get demographic breakdown by race for California (StatFP = '06')
SELECT 
    SUM(pd.White) as white_population,
    SUM(pd.BlackorAfricanAmerican) as black_population,
    SUM(pd.HispanicorLatino) as hispanic_population,
    SUM(pd.Asian) as asian_population,
    SUM(pd.AmericanIndian) as american_indian_population,
    SUM(pd.NativeHawaiian) as pacific_islander_population
FROM Geoid_info gi
JOIN Population_Demographics pd ON gi.Year = pd.Year
    AND gi.StatFP = pd.StatFP
    AND gi.CountyFP = pd.CountyFP
    AND gi.Tract = pd.Tract
WHERE gi.Year = 2020 AND gi.StatFP = '06';

-- 4. Calculate average home values and rent by state
SELECT 
    gi.StatFP,
    AVG(hd.MedianHomeValue) as average_home_value,
    AVG(hd.MedianGrossRent) as average_rent
FROM Geoid_info gi
JOIN Housing_Data hd ON gi.Year = hd.Year
    AND gi.StatFP = hd.StatFP
    AND gi.CountyFP = hd.CountyFP
    AND gi.Tract = hd.Tract
WHERE gi.Year = 2020
GROUP BY gi.StatFP
ORDER BY average_home_value DESC;

-- 5. Get transportation methods breakdown by state
SELECT 
    gi.StatFP,
    SUM(tm.WorkedatHome) as worked_at_home,
    SUM(tm.PublicTransportation) as public_transit,
    AVG(tm.AverageTravelTimetoWork) as avg_commute_time
FROM Geoid_info gi
JOIN Transportation_Mobility tm ON gi.Year = tm.Year
    AND gi.StatFP = tm.StatFP
    AND gi.CountyFP = tm.CountyFP
    AND gi.Tract = tm.Tract
WHERE gi.Year = 2020
GROUP BY gi.StatFP
ORDER BY avg_commute_time DESC;

-- 6. Get education level breakdown by state
SELECT 
    gi.StatFP,
    SUM(sf.HighSchoolGraduate) as high_school_graduates,
    SUM(sf.SomeCollege) as some_college,
    SUM(sf.BachelorsDegreeorHigher) as bachelors_or_higher
FROM Geoid_info gi
JOIN Socioeconomic_Factors sf ON gi.Year = sf.Year
    AND gi.StatFP = sf.StatFP
    AND gi.CountyFP = sf.CountyFP
    AND gi.Tract = sf.Tract
WHERE gi.Year = 2020
GROUP BY gi.StatFP;

-- 7. Get counties with the highest poverty rates
SELECT 
    gi.StatFP,
    gi.CountyFP,
    SUM(sf.PeopleBelowPovertyLine) as people_in_poverty,
    SUM(pd.TotalMalePopulation + pd.TotalFemalePopulation) as total_population,
    (SUM(sf.PeopleBelowPovertyLine) / SUM(pd.TotalMalePopulation + pd.TotalFemalePopulation)) * 100 as poverty_rate
FROM Geoid_info gi
JOIN Socioeconomic_Factors sf ON gi.Year = sf.Year
    AND gi.StatFP = sf.StatFP
    AND gi.CountyFP = sf.CountyFP
    AND gi.Tract = sf.Tract
JOIN Population_Demographics pd ON gi.Year = pd.Year
    AND gi.StatFP = pd.StatFP
    AND gi.CountyFP = pd.CountyFP
    AND gi.Tract = pd.Tract
WHERE gi.Year = 2020
GROUP BY gi.StatFP, gi.CountyFP
ORDER BY poverty_rate DESC
LIMIT 20;

-- 8. Get average median age by state
SELECT 
    gi.StatFP,
    AVG(pd.MedianAge) as average_median_age
FROM Geoid_info gi
JOIN Population_Demographics pd ON gi.Year = pd.Year
    AND gi.StatFP = pd.StatFP
    AND gi.CountyFP = pd.CountyFP
    AND gi.Tract = pd.Tract
WHERE gi.Year = 2020
GROUP BY gi.StatFP
ORDER BY average_median_age DESC;

-- 9. Get employment statistics by state
SELECT 
    gi.StatFP,
    SUM(sf.Employed) as employed,
    SUM(sf.Unemployed) as unemployed,
    SUM(sf.NotinLaborForce) as not_in_labor_force,
    (SUM(sf.Unemployed) / SUM(sf.CivilianLaborForce)) * 100 as unemployment_rate
FROM Geoid_info gi
JOIN Socioeconomic_Factors sf ON gi.Year = sf.Year
    AND gi.StatFP = sf.StatFP
    AND gi.CountyFP = sf.CountyFP
    AND gi.Tract = sf.Tract
WHERE gi.Year = 2020
GROUP BY gi.StatFP
ORDER BY unemployment_rate;