# Yolanda Project Skeleton Plan

Owner: Yolanda  
Scope: FastAPI backend skeleton, Swagger docs, CORS, React/Vite frontend scaffold, Tailwind + shadcn/ui setup, and API contract for the Smart Workout prototype.

This plan is inspired by the friend `BIA` project structure. The key lesson from that project is separation of responsibility:

- Backend routes live in `api/v1/`.
- Backend request/response models live in `schemas/`.
- Backend business logic lives in `services/`.
- Frontend API calls live in `services/`.
- Frontend data loading lives in `hooks/`.
- Frontend response shapes live in `types/`.
- Dashboard screens are organized into tabs/pages.

For our project, start with the backend first. Build mock responses first so the frontend can be developed immediately. Replace the mock logic with real ML, recommender, RAG, and chat logic later.

---

## 1. Your Project Skeleton Tasks

Original TODO:

- [ ] FastAPI hello-world endpoint + auto-Swagger at `/docs`
- [ ] React + Vite project scaffolded with TailwindCSS + shadcn/ui setup
- [ ] CORS configured so frontend can call backend
- [ ] Define API contract: request/response JSON shapes for `/predict-calories`, `/predict-intensity`, `/recommend-exercises`, `/generate-plan`, `/chat`

Expanded Yolanda deliverables:

- [ ] Create backend folder structure.
- [ ] Create FastAPI app with `/`, `/health`, and `/docs`.
- [ ] Configure CORS for frontend dev ports.
- [ ] Create Pydantic request/response schemas.
- [ ] Create mock service functions for all required endpoints.
- [ ] Create exact API contracts with sample request and response JSON.
- [ ] Create frontend React/Vite structure.
- [ ] Create Tailwind + shadcn/ui setup.
- [ ] Create frontend API client and service functions for every backend endpoint.
- [ ] Create initial dashboard UI design with tabs and placeholder cards.
- [ ] Confirm frontend can call backend successfully.

---

## 2. Backend First: Folder Structure

Create this backend structure:

```text
backend/
  app/
    main.py
    api/
      __init__.py
      v1/
        __init__.py
        health.py
        workout.py
        chat.py
    core/
      __init__.py
      config.py
    schemas/
      __init__.py
      workout.py
      chat.py
      common.py
    services/
      __init__.py
      workout_service.py
      chat_service.py
  tests/
    test_health.py
    test_workout_api.py
  requirements.txt
  .env.example
  README.md
```

Why this matches the friend project:

- Friend project has `backend/app/main.py`.
- Friend project has `backend/app/api/v1/`.
- Friend project has `backend/app/schemas/`.
- Friend project has `backend/app/services/`.
- We keep the same clean pattern, but remove auth/database for MVP.

Do not add these yet:

- PostgreSQL
- Alembic
- JWT login
- user table

Those are useful in the friend project, but they are not necessary for our MVP.

---

## 3. Backend Setup Commands

From project root:

```powershell
cd C:\Users\Windows\Desktop\125970-125934-125843
mkdir backend
cd backend
python -m venv .venv
.\.venv\Scripts\activate
python -m pip install --upgrade pip
```

Create `backend/requirements.txt`:

```text
fastapi
uvicorn[standard]
pydantic
pydantic-settings
python-dotenv
pandas
numpy
scikit-learn
joblib
pytest
httpx
```

Install:

```powershell
pip install -r requirements.txt
```

Run backend:

```powershell
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

Check:

- App root: `http://127.0.0.1:8000/`
- Health: `http://127.0.0.1:8000/api/v1/health`
- Swagger: `http://127.0.0.1:8000/docs`

---

## 4. Backend App Design

`backend/app/main.py` should do five things:

- create the FastAPI app
- configure CORS
- include API routers
- expose `/`
- keep Swagger auto-documentation working at `/docs`

Design:

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.health import router as health_router
from app.api.v1.workout import router as workout_router
from app.api.v1.chat import router as chat_router

