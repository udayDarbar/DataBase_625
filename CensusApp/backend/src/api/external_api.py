from flask import Blueprint, jsonify, request
import logging
import os
from services.census_service import CensusService

external_api_bp = Blueprint("external_api", __name__)
logger = logging.getLogger(__name__)

# Initialize services
census_service = CensusService()

@external_api_bp.route('/api/population/overview', methods=['GET'])
def get_population_overview():
    """
    Get overall population statistics
    """
    try:
        year = request.args.get('year', default=2020, type=int)
        data = census_service.get_population_overview(year)
        return jsonify(data)
    except Exception as e:
        logger.error(f"Error in population overview: {str(e)}")
        return jsonify({"error": "Failed to fetch population overview"}), 500

@external_api_bp.route('/api/countries/top', methods=['GET'])
def get_top_countries():
    """
    Get top countries by population
    """
    try:
        limit = request.args.get('limit', default=10, type=int)
        countries = census_service.get_top_countries(limit)
        return jsonify(countries)
    except Exception as e:
        logger.error(f"Error fetching top countries: {str(e)}")
        return jsonify({"error": "Failed to fetch top countries"}), 500

@external_api_bp.route('/api/population/trend', methods=['GET'])
def get_population_trend():
    """
    Get population trend data
    """
    try:
        start_year = request.args.get('start_year', default=2012, type=int)
        end_year = request.args.get('end_year', default=2020, type=int)
        
        # Optional sample parameter to include sample historical data
        include_sample = request.args.get('include_sample', default='true', type=str).lower() == 'true'
        
        trend_data = census_service.get_population_trend(start_year, end_year)
        return jsonify(trend_data)
    except Exception as e:
        logger.error(f"Error fetching population trend: {str(e)}")
        return jsonify({"error": "Failed to fetch population trend"}), 500