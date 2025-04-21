# wait_for_mysql.py
import time
import pymysql
import os
import sys
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def wait_for_mysql(host, user, password, port=3306, max_attempts=30, delay=2):
    """
    Wait for MySQL database to be available
    """
    logger.info(f"Waiting for MySQL at {host}:{port} to be ready...")
    
    for attempt in range(max_attempts):
        try:
            connection = pymysql.connect(
                host=host,
                user=user,
                password=password,
                port=port,
                connect_timeout=5
            )
            connection.close()
            logger.info("MySQL database is ready!")
            return True
        except pymysql.Error as e:
            logger.info(f"MySQL not ready yet (attempt {attempt + 1}/{max_attempts}): {e}")
            time.sleep(delay)
    
    logger.error(f"Could not connect to MySQL after {max_attempts} attempts")
    return False

if __name__ == "__main__":
    # Get database connection parameters from environment variables
    host = os.environ.get("MYSQL_HOST", "mysql")
    user = os.environ.get("MYSQL_USER", "root")
    password = os.environ.get("MYSQL_PASSWORD", "")
    port = int(os.environ.get("MYSQL_PORT", 3306))
    
    # Wait for MySQL to be ready
    if not wait_for_mysql(host, user, password, port):
        sys.exit(1)