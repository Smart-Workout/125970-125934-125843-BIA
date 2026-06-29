# Smart Workout Demo Script

Owner: Yolanda  
Purpose: 5-minute walkthrough for the frontend/backend skeleton and integration flow.
Last updated: `2026-06-29`

## Before the demo

Local backend verification already completed on `2026-06-29`:

```text
python -m pytest backend\tests -q
12 passed, 2 warnings in 6.09s
```

Run the backend:

```powershell
cd C:\Users\Windows\Desktop\125970-125934-125843
$env:PYTHONPATH = "backend"
python -m uvicorn app.main:app --app-dir backend --reload --host 127.0.0.1 --port 8000
```

Run the frontend:

```powershell
cd C:\Users\Windows\Desktop\125970-125934-125843\frontend
cmd /c npm install
cmd /c npm run dev
```

Open:

- Frontend: `http://127.0.0.1:5173`
- Backend Swagger: `http://127.0.0.1:8000/docs`

## Demo flow

### 1. Open Swagger

Show that FastAPI is running and Swagger lists the main endpoints:

- `GET /api/v1/health`
- `GET /api/v1/health/readiness`
- `GET /api/v1/dashboard/summary`
- `POST /api/v1/workout/preprocess`
- `POST /api/v1/workout/predict-calories`
- `POST /api/v1/workout/predict-intensity`
- `POST /api/v1/workout/recommend-exercises`
- `POST /api/v1/workout/generate-plan`
- `POST /api/v1/chat`

Talk track:

> This shows the full API contract for the current prototype. The ML prediction endpoints are already wired to saved Week 2 models, while the chat remains retrieval-grounded rather than fully LLM-generated.

### 2. Open the dashboard overview

Show:

- backend status
- readiness/model/data status
- dataset KPI cards
- Gym Membership tab for relational analytics
- Lifestyle Profiles tab for clustering outputs
- workout type chart
- body-part coverage chart
- equipment coverage chart
- nutrition macro chart

Talk track:

> This screen covers the BI part of the project. The dashboard summarizes the workout, nutrition, and ExerciseDB datasets so the app is not only a form, but also a decision-support dashboard.

### 3. Fill the profile form

Use this sample:

- Age: `23`
- Height: `170`
- Weight: `68`
- Sleep duration: `7`
- Stress level: `4`
- Resting heart rate: `72`
- Blood pressure: `118/76`
- Target body part: `chest`
- Equipment: `dumbbell`, `body weight`
- Sessions per week: `3`

Submit the form.

Talk track:

> The form calls the backend workflow in order: preprocessing, calorie prediction, intensity prediction, exercise recommendation, and plan generation.

### 4. Show the plan tab

Show:

- calorie prediction card
- intensity class and probability bars
- recommended exercise table
- generated weekly plan
- readiness adjustment and safety notes
- retrieved snippets used for explanation

Talk track:

> The current plan flow uses real saved ML models for calorie and intensity prediction, real ExerciseDB filtering for exercise recommendation, and a still-simplified rule engine for weekly plan assembly.
> The current plan flow uses real saved ML models for calorie and intensity prediction, real ExerciseDB filtering for exercise recommendation, and a stronger rule-based weekly split that is grounded in readiness, goal, equipment, and target body part.

### 5. Show the RAG chat tab

Ask:

```text
Why did you choose these exercises?
```

Then ask:

```text
Can I replace barbell exercises with dumbbells?
```

Talk track:

> The chat endpoint returns grounded answers assembled from retrieved snippets and current plan context. It is not the final free-form LLM assistant yet, but it already demonstrates evidence-grounded explanation.

### 6. Show one edge case

Change the profile:

- Equipment: clear all equipment, or select only `body weight`

Submit again and show that recommendations fall back to bodyweight exercises.

Talk track:

> This proves the recommender handles a practical fallback case instead of failing when equipment is limited.

## Closing line

> The current prototype now covers the descriptive dashboard, model-backed prediction path, exercise recommendation, a structured rule-based plan generator, and grounded chat explanation. The biggest remaining product gap is adding the final Tableau embeds and finishing local verification/screenshots.

## Known limitations to mention

- It is not medical advice.
- ML predictions are backed by saved Week 2 model artifacts.
- RAG chat is still retrieval-grounded until the final vector/LLM assistant is completed.
- The Gym Membership and Lifestyle tabs are implemented in React, but Tableau embedding from the proposal is still not implemented.
- The plan generator is improved, but still may need final tuning after local demo inspection.
- No login or database is included because the MVP does not need saved user history.
