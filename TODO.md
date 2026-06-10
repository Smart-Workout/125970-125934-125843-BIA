# Smart Workout — Implementation TODO

**Project:** Smart Workout DSS/BIS for Personalized Weight Training
**Implementation window:** 23 Jun – 20 Jul 2026 (4 weeks)
**Goal:** Working prototype + evaluated models + demo + final report

---

## BIA-Inspired Smart Workout Implementation Outline

This section translates the useful structure from the friend `BIA` project into our own Smart Workout project. The goal is not to copy the vending-machine domain, but to reuse its clean project organization: clear README, separated backend/frontend, service layer, typed API responses, dashboard tabs, filters, charts, and a simple local demo workflow.

### What to learn from the BIA project
- [ ] Keep a strong root `README.md` with overview, problem statement, features, tech stack, system architecture, install steps, run steps, API docs, project structure, and troubleshooting.
- [ ] Use one root `docker-compose.yml` for local infrastructure only. For Smart Workout, this should run ChromaDB only if needed; avoid adding PostgreSQL unless we truly need login/history storage.
- [ ] Separate backend code by responsibility:
  - `api/v1/` for FastAPI route files.
  - `schemas/` for Pydantic request/response models.
  - `services/` for data loading, analytics, ML prediction, recommendation, RAG, and plan generation.
  - `core/` for config, logging, constants, and environment settings.
  - `data/` or project-level `data/processed/` for cleaned datasets.
  - `models/` for saved `.joblib` ML artifacts.
- [ ] Separate frontend code by responsibility:
  - `pages/` for full screens.
  - `components/` for reusable UI blocks such as KPI cards, charts, plan cards, readiness cards, and chat widget.
  - `services/` for API calls.
  - `hooks/` for API data fetching and loading/error state.
  - `types/` for TypeScript interfaces matching backend Pydantic responses.
- [ ] Use dashboard tabs like the BIA project instead of one giant page. Smart Workout should have separate tabs for overview, personal plan, dataset insights, and RAG explanation.
- [ ] Use API response models that are frontend-friendly. For charts, return simple shapes such as `{ labels: string[], values: number[] }`, lists of cards, and structured plan JSON.
- [ ] Include loading, error, empty, and refresh states in the frontend from the beginning.

### Target Smart Workout folder structure
- [ ] Create this implementation structure:

```text
125970-125934-125843/
  backend/
    app/
      main.py
      api/
        v1/
          health.py
          dashboard.py
          workout.py
          rag.py
          chat.py
      core/
        config.py
        logging.py
        constants.py
      schemas/
        common.py
        user_profile.py
        dashboard.py
        workout.py
        rag.py
        chat.py
      services/
        data_service.py
        preprocessing_service.py
        analytics_service.py
        readiness_service.py
        ml_service.py
        exercise_service.py
        plan_service.py
        rag_service.py
        chat_service.py
      tests/
        test_health.py
        test_workout_api.py
    pyproject.toml or requirements.txt
    .env.example
    README.md
  frontend/
    src/
      components/
        KPICard.tsx
        ReadinessCard.tsx
        PlanCard.tsx
        ExerciseTable.tsx
        ChartPanel.tsx
        ChatWidget.tsx
        LoadingState.tsx
        ErrorState.tsx
      pages/
        DashboardPage.tsx
        FormPage.tsx
        DatasetInsightsPage.tsx
        PlanPage.tsx
        RagExplanationPage.tsx
      services/
        api.client.ts
        dashboard.service.ts
        workout.service.ts
        chat.service.ts
      hooks/
        useDashboard.ts
        useWorkoutPlan.ts
        useChat.ts
      types/
        dashboard.types.ts
        workout.types.ts
        chat.types.ts
      App.tsx
      main.tsx
    package.json
    .env.example
    README.md
  data/
    raw/
    processed/
  notebooks/
  models/
  chroma_db/
  docs/
    architecture.md
    api_contract.md
    demo_script.md
  MODEL_RESULTS.md
  RAG_CORPUS.md
  system_prompt.md
  docker-compose.yml
  README.md
  TODO.md
```

### MVP system architecture
- [ ] Build the prototype around this simple flow:

```text
User form input
  -> FastAPI /preprocess
  -> readiness score and normalized profile
  -> ML prediction endpoints
  -> exercise recommendation endpoint
  -> rule-based plan generator
  -> RAG retrieval for explanation
  -> React dashboard displays KPIs, charts, plan, and retrieved rationale
```

- [ ] Keep authentication out of MVP unless the professor explicitly requires it. BIA has login/JWT, but Smart Workout can save time by focusing on DSS/BIS analytics, prediction, prescription, and explanation.
- [ ] Keep PostgreSQL out of MVP unless we need persistent user accounts. CSV files plus saved model files are enough for a local academic prototype.
- [ ] Make ChromaDB optional for local demo. If ChromaDB is unstable, fall back to a simple local text search over `RAG_CORPUS.md` and ExerciseDB instructions.

### Backend API outline
- [ ] `GET /` returns app status message.
- [ ] `GET /health` returns backend health.
- [ ] `GET /api/v1/dashboard/summary` returns descriptive analytics for the dashboard:
  - workout type distribution
  - calorie burn distribution
  - body part coverage
  - equipment coverage
  - nutrition macro summary
  - sleep/readiness cluster summary
- [ ] `POST /api/v1/workout/preprocess` accepts user profile and returns normalized features:
  - age
  - height and weight
  - computed BMI and BMI category
  - sleep duration
  - sleep quality if available
  - stress level if available
  - blood pressure split into systolic/diastolic
  - resting heart rate
  - target body part
  - available equipment
  - preferred schedule
- [ ] `POST /api/v1/workout/predict-calories` returns calorie-burn-rate prediction, model name, and confidence/metric note.
- [ ] `POST /api/v1/workout/predict-intensity` returns Low/Mid/High intensity class and class probabilities.
- [ ] `POST /api/v1/workout/recommend-exercises` returns filtered ExerciseDB exercises by body part, equipment, target muscle, and difficulty if available.
- [ ] `POST /api/v1/workout/generate-plan` returns the final daily/weekly plan:
  - split name
  - selected exercises
  - sets, reps, rest time
  - intensity band
  - readiness adjustment
  - safety notes
  - retrieved RAG snippets used for explanation
- [ ] `POST /api/v1/rag/search` returns top-k retrieved snippets with metadata.
- [ ] `POST /api/v1/chat` answers user questions using retrieved context and current plan JSON.

