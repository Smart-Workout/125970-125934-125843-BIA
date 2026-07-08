# Render Deployment Guide (Backend + Frontend)

This project is set up to deploy on Render with:
- FastAPI backend as a Web Service
- Vite frontend as a Static Site

A Render Blueprint file is included at `render.yaml`.

## 1. Before You Start

1. Push your latest code to GitHub.
2. Confirm local checks pass:
   - `python -m pytest backend/tests -q`
   - `cd frontend && npm run build`

## 2. Deploy with Render Blueprint (Recommended)

1. Go to Render dashboard.
2. Click **New +** -> **Blueprint**.
3. Connect your GitHub repository.
4. Select the branch to deploy.
5. Render will detect `render.yaml` and show two services:
   - `smart-workout-api`
   - `smart-workout-frontend`
6. Click **Apply**.

## 3. Configure Backend Environment Variables

After the backend service is created:

1. Open service: `smart-workout-api`.
2. Go to **Environment**.
3. Set:
   - `CORS_ALLOW_ORIGINS` = your frontend URL (from static site), e.g. `https://smart-workout-frontend.onrender.com`
4. Save changes.

Notes:
- You can provide multiple origins separated by commas.
- Localhost origins are already allowed for development.

## 4. Configure Frontend Environment Variables

After the backend URL is available:

1. Open service: `smart-workout-frontend`.
2. Go to **Environment**.
3. Set:
   - `VITE_API_URL` = backend public URL, e.g. `https://smart-workout-api.onrender.com`
   - `VITE_API_V1` = `/api/v1`
4. Save changes and redeploy frontend.

## 5. Manual Deploy Alternative (Without Blueprint)

If you prefer creating services manually:

### Backend (Web Service)
1. **New +** -> **Web Service** -> connect repo.
2. Settings:
   - Runtime: `Python`
   - Root Directory: repo root (`.`)
   - Build Command: `pip install -r backend/requirements.txt`
   - Start Command: `uvicorn app.main:app --app-dir backend --host 0.0.0.0 --port $PORT`
3. Add env vars:
   - `PYTHON_VERSION=3.11.9`
   - `CORS_ALLOW_ORIGINS=https://<your-frontend-domain>`

### Frontend (Static Site)
1. **New +** -> **Static Site** -> connect repo.
2. Settings:
   - Root Directory: `frontend`
   - Build Command: `npm ci && npm run build`
   - Publish Directory: `dist`
3. Add env vars:
   - `VITE_API_URL=https://<your-backend-domain>`
   - `VITE_API_V1=/api/v1`

## 6. Post-Deploy Verification Checklist

1. Backend health:
   - `GET https://<backend-domain>/api/v1/health`
   - Expect: `{ "status": "ok" }`
2. Dashboard summary:
   - `GET https://<backend-domain>/api/v1/dashboard/summary`
   - Expect: status 200
3. Frontend opens and loads data from backend.
4. Submit profile and generate plan.
5. Ask one chat question in RAG panel.

## 7. Common Issues

1. CORS error in browser:
   - Fix `CORS_ALLOW_ORIGINS` on backend and redeploy backend.
2. Frontend calling wrong API host:
   - Fix `VITE_API_URL` on static site and redeploy frontend.
3. API returns 404 on frontend domain:
   - Expected if `VITE_API_URL` is missing; frontend needs backend URL.

## 8. Recommended Free-Tier Usage

- Keep backend and frontend both on free plan initially.
- Expect cold starts on backend free tier.
- For demos, open backend URL once before presenting.
