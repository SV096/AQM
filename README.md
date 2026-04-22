# Air Quality Monitoring (AQM)

Air Quality Monitoring is a full-stack project for checking live air quality and viewing short-term AQI forecasts.

The project includes:

- a React frontend for users
- an Express and MongoDB backend API
- a Python and XGBoost ML module for forecasting

Users can:

- create an account
- search for cities
- view current AQI and pollutant data
- check 24-hour and 5-day forecasts
- save favorite cities
- review search history

## Project Structure

```text
AQM/
|- backend/
|- frontend/
|- ml/
|- PROJECT_OVERVIEW.md
`- README.md
```

## Folder Overview

- `frontend/` - React app for the user interface
- `backend/` - Express API for auth, data fetching, and forecast handling
- `ml/` - Python scripts and trained models used for AQI prediction

## Tech Stack

- Frontend: React, React Router, Axios, Framer Motion
- Backend: Node.js, Express, MongoDB, Mongoose, JWT
- ML: Python, pandas, NumPy, scikit-learn, XGBoost
- External APIs: OpenWeather and WAQI

## Local Setup

### 1. Start the backend

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

### 2. Start the frontend

```bash
cd frontend
npm install
cp .env.example .env
npm start
```

### 3. ML module

The backend uses the files inside `ml/` directly for forecasting, so the `ml` folder should stay available alongside the backend.

## Environment Files

Use the example files when setting up the project:

- `backend/.env.example`
- `frontend/.env.example`

## Deployment

A practical deployment setup for this project is:

- `frontend` on Vercel
- `backend` and `ml` together on Render or another server that supports both Node.js and Python

The frontend should point to the live backend API URL through:

```env
REACT_APP_API_URL=https://your-backend-url/api
```

## More Information

For a more detailed explanation of the project structure and flow, see `PROJECT_OVERVIEW.md`.
