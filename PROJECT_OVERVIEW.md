# Project Overview

## Introduction

Air Quality Monitoring (AQM) is a full-stack application built to help users check air quality conditions for cities and view short-term AQI forecasts generated from live environmental data and trained machine learning models.

The project combines three connected parts:

- a React frontend for the user interface
- an Express and MongoDB backend for authentication, storage, and API orchestration
- a Python and XGBoost machine learning layer for AQI prediction

The goal of the project is to give users a simple way to:

- create an account and sign in
- search for a city
- check current air quality conditions
- review 24-hour and 5-day AQI forecasts
- save cities for quick access
- view previous search activity

This document is intended to be safe for public repository visitors. It explains how the project works without exposing secret values, private credentials, or sensitive local configuration.

## What The Project Does

AQM focuses on real-time and near-future air quality visibility.

At a high level, the application:

1. lets a user authenticate
2. accepts a city search from the frontend
3. resolves the city location
4. fetches current weather data and forecast weather data
5. fetches current AQI and pollutant data
6. converts those live signals into a machine-learning-ready feature vector
7. runs prediction using trained XGBoost models
8. returns a formatted forecast response to the frontend
9. stores useful user-related records such as history and favorites

The system is designed around practical forecasting rather than only static historical reporting. That is why the backend, external APIs, and ML layer are tightly connected.

## High-Level Architecture

```text
Frontend (React)
    |
    v
Backend API (Node.js + Express + MongoDB)
    |
    +--> OpenWeather API
    +--> WAQI API
    `--> Python inference in ml/inference.py
```

### Architecture summary

- The frontend is responsible for user interaction and presentation.
- The backend is responsible for auth, data fetching, persistence, and forecast orchestration.
- The ML layer is responsible for model loading and prediction.
- External APIs provide live weather and air quality inputs.

## Main Parts Of The Repository

```text
AQM/
|- backend/
|- frontend/
|- ml/
|- README.md
`- PROJECT_OVERVIEW.md
```

Each main folder has a separate responsibility and can be understood independently, but the full product works only when they are connected together.

## Frontend Overview

The frontend is a React application that provides the user-facing experience.

Its main responsibilities are:

- route navigation
- authentication state handling
- protected page access
- city search and forecast display
- favorites management
- history display

### Main frontend routes and pages

Based on [frontend/src/App.js](/abs/path/e:/AQM/frontend/src/App.js), the frontend exposes these routes:

- `/` for the home page
- `/signup` for registration
- `/signin` for login
- `/live` for the main forecast experience
- `/favorites` for saved cities
- `/history` for previous search activity

The `live`, `favorites`, and `history` routes are protected by `PrivateRoute`, which means a user must be authenticated before accessing them.

### Frontend auth flow

Auth state is managed in [frontend/src/context/AuthContext.js](/abs/path/e:/AQM/frontend/src/context/AuthContext.js).

The frontend:

- reads the saved JWT token from local storage
- sets the default Axios `Authorization` header when a token is available
- calls `/auth/me` to validate the current session
- stores the returned user profile in application state
- clears local auth state when login validation fails or the user logs out

This keeps auth logic centralized and allows the rest of the application to depend on shared auth state.

### Frontend search and forecast experience

The main user workflow lives in [frontend/src/pages/Live.js](/abs/path/e:/AQM/frontend/src/pages/Live.js).

That page:

- accepts a city search from the user
- calls the backend forecast endpoint using `REACT_APP_API_URL`
- sends the stored token in the bearer header
- renders current AQI, weather, and pollutant details
- shows 24-hour and 5-day forecast summaries
- provides basic user-friendly error messages for network and API failures

The page also includes a large list of city suggestions to make search easier.

### Favorites and history on the frontend

The frontend includes dedicated pages for:

- `Favorites` to revisit saved cities quickly
- `History` to view previously searched cities and AQI results

This makes the app feel more like a user account product rather than a one-time search tool.

## Backend Overview

The backend is an Express application that acts as the central coordinator for the whole system.

Its main responsibilities are:

