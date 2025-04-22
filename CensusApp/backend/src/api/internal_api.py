from flask import Blueprint, jsonify, request
import logging
from db.database_manager import DatabaseManager
from db.mysql_connection import get_mysql_connection
import os
from datetime import datetime
from services.census_service import CensusService

internal_api_bp = Blueprint("internal_api", __name__)
database_service = DatabaseManager()
census_service = CensusService()
logger = logging.getLogger(__name__)

@internal_api_bp.route("/api/save-user", methods=["POST"])
def user_session():
    """
    Receives user data from Clerk (React frontend) and saves it in the MySQL Users table.
    """
    try:
        data = request.json
        required_fields = ("userId", "username", "firstName", "lastName", "email")

        # Quick validation
        if not all(field in data for field in required_fields):
            return jsonify({"error": "Missing required user fields"}), 400

        user_id = data["userId"]
        username = data["username"]
        first_name = data["firstName"]
        last_name = data["lastName"]
        email = data["email"]
        role = data.get("role", "User")  # Default to User if not provided

        # Save user data in the MySQL database
        success = database_service.save_user(
            user_id, username, first_name, last_name, email, role
        )

        if not success:
            return jsonify({"error": "Failed to save user data"}), 500

        return jsonify({"message": "User data saved successfully"}), 200
    except Exception as e:
        logger.error(f"Error in save-user endpoint: {e}")
        return jsonify({"error": str(e)}), 500

@internal_api_bp.route("/api/user-profile", methods=["GET"])
def get_user_profile():
    """
    Retrieve user profile data including role
    """
    try:
        user_id = request.args.get("userId")
        if not user_id:
            return jsonify({"error": "User ID is required"}), 400
            
        try:
            with get_mysql_connection() as conn:
                with conn.cursor() as cursor:
                    sql = """
                    SELECT username, first_name, last_name, email, role
                    FROM Users 
                    WHERE user_id = %s
                    """
                    cursor.execute(sql, (user_id,))
                    user = cursor.fetchone()
                    
                    if user:
                        return jsonify({
                            "username": user["username"],
                            "firstName": user["first_name"],
                            "lastName": user["last_name"],
                            "email": user["email"],
                            "role": user["role"],
                        })
                    
                    # If user not found, return default structure
                    # This prevents 404 errors during first login
                    return jsonify({
                        "username": "",
                        "firstName": "",
                        "lastName": "",
                        "email": "",
                        "role": "User", 
                    })
                    
        except Exception as e:
            logger.error(f"Database error fetching user profile: {e}")
            # Return default user profile on database error
            return jsonify({
                "username": "",
                "firstName": "",
                "lastName": "", 
                "email": "",
                "role": "User",
            })
    except Exception as e:
        logger.error(f"Error in user-profile endpoint: {e}")
        return jsonify({"error": str(e)}), 500

@internal_api_bp.route("/api/census/data", methods=["GET"])
def get_census_data():
    """
    Get census data with optional filters
    """
    try:
        year = request.args.get('year', default=2020, type=int)
        state = request.args.get('state')
        county = request.args.get('county')
        
        data = database_service.get_census_data(year, state, county)
        
        return jsonify({
            "year": year,
            "state": state,
            "county": county,
            "data": data,
            "count": len(data)
        })
    except Exception as e:
        logger.error(f"Error fetching census data: {str(e)}")
        return jsonify({"error": "Failed to fetch census data"}), 500

@internal_api_bp.route("/api/census/years", methods=["GET"])
def get_census_years():
    """
    Get all available census years
    """
    try:
        years = database_service.get_census_years()
        return jsonify(years)
    except Exception as e:
        logger.error(f"Error fetching census years: {str(e)}")
        return jsonify({"error": "Failed to fetch census years"}), 500

@internal_api_bp.route("/api/population/states", methods=["GET"])
def get_population_by_state():
    """
    Get population statistics by state
    """
    try:
        year = request.args.get('year', default=2020, type=int)
        data = database_service.get_population_by_state(year)
        
        return jsonify({
            "year": year,
            "states": data,
            "count": len(data)
        })
    except Exception as e:
        logger.error(f"Error fetching population by state: {str(e)}")
        return jsonify({"error": "Failed to fetch population by state"}), 500

@internal_api_bp.route("/api/population/overview", methods=["GET"])
def get_population_overview():
    """
    Get overall population statistics including ethnicity data
    """
    try:
        year = request.args.get('year', default=2020, type=int)
        
        # Use the census service to get the data with ethnicity percentages
        data = census_service.get_population_overview(year)
        return jsonify(data)
    except Exception as e:
        logger.error(f"Error in population overview: {str(e)}")
        # Return default values in case of error
        return jsonify({
            "total_population": 7981681536,
            "median_age": 30.9,
            "working_age_percentage": 65.0,
            "elderly_percentage": 10.0,
            "youth_percentage": 25.0,
            # Ethnicity data
            "white_percentage": 61.6,
            "black_percentage": 12.4,
            "hispanic_percentage": 18.7,
            # Other data
            "births_today": 180295,
            "deaths_today": 80295,
            "growth_today": 105295
        })

@internal_api_bp.route("/api/population/trend", methods=["GET"])
def get_population_trend():
    """
    Get population trend data
    """
    try:
        start_year = request.args.get('start_year', default=2010, type=int)
        end_year = request.args.get('end_year', default=2020, type=int)
        
        # Use census_service for the trend data
        trend_data = census_service.get_population_trend(start_year, end_year)
        return jsonify(trend_data)
    except Exception as e:
        logger.error(f"Error fetching population trend: {str(e)}")
        return jsonify({"error": "Failed to fetch population trend"}), 500

@internal_api_bp.route("/api/logs", methods=["GET"])
def get_logs():
    """
    Get application logs
    """
    try:
        # Log request for debugging
        logging.info("Log request received")

        # Initialize logs list
        logs = []

        # First try to get logs from the log file
        log_file_path = os.path.join(os.getcwd(), 'logs', 'app.log')
        if os.path.exists(log_file_path):
            with open(log_file_path, 'r') as file:
                file_logs = file.readlines()[-1000:]  # Get last 1000 lines
                logs.extend(file_logs)
        
        # If no file logs, add some basic info
        if not logs:
            logs = [
                f"{datetime.now().isoformat()} | INFO | Application running",
                f"{datetime.now().isoformat()} | INFO | No historical logs available",
            ]
        
        # Add current runtime info
        logs.append(f"{datetime.now().isoformat()} | INFO | Log request successful")
        
        # Clean up logs
        logs = [line.strip() for line in logs if line.strip()]
        
        return jsonify(logs)

    except Exception as e:
        error_message = str(e)
        logging.error(f"Error in get_logs: {error_message}")
        
        # Return detailed error response
        return jsonify({
            "error": "Failed to fetch logs",
            "message": error_message,
            "timestamp": datetime.now().isoformat(),
            "debug_info": {
                "current_dir": os.getcwd(),
                "log_path": log_file_path if 'log_file_path' in locals() else "Not set",
                "exception_type": type(e).__name__
            }
        }), 500