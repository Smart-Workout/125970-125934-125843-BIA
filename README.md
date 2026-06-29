# Smart Workout

Smart Workout is a Decision Support System / Business Intelligence System (DSS/BIS) for personalized workout planning. The project combines descriptive analytics, machine learning, rule-based plan generation, and retrieval-grounded explanation in a single prototype.

The current system uses:
- multi-dataset descriptive analytics for gym activity, exercise coverage, lifestyle patterns, and nutrition context
- machine learning for calorie-burn and workout-intensity prediction
- rule-based weekly plan generation
- a retrieval-grounded RAG assistant for explanation and substitution-style questions

## Current Status

Status updated: `2026-06-29`

The project is now a working prototype, not only a proposal.

### Completed
- Week 1 data cleaning, validation, and EDA
- GymDB relational marts and descriptive analytics
- lifestyle clustering and readiness-related outputs
- Week 2 model training and artifact generation
- FastAPI backend for dashboard, preprocessing, prediction, recommendation, plan generation, and chat
- React frontend with:
  - `Overview`
  - `Gym Membership`
  - `Lifestyle Profiles`
  - `Profile`
  - `Plan`
  - `RAG Chat`
  - floating assistant
- local backend verification:
  - `12 passed, 2 warnings in 6.09s`

### In Progress
- final tuning of the improved rule-based plan generator after live demo inspection

### Remaining
- Tableau embedding promised in the proposal
- final screenshot and demo-evidence capture
- optional external LLM API enhancement for a richer assistant

## System Workflow

The current application flow is:

1. User enters profile and training information
2. System preprocesses the input
3. System estimates readiness
4. System predicts calorie burn and workout intensity
5. System recommends exercises
6. System generates the weekly workout plan
7. RAG chat explains the result

Important wording:
- `Readiness` is an **estimation**
- `Calorie burn` and `workout intensity` are **predictions**
- `Workout plan` is **generated after prediction**

## Implemented Components

### Descriptive Layer
- Gym Membership dashboard backed by cleaned GymDB marts
- Lifestyle Profiles dashboard backed by clustering outputs
- Overview dashboard for cross-dataset charts and system readiness

### Predictive Layer
- `Random Forest Regressor` for calorie prediction
- `XGBoost Classifier` for intensity classification
- saved model artifacts loaded directly by the backend

### Prescriptive Layer
- exercise recommendation from ExerciseDB
- rule-based weekly split generation using:
  - readiness
  - predicted intensity
  - goal
  - target body part
  - available equipment

### Explanation Layer
- retrieval-grounded chat endpoint
- floating assistant and tab-based chat UI
- current-plan-aware answers built from retrieved snippets

## Tech Stack

### Backend
- FastAPI
- Pydantic
- pandas / numpy
- scikit-learn
- XGBoost
- ChromaDB
- sentence-transformers

### Frontend
- React
- TypeScript
- Vite
- Recharts
- Lucide React

## Repository Structure

| Path | Purpose |
|---|---|
| `backend/` | FastAPI application, services, schemas, and tests |
| `frontend/` | React dashboard frontend |
| `data/raw/` | original source datasets |
| `data/processed/` | cleaned outputs, marts, validation tables, and model-ready datasets |
| `docs/` | run steps, demo notes, figures, and RAG documentation |
| `models/` | saved model artifacts and evaluation outputs |
| `notebooks/` | Week 1 and Week 2 notebook workflows |
| `scripts/` | rerunnable ML and RAG scripts |
| `Proposal/` | proposal materials |

## Local Setup

Open PowerShell at the repository root:

```powershell
cd "<repo-root>"
```

### 1. Create and activate the Python environment

```powershell
python -m venv .venv
Set-ExecutionPolicy -Scope Process -ExecutionPolicy RemoteSigned
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
python -m pip install -r backend\requirements.txt
```

### 2. Run the backend

```powershell
$env:PYTHONPATH = "backend"
python -m uvicorn app.main:app --app-dir backend --reload --host 127.0.0.1 --port 8000
```

Backend URLs:
- API root: `http://127.0.0.1:8000`
- Swagger: `http://127.0.0.1:8000/docs`
- Health: `http://127.0.0.1:8000/api/v1/health`

### 3. Run the frontend

Open a second PowerShell window:

```powershell
cd "<repo-root>\\frontend"
cmd /c npm install
cmd /c npm run dev
```

Frontend URL:
- `http://127.0.0.1:5173`

## Recommended Local Check Flow

1. Open Swagger and confirm the main endpoints load.
2. Open the frontend.
3. Inspect:
   - `Overview`
   - `Gym Membership`
   - `Lifestyle Profiles`
4. Submit a sample profile from the `Profile` tab.
5. Inspect the `Plan` tab for:
   - readiness
   - calorie prediction
   - intensity prediction
   - recommended exercises
   - generated weekly split
6. Open the floating assistant or `RAG Chat` and ask:
   - `Why this plan?`
   - `Can I replace barbell exercises with dumbbells?`

## Verification

Local backend verification completed on `2026-06-29`:

```text
python -m pytest backend\tests -q
12 passed, 2 warnings in 6.09s
```

Notes:
- the Starlette/httpx warning is a dependency warning, not a failure
- the XGBoost warning is an artifact-serialization warning, not a failed test

## Main Backend Endpoints

| Endpoint | Method | Purpose |
|---|---|---|
| `/api/v1/health` | GET | backend health check |
| `/api/v1/health/readiness` | GET | data/model availability check |
| `/api/v1/dashboard/summary` | GET | overview + GymDB + lifestyle dashboard payload |
| `/api/v1/workout/preprocess` | POST | preprocess user input |
| `/api/v1/workout/predict-calories` | POST | run calorie prediction |
| `/api/v1/workout/predict-intensity` | POST | run intensity prediction |
| `/api/v1/workout/recommend-exercises` | POST | retrieve ExerciseDB recommendations |
| `/api/v1/workout/generate-plan` | POST | generate the weekly workout plan |
| `/api/v1/chat` | POST | retrieval-grounded assistant response |

## Key Files

| File | Purpose |
|---|---|
| `backend/app/services/ml_service.py` | loads model artifacts and runs inference |
| `backend/app/services/workout_service.py` | preprocessing, recommendation, and plan generation |
| `backend/app/services/dashboard_service.py` | dashboard aggregation logic |
| `backend/app/services/chat_service.py` | grounded chat response assembly |
| `docs/WEEK1_WEEK2_RUN_STEPS.md` | full reproducibility and rerun guide |
| `docs/demo_script.md` | presentation/demo walk-through |
| `MODEL_RESULTS.md` | model-comparison summary |

## Documentation

For detailed technical and reproducibility material, use:
- [docs/WEEK1_WEEK2_RUN_STEPS.md](docs/WEEK1_WEEK2_RUN_STEPS.md)
- [docs/demo_script.md](docs/demo_script.md)
- [frontend/README.md](frontend/README.md)

## Remaining Work

Before final submission, the main remaining items are:
- add Tableau embedding
- complete final screenshots and presentation evidence
- finalize local walkthrough and polish
- optionally add an external LLM API as a future enhancement

## Notes

- The current assistant works **without** an external LLM API.
- The current chat is retrieval-grounded and uses current plan context.
- The project should be presented as a **working prototype** rather than a proposal.
