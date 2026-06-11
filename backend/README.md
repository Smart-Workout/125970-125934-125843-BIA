# Smart Workout Backend

FastAPI backend for the Smart Workout DSS/BIS prototype.

## Setup

```powershell
cd C:\Users\Windows\Desktop\125970-125934-125843\backend
python -m venv .venv
.\.venv\Scripts\activate
python -m pip install --upgrade pip
pip install -r requirements.txt
```

## Run

```powershell
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

Open:

- API root: `http://127.0.0.1:8000/`
- Swagger: `http://127.0.0.1:8000/docs`
- Health: `http://127.0.0.1:8000/api/v1/health`

## Current Mode

The backend starts in mock mode. Mock responses let the frontend and API contract be built before the real ML, RAG, and recommender services are connected.

## Main Endpoints

- `GET /api/v1/health`
- `GET /api/v1/health/readiness`
- `GET /api/v1/dashboard/summary`
- `POST /api/v1/workout/preprocess`
- `POST /api/v1/workout/predict-calories`
- `POST /api/v1/workout/predict-intensity`
- `POST /api/v1/workout/recommend-exercises`
- `POST /api/v1/workout/generate-plan`
- `POST /api/v1/chat`

## Test

```powershell
pytest
```