- user authentication
- input validation
- protected API access
- integration with external weather and air quality providers
- preparation of machine learning inputs
- invocation of Python model inference
- persistence of user and forecast-related data

### Server setup

From [backend/server.js](/abs/path/e:/AQM/backend/server.js), the backend:

- loads environment variables with `dotenv`
- enables `helmet` for basic security headers
- enables `cors` using the configured frontend origin
- parses JSON request bodies
- applies request rate limiting
- connects to MongoDB using Mongoose
- initializes ML model loading during startup
- mounts the auth, forecast, user, and weather routes
- exposes a health endpoint at `/api/health`

The health endpoint also reports whether ML models were loaded successfully, which is useful for deployment checks.

### Backend route groups

The backend is organized into four main route areas:

- `routes/auth.js`
- `routes/forecast.js`
- `routes/user.js`
- `routes/weather.js`

#### Authentication routes

From [backend/routes/auth.js](/abs/path/e:/AQM/backend/routes/auth.js):

- `POST /api/auth/signup` creates a user account
- `POST /api/auth/login` authenticates a user and returns a JWT
- `GET /api/auth/me` returns the current authenticated user

Input validation is done using `express-validator`, and passwords are never stored in plain text.

#### User routes

From [backend/routes/user.js](/abs/path/e:/AQM/backend/routes/user.js):

- `GET /api/user/profile` returns the current user profile
- `PUT /api/user/favorite-city` updates a user’s preferred city
- `POST /api/user/favorites` adds a favorite city
- `GET /api/user/favorites` lists favorites
- `DELETE /api/user/favorites/:id` removes a favorite
- `GET /api/user/history` returns search history
- `DELETE /api/user/history` clears search history

These routes are protected by JWT middleware.

#### Weather routes

The weather routes provide current weather and forecast proxy endpoints. They are useful helper endpoints and keep external API access inside the backend.

#### Forecast route

The most important route is `GET /api/forecast/city/:city` in [backend/routes/forecast.js](/abs/path/e:/AQM/backend/routes/forecast.js).

This route performs the core product workflow:

1. converts the city name to coordinates using OpenWeather geocoding
2. fetches current weather from OpenWeather
3. fetches 5-day weather forecast data from OpenWeather
4. fetches current AQI and pollutant data from WAQI
5. converts live values into a 42-feature input vector
6. calls the Python inference wrapper
7. receives 1-day and 5-day AQI predictions
8. formats the response into frontend-friendly output
9. stores forecast and history data in MongoDB
10. returns the final structured response

This route is the point where the backend, external APIs, database, and ML system all come together.

## Database Models

The backend uses MongoDB with Mongoose schemas to store application data.

### User model

From [backend/models/User.js](/abs/path/e:/AQM/backend/models/User.js):

- stores name, email, password, avatar, favorite city, and creation date
- enforces unique email addresses
- hashes passwords before save using `bcryptjs`
- hides the password field by default with `select: false`

### Forecast model

From [backend/models/Forecast.js](/abs/path/e:/AQM/backend/models/Forecast.js):

- stores forecast results for a user and city
- stores 24-hour and 5-day prediction arrays
- stores AQI, pollutant, and weather snapshot data
- automatically expires documents after 24 hours using a TTL-style `expires` setting on `createdAt`

This is a useful design choice because forecasts are time-sensitive and do not need to live forever in storage.

### Favorite model

From [backend/models/Favorite.js](/abs/path/e:/AQM/backend/models/Favorite.js):

- stores a user’s saved city list
- keeps city coordinates and country metadata
- enforces a unique `userId + city` combination

### History model

From [backend/models/History.js](/abs/path/e:/AQM/backend/models/History.js):

- stores the user’s searched cities
- stores AQI, pollutants, weather, and action type
- indexes `userId` and timestamp for faster retrieval

## Machine Learning Overview

The ML layer lives in the `ml/` folder and is used directly by the backend at runtime.

This is important: the ML module is not a separate service in the current architecture. Instead, the backend expects the ML files to exist locally in the same deployed codebase.

### ML folder responsibilities

The ML folder contains:

- trained XGBoost model files
- Python inference code
- preprocessing scripts
- exploratory analysis scripts
- training and evaluation scripts