app = FastAPI(
    title="Smart Workout DSS/BIS API",
    version="0.1.0",
    description="Backend API for personalized workout prediction, recommendation, plan generation, and RAG-supported chat.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:5173",
        "http://localhost:5174",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

app.include_router(health_router, prefix="/api/v1")
app.include_router(workout_router, prefix="/api/v1")
app.include_router(chat_router, prefix="/api/v1")


@app.get("/")
def root() -> dict[str, str]:
    return {"message": "Smart Workout DSS/BIS API is running"}
```

---

## 5. Backend API Routes

Use these exact route groups:

```text
GET  /
GET  /api/v1/health
POST /api/v1/workout/predict-calories
POST /api/v1/workout/predict-intensity
POST /api/v1/workout/recommend-exercises
POST /api/v1/workout/generate-plan
POST /api/v1/chat
```

Optional later:

```text
POST /api/v1/workout/preprocess
POST /api/v1/rag/search
GET  /api/v1/dashboard/summary
```

For your current skeleton task, focus on the required five endpoints plus health.

---

## 6. Shared Request Shape

Most workout endpoints can use one shared user-profile request.

`UserProfileRequest`:

```json
{
  "age": 22,
  "height_cm": 165,
  "weight_kg": 60,
  "sleep_hours": 7,
  "stress_level": 4,
  "blood_pressure": "120/80",
  "resting_heart_rate": 72,
  "target_body_part": "chest",
  "available_equipment": ["dumbbell", "bench"],
  "sessions_per_week": 3,
  "goal": "strength"
}
```

Validation rules:

- `age`: 13 to 90
- `height_cm`: 100 to 230
- `weight_kg`: 30 to 250
- `sleep_hours`: 0 to 14
- `stress_level`: 1 to 10
- `blood_pressure`: string format like `120/80`
- `resting_heart_rate`: 35 to 140
- `target_body_part`: one of `chest`, `back`, `legs`, `arms`, `shoulders`, `core`, `full body`
- `available_equipment`: list of equipment strings
- `sessions_per_week`: 1 to 6
- `goal`: one of `strength`, `muscle gain`, `fat loss`, `general fitness`

---

## 7. Exact API Contract

### 7.1 `GET /api/v1/health`

Purpose:

Check whether backend is running.

Frontend use:

Show backend status indicator in the dashboard navbar.

Request:

```http
GET http://127.0.0.1:8000/api/v1/health
```

Response:

```json
{
  "status": "ok",
  "service": "smart-workout-api",
  "version": "0.1.0"
}
```

PowerShell test:

```powershell
Invoke-RestMethod -Method GET -Uri "http://127.0.0.1:8000/api/v1/health"
```

---

### 7.2 `POST /api/v1/workout/predict-calories`

Purpose:

Predict estimated calorie burn rate for the planned workout.

For skeleton phase:

Return mock value.

Later:

Use trained regression model.

Request:

```http
POST http://127.0.0.1:8000/api/v1/workout/predict-calories
Content-Type: application/json
```

Request body:

```json
{
  "age": 22,
  "height_cm": 165,
  "weight_kg": 60,
  "sleep_hours": 7,
  "stress_level": 4,
  "blood_pressure": "120/80",
  "resting_heart_rate": 72,
  "target_body_part": "chest",
  "available_equipment": ["dumbbell", "bench"],
  "sessions_per_week": 3,
  "goal": "strength"
}
```

Response:

```json
{
  "prediction": 420.5,
  "unit": "kcal_per_hour",
  "model_name": "mock-calorie-regressor",
  "confidence_note": "Mock response for frontend integration. Replace with trained model output later.",
  "input_summary": {
    "target_body_part": "chest",
    "equipment_count": 2,
    "sessions_per_week": 3
  }
}
```

PowerShell test:

```powershell
$body = @{
  age = 22
  height_cm = 165
  weight_kg = 60
  sleep_hours = 7
  stress_level = 4
  blood_pressure = "120/80"
  resting_heart_rate = 72
  target_body_part = "chest"
  available_equipment = @("dumbbell", "bench")
  sessions_per_week = 3
  goal = "strength"
} | ConvertTo-Json

Invoke-RestMethod -Method POST `
  -Uri "http://127.0.0.1:8000/api/v1/workout/predict-calories" `
  -ContentType "application/json" `
  -Body $body
```

---

### 7.3 `POST /api/v1/workout/predict-intensity`

Purpose:

Predict workout intensity band: `Low`, `Medium`, or `High`.

For skeleton phase:

Return rule-based mock value.

Later:

Use trained classifier.

Request:

```http
POST http://127.0.0.1:8000/api/v1/workout/predict-intensity
Content-Type: application/json
```

Request body:

Same `UserProfileRequest`.

Response:

```json
{
  "predicted_class": "Medium",
  "class_probabilities": {
    "Low": 0.2,
    "Medium": 0.6,
    "High": 0.2
  },
  "model_name": "mock-intensity-classifier",
  "readiness_band": "Medium",
  "explanation": [
    "Sleep duration is acceptable.",
    "Stress level is moderate.",
    "Resting heart rate is within normal training range."
  ]
}
```

PowerShell test:

```powershell
Invoke-RestMethod -Method POST `
  -Uri "http://127.0.0.1:8000/api/v1/workout/predict-intensity" `
  -ContentType "application/json" `
  -Body $body
```

---

### 7.4 `POST /api/v1/workout/recommend-exercises`

Purpose:

Return exercises filtered by target body part and available equipment.

For skeleton phase:

Return hardcoded example exercises.

Later:

Filter `exercisedb_all_raw_flat.csv`.

Request:

```http
POST http://127.0.0.1:8000/api/v1/workout/recommend-exercises
Content-Type: application/json
```

Request body:

Same `UserProfileRequest`.

Response:

```json
{
  "target_body_part": "chest",
  "available_equipment": ["dumbbell", "bench"],
  "recommendations": [
    {
      "name": "Dumbbell Bench Press",
      "body_parts": ["chest"],
      "target_muscles": ["pectorals", "triceps", "front deltoids"],
      "equipment": ["dumbbell", "bench"],
      "match_score": 0.95,
      "instructions": [
        "Lie on a bench with a dumbbell in each hand.",
        "Press the dumbbells upward until arms are extended.",
        "Lower with control and repeat."
      ]
    },
    {
      "name": "Push-Up",
      "body_parts": ["chest"],
      "target_muscles": ["pectorals", "triceps"],
      "equipment": ["bodyweight"],
      "match_score": 0.8,
      "instructions": [
        "Start in a high plank position.",
        "Lower the chest toward the floor.",
        "Push back to the starting position."
      ]
    }
  ],
  "fallback_used": false
}
```

PowerShell test:

```powershell
Invoke-RestMethod -Method POST `
  -Uri "http://127.0.0.1:8000/api/v1/workout/recommend-exercises" `
  -ContentType "application/json" `
  -Body $body
```

---

### 7.5 `POST /api/v1/workout/generate-plan`

Purpose:

Generate a daily or weekly training plan from profile, prediction, and recommendations.

For skeleton phase:

Return a mock 3-day plan.

Later:

Use readiness rules, ML prediction, exercise recommender, and RAG snippets.

Request:

```http
POST http://127.0.0.1:8000/api/v1/workout/generate-plan
Content-Type: application/json
```

Request body:

```json
{
  "profile": {
    "age": 22,
    "height_cm": 165,
    "weight_kg": 60,
    "sleep_hours": 7,
    "stress_level": 4,
    "blood_pressure": "120/80",
    "resting_heart_rate": 72,
    "target_body_part": "chest",
    "available_equipment": ["dumbbell", "bench"],
    "sessions_per_week": 3,
    "goal": "strength"
  },
  "predicted_intensity": "Medium"
}
```

Response:

```json
{
  "plan_id": "mock-plan-001",
  "plan_type": "3-day strength split",
  "readiness_band": "Medium",
  "predicted_intensity": "Medium",
  "weekly_schedule": [
    {
      "day": "Monday",
      "focus": "Chest and triceps",
      "exercises": [
        {
          "name": "Dumbbell Bench Press",
          "sets": 3,
          "reps": "8-12",
          "rest_seconds": 90
        },
        {
          "name": "Push-Up",
          "sets": 3,
          "reps": "10-15",
          "rest_seconds": 60
        }
      ]
    },
    {
      "day": "Wednesday",
      "focus": "Back and core",
      "exercises": [
        {
          "name": "Dumbbell Row",
          "sets": 3,
          "reps": "8-12",
          "rest_seconds": 90
        }
      ]
    },
    {
      "day": "Friday",
      "focus": "Legs and full body",
      "exercises": [
        {
          "name": "Goblet Squat",
          "sets": 3,
          "reps": "10-12",
          "rest_seconds": 90
        }
      ]
    }
  ],
  "safety_notes": [
    "This is decision support only and not medical advice.",
    "Use lighter volume if sleep or recovery is poor."
  ],
  "rag_snippets": [
    {
      "source": "RAG_CORPUS.md",
      "category": "Intensity / readiness scaling",
      "text": "Mid readiness uses moderate training volume with 3-4 sets and 8-12 reps."
    }
  ]
}
```

PowerShell test:

```powershell
$planBody = @{
  profile = @{
    age = 22
    height_cm = 165
    weight_kg = 60
    sleep_hours = 7
    stress_level = 4
    blood_pressure = "120/80"
    resting_heart_rate = 72
    target_body_part = "chest"
    available_equipment = @("dumbbell", "bench")
    sessions_per_week = 3
    goal = "strength"
  }
  predicted_intensity = "Medium"
} | ConvertTo-Json -Depth 5

Invoke-RestMethod -Method POST `
  -Uri "http://127.0.0.1:8000/api/v1/workout/generate-plan" `
  -ContentType "application/json" `
  -Body $planBody
```

---

### 7.6 `POST /api/v1/chat`

Purpose:

Answer user questions using retrieved context and the current plan.

For skeleton phase:

Return a mock grounded answer.

Later:

Use RAG retrieval and an LLM provider if available.

Request:

```http
POST http://127.0.0.1:8000/api/v1/chat
Content-Type: application/json
```

Request body:

```json
{
  "message": "Why did you choose dumbbell bench press?",
  "current_plan_id": "mock-plan-001",
  "current_plan": {
    "plan_type": "3-day strength split",
    "predicted_intensity": "Medium"
  }
}
```

Response:

```json
{
  "answer": "Dumbbell bench press was selected because it matches the chest target and available dumbbell/bench equipment. For medium intensity, the plan uses moderate volume with 3 sets of 8-12 reps.",
  "retrieved_snippets": [
    {
      "source": "RAG_CORPUS.md",
      "category": "Intensity / readiness scaling",
      "text": "Mid readiness uses moderate training volume with 3-4 sets and 8-12 reps."
    }
  ],
  "grounded": true
}
```

PowerShell test:

```powershell
$chatBody = @{
  message = "Why did you choose dumbbell bench press?"
  current_plan_id = "mock-plan-001"
  current_plan = @{
    plan_type = "3-day strength split"
    predicted_intensity = "Medium"
  }
} | ConvertTo-Json -Depth 5

Invoke-RestMethod -Method POST `
  -Uri "http://127.0.0.1:8000/api/v1/chat" `
  -ContentType "application/json" `
  -Body $chatBody
```

---

## 8. Backend Implementation Order

Do the backend in this exact order:

### Step 1: Basic FastAPI app

- [ ] Create `backend/app/main.py`.
- [ ] Add root endpoint `/`.
- [ ] Run backend.
- [ ] Open `/docs`.

Done when:

- `http://127.0.0.1:8000/` returns JSON.
- `http://127.0.0.1:8000/docs` opens.

### Step 2: Health router

- [ ] Create `api/v1/health.py`.
- [ ] Add `GET /api/v1/health`.
- [ ] Include router in `main.py`.

Done when:

- frontend can call health endpoint.

### Step 3: Schemas

- [ ] Create `schemas/workout.py`.
- [ ] Add all workout request/response models.
- [ ] Create `schemas/chat.py`.
- [ ] Add chat request/response models.

Done when:

- Swagger shows correct request body examples.

### Step 4: Mock services

- [ ] Create `services/workout_service.py`.
- [ ] Add mock functions:
  - `predict_calories`
  - `predict_intensity`
  - `recommend_exercises`
  - `generate_plan`
- [ ] Create `services/chat_service.py`.
- [ ] Add mock `answer_chat`.

Done when:

- services return fixed but realistic JSON.

### Step 5: Workout router

- [ ] Create `api/v1/workout.py`.
- [ ] Add all workout POST endpoints.
- [ ] Connect endpoints to mock services.

Done when:

- all workout endpoints work from Swagger.

### Step 6: Chat router

- [ ] Create `api/v1/chat.py`.
- [ ] Add `POST /api/v1/chat`.
- [ ] Connect to mock chat service.

Done when:

- chat endpoint works from Swagger.

### Step 7: CORS test

- [ ] Start frontend.
- [ ] Call backend from frontend.
- [ ] Fix CORS if browser blocks request.

Done when:

- frontend can show backend health status.

---

## 9. Backend Design Notes

Keep backend simple first.

Use this rule:

- Router files should not contain heavy logic.
- Router files should validate input and call service functions.
- Service files should contain the actual logic.
- Schema files should define API shapes.

Bad pattern:

```python
@router.post("/predict-calories")
def predict(request):
    # load csv
    # clean data
    # run model
    # format chart
    # all in one route
```

Good pattern:

```python
@router.post("/predict-calories", response_model=CaloriePredictionResponse)
def predict_calories(request: UserProfileRequest) -> CaloriePredictionResponse:
    return workout_service.predict_calories(request)
```

This is the same clean backend idea used by the friend project.

---

## 10. Frontend Setup Inspired by BIA

After backend mock API works, create frontend.

Commands:

```powershell
cd C:\Users\Windows\Desktop\125970-125934-125843
npm create vite@latest frontend -- --template react-ts
cd frontend
npm install
npm install axios recharts lucide-react react-router-dom
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

For shadcn/ui, install after Tailwind is working:

```powershell
npx shadcn@latest init
```

Recommended shadcn components:

```powershell
npx shadcn@latest add button card input label select slider tabs badge table textarea alert
```

Frontend structure:

```text
frontend/
  src/
    components/
      KPICard.tsx
      ReadinessCard.tsx
      PlanCard.tsx
      ExerciseTable.tsx
      ChatWidget.tsx
      LoadingState.tsx
      ErrorState.tsx
    pages/
      DashboardPage.tsx
    services/
      api.client.ts
      workout.service.ts
      chat.service.ts
      health.service.ts
    hooks/
      useHealth.ts
      useWorkoutPlan.ts
      useChat.ts
    types/
      workout.types.ts
      chat.types.ts
      health.types.ts
    App.tsx
    main.tsx
```

---

## 11. Frontend API Client Design

Create `frontend/src/services/api.client.ts`.

Design:

```ts
import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'
const API_V1 = import.meta.env.VITE_API_V1 || '/api/v1'

const apiClient = axios.create({
  baseURL: `${API_BASE_URL}${API_V1}`,
  headers: {
    'Content-Type': 'application/json',
  },
})

export default apiClient
```

Create `frontend/.env.example`:

```text
VITE_API_URL=http://127.0.0.1:8000
VITE_API_V1=/api/v1
```

---

## 12. Frontend Service Calls

Create `frontend/src/services/workout.service.ts`.

Exact frontend calls:

```ts
import apiClient from './api.client'
import {
  UserProfileRequest,
  CaloriePredictionResponse,
  IntensityPredictionResponse,
  ExerciseRecommendationResponse,
  GeneratePlanRequest,
  GeneratedPlanResponse,
} from '../types/workout.types'

class WorkoutService {
  async predictCalories(payload: UserProfileRequest): Promise<CaloriePredictionResponse> {
    const response = await apiClient.post('/workout/predict-calories', payload)
    return response.data
  }

  async predictIntensity(payload: UserProfileRequest): Promise<IntensityPredictionResponse> {
    const response = await apiClient.post('/workout/predict-intensity', payload)
    return response.data
  }

  async recommendExercises(payload: UserProfileRequest): Promise<ExerciseRecommendationResponse> {
    const response = await apiClient.post('/workout/recommend-exercises', payload)
    return response.data
  }

  async generatePlan(payload: GeneratePlanRequest): Promise<GeneratedPlanResponse> {
    const response = await apiClient.post('/workout/generate-plan', payload)
    return response.data
  }
}

export default new WorkoutService()
```

Create `frontend/src/services/chat.service.ts`.

```ts
import apiClient from './api.client'
import { ChatRequest, ChatResponse } from '../types/chat.types'

class ChatService {
  async sendMessage(payload: ChatRequest): Promise<ChatResponse> {
    const response = await apiClient.post('/chat', payload)
    return response.data
  }
}

export default new ChatService()
```

---

## 13. Frontend UI Design

First screen should be the actual dashboard, not a landing page.

Dashboard layout:

```text
Top navbar
  Smart Workout
  backend status
  refresh button

Tabs
  Overview
  Profile
  Plan
  RAG Chat

Main area
  selected tab content
```

### Overview tab

Purpose:

Show that this is a DSS/BIS system.

Components:

- KPI card: Backend status
- KPI card: API endpoints ready
- KPI card: Model status
- KPI card: RAG status
- Simple workflow panel:
  - User input
  - ML prediction
  - Exercise recommendation
  - Plan generation
  - RAG explanation

### Profile tab

Purpose:

Collect input for API calls.

Fields:

- age
- height
- weight
- sleep hours
- stress level
- blood pressure
- resting heart rate
- target body part
- available equipment
- sessions per week
- goal

Design:

- Use grouped form sections.
- Use sliders for sleep, stress, sessions per week.
- Use select/dropdown for body part and goal.
- Use checkbox/chips for equipment.
- Use submit button with loading state.

### Plan tab

Purpose:

Show the output of backend calls.

Components:

- calorie prediction card
- intensity prediction card
- class probability bars
- recommended exercises table
- generated weekly plan cards
- safety notes panel

### RAG Chat tab

Purpose:

Show explanation and chat.

Components:

- retrieved snippets panel
- chat input
- response area
- example prompt buttons:
  - `Why this plan?`
  - `Make it lighter`
  - `Use dumbbells only`
  - `Explain recovery time`

---

## 14. Frontend Implementation Flow

Use this frontend data flow:

```text
User fills profile form
  -> call predictCalories(profile)
  -> call predictIntensity(profile)
  -> call recommendExercises(profile)
  -> call generatePlan({ profile, predicted_intensity })
  -> render all results in Plan tab
```

For skeleton phase, call APIs sequentially.

Later, prediction and recommendation can be parallel:

```text
predictCalories + predictIntensity + recommendExercises
  -> generatePlan
```

---

## 15. Design and Implementation Priorities

Priority 1:

- Backend starts.
- Swagger works.
- All five required endpoints exist.
- Endpoints return mock JSON.

Priority 2:

- Frontend starts.
- Frontend calls `/health`.
- CORS works.

Priority 3:

- Profile form sends data to backend.
- Plan tab displays mock predictions and mock plan.

Priority 4:

- Replace mock exercise recommendations with CSV-based recommendations.
- Replace mock predictions with trained model artifacts.
- Replace mock chat with RAG-based chat.

---

## 16. Done Checklist for Yolanda

Your skeleton task is done when:

- [ ] `backend/app/main.py` exists.
- [ ] `http://127.0.0.1:8000/docs` opens.
- [ ] CORS is configured in FastAPI.
- [ ] `GET /api/v1/health` works.
- [ ] `POST /api/v1/workout/predict-calories` works.
- [ ] `POST /api/v1/workout/predict-intensity` works.
- [ ] `POST /api/v1/workout/recommend-exercises` works.
- [ ] `POST /api/v1/workout/generate-plan` works.
- [ ] `POST /api/v1/chat` works.
- [ ] Frontend React/Vite app exists.
- [ ] Tailwind is configured.
- [ ] shadcn/ui is initialized.
- [ ] Frontend has `api.client.ts`.
- [ ] Frontend has service files for workout and chat API calls.
- [ ] Frontend can call backend without CORS error.
- [ ] API contract is documented in this file or moved into `docs/api_contract.md`.

---

## 17. What to Say in Team Meeting

Use this summary:

> My part is the application skeleton. I will build the FastAPI backend structure first, following the clean router/schema/service pattern from the BIA project. I will expose Swagger docs and define stable JSON contracts for calorie prediction, intensity prediction, exercise recommendation, plan generation, and chat. At first these endpoints will return mock data, so the frontend can be built without waiting for ML and RAG. Then I will scaffold React + Vite with Tailwind and shadcn/ui, create typed API services, and connect the dashboard form to the backend.

---

## 18. Overlooked Items to Add Before Coding

These are the gaps found after comparing the skeleton plan with the proposal, professor requirement, and friend BIA project.

### 18.1 Add preprocessing/readiness endpoint

The proposal workflow explicitly says:

```text
User input -> Data Preprocessing -> processed user profile and readiness features
```

So the backend should include this endpoint even if the original skeleton checklist did not mention it.

Add:

```text
POST /api/v1/workout/preprocess
```

Purpose:

- clean and normalize user input
- compute BMI
- split blood pressure
- standardize equipment names
- calculate readiness band
- return processed profile for ML and plan generation

Request:

```json
{
  "age": 22,
  "height_cm": 165,
  "weight_kg": 60,
  "sleep_hours": 7,
  "stress_level": 4,
  "blood_pressure": "120/80",
  "resting_heart_rate": 72,
  "target_body_part": "chest",
  "available_equipment": ["Dumbbells", "Bench"],
  "sessions_per_week": 3,
  "goal": "strength"
}
```

Response:

```json
{
  "processed_profile": {
    "age": 22,
    "height_cm": 165,
    "weight_kg": 60,
    "bmi": 22.04,
    "bmi_category": "Normal",
    "sleep_hours": 7,
    "stress_level": 4,
    "systolic_bp": 120,
    "diastolic_bp": 80,
    "resting_heart_rate": 72,
    "target_body_part": "chest",
    "available_equipment": ["dumbbell", "bench"],
    "sessions_per_week": 3,
    "goal": "strength"
  },
  "readiness": {
    "band": "Medium",
    "score": 72,
    "factors": [
      "Sleep duration is acceptable.",
      "Blood pressure is in normal range.",
      "Stress level is moderate."
    ]
  }
}
```

Frontend use:

- Profile tab submits to `/preprocess` first.
- Show BMI and readiness before showing final plan.
- Send `processed_profile` into later prediction and plan endpoints.

### 18.2 Add dashboard summary endpoint for BI requirement

The professor requirement says the project needs descriptive, predictive, and if possible prescriptive analytics. The current skeleton covers predictive/prescriptive endpoints, but descriptive BI needs its own endpoint.

Add:

```text
GET /api/v1/dashboard/summary
```

Purpose:

- provide descriptive analytics for dashboard cards and charts
- match the friend BIA pattern where one summary endpoint feeds the dashboard

Response:

```json
{
  "kpis": {
    "exercise_count": 1324,
    "equipment_count": 28,
    "body_part_count": 10,
    "raw_dataset_count": 4
  },
  "workout_type_distribution": {
    "labels": ["Strength", "Cardio", "HIIT", "Yoga"],
    "values": [340, 210, 180, 120]
  },
  "body_part_coverage": {
    "labels": ["chest", "back", "legs", "arms", "shoulders", "core"],
    "values": [180, 210, 240, 160, 130, 150]
  },
  "equipment_coverage": {
    "labels": ["bodyweight", "dumbbell", "barbell", "cable", "machine"],
    "values": [220, 180, 140, 120, 160]
  },
  "nutrition_macro_summary": {
    "labels": ["protein", "carbs", "fat"],
    "values": [30, 45, 25]
  }
}
```

Frontend use:

- Overview tab loads this endpoint on page open.
- This proves the BIS/descriptive analytics part.

### 18.3 Make endpoint names consistent

Original TODO says:

```text
/predict-calories
/predict-intensity
/recommend-exercises
/generate-plan
/chat
```

The plan uses versioned routes:

```text
/api/v1/workout/predict-calories
/api/v1/workout/predict-intensity
/api/v1/workout/recommend-exercises
/api/v1/workout/generate-plan
/api/v1/chat
```

Decision:

- Use the versioned routes in code.
- In the report, describe the short names as logical functions.
- In frontend services, always call the versioned routes through `api.client.ts`.

### 18.4 Add error response contract

Frontend needs predictable errors, not only success responses.

Use FastAPI validation errors for invalid input:

```json
{
  "detail": [
    {
      "loc": ["body", "sleep_hours"],
      "msg": "Input should be less than or equal to 14",
      "type": "less_than_equal"
    }
  ]
}
```

For custom service errors, return:

```json
{
  "error": "model_not_ready",
  "message": "Calorie model artifact is not available yet. Using mock mode is recommended for frontend development."
}
```

Frontend must display:

- validation error near form field if possible
- general error banner for API failure
- fallback empty state if no exercises match

### 18.5 Add mock mode flag

Because your skeleton will return mock data first, every mock response should clearly say it is mock.

Add this field to prediction, recommendation, plan, and chat responses:

```json
{
  "mock_mode": true
}
```

Later when real models are connected:

```json
{
  "mock_mode": false
}
```

Why this matters:

- Demo audience can understand what is finished versus placeholder.
- Teammates can replace services one by one without changing frontend types.

### 18.6 Add unique IDs to exercise and plan objects

The current recommendation response has exercise names, but the frontend and plan generator will be easier if every item has an ID.

Exercise object should include:

```json
{
  "exercise_id": "ex_dumbbell_bench_press",
  "name": "Dumbbell Bench Press"
}
```

Plan object should include:

```json
{
  "plan_id": "mock-plan-001"
}
```

Why this matters:

- React table keys are stable.
- Chat can refer to the current plan.
- Later substitutions can target exact exercise IDs.

### 18.7 Improve generate-plan request

Current plan request only sends profile and predicted intensity. That is enough for mock mode, but not enough for clean integration.

Better request:

```json
{
  "profile": {
    "age": 22,
    "height_cm": 165,
    "weight_kg": 60,
    "sleep_hours": 7,
    "stress_level": 4,
    "blood_pressure": "120/80",
    "resting_heart_rate": 72,
    "target_body_part": "chest",
    "available_equipment": ["dumbbell", "bench"],
    "sessions_per_week": 3,
    "goal": "strength"
  },
  "readiness_band": "Medium",
  "predicted_intensity": "Medium",
  "recommended_exercise_ids": [
    "ex_dumbbell_bench_press",
    "ex_push_up"
  ]
}
```

This avoids confusion about whether `/generate-plan` should recompute recommendations or use already selected exercises.

Decision:

- Skeleton can accept only profile + predicted intensity.
- Final version should accept readiness + predicted intensity + recommended exercise IDs.

### 18.8 Add frontend health service

The plan mentions health service in folder structure but does not define it.

Create:

```text
frontend/src/services/health.service.ts
frontend/src/hooks/useHealth.ts
```

Call:

```text
GET /api/v1/health
```

UI:

- green dot: backend online
- red dot: backend offline
- show error if frontend cannot reach backend

### 18.9 Add backend README for Yolanda's part

Create `backend/README.md` with:

- setup command
- activate venv command
- install dependencies command
- run backend command
- Swagger URL
- endpoint list
- mock mode explanation
- testing command

This mirrors the friend project quality.

### 18.10 Add frontend README for Yolanda's part

Create `frontend/README.md` with:

- install command
- `.env` setup
- run dev server command
- build command
- page/component map
- backend dependency note

### 18.11 Add API examples into Swagger

When writing Pydantic schemas, add examples so `/docs` looks professional.

Use:

```python
from pydantic import BaseModel, Field
```

Example:

```python
class UserProfileRequest(BaseModel):
    age: int = Field(..., ge=13, le=90, examples=[22])
```

Why this matters:

- Swagger becomes part of the demo.
- Teammates can test endpoints without reading code.

### 18.12 Add testing tasks

Backend:

- [ ] `pytest` health endpoint.
- [ ] `pytest` calorie endpoint valid request.
- [ ] `pytest` intensity endpoint valid request.
- [ ] `pytest` generate-plan endpoint valid request.
- [ ] `pytest` invalid profile returns `422`.

Frontend manual test:

- [ ] backend off -> UI shows backend offline.
- [ ] backend on -> UI shows backend online.
- [ ] form submit -> plan tab receives mock outputs.
- [ ] invalid form -> submit disabled or validation message shown.
- [ ] chat message -> mock answer appears.

### 18.13 Add safety/disclaimer UI requirement

Because this is fitness/health-related, include a small disclaimer in the plan output and chat output.

Text:

```text
This system provides decision support only. It does not provide medical diagnosis or replace advice from a certified trainer or healthcare professional.
```

Add this to:

- generated plan response
- Plan tab UI
- Chat tab UI

### 18.14 Add handoff contract for teammates

Yolanda's skeleton should make it clear where teammates replace mock logic.

Handoff points:

```text
workout_service.predict_calories()       -> ML teammate replaces with real regressor
workout_service.predict_intensity()      -> ML teammate replaces with real classifier
workout_service.recommend_exercises()    -> data/recommender teammate replaces with CSV filtering
workout_service.generate_plan()          -> plan/rules teammate replaces with real rule engine
chat_service.answer_chat()               -> RAG teammate replaces with retrieval + LLM
dashboard_service.get_summary()          -> data teammate replaces mock dashboard summary
```

Rule:

- Keep function names and response schemas stable.
- Replace internals only.
- This prevents frontend breakage.

### 18.15 Add one-page wireframe requirement

Before coding the frontend UI, create one simple wireframe in `docs/wireframe.md`.

Required wireframe:

```text
Navbar
Tabs
Overview cards
Profile form
Plan output
Chat panel
```

This answers the proposal note: "Need a wireframe diagram of the dashboard / our prototype."

---

## 19. Second Backend Audit from Friend BIA Project

After a closer backend-focused review of the friend `BIA` project, these are the extra backend practices we should copy, adapt, or explicitly avoid.

### 19.1 Copy: `pydantic-settings` based config

BIA uses `backend/app/core/config.py` with:

- `BaseSettings`
- `.env.example`
- `API_V1_STR`
- `APP_NAME`
- `APP_ENV`
- `LOG_LEVEL`
- path resolution from the backend root

For Smart Workout, create:

```text
backend/app/core/config.py
backend/.env.example
```

Smart Workout `.env.example` should be:

```text
APP_NAME=Smart Workout DSS/BIS API
APP_ENV=development
API_V1_STR=/api/v1
LOG_LEVEL=INFO

RAW_DATA_DIR=../data/raw
PROCESSED_DATA_DIR=../data/processed
MODEL_DIR=../models
CHROMA_DB_DIR=../chroma_db

MOCK_MODE=true
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001,http://localhost:5173,http://localhost:5174,http://127.0.0.1:3000,http://127.0.0.1:5173
```

Config design:

```python
from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict

BACKEND_ROOT = Path(__file__).resolve().parents[2]
PROJECT_ROOT = BACKEND_ROOT.parent
ENV_FILE = BACKEND_ROOT / ".env"


class Settings(BaseSettings):
    APP_NAME: str = "Smart Workout DSS/BIS API"
    APP_ENV: str = "development"
    API_V1_STR: str = "/api/v1"
    LOG_LEVEL: str = "INFO"
    MOCK_MODE: bool = True

    RAW_DATA_DIR: Path = PROJECT_ROOT / "data" / "raw"
    PROCESSED_DATA_DIR: Path = PROJECT_ROOT / "data" / "processed"
    MODEL_DIR: Path = PROJECT_ROOT / "models"
    CHROMA_DB_DIR: Path = PROJECT_ROOT / "chroma_db"
    ALLOWED_ORIGINS: str = "http://localhost:5173,http://127.0.0.1:5173"

    model_config = SettingsConfigDict(
        env_file=ENV_FILE,
        env_file_encoding="utf-8",
        case_sensitive=True,
    )

    @property
    def allowed_origins_list(self) -> list[str]:
        return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",") if origin.strip()]


settings = Settings()
```

Why this matters:

- no hard-coded paths everywhere
- easier local setup
- easier to switch mock mode on/off
- cleaner CORS config
- closer to BIA project quality

### 19.2 Copy: startup/shutdown logging with lifespan

BIA uses a FastAPI lifespan function and logs startup/shutdown. We should add the same lightweight pattern.

Add:

```text
backend/app/core/logging.py
```

`main.py` should:

- call `setup_logging()`
- create `logger = logging.getLogger("app")`
- log app name, environment, mock mode, and data/model paths at startup
- log shutdown

Backend startup should print:

```text
Starting Smart Workout DSS/BIS API
Environment: development
Mock mode: true
Raw data dir: ...
Model dir: ...
```

This helps debugging during demo.

### 19.3 Copy: response models and route tags everywhere

BIA consistently uses:

```python
router = APIRouter(prefix="/dashboard", tags=["dashboard"])

@router.get("/summary", response_model=DashboardSummaryResponse)
```

Smart Workout should do the same.

Required route pattern:

```python
router = APIRouter(prefix="/workout", tags=["workout"])

@router.post("/predict-calories", response_model=CaloriePredictionResponse)
def predict_calories(payload: UserProfileRequest) -> CaloriePredictionResponse:
    return workout_service.predict_calories(payload)
```

Rules:

- every endpoint gets `response_model`
- every router gets `prefix`
- every router gets `tags`
- route functions should return schema objects or dicts matching schema
- avoid untyped `dict` responses except for simple root/health

### 19.4 Copy partially: `api/deps.py`

BIA uses `api/deps.py` for auth/database dependencies. We do not need auth/database yet, but a lightweight dependencies module is still useful.

Create:

```text
backend/app/api/deps.py
```

Use it for:

- shared settings dependency
- mock-mode dependency
- later data service dependency
- later model service dependency

Simple version:

```python
from app.core.config import settings, Settings


def get_settings() -> Settings:
    return settings
```

Later we can add:

```python
def require_real_models_ready():
    ...
```

Do not add auth dependencies now.

### 19.5 Copy: frontend Vite proxy to reduce CORS issues

BIA's frontend uses a Vite proxy:

```ts
server: {
  port: 3000,
  proxy: {
    '/api': {
      target: process.env.VITE_API_URL || 'http://localhost:8000',
      changeOrigin: true,
    }
  }
}
```

For Smart Workout, use this in `frontend/vite.config.ts`:

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
    },
  },
})
```

Then frontend API client can use:

```ts
const API_BASE_URL = import.meta.env.PROD
  ? import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'
  : ''
