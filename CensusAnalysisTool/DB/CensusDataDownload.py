import requests
import csv
import time
import logging

# Your Census API key (Replace with your actual key)
API_KEY = "12aad78e6a2a81406f0d7ea0803de63b373022ac"

# Years for which to download data (ACS available yearly)
years = range(2023, 2025)

# Race-related variables from ACS Table B03002
variables = [
    # 1️⃣ Population & Demographics
    #"B01003_001E",  # Total Population
    "B01002_001E",  # Median Age
    "B02001_002E",  # White
    "B02001_003E",  # Black or African American
    "B03001_003E",  # Hispanic or Latino
    "B02001_005E",  # Asian
    "B02001_004E",  # American Indian/Alaska Native
    "B02001_006E",  # Native Hawaiian & Pacific Islander
    "B02001_008E",  # Two or More Races
    "B01001_002E",  # Total Male Population
    "B01001_026E",  # Total Female Population

    # 2️⃣ Socioeconomic Factors
    "B19013_001E",  # Median Household Income
    "B19301_001E",  # Per Capita Income
    "B17001_002E",  # People Below Poverty Line
    "B17024_001E",  # Child Poverty Rate (representative)
    "B15003_017E",  # High School Graduate
    "B15003_018E",  # Some College
    "B15003_021E",  # Bachelor’s Degree or Higher
    "B23025_002E",  # In Labor Force
    "B23025_003E",  # Civilian Labor Force
    "B23025_004E",  # Employed
    "B23025_005E",  # Unemployed
    "B23025_007E",  # Not in Labor Force

    # 3️⃣ Housing Data
    #"B25001_001E",  # Total Housing Units
    #"B25002_001E",  # Total Housing Units (Occupancy info header)
    "B25002_002E",  # Occupied Housing Units
    "B25002_003E",  # Vacant Housing Units
    "B25003_002E",  # Owner-Occupied Units
    "B25003_003E",  # Renter-Occupied Units
    "B25077_001E",  # Median Home Value
    "B25064_001E",  # Median Gross Rent
    "B25010_001E",  # Household Size

    # 4️⃣ Transportation & Mobility
    "B08301_003E",  # Drove Alone
    "B08301_004E",  # Carpooled
    "B08301_010E",  # Public Transportation
    "B08301_019E",  # Walked
    "B08301_021E",  # Worked at Home
    "B08303_001E",  # Average Travel Time to Work
    "B25044_003E",  # No Vehicle Available
    "B25044_004E",  # 1 Vehicle Available
    "B25044_005E",  # 2 Vehicles Available
    "B25044_006E",  # 3 or More Vehicles Available
   # "B08141_001E",  # Public Transit Usage
    "B08201_001E",  # Car Ownership per Household

    # 5️⃣ Health & Disability
    #"B18101_001E",  # Disability: Total Population
    "B18101_002E",  # With Disability
    #"B18101_003E",  # Without Disability
    #"B27001_001E",  # Health Insurance: Total Population
    "B27001_002E",  # With Health Insurance Coverage
    #"B27001_005E",  # Without Health Insurance Coverage

   # Born Outside the U.S.
]

variables_names = [
    # 1️⃣ Population & Demographics
   # "Total Population",
    "Median Age",
    "White",
    "Black or African American",
    "Hispanic or Latino",
    "Asian",
    "American Indian/Alaska Native",
    "Native Hawaiian & Pacific Islander",
    "Two or More Races",
    "Total Male Population",
    "Total Female Population",

    # 2️⃣ Socioeconomic Factors
    "Median Household Income",
    "Per Capita Income",
    "People Below Poverty Line",
    "Child Poverty Rate",
    "High School Graduate",
    "Some College",
    "Bachelor’s Degree or Higher",
    "In Labor Force",
    "Civilian Labor Force",
    "Employed",
    "Unemployed",
    "Not in Labor Force",

    # 3️⃣ Housing Data
    #"Total Housing Units",
    #"Total Housing Units (Occupancy)",
    "Occupied Housing Units",
    "Vacant Housing Units",
    "Owner-Occupied Units",
    "Renter-Occupied Units",
    "Median Home Value",
    "Median Gross Rent",
    "Household Size",

    # 4️⃣ Transportation & Mobility
    "Drove Alone",
    "Carpooled",
    "Public Transportation",
    "Walked",
    "Worked at Home",
    "Average Travel Time to Work",
    "No Vehicle Available",
    "1 Vehicle Available",
    "2 Vehicles Available",
    "3 or More Vehicles Available",
    #"Public Transit Usage",
    "Car Ownership per Household",

    # 5️⃣ Health & Disability
    #"Disability Total",
    "With Disability",
    #"Without Disability",
    #"Total Health Insurance",
    "With Health Insurance",
    #"Without Health Insurance",

    
]