### Backend service outline
- [ ] `data_service.py`: load raw/processed CSV files, cache dataframes, and validate required columns.
- [ ] `preprocessing_service.py`: standardize equipment, parse ExerciseDB list-like columns, split blood pressure, compute BMI, and convert frontend input into model-ready features.
- [ ] `analytics_service.py`: produce chart-ready descriptive analytics and summary cards for dataset size, exercise count, equipment count, and user archetypes.
- [ ] `readiness_service.py`: convert sleep, stress, BMI, heart rate, and blood pressure into Low/Mid/High readiness with explanation factors.
- [ ] `ml_service.py`: load saved `.joblib` models, run calorie regression and intensity classification, and return predictions with model metadata.
- [ ] `exercise_service.py`: filter exercises by body part and equipment, rank by match quality, and provide substitutions.
- [ ] `plan_service.py`: combine readiness, predicted intensity, schedule, and recommended exercises into structured daily/weekly plan JSON.
- [ ] `rag_service.py`: ingest ExerciseDB instructions and `RAG_CORPUS.md`, retrieve top-k snippets, and return source/category metadata.
- [ ] `chat_service.py`: build prompt from retrieved snippets and current plan; support Q&A first, then Tier 1 deterministic equipment substitution.

### Frontend screen outline
- [ ] `DashboardPage.tsx`
  - top navigation with tabs
  - global refresh button
  - empty state before user creates a plan
  - error banner if backend call fails
- [ ] Tab 1: `Overview`
  - KPI cards: dataset rows, available exercises, equipment count, model status
  - charts: workout type distribution, body part coverage, equipment coverage, calorie burn distribution
  - short system pipeline visual: input -> ML -> recommendation -> plan -> dashboard
- [ ] Tab 2: `User Profile and Readiness`
  - form sections: About You, Wellness Today, Training Intent
  - computed BMI display
  - readiness card with Low/Mid/High label
  - explanation factors: sleep, BMI, blood pressure, heart rate, stress
- [ ] Tab 3: `Personalized Plan`
  - predicted calorie burn rate card
  - predicted intensity card with probabilities
  - recommended exercise table
  - generated plan card with schedule, sets, reps, rest, and notes
  - button to regenerate plan after changing equipment/body part
- [ ] Tab 4: `Dataset Insights`
  - multi-dataset descriptive analytics
  - sleep cluster/user archetype summary
  - nutrition macro chart
  - exercise coverage chart
- [ ] Tab 5: `RAG Explanation and Chat`
  - retrieved snippets used by the plan
  - source/category labels for each snippet
  - floating or side-panel chat widget
  - chat supports "why this exercise?", "substitute equipment", and "make it lighter"

### Frontend data-flow pattern copied from BIA structure
- [ ] `api.client.ts`: central Axios client, base URL from `VITE_API_URL`, common error handling.
- [ ] `dashboard.service.ts`: `getSummary()`.
- [ ] `workout.service.ts`: `preprocessProfile()`, `predictCalories()`, `predictIntensity()`, `recommendExercises()`, `generatePlan()`.
- [ ] `chat.service.ts`: `sendMessage()`; later streaming response if time allows.
- [ ] `useDashboard.ts`: dashboard summary loading/error/refresh.
- [ ] `useWorkoutPlan.ts`: full flow from preprocess to generated plan.
- [ ] `useChat.ts`: chat messages, loading state, and current plan context.
- [ ] TypeScript types must mirror backend schemas: `ChartData`, `DashboardSummary`, `UserProfileRequest`, `ProcessedProfile`, `PredictionResponse`, `ExerciseRecommendation`, `GeneratedPlan`, `RetrievedSnippet`, `ChatResponse`.

### Dashboard visual checklist
- [ ] Use KPI cards like the BIA project, but for Smart Workout:
  - readiness band
  - predicted intensity
  - estimated calorie burn rate
  - recommended exercise count
  - plan duration/sessions per week
- [ ] Use tabs and filters:
  - target body part filter
  - equipment filter
  - schedule preference filter
  - intensity/readiness filter
- [ ] Use Recharts for:
  - bar chart: workout type distribution
  - pie/donut chart: exercise body part coverage
  - stacked bar: nutrition macros by meal type
  - line/bar chart: calorie burn or model prediction comparison
  - small feature importance chart from SHAP if available
- [ ] Include loading skeletons, error states, and no-plan empty state.
- [ ] Keep UI focused on decision support, not decoration.

### README outline to write later
- [ ] Root `README.md` should include project overview, problem statement, DSS/BIS decision context, features, tech stack, system architecture diagram, dataset list/sources, run steps, API summary, dashboard screen descriptions, ML summary, RAG summary, demo script link, and troubleshooting.
- [ ] Backend `README.md` should include Python setup, environment variables, API route list, model training/loading, and test commands.
- [ ] Frontend `README.md` should include Node setup, `.env` setup, main pages/components, and build command.

### Demo flow outline
- [ ] Start backend and frontend.
- [ ] Open dashboard overview and show descriptive analytics.
- [ ] Fill user profile form.
- [ ] Submit and show readiness score.
- [ ] Show calorie/intensity predictions.
- [ ] Show recommended exercises.
- [ ] Generate plan.
- [ ] Open RAG explanation and show retrieved snippets.
- [ ] Ask chat: "Why did you choose these exercises?"
- [ ] Ask chat/refinement: "Replace barbell exercises with dumbbell options."
- [ ] End with limitations: no medical diagnosis, prediction is estimate, no real long-term user history.

### MVP versus stretch scope
- [ ] MVP must-have:
  - clean datasets
  - FastAPI backend
  - React dashboard
  - descriptive analytics dashboard
  - at least one calorie or intensity ML model, ideally both
  - exercise recommendation by body part/equipment
  - rule-based plan generator
  - RAG retrieval or simple fallback retrieval
  - basic chat Q&A grounded in retrieved snippets
  - final report and demo script
- [ ] Stretch only if MVP is stable:
  - user login/JWT
  - PostgreSQL
  - Docker Compose for all services
  - streaming chat
  - LLM function calling for plan edits
  - deployment to Vercel/Render/Railway
  - advanced SHAP dashboard

### Deliverables to match friend's project quality
- [ ] Working app folder structure, not only notebooks.
- [ ] API documented through FastAPI Swagger at `/docs`.
- [ ] Frontend has typed services/hooks like the BIA project.
- [ ] README explains how another person can run the project.
- [ ] Dashboard has multiple tabs and real charts.
- [ ] Final demo follows a clear story: data -> analytics -> prediction -> decision support -> explanation.

### Detailed build blueprint from the BIA project

Use this as the exact implementation checklist when we start building. The friend project is useful because it is not only a notebook/report project; it has a runnable backend, frontend, API layer, services, UI pages, charts, filters, and documentation. Our project should reach the same level, but focused on Smart Workout.

