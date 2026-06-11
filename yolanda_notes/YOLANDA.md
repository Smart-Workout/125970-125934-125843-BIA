# Yolanda First Step Execution Plan

Owner: Yolanda  
Current focus: backend skeleton first, then frontend scaffold.

## What the proposal requires

The proposal workflow is:

```text
User input
-> data preprocessing
-> readiness-related features
-> RAG retrieves rules and exercise knowledge
-> exercise recommender filters by body part and equipment
-> plan generator creates daily/weekly plan
-> ML model predicts outcome/intensity
-> dashboard displays plan, readiness, prediction, and explanation
```

So Yolanda's first step should not stop at a hello-world API. The first step must create a runnable backend contract for this workflow, using mock responses first.

## First backend step

Build a FastAPI backend skeleton with:

- `GET /`
- `GET /api/v1/health`
- `GET /api/v1/health/readiness`
- `GET /api/v1/dashboard/summary`
- `POST /api/v1/workout/preprocess`
- `POST /api/v1/workout/predict-calories`
- `POST /api/v1/workout/predict-intensity`
- `POST /api/v1/workout/recommend-exercises`
- `POST /api/v1/workout/generate-plan`
- `POST /api/v1/chat`

## Why these endpoints are first

- `/health` proves the backend runs.
- `/health/readiness` proves data/model paths can be checked.
- `/dashboard/summary` covers the descriptive BI requirement.
- `/workout/preprocess` matches the proposal's preprocessing/readiness stage.
- `/predict-calories` and `/predict-intensity` cover predictive analytics.
- `/recommend-exercises` and `/generate-plan` cover prescriptive decision support.
- `/chat` prepares the RAG explanation interface.

## First implementation rule

Use mock mode first:

```json
{
  "mock_mode": true
}
```

Mock mode lets the frontend and API contract finish before real ML/RAG services are ready.

## Handoff rule

Keep route names, schemas, and service function names stable. Teammates should replace internals only:

- `dashboard_service.py` -> real descriptive analytics
- `workout_service.py` -> real preprocessing, ML, recommendation, plan rules
- `chat_service.py` -> real RAG and LLM integration

## Backend files started

```text
backend/
  app/
    main.py
    api/
      deps.py
      v1/
        health.py
        dashboard.py
        workout.py
        chat.py
    core/
      config.py
      logging.py
      constants.py
    schemas/
      common.py
      health.py
      dashboard.py
      workout.py
      chat.py
    services/
      data_service.py
      dashboard_service.py
      workout_service.py
      chat_service.py
  tests/
    test_health.py
    test_workout_api.py
  requirements.txt
  .env.example
  README.md
```

## Next after backend

After Swagger works:

1. Create React + Vite frontend.
2. Add TailwindCSS and shadcn/ui.
3. Add Vite proxy for `/api`.
4. Create `api.client.ts`.
5. Build Profile tab that calls `/workout/preprocess`.
6. Build Plan tab that displays mock predictions/recommendations/plan.

## Frontend analysis from BIA

The friend BIA frontend has the right application structure:

- Vite React app
- Vite proxy for `/api`
- central Axios API client
- service files for backend calls
- hooks for loading/error/data state
- TypeScript response types
- reusable `KPICard`
- dashboard-first page
- tab navigation
- refresh button
- backend-driven charts through `/dashboard/summary`

For Smart Workout, copy the architecture but not the domain:

- keep dashboard-first UI
- skip login/auth for MVP
- skip protected routes for MVP
- skip PostgreSQL/JWT for MVP
- use our backend routes and schemas
- connect all panels to mock backend responses first

## Frontend files to create

```text
frontend/
  package.json
  index.html
  vite.config.ts
  tailwind.config.js
  postcss.config.js
  .env.example
  README.md
  src/
    main.tsx
    App.tsx
    styles/index.css
    types/
      health.types.ts
      dashboard.types.ts
      workout.types.ts
      chat.types.ts
    services/
      api.client.ts
      health.service.ts
      dashboard.service.ts
      workout.service.ts
      chat.service.ts
    hooks/
      useHealth.ts
      useDashboard.ts
      useWorkoutPlan.ts
      useChat.ts
    components/
      KPICard.tsx
      ChartPanel.tsx
      ProfileForm.tsx
      PlanCard.tsx
      ExerciseTable.tsx
      ChatPanel.tsx
    pages/
      DashboardPage.tsx
```

## Frontend UI tabs

- `Overview`: backend status, dataset KPIs, descriptive BI charts.
- `Profile`: user input form and readiness result.
- `Plan`: calorie prediction, intensity prediction, recommended exercises, generated plan.
- `RAG Chat`: retrieved snippets and chat response.

## Frontend API calls

- `GET /api/v1/health`
- `GET /api/v1/health/readiness`
- `GET /api/v1/dashboard/summary`
- `POST /api/v1/workout/preprocess`
- `POST /api/v1/workout/predict-calories`
- `POST /api/v1/workout/predict-intensity`
- `POST /api/v1/workout/recommend-exercises`
- `POST /api/v1/workout/generate-plan`
- `POST /api/v1/chat`

## Docker and database decision

No database is needed now.

Reason:

- The proposal does not require login or saved user history.
- The MVP value is DSS/BIS analytics, prediction, exercise recommendation, plan generation, and RAG explanation.
- PostgreSQL, Alembic, users, roles, and JWT are useful in BIA, but they are not needed for Smart Workout MVP.

Docker is optional later:

- now: run backend and frontend locally
- later: add Docker Compose for backend/frontend
- stretch: add ChromaDB service if RAG needs persistent vector storage
- stretch: add PostgreSQL only if saved user history is required

## Next Week Yolanda Ownership

Yolanda should take the application skeleton and integration tasks, not the ML/RAG training tasks.

### What Yolanda should say she is responsible for

Yolanda owns the runnable application shell:

- backend route setup and Swagger documentation
- request/response schema stability
- CORS and frontend/backend connection
- dashboard summary endpoint for BI charts
- React/Vite frontend structure
- API client, service files, hooks, and TypeScript types
- dashboard-first UI with Overview, Profile, Plan, and RAG Chat tabs
- frontend validation and loading/error states
- demo walkthrough and screenshot evidence

This is the correct scope because it connects the project pieces together. ML model training, ChromaDB ingestion, and real LLM integration can plug into the same endpoints later.

### First thing to do now

1. Run backend tests:

```powershell
cd C:\Users\Windows\Desktop\125970-125934-125843\backend
py -m pytest -q
```

2. Run frontend build:

```powershell
cd C:\Users\Windows\Desktop\125970-125934-125843\frontend
npm run build
```

3. Start both apps:

```powershell
cd C:\Users\Windows\Desktop\125970-125934-125843\backend
py -m uvicorn app.main:app --reload
```

```powershell
cd C:\Users\Windows\Desktop\125970-125934-125843\frontend
npm run dev
```

4. Open:

- `http://127.0.0.1:8000/docs`
- `http://127.0.0.1:5173`

5. Follow `docs/demo_script.md` and `docs/frontend_manual_test_checklist.md`.

### Exact API contract Yolanda must protect

Do not rename these endpoints unless the frontend is updated at the same time:

| Feature | Method | Endpoint | Frontend owner file |
|---|---:|---|---|
| Backend health | `GET` | `/api/v1/health` | `frontend/src/services/health.service.ts` |
| Data/model readiness | `GET` | `/api/v1/health/readiness` | `frontend/src/services/health.service.ts` |
| BI dashboard summary | `GET` | `/api/v1/dashboard/summary` | `frontend/src/services/dashboard.service.ts` |
| Profile preprocessing | `POST` | `/api/v1/workout/preprocess` | `frontend/src/services/workout.service.ts` |
| Calorie prediction | `POST` | `/api/v1/workout/predict-calories` | `frontend/src/services/workout.service.ts` |
| Intensity prediction | `POST` | `/api/v1/workout/predict-intensity` | `frontend/src/services/workout.service.ts` |
| Exercise recommendations | `POST` | `/api/v1/workout/recommend-exercises` | `frontend/src/services/workout.service.ts` |
| Plan generation | `POST` | `/api/v1/workout/generate-plan` | `frontend/src/services/workout.service.ts` |
| RAG/chat answer | `POST` | `/api/v1/chat` | `frontend/src/services/chat.service.ts` |

### Implementation status

- Backend skeleton: implemented.
- Backend API contracts: implemented.
- Backend smoke tests: implemented.
- Real CSV dashboard aggregation: implemented.
- Real ExerciseDB recommendation filtering: implemented.
- Frontend React/Vite scaffold: implemented.
- Frontend API services/hooks/types: implemented.
- Dashboard UI tabs: implemented.
- Profile-to-plan submit flow: implemented.
- RAG snippets in Plan and Chat UI: implemented.
- Demo script: implemented in `docs/demo_script.md`.
- Manual test checklist: implemented in `docs/frontend_manual_test_checklist.md`.

### Remaining Yolanda work

- Manually run the full browser flow and take screenshots.
- Put screenshots into the final report chapter about the dashboard.
- Keep endpoint names stable while ML/RAG teammates replace mock internals.
- Optional: install official shadcn/ui components if the team wants exact shadcn source files instead of Tailwind-styled local components.

### Backend/API tasks

- [x] Keep FastAPI Swagger working at `/docs`.
- [x] Keep all request/response schemas stable.
- [x] Keep frontend-compatible endpoint names:
  - `POST /api/v1/workout/preprocess`
  - `POST /api/v1/workout/predict-calories`
  - `POST /api/v1/workout/predict-intensity`
  - `POST /api/v1/workout/recommend-exercises`
  - `POST /api/v1/workout/generate-plan`
  - `POST /api/v1/chat`
- [x] Add `GET /api/v1/dashboard/summary` for descriptive BI charts.
- [x] Replace mock ExerciseDB recommendations with CSV filtering.
- [x] Replace mock dashboard body-part, equipment, and nutrition charts with CSV aggregations.
- [x] Add more API smoke tests:
  - invalid blood pressure
  - no equipment selected
  - dashboard summary response
  - recommendation returns real ExerciseDB IDs

### Frontend tasks

- [x] Keep React + Vite + TypeScript frontend running.
- [x] Keep Vite proxy for `/api`.
- [x] Keep the dashboard-first UI.
- [x] Profile form sections:
  - About You
  - Wellness Today
  - Training Intent
- [x] Submit handler calls backend and renders proper UI.
- [x] Add frontend validation messages.
- [x] Add intensity probability bars in Plan tab.
- [x] Show plan RAG snippets in Plan tab.
- [ ] Add screenshots/manual test evidence for report.
- [ ] Optional later: install official shadcn/ui components if the team wants exact shadcn files.

### Do not take unless done early

- ML model training.
- ChromaDB ingestion.
- LLM provider/API key setup.
- PostgreSQL/JWT/auth.