# State FIPS codes (Modify if needed)
states = {
    "01": "Alabama", "02": "Alaska", "04": "Arizona", "05": "Arkansas",
    "06": "California", "08": "Colorado", "09": "Connecticut", "10": "Delaware",
    "11": "District of Columbia", "12": "Florida", "13": "Georgia", "15": "Hawaii",
    "16": "Idaho", "17": "Illinois", "18": "Indiana", "19": "Iowa", "20": "Kansas",
    "21": "Kentucky", "22": "Louisiana", "23": "Maine", "24": "Maryland",
    "25": "Massachusetts", "26": "Michigan", "27": "Minnesota", "28": "Mississippi",
    "29": "Missouri", "30": "Montana", "31": "Nebraska", "32": "Nevada",
    "33": "New Hampshire", "34": "New Jersey", "35": "New Mexico", "36": "New York",
    "37": "North Carolina", "38": "North Dakota", "39": "Ohio", "40": "Oklahoma",
    "41": "Oregon", "42": "Pennsylvania", "44": "Rhode Island", "45": "South Carolina",
    "46": "South Dakota", "47": "Tennessee", "48": "Texas", "49": "Utah",
    "50": "Vermont", "51": "Virginia", "53": "Washington", "54": "West Virginia",
    "55": "Wisconsin", "56": "Wyoming"
}

# Base URL for ACS 5-year endpoint
base_url = "https://api.census.gov/data/{year}/acs/acs5"

# Set up logging
logging.basicConfig(filename="census_data.log", level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")

# Function to fetch data with retries
def fetch_data(url, params, max_retries=5):
    """Fetch Census data with retry logic and exponential backoff."""
    for attempt in range(max_retries):
        try:
            response = requests.get(url, params=params, timeout=10)
            
            if response.status_code == 200:
                return response.json()
            elif response.status_code == 429:  # Rate Limit Exceeded
                retry_after = int(response.headers.get("Retry-After", 5))  # Use retry header if available
                logging.warning(f"Rate limit exceeded. Retrying in {retry_after} seconds.")
                time.sleep(retry_after)
            else:
                logging.error(f"Error {response.status_code}: {response.text}")
                return None
        except requests.exceptions.RequestException as e:
            logging.error(f"Request failed: {e}")
        
        time.sleep(2 ** attempt)  # Exponential backoff

    return None

# Loop through years and save data in separate files
for year in years:
    print(f"Processing data for year: {year}")
    url = base_url.format(year=year)
    get_vars = ",".join(["NAME"] + variables)

    output_file = f"acs_race_population_{year}.csv"
    
    with open(output_file, mode="w", newline="", encoding="utf-8") as csv_file:
        writer = csv.writer(csv_file)
        header = ["year", "state", "county", "tract"] + variables_names
        writer.writerow(header)

        for state_fips in states.keys():
            params = {
                "get": get_vars,
                "for": "tract:*",
                "in": f"state:{state_fips}",
                "key": API_KEY
            }

            data = fetch_data(url, params)
            if not data:
                print(f"Skipping {year} {state_fips} due to errors.")
                continue

            for row in data[1:]:
                state_code, county_code, tract_code = row[-3], row[-2], row[-1]
                var_values = [v if v != "null" else "-1" for v in row[1:1 + len(variables)]]
                writer.writerow([year, state_code, county_code, tract_code] + var_values)

            # Adaptive delay (0.5s minimum)
            time.sleep(1)

    print(f"Data for {year} saved in {output_file}")

print("Data download complete for all years.")
