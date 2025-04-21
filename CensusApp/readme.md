# Census Population Dashboard

A modern, interactive dashboard for exploring population census data with detailed demographics, statistics, and visualizations.

## Features

- Interactive population statistics and demographics
- Real-time data visualization with charts and graphs
- State and county-level population breakdowns
- Historical population trends
- User authentication via Clerk
- Responsive design for desktop and mobile

## Tech Stack

### Frontend
- React.js
- Tailwind CSS
- Recharts (data visualization)
- Clerk (authentication)

### Backend
- Flask (Python)
- MySQL database
- RESTful API

## Getting Started

### Prerequisites

- Node.js and npm
- Python 3.9 or later
- MySQL
- Docker and Docker Compose (optional)

### Environment Setup

1. Clone the repository
   ```
   git clone https://github.com/your-username/population-dashboard.git
   cd population-dashboard
   ```

2. Create a `.env` file in the root directory using the provided `.env.example` as a template
   ```
   cp .env.example .env
   ```

3. Update the `.env` file with your API keys and database credentials

### Running the Application with Docker

The easiest way to get started is to use Docker Compose:

```
docker-compose up
```

This will start the frontend, backend, and MySQL database in separate containers.

### Manual Setup

#### Backend Setup

1. Navigate to the backend directory
   ```
   cd backend
   ```

2. Create a virtual environment and activate it
   ```
   python -m venv venv
   source venv/bin/activate   # On Windows: venv\Scripts\activate
   ```

3. Install dependencies
   ```
   pip install -r requirements.txt
   ```

4. Start the Flask server
   ```
   flask --app src/app.py run --debug
   ```

#### Frontend Setup

1. Navigate to the frontend directory
   ```
   cd frontend
   ```

2. Install dependencies
   ```
   npm install
   ```

3. Start the development server
   ```
   npm start
   ```

## Database Setup

The application will automatically create the necessary tables if they don't exist. The SQL scripts for table creation and sample data insertion are available in `backend/sql/`.

## Available Scripts

### Backend

- `flask --app src/app.py run --debug`: Start the Flask server in development mode

### Frontend

- `npm start`: Start the development server
- `npm test`: Run tests
- `npm run build`: Build for production

## License

This project is licensed under the MIT License - see the LICENSE file for details.