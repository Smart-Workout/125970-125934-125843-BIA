# Smart Workout Demo Script

Owner: Yolanda  
Purpose: 5-minute walkthrough for the frontend/backend skeleton and integration flow.

## Before the demo

Run the backend:

```powershell
cd C:\Users\Windows\Desktop\125970-125934-125843\backend
py -m uvicorn app.main:app --reload
```

Run the frontend:

```powershell
cd C:\Users\Windows\Desktop\125970-125934-125843\frontend
npm run dev
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

> My part sets up the backend API contract and frontend integration shell. The ML and RAG internals can be replaced later without changing the frontend calls.

### 2. Open the dashboard overview

Show:

- backend status
- readiness/model/data status
- dataset KPI cards
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
- Session duration: `60`

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

> The current predictions are placeholder logic, but the endpoint names and response shapes are stable. The exercise recommendations already use the ExerciseDB CSV filtering by body part and equipment.

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

> The chat endpoint currently returns grounded mock responses with snippets. Later, the RAG owner can replace the service internals with ChromaDB and an LLM while keeping this same frontend contract.

### 6. Show one edge case

Change the profile:

- Equipment: clear all equipment, or select only `body weight`

Submit again and show that recommendations fall back to bodyweight exercises.

Talk track:

> This proves the recommender handles a practical fallback case instead of failing when equipment is limited.

## Closing line

> Yolanda's implementation provides the runnable app skeleton, typed API contract, frontend dashboard, backend integration, and demo path. The next team handoff is to replace mock ML/RAG services with trained models and a real vector retrieval pipeline.

## Known limitations to mention

- It is not medical advice.
- ML predictions are still placeholder until model artifacts are added.
- RAG chat is grounded mock logic until ChromaDB and LLM integration are completed.
- No login or database is included because the MVP does not need saved user history.
