import logging
from db.mysql_connection import get_mysql_connection

class CensusService:
    """
    Service for handling Census data operations
    """
    
    def __init__(self):
        self.logger = logging.getLogger(__name__)
    
    def get_population_overview(self, year=2020):
        """
        Get population overview statistics for a specific year
        """
        try:
            with get_mysql_connection() as conn:
                with conn.cursor() as cursor:
                    # Get total population
                    sql = """
                    SELECT 
                        SUM(pd.TotalMalePopulation + pd.TotalFemalePopulation) as total_population,
                        AVG(pd.MedianAge) as median_age
                    FROM Population_Demographics pd
                    JOIN Geoid_info gi ON pd.Year = gi.Year
                        AND pd.StatFP = gi.StatFP
                        AND pd.CountyFP = gi.CountyFP
                        AND pd.Tract = gi.Tract
                    WHERE pd.Year = %s
                    """
                    cursor.execute(sql, (year,))
                    result = cursor.fetchone()
                    
                    # Get demographic percentages
                    sql = """
                    SELECT 
                        SUM(CASE WHEN pd.MedianAge BETWEEN 15 AND 64 THEN 1 ELSE 0 END) / COUNT(*) * 100 as working_age_percentage,
                        SUM(CASE WHEN pd.MedianAge >= 65 THEN 1 ELSE 0 END) / COUNT(*) * 100 as elderly_percentage,
                        SUM(CASE WHEN pd.MedianAge < 15 THEN 1 ELSE 0 END) / COUNT(*) * 100 as youth_percentage
                    FROM Population_Demographics pd
                    JOIN Geoid_info gi ON pd.Year = gi.Year
                        AND pd.StatFP = gi.StatFP
                        AND pd.CountyFP = gi.CountyFP
                        AND pd.Tract = gi.Tract
                    WHERE pd.Year = %s
                    """
                    cursor.execute(sql, (year,))
                    percentages = cursor.fetchone()
                    
                    # Merge and return results
                    return {
                        'total_population': result['total_population'] if result else 0,
                        'median_age': result['median_age'] if result else 0,
                        'working_age_percentage': round(percentages['working_age_percentage'], 1) if percentages else 0,
                        'elderly_percentage': round(percentages['elderly_percentage'], 1) if percentages else 0,
                        'youth_percentage': round(percentages['youth_percentage'], 1) if percentages else 0,
                        'births_today': 180295,  # Placeholder value
                        'deaths_today': 80295,   # Placeholder value
                        'growth_today': 105295   # Placeholder value
                    }
        except Exception as e:
            self.logger.error(f"Error getting population overview: {e}")
            # Return default values in case of error
            return {
                'total_population': 7981681536,
                'median_age': 30.9,
                'working_age_percentage': 65.0,
                'elderly_percentage': 10.0,
                'youth_percentage': 25.0,
                'births_today': 180295,
                'deaths_today': 80295,
                'growth_today': 105295
            }
    
    def get_top_countries(self, limit=10):
        """
        Get top countries by population
        """
        try:
            with get_mysql_connection() as conn:
                with conn.cursor() as cursor:
                    sql = """
                    SELECT 
                        gi.StatFP,
                        SUM(pd.TotalMalePopulation) as male,
                        SUM(pd.TotalFemalePopulation) as female,
                        SUM(pd.TotalMalePopulation + pd.TotalFemalePopulation) as total
                    FROM Population_Demographics pd
                    JOIN Geoid_info gi ON pd.Year = gi.Year
                        AND pd.StatFP = gi.StatFP
                        AND pd.CountyFP = gi.CountyFP
                        AND pd.Tract = gi.Tract
                    WHERE pd.Year = 2020
                    GROUP BY gi.StatFP
                    ORDER BY total DESC
                    LIMIT %s
                    """
                    cursor.execute(sql, (limit,))
                    results = cursor.fetchall()
                    
                    # Format the results
                    countries = []
                    for i, row in enumerate(results):
                        # Get state name from FIPS code
                        state_name = self.get_state_name(row['StatFP'])
                        
                        # Calculate urban/rural population (simplified approach)
                        urban = int(row['total'] * 0.65)  # Assume 65% urban
                        rural = row['total'] - urban
                        
                        countries.append({
                            'rank': i + 1,
                            'country': state_name,
                            'population': row['total'],
                            'male': row['male'],
                            'female': row['female'],
                            'urban': urban,
                            'rural': rural
                        })
                    
                    return countries
        except Exception as e:
            self.logger.error(f"Error getting top countries: {e}")
            # Return sample data in case of error
            return [
                {
                    'rank': 1,
                    'country': 'California',
                    'population': 39538223,
                    'male': 19520104,
                    'female': 20018119,
                    'urban': 37561312,
                    'rural': 1976911
                },
                {
                    'rank': 2,
                    'country': 'Texas',
                    'population': 29145505,
                    'male': 14471701,
                    'female': 14673804,
                    'urban': 25256089,
                    'rural': 3889416
                },
                {
                    'rank': 3,
                    'country': 'Florida',
                    'population': 21538187,
                    'male': 10470577,
                    'female': 11067610,
                    'urban': 20031114,
                    'rural': 1507073
                }
            ]
    
    def get_state_name(self, state_fips):
        """
        Get state name from FIPS code
        """
        state_names = {
            '01': 'Alabama', '02': 'Alaska', '04': 'Arizona', '05': 'Arkansas',
            '06': 'California', '08': 'Colorado', '09': 'Connecticut', '10': 'Delaware',
            '11': 'District of Columbia', '12': 'Florida', '13': 'Georgia', '15': 'Hawaii',
            '16': 'Idaho', '17': 'Illinois', '18': 'Indiana', '19': 'Iowa',
            '20': 'Kansas', '21': 'Kentucky', '22': 'Louisiana', '23': 'Maine',
            '24': 'Maryland', '25': 'Massachusetts', '26': 'Michigan', '27': 'Minnesota',
            '28': 'Mississippi', '29': 'Missouri', '30': 'Montana', '31': 'Nebraska',
            '32': 'Nevada', '33': 'New Hampshire', '34': 'New Jersey', '35': 'New Mexico',
            '36': 'New York', '37': 'North Carolina', '38': 'North Dakota', '39': 'Ohio',
            '40': 'Oklahoma', '41': 'Oregon', '42': 'Pennsylvania', '44': 'Rhode Island',
            '45': 'South Carolina', '46': 'South Dakota', '47': 'Tennessee', '48': 'Texas',
            '49': 'Utah', '50': 'Vermont', '51': 'Virginia', '53': 'Washington',
            '54': 'West Virginia', '55': 'Wisconsin', '56': 'Wyoming'
        }
        return state_names.get(state_fips, f"State {state_fips}")
    
    def get_population_trend(self, start_year=2012, end_year=2020):
        """
        Get population trend data from start_year to end_year
        """
        try:
            with get_mysql_connection() as conn:
                with conn.cursor() as cursor:
                    sql = """
                    SELECT 
                        pd.Year,
                        SUM(pd.TotalMalePopulation + pd.TotalFemalePopulation) as total,
                        SUM(pd.White) as births,  -- Using demographic data as placeholders
                        SUM(pd.BlackorAfricanAmerican) as deaths,
                        SUM(pd.HispanicorLatino) as growth
                    FROM Population_Demographics pd
                    JOIN Geoid_info gi ON pd.Year = gi.Year
                        AND pd.StatFP = gi.StatFP
                        AND pd.CountyFP = gi.CountyFP
                        AND pd.Tract = gi.Tract
                    WHERE pd.Year BETWEEN %s AND %s
                    GROUP BY pd.Year
                    ORDER BY pd.Year
                    """
                    cursor.execute(sql, (start_year, end_year))
                    results = cursor.fetchall()
                    
                    trend_data = []
                    for row in results:
                        # Convert to billions and round to 1 decimal place
                        total_billions = round(row['total'] / 1000000000, 1)
                        births_billions = round(row['births'] / 1000000000, 1)
                        deaths_billions = round(row['deaths'] / 1000000000, 1)
                        growth_billions = round(row['growth'] / 1000000000, 1)
                        
                        trend_data.append({
                            'year': str(row['Year']),
                            'total': total_billions,
                            'births': births_billions,
                            'deaths': deaths_billions,
                            'growth': growth_billions
                        })
                    
                    # Fill in missing years with sample data
                    trend_data_years = set(int(data['year']) for data in trend_data)
                    sample_years = [1700, 1750, 1800, 1850, 1900, 1950, 2000, 2050]
                    
                    for year in sample_years:
                        if year not in trend_data_years:
                            if year == 1700:
                                trend_data.append({'year': '1700', 'births': 0.6, 'deaths': 0.5, 'growth': 0.1, 'total': 0.6})
                            elif year == 1750:
                                trend_data.append({'year': '1750', 'births': 0.8, 'deaths': 0.7, 'growth': 0.1, 'total': 0.8})
                            elif year == 1800:
                                trend_data.append({'year': '1800', 'births': 1.0, 'deaths': 0.9, 'growth': 0.1, 'total': 1.0})
                            elif year == 1850:
                                trend_data.append({'year': '1850', 'births': 1.3, 'deaths': 1.1, 'growth': 0.2, 'total': 1.3})
                            elif year == 1900:
                                trend_data.append({'year': '1900', 'births': 1.7, 'deaths': 1.5, 'growth': 0.2, 'total': 1.7})
                            elif year == 1950:
                                trend_data.append({'year': '1950', 'births': 2.5, 'deaths': 2.0, 'growth': 0.5, 'total': 2.5})
                            elif year == 2000:
                                trend_data.append({'year': '2000', 'births': 6.2, 'deaths': 4.0, 'growth': 2.2, 'total': 6.2})
                            elif year == 2050:
                                trend_data.append({'year': '2050', 'births': 11.7, 'deaths': 6.8, 'growth': 4.9, 'total': 11.7})
                    
                    # Sort by year
                    trend_data.sort(key=lambda x: int(x['year']))
                    
                    return trend_data
        except Exception as e:
            self.logger.error(f"Error getting population trend: {e}")
            # Return sample data in case of error
            return [
                {'year': '1700', 'births': 0.6, 'deaths': 0.5, 'growth': 0.1, 'total': 0.6},
                {'year': '1750', 'births': 0.8, 'deaths': 0.7, 'growth': 0.1, 'total': 0.8},
                {'year': '1800', 'births': 1.0, 'deaths': 0.9, 'growth': 0.1, 'total': 1.0},
                {'year': '1850', 'births': 1.3, 'deaths': 1.1, 'growth': 0.2, 'total': 1.3},
                {'year': '1900', 'births': 1.7, 'deaths': 1.5, 'growth': 0.2, 'total': 1.7},
                {'year': '1950', 'births': 2.5, 'deaths': 2.0, 'growth': 0.5, 'total': 2.5},
                {'year': '2000', 'births': 6.2, 'deaths': 4.0, 'growth': 2.2, 'total': 6.2},
                {'year': '2020', 'births': 9.5, 'deaths': 5.0, 'growth': 4.0, 'total': 9.5},
                {'year': '2050', 'births': 11.7, 'deaths': 6.8, 'growth': 4.9, 'total': 11.7}
            ]