#### 1. Repository and environment setup
- [ ] Create `backend/` and `frontend/` folders at project root.
- [ ] Add root `.gitignore` entries:
  - `.env`
  - `.venv/`
  - `node_modules/`
  - `dist/`
  - `__pycache__/`
  - `.pytest_cache/`
  - `chroma_db/`
  - `models/*.joblib` only if model files are too large for Git
- [ ] Add root `.env.example` or separate examples:
  - `backend/.env.example`
  - `frontend/.env.example`
- [ ] Decide dependency style:
  - simple option: `backend/requirements.txt`
  - cleaner option like BIA: `backend/pyproject.toml`
- [ ] Pin backend dependencies:
  - `fastapi`
  - `uvicorn`
  - `pandas`
  - `numpy`
  - `scikit-learn`
  - `joblib`
  - `pydantic`
  - `pydantic-settings`
  - `python-dotenv`
  - `chromadb`
  - `sentence-transformers`
  - `shap`
  - `pytest`
  - optional: `xgboost`
- [ ] Pin frontend dependencies:
  - `react`
  - `react-dom`
  - `typescript`
  - `vite`
  - `axios`
  - `recharts`
  - `lucide-react`
  - `react-router-dom`
  - `tailwindcss`
  - optional: `react-hook-form`
  - optional: `zod`
- [ ] Add root `docker-compose.yml` only for optional local services:
  - ChromaDB if using persistent vector store
  - do not add PostgreSQL unless we add login/history later
- [ ] Add `docs/architecture.md`, `docs/api_contract.md`, and `docs/demo_script.md`.

#### 2. Backend setup tasks
- [ ] Create `backend/app/main.py` similar to BIA:
  - initialize FastAPI app
  - set app title to `Smart Workout DSS/BIS API`
  - configure CORS for frontend ports `3000`, `3001`, `5173`, and `5174`
  - include routers from `api/v1`
  - add root route `/`
  - add health route `/health`
  - expose Swagger at `/docs`
- [ ] Create `backend/app/core/config.py`:
  - app name
  - environment
  - API prefix `/api/v1`
  - raw data path
  - processed data path
  - model path
  - ChromaDB path
  - optional LLM API key name
- [ ] Create `backend/app/core/logging.py`:
  - standard logging format
  - log startup/shutdown
  - log endpoint errors clearly
- [ ] Create `backend/app/core/constants.py`:
  - allowed body parts
  - allowed equipment labels
  - readiness thresholds
  - intensity thresholds
  - default sets/reps/rest rules
- [ ] Create `backend/app/api/v1/health.py`:
  - `GET /api/v1/health`
  - returns app status, data-loaded status, model-loaded status
- [ ] Create `backend/app/api/v1/dashboard.py`:
  - `GET /api/v1/dashboard/summary`
  - returns all descriptive BI dashboard data in one response like BIA's `/dashboard/summary`
- [ ] Create `backend/app/api/v1/workout.py`:
  - `POST /preprocess`
  - `POST /predict-calories`
  - `POST /predict-intensity`
  - `POST /recommend-exercises`
  - `POST /generate-plan`
- [ ] Create `backend/app/api/v1/rag.py`:
  - `POST /search`
  - `POST /ingest` only for development, not needed in final UI
- [ ] Create `backend/app/api/v1/chat.py`:
  - `POST /chat`
  - return grounded answer and retrieved snippets
- [ ] Create `backend/app/schemas/` with Pydantic models:
  - `ChartData`
  - `KPIResponse`
  - `DashboardSummaryResponse`
  - `UserProfileRequest`
  - `ProcessedProfileResponse`
  - `PredictionResponse`
  - `ExerciseRecommendationResponse`
  - `GeneratedPlanResponse`
  - `RagSearchRequest`
  - `RetrievedSnippet`
  - `ChatRequest`
  - `ChatResponse`
- [ ] Add backend smoke tests:
  - health endpoint returns `200`
  - dashboard summary returns expected keys
  - invalid workout input returns validation error
  - generate-plan returns structured plan for one sample profile

#### 3. Backend service details
- [ ] `data_service.py`
  - load `Sleep_health_and_lifestyle_dataset.csv`
  - load `gym_members_exercise_tracking.csv`
  - load `exercisedb_all_raw_flat.csv`
  - load `daily_food_nutrition_dataset.csv`
  - expose cached dataframes
  - expose dataset summary counts
  - check missing required columns at startup
- [ ] `preprocessing_service.py`
  - split blood pressure like `120/80` into systolic and diastolic
  - compute BMI from height/weight
  - normalize BMI category names
  - normalize equipment names to match ExerciseDB values
  - parse list-like ExerciseDB columns into real Python lists
  - convert frontend form values into model feature vector
- [ ] `analytics_service.py`
  - workout type distribution
  - calories burned distribution
  - average calories by workout type
  - body part coverage from ExerciseDB
  - equipment coverage from ExerciseDB
  - target muscle coverage
  - nutrition macro totals by meal type
  - sleep duration and stress summary
  - readiness archetype/cluster summary
  - return chart-friendly objects like BIA: `{ labels, values }`
- [ ] `readiness_service.py`
  - calculate readiness score from sleep duration, stress, heart rate, BMI, and blood pressure
  - output readiness band: `Low`, `Medium`, `High`
  - output explanation factors:
    - low sleep penalty
    - high stress penalty
    - elevated blood pressure warning
    - high resting heart rate warning
    - BMI-related adjustment
- [ ] `ml_service.py`
  - load saved model artifacts with `joblib`
  - expose `predict_calorie_burn_rate()`
  - expose `predict_intensity_band()`
  - return model name and metrics from `MODEL_RESULTS.md` or a small JSON metadata file
  - if model file is missing, return clear error instead of crashing
- [ ] `exercise_service.py`
  - filter by body part
  - filter by available equipment
  - rank exact equipment matches first
  - allow bodyweight fallback if no equipment selected
  - return exercise name, body parts, target muscles, equipment, instructions, and match score
- [ ] `plan_service.py`
  - choose plan type from schedule preference:
    - 2 days: full body
    - 3 days: push/pull/legs or full-body rotation
    - 4 days: upper/lower
    - 5 days: body-part split
  - adjust sets/reps/rest using predicted intensity
  - reduce volume if readiness is low
  - include safety note if blood pressure or heart rate is high
  - return structured JSON, not plain text
- [ ] `rag_service.py`
  - ingest `RAG_CORPUS.md`
  - ingest ExerciseDB instructions
  - store metadata:
    - source
    - category
    - body part
    - equipment
    - target muscle
  - retrieve top 5 snippets per query
  - provide simple keyword fallback if ChromaDB is not ready
- [ ] `chat_service.py`
  - answer using retrieved snippets and current plan
  - keep responses short for demo
  - say when the context is insufficient
  - support deterministic equipment substitution first
  - leave advanced LLM plan editing as stretch

