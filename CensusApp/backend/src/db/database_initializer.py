import os
import logging
import pymysql
from db.mysql_connection import get_mysql_connection


class DatabaseInitializer:
    def __init__(self):
        # For MySQL, we no longer need a file path.
        self._initialize_database()

    def _initialize_database(self):
        logging.info("Initializing MySQL database schema")
        try:
            # First connect without database to create it if needed
            connection = pymysql.connect(
                host=os.environ.get("MYSQL_HOST"),
                user=os.environ.get("MYSQL_USER"),
                password=os.environ.get("MYSQL_PASSWORD"),
                port=int(os.environ.get("MYSQL_PORT", 3306)),
                cursorclass=pymysql.cursors.DictCursor,
                autocommit=True
            )

            with connection.cursor() as cursor:
                # Create database if it doesn't exist
                cursor.execute(
                    f"CREATE DATABASE IF NOT EXISTS {os.environ.get('MYSQL_DATABASE')}")
            connection.close()

            # Now connect with database specified and check tables
            with get_mysql_connection() as conn:
                with conn.cursor() as cursor:
                    # Check if tables exist
                    cursor.execute("""
                        SELECT COUNT(*) as table_count FROM information_schema.tables 
                        WHERE table_schema = %s AND table_name IN ('Geoid_info', 'Population_Demographics', 'Socioeconomic_Factors', 'Housing_Data', 'Transportation_Mobility')
                    """, (os.environ.get('MYSQL_DATABASE'),))
                    
                    result = cursor.fetchone()
                    if result and result['table_count'] == 5:
                        logging.info("Census tables already exist, skipping initialization")
                        return
                
                    # If tables don't exist, execute the SQL initialization script
                    sql_script_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), 'sql', 'CensusData.sql')
                    
                    if os.path.exists(sql_script_path):
                        logging.info(f"Executing SQL script from: {sql_script_path}")
                        with open(sql_script_path, 'r') as f:
                            sql_script = f.read()
                            
                            # Split the script by 'GO' statements (if any)
                            statements = sql_script.split('GO')
                            for statement in statements:
                                if statement.strip():
                                    try:
                                        cursor.execute(statement)
                                    except Exception as e:
                                        logging.error(f"Error executing SQL statement: {e}")
                                        logging.error(f"Statement: {statement[:100]}...")
                    else:
                        logging.warning(f"SQL script not found at: {sql_script_path}")
                        
                        # Create basic tables if script is not found
                        logging.info("Creating basic Census tables")
                        
                        # Create Geoid_info table
                        cursor.execute("""
                        CREATE TABLE IF NOT EXISTS Geoid_info (
                            Year INT,
                            StatFP VARCHAR(10),
                            CountyFP VARCHAR(10),
                            Tract VARCHAR(20),
                            PRIMARY KEY (Year, StatFP, CountyFP, Tract)
                        )
                        """)
                        
                        # Create Population_Demographics table
                        cursor.execute("""
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
                        )
                        """)
                        
                        # Create Socioeconomic_Factors table
                        cursor.execute("""
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
                        )
                        """)
                        
                        # Create Housing_Data table
                        cursor.execute("""
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
                        )
                        """)
                        
                        # Create Transportation_Mobility table
                        cursor.execute("""
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
                        )
                        """)
            
            logging.info("MySQL database and tables initialized.")
        except Exception as e:
            logging.error(f"Error initializing MySQL database: {e}")