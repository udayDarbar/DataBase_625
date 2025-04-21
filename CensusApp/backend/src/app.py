from flask import Flask, jsonify, request
from flask_cors import CORS
from dotenv import load_dotenv
import logging
from logging.handlers import RotatingFileHandler
import os
import traceback
from db.database_initializer import DatabaseInitializer

# Import blueprints
from api.external_api import external_api_bp
from api.internal_api import internal_api_bp

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)

# Configure CORS - Allow requests from all origins for development
CORS(app, resources={r"/api/*": {"origins": "*", "supports_credentials": False}})

# Configure logging
logging.basicConfig(
    level=logging.INFO,  # Change from DEBUG to INFO for app-level logs
    format='%(asctime)s | %(name)s | %(levelname)s | %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)

# Create a logger for the application
logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)  # Keep your app's logger at DEBUG level

# Set watchdog module to only show WARNING and above
logging.getLogger('watchdog').setLevel(logging.WARNING)

# Register error handler
@app.errorhandler(Exception)
def handle_error(e):
    logger.error(f"Unhandled error: {str(e)}")
    logger.error(traceback.format_exc())
    
    response = {
        "error": str(e),
        "message": "An unexpected error occurred. Please try again later."
    }
    
    # Return different status code based on exception type
    if isinstance(e, ValueError):
        return jsonify(response), 400
    elif isinstance(e, KeyError):
        return jsonify(response), 400
    elif isinstance(e, FileNotFoundError):
        return jsonify(response), 404
    
    return jsonify(response), 500

# Register blueprints
app.register_blueprint(external_api_bp)
app.register_blueprint(internal_api_bp)

# Create the database
db_initializer = DatabaseInitializer()

@app.route('/')
def index():
    return {
        'status': 'ok',
        'message': 'Census Population Dashboard API is running'
    }

# Add health check endpoint
@app.route('/health')
def health_check():
    return jsonify({'status': 'ok', 'service': 'census-api'})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)