#### 4. Frontend setup tasks
- [ ] Create React + Vite + TypeScript project in `frontend/`.
- [ ] Configure frontend scripts:
  - `npm run dev`
  - `npm run build`
  - `npm run preview`
  - optional `npm run lint`
- [ ] Configure `frontend/.env.example`:
  - `VITE_API_URL=http://localhost:8000`
  - `VITE_API_V1=/api/v1`
- [ ] Create `src/services/api.client.ts` like BIA:
  - central Axios instance
  - base URL from env
  - JSON headers
  - common error handling
- [ ] Create API service files:
  - `dashboard.service.ts`
  - `workout.service.ts`
  - `chat.service.ts`
- [ ] Create hooks:
  - `useDashboard`
  - `useWorkoutPlan`
  - `useChat`
  - each hook should expose `data`, `loading`, `error`, and `refresh` or `submit`
- [ ] Create TypeScript interfaces:
  - chart data
  - dashboard summary
  - user input form
  - processed profile
  - predictions
  - exercise recommendation
  - generated plan
  - RAG snippet
  - chat message
- [ ] Use React Router for pages or tab views:
  - `/`
  - `/dashboard`
  - `/plan`
  - `/insights`
  - `/rag`
- [ ] Use Lucide icons for navigation and buttons.
- [ ] Use Recharts for all charts.
- [ ] Add reusable UI components before building full pages.

#### 5. Frontend UI and dashboard details
- [ ] Build a top navigation bar like BIA:
  - app name: `Smart Workout`
  - subtitle: `DSS/BIS Personalized Training Dashboard`
  - refresh button
  - backend health indicator
- [ ] Build tab navigation:
  - `Overview`
  - `Profile`
  - `Plan`
  - `Insights`
  - `RAG + Chat`
- [ ] `Overview` tab:
  - KPI: total exercises
  - KPI: available equipment types
  - KPI: dataset rows
  - KPI: model status
  - chart: workout type distribution
  - chart: body part coverage
  - chart: equipment coverage
  - chart: calorie burn distribution
- [ ] `Profile` tab:
  - user form with three grouped sections:
    - About You: age, height, weight
    - Wellness Today: sleep, stress, blood pressure, resting heart rate
    - Training Intent: body part, equipment, sessions per week, goal
  - BMI auto-calculation
  - validation messages
  - submit button
  - readiness result card after submit
- [ ] `Plan` tab:
  - predicted calorie burn rate card
  - predicted intensity band card
  - class probability mini-bars
  - recommended exercise table
  - generated weekly plan cards
  - plan notes and safety warnings
  - regenerate button
- [ ] `Insights` tab:
  - descriptive BI charts from all datasets
  - nutrition macro view
  - sleep/readiness archetype view
  - exercise database coverage view
  - model comparison chart from `MODEL_RESULTS.md`
- [ ] `RAG + Chat` tab:
  - retrieved snippets panel
  - source/category badges
  - chat input
  - chat response area
  - current plan context shown in a compact panel
  - example prompt buttons:
    - `Why this plan?`
    - `Make it lighter`
    - `Use dumbbells only`
    - `Explain recovery time`
- [ ] Add UI states:
  - loading skeletons for charts/cards
  - empty state before profile submit
  - error banner on API failure
  - disabled submit while loading
  - no exercise match state with fallback suggestion
- [ ] UI quality requirements:
  - no giant landing page; open directly into dashboard
  - compact operational dashboard style
  - use cards only for actual dashboard panels
  - keep text short and scannable
  - every chart needs a clear title
  - every prediction needs a short interpretation
  - dashboard must be readable on laptop screen during demo

#### 6. API contract to document in `docs/api_contract.md`
- [ ] Document sample request/response for `/dashboard/summary`.
- [ ] Document sample request/response for `/workout/preprocess`.
- [ ] Document sample request/response for `/workout/predict-calories`.
- [ ] Document sample request/response for `/workout/predict-intensity`.
- [ ] Document sample request/response for `/workout/recommend-exercises`.
- [ ] Document sample request/response for `/workout/generate-plan`.
- [ ] Document sample request/response for `/rag/search`.
- [ ] Document sample request/response for `/chat`.
- [ ] Keep backend Pydantic schemas and frontend TypeScript types aligned.

#### 7. Integration sequence
- [ ] First integration: frontend calls `/health`.
- [ ] Second integration: frontend loads `/dashboard/summary` and renders charts.
- [ ] Third integration: profile form calls `/workout/preprocess`.
- [ ] Fourth integration: profile submit calls predictions.
- [ ] Fifth integration: recommendations render in table.
- [ ] Sixth integration: generated plan renders in cards.
- [ ] Seventh integration: RAG snippets display for plan explanation.
- [ ] Final integration: chat uses current plan and retrieved snippets.

#### 8. What to copy conceptually from BIA, and what not to copy
- [ ] Copy conceptually:
  - clean README
  - backend router/service/schema separation
  - frontend service/hook/type separation
  - one dashboard summary endpoint
  - typed frontend API calls
  - KPI cards
  - dashboard tabs
  - refresh/loading/error states
  - local demo instructions
- [ ] Do not copy for MVP:
  - login/authentication
  - PostgreSQL database
  - Alembic migrations
  - vending machine domain logic
  - overly complex visual styling
  - generated/fake analytics that are not tied to our datasets

#### 9. Minimum final demo acceptance checklist
- [ ] `backend` starts successfully.
- [ ] `frontend` starts successfully.
- [ ] `/docs` opens and shows all major endpoints.
- [ ] dashboard overview loads real dataset analytics.
- [ ] user can submit profile form.
- [ ] readiness result appears.
- [ ] prediction result appears.
- [ ] recommended exercises appear.
- [ ] generated plan appears.
- [ ] RAG snippets appear.
- [ ] chat answers at least one grounded question.
- [ ] README has exact run commands.
- [ ] demo script is written.

---

## Project management (Day-1 setup-)

### Tooling
- [ ] Pick communication channel (Discord / LINE / Slack) — pin a #smart-workout room
- [ ] Shared Google Drive folder (figures, recordings, planning docs)
- [ ] GitHub repo with **branch protection** on `main` (no direct pushes)
- [ ] Branching: `main` ← PR from `feat/<feature-name>` branches
- [ ] PR rule: at least 1 review before merge
- [ ] GitHub Issues with milestones for W1 / W2 / W3 / W4

### Cadence
- **Daily standup** (15 min, async in chat OK): yesterday / today / blocked-on
- **Mid-week sync** (Wed, 30 min): check Week deliverable status
- **End-of-week retro** (Sun, 30 min): what worked / what didn't / change next week
- **Final week**: daily in-person sync (integration crunch)

---

## Week 1 (23–29 Jun): Foundation