### Inference flow

The main runtime file is [ml/inference.py](/abs/path/e:/AQM/ml/inference.py).

That file:

- loads the trained 1-day and 5-day XGBoost models from `ml/models/`
- accepts a 42-element feature array
- converts it into a NumPy array
- runs both models
- clamps values to the valid AQI range
- returns a JSON response to the Node backend

### Why the backend and ML stay together

The backend uses local ML files instead of making an HTTP call to another ML service.

That means:

- the backend and `ml/` folder must be deployed together
- Python and the required ML packages must be available in the runtime environment
- the model files must be present in deployment

This is why the current project structure works well as:

- `frontend` deployed separately
- `backend` and `ml` deployed together

## End-To-End User Flow

The best way to understand the system is to follow one complete user action.

### Example flow: user searches for a city

1. A user signs in from the frontend.
2. The frontend stores the JWT token and keeps it in auth context.
3. The user goes to the Live page and searches for a city.
4. The frontend sends a request to the backend forecast endpoint.
5. The backend validates the JWT.
6. The backend resolves the city location and fetches live weather and AQI information.
7. The backend engineers prediction features from those live inputs.
8. The backend runs Python inference against the trained models.
9. The backend formats the result into current conditions plus forecast sections.
10. The backend saves forecast and history records.
11. The frontend renders the result in cards and sections for the user.

This flow is what gives the project its full-stack character. Every major folder participates in the result.

## External Services And Data Sources

The project integrates with several external systems:

- OpenWeather for geocoding and weather data
- WAQI for current AQI and pollutant data
- MongoDB for persistence
- local Python/XGBoost inference for prediction

These integrations are one of the most important parts of the project, because the application depends on live environmental signals rather than only static sample data.

## Local Development Setup

### Backend

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm start
```

### ML scripts

```bash
cd ml
python src/01_preprocessing.py
python src/02_eda.py
python src/03_data_analysis.py
python src/04_model_training.py
```

For normal application use, the most important ML runtime files are `ml/inference.py` and the model files in `ml/models/`.

## Deployment Shape

The current code structure strongly suggests this deployment layout:

- `frontend` on a static hosting platform such as Vercel
- `backend` and `ml` together on a server platform that supports both Node.js and Python, such as Render or Railway

This is because the backend directly calls the Python inference script and directly loads model files from the `ml/` folder.

### Important deployment relationship

- frontend needs the live backend URL through `REACT_APP_API_URL`
- backend needs the live frontend URL through `FRONTEND_URL`
- backend also needs access to MongoDB and third-party API credentials through environment variables
- ML model files must be available on the deployed backend runtime

## Security And Sensitive Data Handling

This project uses environment variables for sensitive configuration rather than hardcoding secrets in source files.

Based on the reviewed code and docs:

- backend secrets are expected in local environment files and platform env settings
- frontend only needs a backend API URL
- ML code does not require secret keys for the prediction logic itself

### What should never be published

- real `.env` contents
- database connection strings with real credentials
- API keys
- JWT secret values
- any private deployment-specific secrets

### What is safe to document publicly

- architecture
- folder structure
- route summaries
- setup steps using example env files
- deployment patterns
- model workflow descriptions without secret values

## Repository Documentation Map

The repository now has a layered documentation structure:

- `README.md` for the main project landing page
- `backend/README.md` for backend-specific setup and structure
- `frontend/README.md` for frontend-specific setup and structure
- `ml/README.md` for ML-specific setup and structure
- `PROJECT_OVERVIEW.md` for the long-form explanation you are reading now

This helps visitors choose the level of detail they need.

## Summary

AQM is a multi-part air quality application where the frontend, backend, and ML system are tightly connected.

Its core strengths are:

- full-stack user flow
- live external data integration
- authenticated user features
- persistent history and favorites
- local model-based AQI forecasting

From a repository and deployment point of view, the most important design fact is that the backend and ML layers work as one runtime unit, while the frontend can be hosted separately.

This overview intentionally stays detailed about the system design while avoiding any sensitive values or private configuration details.
