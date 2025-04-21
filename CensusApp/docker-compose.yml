services:
  backend:
    env_file: 
      - .env
    build: ./backend
    ports:
      - "5001:5000"
    volumes:
      - ./backend:/backend
    environment:
      - FLASK_DEBUG=${FLASK_DEBUG}
      - FLASK_APP=${FLASK_APP}
      - FLASK_ENV=${FLASK_ENV}
      - MYSQL_HOST=${MYSQL_HOST}
      - MYSQL_USER=${MYSQL_USER}
      - MYSQL_PASSWORD=${MYSQL_PASSWORD}
      - MYSQL_DATABASE=${MYSQL_DATABASE}
      - MYSQL_PORT=${MYSQL_PORT}
      - CLERK_SECRET_KEY=${CLERK_SECRET_KEY}
    depends_on:
      - mysql

  frontend:
    env_file: 
      - .env
    build: ./frontend
    ports:
      - "3000:3000"
    volumes:
      - ./frontend:/app
      - /app/node_modules
    environment:
      - REACT_APP_API_URL=${REACT_APP_API_URL}
      - REACT_APP_VITE_CLERK_PUBLISHABLE_KEY=${REACT_APP_VITE_CLERK_PUBLISHABLE_KEY}
      - NODE_ENV=development
      - CHOKIDAR_USEPOLLING=true
      - WDS_SOCKET_PORT=0
    depends_on:
      - backend

  mysql:
    image: mysql:8.0
    environment:
      - MYSQL_ROOT_PASSWORD=${MYSQL_ROOT_PASSWORD}
      - MYSQL_DATABASE=${MYSQL_DATABASE}
      - MYSQL_USER=${MYSQL_USER}
      - MYSQL_PASSWORD=${MYSQL_PASSWORD}
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql
      - ./backend/sql:/docker-entrypoint-initdb.d

volumes:
  mysql_data: