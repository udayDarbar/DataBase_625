import requests
import csv
import time
import logging

# Your Census API key (Replace with your actual key)
API_KEY = "12aad78e6a2a81406f0d7ea0803de63b373022ac"

# Years for which to download data (ACS available yearly)
years = range(2010, 2025)

# Race-related variables from ACS Table B03002
variables = [
    "B03002_001E",  # Total Population
    "B03002_002E",  #  White (Non-Hispanic)
    "B03002_003E",  # Hispanic or Latino
    "B03002_004E",  # Black or African American
    "B03002_005E",  # American Indian and Alaska Native
    "B03002_006E",  # Asian
    "B03002_007E",  # Native Hawaiian and Other Pacific Islander
 
]
variables_names = ["Total Population",
                   
    "White(Non-Hispanic)",
    "Hispanic_Latino",
    "Black_African_American",
    "American_Indian_Alaska_Native",
    "Asian",
    "Native_Hawaiian_Pacific_Islander",
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
            time.sleep(0.5)

    print(f"Data for {year} saved in {output_file}")

print("Data download complete for all years.")