const API_V1 = '/api/v1'
```

Why this matters:

- local frontend can call `/api/v1/...`
- fewer CORS issues during development
- matches BIA project architecture

### 19.6 Copy: package marker files

BIA has `__init__.py` files in each backend package folder.

Add empty `__init__.py` files:

```text
backend/app/__init__.py
backend/app/api/__init__.py
backend/app/api/v1/__init__.py
backend/app/core/__init__.py
backend/app/schemas/__init__.py
backend/app/services/__init__.py
```

This prevents import issues when running:

```powershell
uvicorn app.main:app --reload
```

### 19.7 Copy/adapt: project dependency metadata

BIA uses `pyproject.toml` and `poetry.lock`. For our scope, `requirements.txt` is simpler, but we should still document the decision.

Decision:

- MVP: use `backend/requirements.txt`
- Stretch/cleaner option: convert to `backend/pyproject.toml`

Add to `backend/README.md`:

```text
This backend uses requirements.txt for simplicity. The friend BIA project uses Poetry/pyproject.toml, but requirements.txt is enough for this 4-week prototype.
```

### 19.8 Avoid for MVP: auth, users, roles, database, Alembic

BIA includes:

- `/auth/register`
- `/auth/login`
- JWT access/refresh tokens
- `/users`
- roles
- PostgreSQL
- SQLAlchemy sessions
- Alembic migrations

Do not implement these in Smart Workout MVP.

Reason:

- professor requires prototype + report, not production auth
- our decision-support value is ML/RAG/dashboard
- auth/database would consume time without improving the core DSS/BIS story

Mark as stretch only:

```text
Stretch: user accounts and saved plan history with PostgreSQL.
```

### 19.9 Add backend readiness checks

BIA has `/health/db` because it has a database. We do not need DB health, but we should add data/model readiness checks.

Add:

```text
GET /api/v1/health
GET /api/v1/health/readiness
```

`/health` response:

```json
{
  "status": "ok",
  "service": "smart-workout-api",
  "version": "0.1.0"
}
```

`/health/readiness` response:

```json
{
  "status": "ok",
  "mock_mode": true,
  "checks": {
    "raw_data_dir_exists": true,
    "exercise_dataset_exists": true,
    "model_dir_exists": true,
    "calorie_model_exists": false,
    "intensity_model_exists": false,
    "chroma_db_dir_exists": false
  }
}
```

Frontend use:

- show backend online/offline from `/health`
- show model/RAG readiness from `/health/readiness`

### 19.10 Add backend dashboard service like BIA

BIA's `/dashboard/summary` route is clean because it imports small service functions:

```python
revenue_by_category(frame)
profit_trend(period, frame)
top_locations(frame)
machine_utilization(frame)
```

Smart Workout equivalent:

```text
backend/app/api/v1/dashboard.py
backend/app/services/dashboard_service.py
backend/app/schemas/dashboard.py
```

Service functions:

```text
dataset_kpis()
workout_type_distribution()
calorie_distribution()
body_part_coverage()
equipment_coverage()
nutrition_macro_summary()
sleep_readiness_summary()
```

Route:

```text
GET /api/v1/dashboard/summary
```

This should be part of Yolanda's backend skeleton because it proves the BI dashboard can load from the backend.

### 19.11 Add consistent backend naming

BIA has one inconsistent filename: `databoard_service.py`. We should avoid that kind of typo.

Use:

```text
dashboard_service.py
workout_service.py
chat_service.py
data_service.py
```

Do not use:

```text
databoard_service.py
workoutServices.py
apiWorkout.py
```

### 19.12 Final backend skeleton after second audit

Updated backend structure should be:

```text
backend/
  app/
    __init__.py
    main.py
    api/
      __init__.py
      deps.py
      v1/
        __init__.py
        health.py
        dashboard.py
        workout.py
        chat.py
    core/
      __init__.py
      config.py
      logging.py
      constants.py
    schemas/
      __init__.py
      common.py
      health.py
      dashboard.py
      workout.py
      chat.py
    services/
      __init__.py
      data_service.py
      dashboard_service.py
      workout_service.py
      chat_service.py
  tests/
    test_health.py
    test_dashboard_api.py
    test_workout_api.py
  .env.example
  requirements.txt
  README.md
```

### 19.13 Updated backend priority order

Do this order:

1. Create backend package folders and `__init__.py` files.
2. Create `requirements.txt`.
3. Create `.env.example`.
4. Create `core/config.py`.
5. Create `core/logging.py`.
6. Create `main.py` with lifespan, logging, CORS, routers.
7. Create `api/deps.py`.
8. Create `health` schemas/service/route.
9. Create `dashboard` schemas/service/route with mock summary.
10. Create `workout` schemas/service/route with mock prediction/recommendation/plan.
11. Create `chat` schemas/service/route with mock response.
12. Test in Swagger.
13. Add pytest smoke tests.
14. Start frontend and test API through Vite proxy.