### Data (Earth and Non)
- [ ] Set up shared GitHub repo + branch protection + README
- [ ] Set up Python venv with pinned versions (pandas, scikit-learn, xgboost, chromadb, sentence-transformers, fastapi, uvicorn, shap, pydantic)
- [ ] Load + inspect all 4 CSVs (one notebook per dataset)
- [ ] Clean Sleep dataset: split blood pressure into systolic/diastolic, normalize BMI categories
- [ ] Clean Gym Members dataset: verify no missing, derive BPM-response ratio (Avg/Max), bin into Low/Mid/High intensity tertiles (≤0.70, 0.70–0.85, ≥0.85)
- [ ] Clean ExerciseDB: parse `bodyParts`, `equipments`, `targetMuscles` from string-list format → proper lists
- [ ] Clean Nutrition dataset: standardize macro columns
- [ ] Derive Training Readiness rule from Sleep dataset (composite of sleep quality + duration + stress + BMI → Low/Mid/High band)
- [ ] Outlier check on Calories_Burned (drop or cap >3σ)

### Descriptive analytics (Earth and Non)
- [ ] K-Means clustering on Sleep dataset → 3–4 user archetypes (try k=3, k=4, pick by silhouette score)
- [ ] Cross-dataset EDA: workout-type distribution, calorie-burn patterns by experience, exercise coverage by body part, nutrition macro mix by meal type
- [ ] Save EDA plots as PNG (for dashboard later)

### Project skeleton (Yolanda)
- [x] Follow the full detailed plan in `yolanda_notes/YOLANDA_PROJECT_SKELETON_PLAN.md`
- [x] Backend first: create FastAPI app with root endpoint `/`, health endpoint `/api/v1/health`, and auto-Swagger at `/docs`
- [x] Backend structure inspired by friend BIA project:
  - `backend/app/main.py`
  - `backend/app/api/v1/health.py`
  - `backend/app/api/v1/workout.py`
  - `backend/app/api/v1/chat.py`
  - `backend/app/schemas/workout.py`
  - `backend/app/schemas/chat.py`
  - `backend/app/services/workout_service.py`
  - `backend/app/services/chat_service.py`
- [x] CORS configured so React dev servers can call backend:
  - `http://localhost:3000`
  - `http://localhost:3001`
  - `http://localhost:5173`
  - `http://localhost:5174`
  - `http://127.0.0.1:5173`
- [x] Define and implement mock API contracts first, then replace with real ML/RAG later:
  - `POST /api/v1/workout/predict-calories`
  - `POST /api/v1/workout/predict-intensity`
  - `POST /api/v1/workout/recommend-exercises`
  - `POST /api/v1/workout/generate-plan`
  - `POST /api/v1/chat`
- [x] Test backend endpoints with automated smoke tests (`py -m pytest -q`: 4 passed)
- [x] Frontend second: React + Vite + TypeScript scaffold
- [x] Frontend UI setup:
  - TailwindCSS
  - shadcn/ui-compatible local components now; official shadcn install is optional later
  - Recharts
  - Lucide React
  - Axios
  - React Router
- [x] Frontend structure inspired by friend BIA project:
  - `frontend/src/services/api.client.ts`
  - `frontend/src/services/workout.service.ts`
  - `frontend/src/services/chat.service.ts`
  - `frontend/src/hooks/useWorkoutPlan.ts`
  - `frontend/src/hooks/useChat.ts`
  - `frontend/src/types/workout.types.ts`
  - `frontend/src/types/chat.types.ts`
  - `frontend/src/pages/DashboardPage.tsx`
- [x] Initial UI design:
  - top navbar with app name, backend status, refresh button
  - dashboard tabs: `Overview`, `Profile`, `Plan`, `RAG Chat`
  - profile form for user input
  - plan cards for API output
  - chat panel for `/chat`
- [x] Check the "Overlooked Items to Add Before Coding" section in `yolanda_notes/YOLANDA_PROJECT_SKELETON_PLAN.md`
- [x] Check the "Second Backend Audit from Friend BIA Project" section in `yolanda_notes/YOLANDA_PROJECT_SKELETON_PLAN.md`
- [x] Add two extra endpoints that are important for the proposal/professor requirement:
  - `POST /api/v1/workout/preprocess` for BMI, blood-pressure split, equipment normalization, and readiness
  - `GET /api/v1/dashboard/summary` for descriptive BI dashboard charts
- [x] Add BIA-inspired backend quality items:
  - `backend/app/core/config.py` using `pydantic-settings`
  - `backend/app/core/logging.py`
  - FastAPI lifespan startup/shutdown logs
  - `backend/app/api/deps.py`
  - `response_model` and `tags` on every router
  - package `__init__.py` files
  - `GET /api/v1/health/readiness`
  - Vite proxy for `/api` in frontend config
- [x] Add stable handoff points so teammates can replace mock logic without breaking the frontend:
  - calorie prediction service
  - intensity prediction service
  - exercise recommendation service
  - plan generation service
  - chat/RAG service
  - dashboard summary service

#### Yolanda remaining work after skeleton
- [ ] Manually test full browser flow: Overview -> Profile submit -> Plan -> RAG Chat
- [x] Replace mock dashboard calculations with real dataset aggregations
- [x] Replace mock exercise recommendations with real ExerciseDB CSV filtering
- [x] Add frontend validation messages for invalid fields
- [x] Add intensity probability bars in the Plan tab
- [x] Show retrieved RAG snippets in the Plan tab, not only Chat
- [x] Add `docs/demo_script.md` for Yolanda's demo walkthrough
- [x] Add frontend manual-test checklist with screenshots for the report

### RAG knowledge corpus drafting (ongoing) (Earth and Non)
- [ ] Start writing the curated rule corpus (target ~50–100 snippets by end of Week 2)
- [ ] Draft system prompt + 5–10 few-shot examples for the chat

### Frontend design lock-in (see "Frontend design decisions" section below) (Yolanda)
- [ ] Pick component library (shadcn/ui), chart library (Recharts), state mgmt (React Context), routing (React Router v6)
- [ ] Hand-sketch wireframes for all 3 dashboard views + form + chat widget

**Week 1 deliverable:** All 4 datasets clean, K-Means clusters done, repo + venv + FastAPI/React skeletons running, wireframes locked, rule corpus 30% drafted.

---

## Week 2 (30 Jun – 6 Jul): Core ML + RAG

### ML pipeline (see "ML pipeline details" below)
- [ ] **Calorie-burn-rate regression**: train Ridge, Random Forest, XGBoost on gym dataset (target = Calories_Burned / Session_Duration; exclude Session_Duration from features)
  - [ ] Apply StandardScaler for Ridge (tree models don't need it)
  - [ ] 5-fold cross-validation, `random_state=42` for reproducibility
  - [ ] Report RMSE, MAE, R² for each model
  - [ ] Select best, save as `.joblib` artifact in `models/`
- [ ] **Workout-intensity classifier**: train Multinomial Logistic Regression, Random Forest, XGBoost on gym dataset (target = intensity tertile derived from BPM ratio)
  - [ ] Stratified 5-fold CV
  - [ ] Report accuracy, macro-F1, confusion matrix per model
  - [ ] Select best, save artifact
- [ ] Generate SHAP plots for selected models (save as PNG)
- [ ] Write `MODEL_RESULTS.md` with comparison table

### RAG pipeline 
- [ ] Install ChromaDB locally (persistent client, path `./chroma_db/`)
- [ ] Ingest all 1,500 ExerciseDB instructions as documents with metadata (`body_parts`, `equipment`, `target_muscles`)
- [ ] Ingest the curated rule corpus (target ~50 snippets by end of week) with category metadata
- [ ] Embed with `all-MiniLM-L6-v2` sentence-transformer
- [ ] Decide chunk strategy (full instruction set vs sentence-level)
- [ ] Test retrieval with 10 sample queries; verify top-5 are relevant
- [ ] Build `/chat` endpoint stub (retrieval only, no LLM yet)

### Backend endpoints
- [ ] `POST /preprocess` → takes user form input, returns feature vector
- [ ] `POST /predict-calories` → returns calorie-burn rate + confidence
- [ ] `POST /predict-intensity` → returns intensity band + class probabilities
- [ ] `POST /recommend-exercises` → filters ExerciseDB by body part + equipment
- [ ] Pydantic schemas for all request/response models
- [ ] FastAPI auto-Swagger endpoint reviewed at `/docs`

### Frontend shell
- [ ] Set up shadcn/ui components library
- [ ] Build the form: 3 sections (About You / Wellness Today / Training Intent)
  - [ ] React Hook Form + Zod validation
  - [ ] Smart defaults (sleep slider default 7h, session default 60min)
  - [ ] Equipment as multi-select chips (matching ExerciseDB equipment values exactly)
  - [ ] Body-part as chip selector (chest/back/legs/arms/shoulders/core)
  - [ ] BMI auto-computed from weight+height (don't ask separately)
- [ ] Submit handler → POST to backend → display raw JSON response (proper UI next week)

**Week 2 deliverable:** Both ML models trained + compared + best selected; ChromaDB ingested; FastAPI endpoints working; form submits successfully and returns predictions.

---

## Week 3 (7–13 Jul): Plan Generator + Dashboard + Chat

### Plan generator
- [ ] Write rule-based plan generator
  - Input: predicted intensity + readiness + body part + equipment + filtered exercise list
  - Output: structured plan (split, exercises with sets/reps/rest, intensity load)
- [ ] Rules:
  - Intensity High → 4–5 sets, lower reps (5–8), longer rest (2–3 min)
  - Intensity Mid → 3–4 sets, 8–12 reps, 90s rest
  - Intensity Low → 2–3 sets, 12–15 reps OR deload/mobility focus
  - Pull RAG snippets for plan rationale and equipment substitutions
- [ ] `POST /generate-plan` endpoint returning JSON plan

### LLM chat integration (see "LLM integration playbook" below)
- [ ] Pick LLM provider (OpenAI GPT-4o-mini OR Grok — whichever has API access)
- [ ] Store API key in `.env`; never commit
- [ ] Write system prompt anchoring assistant to RAG context (see playbook template)
- [ ] `POST /chat` endpoint with streaming response
- [ ] **Tier 1 refinement** (must-have): equipment substitution ("substitute dumbbells for barbell" → deterministic swap)
- [ ] **Tier 2 refinement** (target): intensity tweak ("make Tuesday lighter" → reduce sets/reps for that day)
- [ ] **Tier 3 refinement** (stretch): free-form modification (LLM function-calling for plan edits)
- [ ] Write 5–10 example Q&A test cases; run and verify groundedness

### Dashboard views
- [ ] **View 1 — Descriptive (multi-dataset EDA)**: load EDA plots from Week 1
  - [ ] Recharts: workout-type bar, calorie-burn distribution, exercise body-part pie, nutrition macro stacked bar
  - [ ] K-Means cluster summary card
- [ ] **View 2 — Personalized Prediction + Plan**: takes form output
  - [ ] Calorie-burn rate gauge
  - [ ] Intensity band badge with class probabilities
  - [ ] Plan card (split, exercises, sets/reps)
  - [ ] SHAP feature attribution chart
- [ ] **View 3 — RAG Explanation**: shows retrieved snippets that grounded the plan
- [ ] **Floating AI chat widget**: bottom-right pop-up using shadcn dialog
- [ ] React Router v6 for view navigation
- [ ] Loading / error / empty states on every panel

### Integration
- [ ] End-to-end test: form → preprocess → predict → recommend → plan → display
- [ ] Mid-week demo internally — every component connected even if rough

**Week 3 deliverable:** Plan generation working, dashboard 3 views functional, chat answers Q&A and does Tier 1 (equipment substitution) refinement.

---

## Week 4 (14–20 Jul): Polish + Evaluation + Report

### Polish
- [ ] Fix bugs from Week 3 integration
- [ ] Mobile-responsive check on dashboard (use Tailwind `md:` / `lg:` breakpoints)
- [ ] Loading states and error handling on all API calls
- [ ] Try Tier 2 refinement if Tier 1 stable
- [ ] Smooth visual polish (consistent spacing, typography, color scheme)

### Evaluation
- [ ] Document final ML results: best model per task + CV metrics + confusion matrices + SHAP plots
- [ ] Run a small user test (3–5 classmates if possible): record their feedback on form + plan + chat
- [ ] Latency benchmarks: time from form submit to plan render
- [ ] Cost benchmark: total LLM tokens used across testing

### Final Report (parallelize chapters; see "Submission / admin" below)
- [ ] Set up LaTeX from senior's structure (frontmatter, ToC, chapters)
- [ ] **Chapter 1** — Introduction (problem, objectives, report org)
- [ ] **Chapter 2** — Theoretical Foundation (DSS, BI, RAG — add 3–4 academic citations)
- [ ] **Chapter 3** — Data Foundation (all 4 datasets, feature engineering)
- [ ] **Chapter 4** — Analytical Framework (Descriptive / Predictive / Prescriptive — pull from §5 of proposal)
- [ ] **Chapter 5** — System Architecture (expand architecture diagram, describe each component)
- [ ] **Chapter 6** — Dashboard Walkthrough (screenshots of each view, captions)
- [ ] **Chapter 7** — Evaluation (model metrics, user feedback, limitations)
- [ ] **Chapter 8** — Discussion (contributions, limitations, ethical considerations)
- [ ] **Chapter 9** — Conclusion
- [ ] Bibliography

### Demo prep
- [ ] Demo script (5-min walkthrough with talking points)
- [ ] Recorded fallback video (in case live demo fails)
- [ ] Slide deck (10–15 slides)
- [ ] Rehearse together at least twice

**Week 4 deliverable:** Polished prototype, evaluation done, final report submitted, demo recorded.

---

## Frontend design decisions (commit upfront, Day 1–3)

### Tech choices
- **Component library:** shadcn/ui (free, copy-paste, no heavy dep)
- **Chart library:** Recharts (fits React + shadcn aesthetic)
- **State management:** React Context API (lightweight; no Zustand/Redux needed)
- **Routing:** React Router v6 for the 3 dashboard views
- **Icons:** Lucide React (shadcn default)
- **Form library:** React Hook Form + Zod (matches FastAPI Pydantic schema)

### Design system
- **Color palette:** Tailwind `slate` (neutral) + `blue` (primary) + `green` (positive) + `red` (warning)
- **Typography:** Inter (default) or system stack
- **Spacing:** Tailwind 4-unit scale (4, 8, 16, 24, 32px)
- **Breakpoints:** mobile-first → `md:` (768px) → `lg:` (1024px)
- **Border radius:** consistent `rounded-lg` (8px) on cards

### States to design upfront
- Loading skeleton for each card
- Error message banner on API failure
- Empty state when no plan generated yet
- Disabled submit while loading
- Toast notifications for chat responses

### Wireframe before code
- [ ] Sketch all 3 dashboard views (Figma free or hand-sketch + photo)
- [ ] Form layout sketch (3 sections, smart defaults)
- [ ] Chat widget mockup (floating bottom-right, expandable)

---

## Deployment plan

### Decision (make in Week 1)
- [ ] **Choose**: local-only demo OR deployed?
  - **Local-only (recommended for 4-week scope)**: simpler, no infra cost; runs on laptop
  - **Deployed (stretch)**: prof can access via URL; adds 2–3 days; more polish

### If local-only
- [ ] Docker Compose with 3 services (backend, frontend, chromadb)
- [ ] Root `README.md` with `docker compose up` instructions
- [ ] Demo runs on a laptop during presentation

### If deployed
- **Frontend:** Vercel (free, ~5 min deploy from GitHub)
- **Backend:** Render or Railway free tier (~10 min deploy)
- **ChromaDB:** persist on backend host's disk, OR Chroma Cloud free tier
- **LLM API key:** server-side only, never in frontend
- **Env vars:** configured via hosting dashboard, never committed

---

## LLM integration playbook

### Setup
- [ ] Choose provider: OpenAI GPT-4o-mini (cheap, ~$0.15/1M input tokens) OR Grok via xAI
- [ ] Get API key, store in `.env`, add `.env` to `.gitignore` ✓
- [ ] Budget cap: $5–10 total across all testing

### System prompt template
```
You are Smart Workout, an AI training assistant. Answer questions about
exercise programming using ONLY the retrieved context below.

Rules:
1. Ground every claim in the retrieved snippets.
2. If the answer isn't in context, say "I don't have specific guidance
   on that — consult a certified trainer."
3. Be concise (2–4 sentences).
4. For plan refinement (substitute, adjust intensity), return the modified
   plan as JSON alongside the explanation.

Retrieved context:
{retrieved_snippets}

Current plan (if refinement request):
{current_plan_json}

User question: {user_query}
```

### Implementation choices
- **Streaming:** yes for chat responses (first token < 1s feels instant)
- **Temperature:** 0.3 (factual, not creative)
- **Max output tokens:** 300 (keep responses concise)
- **Top-k retrieval:** 5 snippets per query
- **Conversation history:** keep last 3 user turns in context window
- **Function calling (Tier 3):** define `modify_plan(action, target, new_value)` schema

### Iteration loop
- [ ] Write 5–10 example Q&A test cases (in `tests/chat_eval.md`)
- [ ] Run them; verify groundedness, tone, plan-refinement accuracy
- [ ] Adjust system prompt; rerun
- [ ] Document final prompt in `system_prompt.md`

### Cost / rate limiting
- [ ] Token counter logged per request
- [ ] Cache identical queries (in-memory dict in backend)
- [ ] Frontend rate limit: 1 chat message per 2 seconds per user

---

## ML pipeline details

### Feature engineering checklist
- [ ] **Calorie regressor target:** `Calories_Burned / Session_Duration` (kcal/hr)
- [ ] **Intensity classifier target:** `Avg_BPM / Max_BPM` binned to tertiles (≤0.70 / 0.70–0.85 / ≥0.85)
- [ ] **Readiness auxiliary feature:** rule-derived from Sleep dataset (sleep quality + duration + stress + BMI category) → Low/Mid/High
- [ ] **Categorical encoding:** one-hot for Workout_Type (Strength/Cardio/HIIT/Yoga); ordinal for Experience_Level (already 1/2/3)
- [ ] **Scaling:** StandardScaler for Ridge & Multinomial Logistic Regression; not needed for tree models

### Cross-validation
- [ ] `KFold(n_splits=5, shuffle=True, random_state=42)` for regression
- [ ] `StratifiedKFold(n_splits=5, shuffle=True, random_state=42)` for classification
- [ ] Report mean ± std across folds

### Hyperparameter tuning (optional, only if time permits)
- [ ] `GridSearchCV` over a small grid:
  - Ridge: `alpha ∈ [0.1, 1.0, 10.0]`
  - Random Forest: `n_estimators ∈ [100, 200]`, `max_depth ∈ [None, 10]`
  - XGBoost: `learning_rate ∈ [0.05, 0.1]`, `max_depth ∈ [3, 5, 7]`

### Model selection logic
- Regression: highest mean CV R² wins
- Classification: highest mean CV macro-F1 wins
- Tiebreaker: prefer simpler model (Linear > Random Forest > XGBoost)

---

## Testing strategy (lightweight, academic-appropriate)

### Backend
- [ ] Smoke test per endpoint with `pytest` + FastAPI `TestClient`
  - One valid input → 200, expected schema
  - One invalid input → 422 (Pydantic validation)
- [ ] Don't aim for 100% coverage; aim for "every endpoint exercised once"

### Frontend
- [ ] Skip unit tests (low value for 4-week academic scope)
- [ ] Manual test script run before final demo:
  1. **Happy path:** typical user input → plan + predictions visible
  2. **Edge:** BMI > 35 → rule engine prescribes lower-impact options
  3. **Edge:** no equipment selected → recommender returns bodyweight only
  4. **Chat Q&A:** "Why this exercise?" → response cites retrieved snippets
  5. **Chat refinement:** "Substitute dumbbells for barbell" → plan visibly updates

### Data / ML
- [ ] Validate cleaned data (no NaN in critical columns)
- [ ] Validate model artifacts load and predict on sample input
- [ ] CV metrics reproducible (set `random_state=42`)

---

## Documentation tasks (per folder)

- [ ] **Root `README.md`**: project overview + how to run (`docker compose up` or local setup)
- [ ] **`backend/README.md`**: API endpoint summary (link to `/docs` Swagger)
- [ ] **`frontend/README.md`**: dev server start + component map
- [ ] **`data/README.md`**: which dataset is where + preprocessing notebook order
- [ ] **`models/README.md`**: training script usage + how to re-train
- [ ] **`MODEL_RESULTS.md`**: comparative table of all 6 trained models with metrics
- [ ] **`RAG_CORPUS.md`**: the 50–100 rule snippets
- [ ] **`system_prompt.md`**: final LLM system prompt

---

## Risk mitigation / fallback plans

| Risk | Likelihood | Mitigation |
|---|---|---|
| Ollama too slow on laptops | High | Fall back to OpenAI/Grok API (proposal already supports either) |
| LLM API quota exhausts mid-demo | Medium | Cache last working chat responses; screenshots as live-demo backup |
| XGBoost fails to converge / takes too long | Low | Drop to Random Forest only; report as model-selection finding |
| React dashboard runs over budget | High | Cut View 3 (RAG explanation) to a side-panel inside View 2 |
| ChromaDB metadata-filter bugs | Medium | Use Python-side filtering on retrieved docs instead |
| Plan refinement Tier 2/3 too complex | Medium | Ship Tier 1 only; document Tier 2/3 in final report as future work |
| Team member sick / unavailable | Medium | Pair-buddy each piece so no single point of failure |
| LaTeX final-report formatting blocker | Low | Use senior's template directly; no custom styling |
| Form-to-ML data type mismatch | Medium | Use Pydantic + Zod with shared schema definition |
| User test recruitment fails | Low | Use classmates as informal testers |

---

## Submission / admin checklist

- [x] **Proposal:** submitted by 18 June 2026 (current PDF is final, 2 pages)
- [ ] **Mid-checkpoint:** clarify with prof if one is required
- [ ] **Final report:** target 25–40 pages (senior's was 44; don't pad)
- [ ] **Citation style:** IEEE (recommended for tech) or APA
- [ ] **Demo format:** live in-class + recorded fallback video
- [ ] **Slide deck:** 10–15 slides, ~5-min presentation
- [ ] **GitHub repo:** public before submission; pin a release tag `v1.0`
- [ ] **Final report PDF filename:** `SmartWorkout_FinalReport_125970_125934_125843.pdf` (or per prof's convention)
- [ ] **Datasets:** acknowledge sources (Kaggle + ExerciseDB) in Chapter 3
- [ ] **Code submission:** GitHub link in report bibliography

---

## RAG Rule Corpus — write these (~50–100 snippets total)

Save as `RAG_CORPUS.md` or split into category files. Each snippet should be **one short, factual sentence**.

### A. Recovery rules (~10–15 snippets)
- *"After a heavy chest day (3+ sets bench press), allow 48 hours before the next chest session."*
- *"Heavy compound lifts (squat, deadlift) require 72 hours of recovery between sessions."*
- *"Cardio sessions should be at least 1 hour apart from strength training to avoid impairing strength adaptation."*
- *"If sleep duration is below 6 hours, reduce training volume by 20–30% for that session."*

### B. Equipment substitution (~15–20 snippets)
- *"Barbell exercises can be substituted with two dumbbells at 50–70% of the prescribed weight per hand."*
- *"Cable machine pulldowns can be replaced with resistance-band pull-aparts or assisted pull-ups."*
- *"For machine leg press, substitute bodyweight goblet squats or single-leg step-ups."*
- *"Lat pulldown → assisted pull-up or inverted row with a sturdy bar."*

### C. Schedule / split rules (~10–15 snippets)
- *"For a 3-day-per-week schedule, use a Push-Pull-Legs split with one rest day between cycles."*
- *"For 4-day schedules, use an Upper-Lower split (Mon Upper, Tue Lower, Thu Upper, Fri Lower)."*
- *"For 2-day schedules, use full-body workouts with at least 72 hours between sessions."*
- *"Avoid training the same muscle group two consecutive days."*

### D. Intensity / readiness scaling (~10–15 snippets)
- *"Low readiness band → prescribe deload week: 2 sets at 50% intensity, focus on mobility and form."*
- *"Mid readiness → 3–4 sets at 70% intensity, 8–12 reps, 90s rest."*
- *"High readiness → 4–5 sets at 75–85%, 5–10 reps, 2–3 min rest."*
- *"High stress + low sleep → prioritize cardio or mobility over heavy compounds."*

### E. Experience-level guidance (~10 snippets)
- *"Beginners (Experience Level 1) should start with machines for 4–6 weeks to learn movement patterns."*
- *"Intermediate (Level 2) lifters benefit from free-weight compound focus with 3–4 sessions per week."*
- *"Advanced (Level 3) lifters need periodization (volume → intensity → deload cycles) every 4–6 weeks."*

### F. Safety / contraindications (~5–10 snippets)
- *"Users with elevated blood pressure (>140/90) should avoid heavy isometric holds and Valsalva-loaded lifts."*
- *"BMI above 30 → start with low-impact options (rowing, swimming, machines) before adding heavy compounds."*
- *"Resting heart rate above 90 bpm warrants reduced session intensity that day."*

---

## Critical-path dependencies (don't get blocked)

```
Week 1 data cleaning ─┐
                      ├─► Week 2 ML training ──┐
Week 2 RAG ingest ────┤                        ├─► Week 3 plan generation ──► Week 4 polish
                      ├─► Week 2 API endpoints ┤                              ↑
Week 1 React skeleton ┘                        └─► Week 3 dashboard ─────────┘
```

**Highest-risk pieces** (start these on Day 1):
1. React dashboard (5–7 days of work)
2. ChromaDB ingestion + retrieval testing (subtle bugs around metadata filtering)
3. LLM chat with plan refinement (Tier 2/3 are stretch — don't block on these)

---

## Definition of Done

- [ ] Working end-to-end prototype (form → ML → plan → dashboard → AI chat)
- [ ] Both ML models trained with 3-candidate comparison results documented
- [ ] ChromaDB containing both exercise instructions and ~50+ rule snippets
- [ ] Chat handles Q&A + at least Tier 1 plan refinement (equipment substitution)
- [ ] Final report written (9 chapters, bibliography)
- [ ] Demo video + slide deck rehearsed
- [ ] GitHub repo public with README + setup instructions + release tag
