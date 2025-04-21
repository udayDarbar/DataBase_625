import logging
from db.mysql_connection import get_mysql_connection


class DatabaseManager:
    def __init__(self):
        self.logger = logging.getLogger(__name__)
    
    def save_user(self, user_id, username, first_name, last_name, email, role=None): 
        try:
            with get_mysql_connection() as conn:
                with conn.cursor() as cursor:
                    # Check if user exists
                    check_sql = "SELECT * FROM Users WHERE user_id = %s"
                    cursor.execute(check_sql, (user_id,))
                    user = cursor.fetchone()

                    # Set default role if not provided
                    if role is None:
                        role = 'User'

                    if user:
                        # Update existing user
                        update_sql = """
                        UPDATE Users 
                        SET username = %s, first_name = %s, last_name = %s, email = %s, role = %s 
                        WHERE user_id = %s
                        """
                        cursor.execute(
                            update_sql,
                            (username, first_name, last_name, email, role, user_id)
                        )
                    else:
                        # Insert new user
                        insert_sql = """
                        INSERT INTO Users 
                        (user_id, username, first_name, last_name, email, role) 
                        VALUES (%s, %s, %s, %s, %s, %s)
                        """
                        cursor.execute(
                            insert_sql,
                            (user_id, username, first_name, last_name, email, role)
                        )

                    return True

        except Exception as e:
            self.logger.error(f"Error saving user: {e}")
            return False
    
    def get_census_data(self, year=2020, state_filter=None, county_filter=None):
        """
        Get census data for a specific year and optional filters
        """
        try:
            with get_mysql_connection() as conn:
                with conn.cursor() as cursor:
                    # Building the SQL query with potential filters
                    params = [year]
                    sql = """
                    SELECT 
                        gi.StatFP,
                        gi.CountyFP,
                        gi.Tract,
                        pd.MedianAge,
                        pd.White,
                        pd.BlackorAfricanAmerican,
                        pd.HispanicorLatino,
                        pd.Asian,
                        pd.AmericanIndian,
                        pd.NativeHawaiian,
                        pd.TotalMalePopulation,
                        pd.TotalFemalePopulation,
                        pd.WithDisability,
                        pd.WithHealthInsurance,
                        sf.MedianHouseholdIncome,
                        sf.PerCapitaIncome,
                        sf.PeopleBelowPovertyLine,
                        sf.ChildPovertyRate
                    FROM Geoid_info gi
                    JOIN Population_Demographics pd ON gi.Year = pd.Year
                        AND gi.StatFP = pd.StatFP
                        AND gi.CountyFP = pd.CountyFP
                        AND gi.Tract = pd.Tract
                    JOIN Socioeconomic_Factors sf ON gi.Year = sf.Year
                        AND gi.StatFP = sf.StatFP
                        AND gi.CountyFP = sf.CountyFP
                        AND gi.Tract = sf.Tract
                    WHERE gi.Year = %s
                    """
                    
                    # Add filters if provided
                    if state_filter:
                        sql += " AND gi.StatFP = %s"
                        params.append(state_filter)
                    
                    if county_filter:
                        sql += " AND gi.CountyFP = %s"
                        params.append(county_filter)
                    
                    # Add limit for performance
                    sql += " LIMIT 1000"
                    
                    cursor.execute(sql, params)
                    results = cursor.fetchall()
                    
                    # Process results
                    if not results:
                        return []
                    
                    # Return list of census data entries
                    return results
                    
        except Exception as e:
            self.logger.error(f"Error fetching census data: {e}")
            return []
            
    def get_population_by_state(self, year=2020):
        """
        Get population statistics grouped by state
        """
        try:
            with get_mysql_connection() as conn:
                with conn.cursor() as cursor:
                    sql = """
                    SELECT 
                        gi.StatFP,
                        SUM(pd.TotalMalePopulation) as male_population,
                        SUM(pd.TotalFemalePopulation) as female_population,
                        SUM(pd.TotalMalePopulation + pd.TotalFemalePopulation) as total_population
                    FROM Geoid_info gi
                    JOIN Population_Demographics pd ON gi.Year = pd.Year
                        AND gi.StatFP = pd.StatFP
                        AND gi.CountyFP = pd.CountyFP
                        AND gi.Tract = pd.Tract
                    WHERE gi.Year = %s
                    GROUP BY gi.StatFP
                    ORDER BY total_population DESC
                    """
                    cursor.execute(sql, (year,))
                    results = cursor.fetchall()
                    
                    # Get state names from state FIPS codes
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
                    
                    # Process results
                    for result in results:
                        result['state_name'] = state_names.get(result['StatFP'], f"State {result['StatFP']}")
                    
                    return results
        except Exception as e:
            self.logger.error(f"Error fetching population by state: {e}")
            return []
            
    def get_census_years(self):
        """
        Get all available census years
        """
        try:
            with get_mysql_connection() as conn:
                with conn.cursor() as cursor:
                    sql = """
                    SELECT DISTINCT Year 
                    FROM Geoid_info 
                    ORDER BY Year
                    """
                    cursor.execute(sql)
                    years = [row['Year'] for row in cursor.fetchall()]
                    return years
        except Exception as e:
            self.logger.error(f"Error fetching census years: {e}")
            return [2020]  # Return default year if there's an error