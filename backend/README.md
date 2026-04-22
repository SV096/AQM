# Backend

The backend is a Node.js and Express API for the Air Quality Monitoring project.

It handles:

- user authentication
- air quality and weather data fetching
- AQI forecast generation
- user favorites and search history
- MongoDB data storage

## Tech Stack

- Node.js
- Express
- MongoDB with Mongoose
- JWT authentication
- Axios
- Helmet
- express-rate-limit

## Project Structure

```text
backend/
|- middleware/
|  `- auth.js
|- ml/
|  |- forecastFormatter.js
|  |- modelInference.js
|  |- modelLoader.js
|  |- pythonInference.js
|  `- weatherFeatureEngineering.js
|- models/
|  |- Favorite.js
|  |- Forecast.js
|  |- History.js
|  `- User.js
|- routes/
|  |- auth.js
|  |- forecast.js
|  |- user.js
|  `- weather.js
|- .env.example
|- .gitignore
|- package-lock.json
|- package.json
`- server.js
```

## Main API Routes

- `POST /api/auth/signup`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/forecast/city/:city`
- `GET /api/user/profile`
- `GET /api/user/history`
- `DELETE /api/user/history`
- `POST /api/user/favorites`
- `GET /api/user/favorites`
- `DELETE /api/user/favorites/:id`
- `GET /api/weather/current/:lat/:lon`
- `GET /api/weather/forecast/:lat/:lon`
- `GET /api/health`

## Environment Variables

Create a `.env` file from `.env.example`.

Required values:

- `PORT`
- `NODE_ENV`
- `FRONTEND_URL`
- `MONGODB_URI`
- `OPENWEATHER_API_KEY`
- `WAQI_API_KEY`
- `JWT_SECRET`

## Run Locally

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

The backend runs on `http://localhost:5000` by default.
