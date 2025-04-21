from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv
import logging
from logging.handlers import RotatingFileHandler
import os
from db.database_initializer import DatabaseInitializer

# Import blueprints
from api.external_api import external_api_bp
from api.internal_api import internal_api_bp

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)

# Configure CORS properly
CORS(app, resources={r"/api/*": {"origins": "*", "supports_credentials": False}})

# Configure logging
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s | %(name)s | %(levelname)s | %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
# Create a logger for the application
logger = logging.getLogger(__name__)

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

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)