# Deployment Guide

This project is easiest to deploy with:

- `frontend` on Vercel
- `backend + ml` together on Render

## Frontend On Vercel

### Create the project

1. Import the GitHub repository into Vercel.
2. Set the **Root Directory** to `frontend`.
3. Keep the framework as Create React App.

### Set environment variable

Add this in Vercel:

```env
REACT_APP_API_URL=https://your-render-backend-url.onrender.com/api
```

After changing environment variables, trigger a new deployment.

## Backend And ML On Render

The backend depends on:

- local files in `ml/`
- Python runtime
- model files in `ml/models/`

Because of that, `backend` and `ml` should be deployed together as one Render web service.

### Option 1: Use `render.yaml`

1. In Render, create a new Blueprint from this repository.
2. Render will detect `render.yaml`.
3. Fill in these environment variables:

- `FRONTEND_URL`
- `MONGODB_URI`
- `OPENWEATHER_API_KEY`
- `WAQI_API_KEY`
- `JWT_SECRET`

### Option 2: Create the service manually

1. Create a new **Web Service** in Render.
2. Select the repository.
3. Choose **Docker** runtime.
4. Render should use the root `Dockerfile`.

Set these environment variables:

```env
NODE_ENV=production
FRONTEND_URL=https://your-frontend-url.vercel.app
MONGODB_URI=your_mongodb_connection_string
OPENWEATHER_API_KEY=your_openweather_key
WAQI_API_KEY=your_waqi_key
JWT_SECRET=your_jwt_secret
```

## Deployment Order

1. Deploy backend on Render first
2. Copy the Render backend URL
3. Set `REACT_APP_API_URL` in Vercel
4. Deploy frontend on Vercel
5. Update Render `FRONTEND_URL` with the final Vercel URL if needed

## Final Check

After deployment, verify:

- backend health route works: `/api/health`
- frontend can sign up and sign in
- city search works
- forecast endpoint returns data
- ML models are loaded in production
