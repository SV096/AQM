# Frontend

The frontend is a React application for the Air Quality Monitoring project.

It provides:

- landing page and authentication screens
- protected user routes
- city search for AQI forecasts
- current pollutant and weather display
- favorites management
- search history view

## Tech Stack

- React
- React Router
- Axios
- Framer Motion
- React Icons

## Project Structure

```text
frontend/
|- public/
|  `- index.html
|- src/
|  |- components/
|  |  |- navbar.css
|  |  |- Navbar.js
|  |  `- PrivateRoute.js
|  |- context/
|  |  `- AuthContext.js
|  |- pages/
|  |  |- auth.css
|  |  |- Auth.js
|  |  |- favorites.css
|  |  |- Favorites.js
|  |  |- history.css
|  |  |- History.js
|  |  |- home.css
|  |  |- Home.js
|  |  |- live.css
|  |  `- Live.js
|  |- styles/
|  |  `- global.css
|  |- App.js
|  `- index.js
|- .env.example
|- .gitignore
|- package-lock.json
`- package.json
```

## Main Pages

- `Home` - landing page
- `Auth` - sign up and sign in
- `Live` - city search, AQI data, and forecasts
- `Favorites` - saved cities
- `History` - recent searches

## Environment Variables

Create a `.env` file from `.env.example`.

Required value:

- `REACT_APP_API_URL`

Example:

```env
REACT_APP_API_URL=http://localhost:5000/api
```

## Run Locally

```bash
cd frontend
npm install
cp .env.example .env
npm start
```

The frontend runs on `http://localhost:3000` by default.
