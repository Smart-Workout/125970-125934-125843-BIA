# Week 1 to Week 2 Run Steps

This document explains how to run the Smart Workout project from the Week 1 data foundation stage to the latest Week 2 ML, RAG, and backend API stage.

Last updated: `2026-06-29`

The goal is to make the workflow reproducible for every group member, including anyone who did not build the files originally.

## 0. Overall Pipeline Concept

The current project is organized into four main layers:

| Layer | Role | Example files |
|---|---|---|
| Raw Data | Original source files before cleaning | `data/raw/*.csv`, `data/raw/Gym Database Management System/*` |
| Processed Data | Inspected, cleaned, validated, and transformed data | `data/processed/*.csv` |
| Analytics / ML / RAG Artifacts | Tables, plots, trained models, and vector index outputs | `docs/figures/`, `models/`, `chroma_db/` |
| Backend API | Local API endpoints for frontend, demo, and testing | `backend/app/main.py`, `/api/v1/*` |

Main flow:

```text
Raw CSV files
  -> Week 1 notebook
  -> cleaned processed CSVs + validation proof + plots
  -> Week 2 ML scripts + RAG scripts
  -> model artifacts + ChromaDB index + retrieval reports
  -> FastAPI backend endpoints
```

## 1. Open the Correct Project Folder

Open PowerShell or the VSCode terminal at the repository root:

```powershell
cd "C:\Users\Windows\Desktop\125970-125934-125843"
```

Check that the current folder is correct:

```powershell
dir
```

Important folders/files should appear:

```text
backend
data
docs
models
notebooks
scripts
README.md
TODO.md
```

## 2. Create and Activate the Python Environment

Create a virtual environment so the project dependencies do not conflict with the global Python installation:

```powershell
python -m venv .venv
```

Activate the environment:

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy RemoteSigned
.\.venv\Scripts\Activate.ps1
```

If activation works, the terminal prompt should start with:

```text
(.venv)
```

Upgrade pip and install all backend, ML, RAG, and test dependencies:

```powershell
python -m pip install --upgrade pip
python -m pip install -r backend\requirements.txt
```

Important dependencies:

| Package | Purpose |
|---|---|
| `pandas`, `numpy` | Data cleaning, validation, summary tables |
| `scikit-learn` | Ridge, Logistic Regression, Random Forest, K-Means, cross-validation metrics |
| `xgboost` | XGBoost regression and classification |
| `shap` | Model explanation plots |
| `chromadb` | Local vector database for RAG |
| `sentence-transformers` | Embedding model for RAG |
| `fastapi`, `uvicorn` | Backend API |
| `pytest`, `httpx` | Backend API tests |

## 3. Week 1: Run the Data Foundation Notebook

Open this notebook in VSCode or Jupyter:

```text
notebooks/week1/smart_workout_week1_complete_final_product.ipynb
```

Run it with:

```text
Restart Kernel -> Run All
```

This notebook performs the Week 1 foundation tasks:

| Section | What it does |
|---|---|
| Raw inspection | Loads and inspects all raw datasets before cleaning |
| Cleaning proof | Cleans each dataset and creates proof tables showing what changed |
| ExerciseDB parsing | Converts string-list fields such as body parts, equipment, and target muscles into usable list-like structures |
| Nutrition cleaning | Standardizes macro columns such as protein, carbohydrates, and fat |
| Sleep readiness | Derives readiness scores from sleep duration, sleep quality, stress, and BMI |
| Calories outlier proof | Checks calorie-burn outliers using a 3-sigma rule |
| K-Means clustering | Creates sleep archetype clusters and silhouette score tables |
| Cross-dataset EDA | Produces descriptive analytics required by the Week 1 TODO |
| GymDB warehouse | Prepares fact and dimension tables plus dashboard marts from the Gym Database Management System dataset |
| Export outputs | Saves processed CSV files and PNG charts |

Main inputs:

```text
data/raw/daily_food_nutrition_dataset.csv
data/raw/exercisedb_all_raw_flat.csv
data/raw/gym_members_exercise_tracking.csv
data/raw/Sleep_health_and_lifestyle_dataset.csv
data/raw/Gym Database Management System/*.csv
```

Main outputs:

```text
data/processed/*.csv
docs/figures/week1/*.png
```

Important Week 1 outputs used by Week 2:

| File | How it is used later |
|---|---|
| `data/processed/gym_cleaned_intensity_calories.csv` | Used to train Week 2 ML regression and classification models |
| `data/processed/exercisedb_cleaned_catalog.csv` | Used to build the RAG index and support exercise recommendations |
| `docs/rag/RAG_CORPUS.md` | Used as the curated rule corpus for RAG |
| `docs/rag/system_prompt.md` | Draft prompt for the future Smart Workout chat assistant |
| `docs/rag/rag_chat_examples.md` | Few-shot examples for future LLM behavior |

## 4. Week 1 Output Check

After running the Week 1 notebook, check the output folders:

```powershell
dir data\processed
dir docs\figures\week1
dir docs\rag
```

Important proof files should exist:

```text
week1_todo_completion_checklist.csv
week1_raw_inspection_summary.csv
week1_data_contract_validation.csv
gym_calorie_outlier_proof.csv
sleep_kmeans_silhouette_scores.csv
sleep_cluster_profile.csv
gymdb_warehouse_overview.csv
```

If these files exist, the Week 1 foundation is ready for Week 2.

## 5. Week 2: Train ML Models

Run:

```powershell
python scripts\train_week2_ml.py
```

This script runs two ML tasks.

### 5.1 Calorie-Burn-Rate Regression

Target:

```text
calorie_burn_rate_kcal_per_hour
```

Models:

```text
Ridge Regression
Random Forest Regressor
XGBoost Regressor
```

Metrics:

```text
RMSE
MAE
R2
```

Advanced note:

`session_duration_hours`, `calories_burned`, `calories_burned_clean`, and outlier proof columns are excluded from the regression features because they can leak the target. If target leakage happens, the model score may look unrealistically strong but will not represent real predictive performance.

### 5.2 Workout-Intensity Classification

Target:

```text
intensity_band
```

Models:

```text
Multinomial Logistic Regression
Random Forest Classifier
XGBoost Classifier
```

Metrics:

```text
Accuracy
Macro-F1
Confusion Matrix
```

Advanced note:

`intensity_band` is derived from BPM ratio. Therefore, `bpm_response_ratio`, `avg_bpm`, and `max_bpm` are excluded from the classifier features to prevent target leakage.

Outputs after the script runs:

```text
MODEL_RESULTS.md
models/best_calorie_regressor.joblib
models/best_intensity_classifier.joblib
models/week2_model_metadata.json
models/*_cv_predictions.csv
models/*_confusion_matrix.csv
docs/figures/week2/*.png
```

## 6. Week 2: Build the RAG Index

Run:

```powershell
python scripts\build_rag_index.py
```

What this script does:

| Step | Description |
|---|---|
| Load ExerciseDB | Reads `data/processed/exercisedb_cleaned_catalog.csv` |
| Load rule corpus | Reads `docs/rag/RAG_CORPUS.md` |
| Create documents | Converts each exercise and each rule into a retrieval document |
| Embed documents | Uses `all-MiniLM-L6-v2` to convert text into vectors |
| Store in ChromaDB | Saves the vectors into `chroma_db/` |
| Save manifest | Writes `docs/rag/rag_index_manifest.json` |

Expected output:

```json
{
  "collection": "smart_workout_knowledge",
  "embedding_model": "all-MiniLM-L6-v2",
  "exercise_documents": 1500,
  "rule_documents": 80,
  "total_documents": 1580
}
```

Important:

`chroma_db/` is a generated local folder. It should not be committed to Git because it can be rebuilt by running this script.

## 7. Week 2: Test RAG Retrieval

Run:

```powershell
python scripts\test_rag_retrieval.py
```

What this script does:

| Step | Description |
|---|---|
| Open ChromaDB | Opens the vector index created in the previous step |
| Embed sample query | Converts each sample query into a vector |
| Query top-5 | Retrieves the five nearest documents |
| Save report | Writes a Markdown report for manual relevance checking |

Output:

```text
docs/rag/rag_retrieval_test_results.md
```

Use this file to check whether RAG retrieves relevant evidence for queries such as:

```text
bodyweight chest exercise for low readiness
reduce workout volume after poor sleep
nutrition macro guidance for workout dashboard
```

## 8. Week 2 Notebook Wrapper

Open:

```text
notebooks/week2/smart_workout_week2_ml_rag_pipeline.ipynb
```

This notebook does not replace the scripts. It is a readable notebook wrapper for running and inspecting Week 2 outputs.

Use it when:

| Use case | Description |
|---|---|
| Running Week 2 from a notebook | Runs cells that call the Week 2 scripts |
| Inspecting outputs | Opens `MODEL_RESULTS.md`, the RAG manifest, and retrieval results |
| Preparing a presentation explanation | Uses Markdown cells as a narrative for the pipeline |

For the most reproducible rerun, use the scripts directly:

```powershell
python scripts\train_week2_ml.py
python scripts\build_rag_index.py
python scripts\test_rag_retrieval.py
```

## 9. Run the Backend API

The backend uses FastAPI and provides local endpoints for testing and demo work.

Set `PYTHONPATH`:

```powershell
$env:PYTHONPATH = "backend"
```

Run the backend:

```powershell
python -m uvicorn app.main:app --app-dir backend --reload --host 127.0.0.1 --port 8000
```

Open in a browser:

```text
http://127.0.0.1:8000
http://127.0.0.1:8000/docs
```

Important endpoints:

| Endpoint | Method | Purpose |
|---|---|---|
| `/api/v1/health` | GET | Checks that the API is running |
| `/api/v1/health/readiness` | GET | Checks whether required data assets are available |
| `/api/v1/dashboard/summary` | GET | Returns overview, GymDB relational, and lifestyle-clustering dashboard data |
| `/api/v1/workout/preprocess` | POST | Preprocesses a user profile |
| `/api/v1/workout/predict-calories` | POST | Runs the saved calorie regression model |
| `/api/v1/workout/predict-intensity` | POST | Runs the saved intensity classification model |
| `/api/v1/workout/recommend-exercises` | POST | Recommends exercises from ExerciseDB |
| `/api/v1/workout/generate-plan` | POST | Generates a structured workout plan from readiness, predicted intensity, goal, equipment, and recommended exercises |
| `/api/v1/chat` | POST | Runs the retrieval-grounded RAG chat endpoint |

## 10. Run the Frontend

Open another PowerShell window:

```powershell
cd "C:\Users\Windows\Desktop\125970-125934-125843\frontend"
cmd /c npm install
cmd /c npm run dev
```

Open:

```text
http://127.0.0.1:5173
```

Current main views:

| View | Purpose |
|---|---|
| `Overview` | High-level pipeline, dataset KPIs, model/data readiness, and cross-dataset charts |
| `Gym Membership` | Relational GymDB analytics from the cleaned marts |
| `Lifestyle Profiles` | Clustering-driven lifestyle and readiness archetypes |
| `Profile` | User-input form and readiness estimation |
| `Plan` | Prediction outputs, recommended exercises, and weekly split |
| `RAG Chat` | Grounded explanation tab |
| Floating assistant | Bottom-right RAG assistant available across the dashboard |

## 11. Test the Chat Endpoint

Open a second PowerShell terminal and run:

```powershell
$response = Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/v1/chat" -Method Post -ContentType "application/json" -Body '{"message":"beginner dumbbell chest workout after poor sleep"}'
$response | ConvertTo-Json -Depth 10
```

Expected result:

```text
grounded = true
retrieved_snippets = 5 items
```

Why the answer is still retrieval-grounded rather than a full assistant:

```text
Week 2 TODO says: retrieval only, no LLM yet
```

Therefore, `/chat` is not the final chatbot yet. It proves that the backend can retrieve grounding evidence from ExerciseDB and the curated rule corpus and assemble a grounded response.

## 12. Run Backend Tests

Run:

```powershell
$env:PYTHONPATH = "backend"
python -m pytest backend\tests -q
```

Current verified local result:

```text
12 passed, 2 warnings in 6.09s
```

The tests cover:

| Test area | What it checks |
|---|---|
| Health | API heartbeat and readiness payload |
| Workout preprocess | BMI category and input validation |
| Exercise recommendation | Real ExerciseDB IDs are used instead of hard-coded mock IDs |
| Fallback recommendation | Recommendations still work when no equipment is provided |
| Generate plan | The plan endpoint returns a structured non-mock weekly split with populated exercises |
| Dashboard summary | Dashboard payload still contains KPI and chart labels |
| Chat | Grounded answers and retrieved snippets are returned |

## 13. Recommended Full Rerun Order

If a teammate starts from a fresh local copy, use this order:

```powershell
cd "C:\Users\Windows\Desktop\125970-125934-125843"
python -m venv .venv
Set-ExecutionPolicy -Scope Process -ExecutionPolicy RemoteSigned
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
python -m pip install -r backend\requirements.txt
```

Then run Week 1:

```text
1. Open notebooks/week1/smart_workout_week1_complete_final_product.ipynb
2. Restart Kernel
3. Run All
4. Confirm data/processed and docs/figures/week1 outputs
```

Then run Week 2:

```powershell
python scripts\train_week2_ml.py
python scripts\build_rag_index.py
python scripts\test_rag_retrieval.py
```

Then run the backend:

```powershell
$env:PYTHONPATH = "backend"
python -m uvicorn app.main:app --app-dir backend --reload --host 127.0.0.1 --port 8000
```

Then run the frontend:

```powershell
cd frontend
cmd /c npm install
cmd /c npm run dev
```

## 14. Troubleshooting

### `No module named app`

Cause:

```text
PYTHONPATH was not set, or uvicorn was not launched with the backend app directory.
```

Fix:

```powershell
$env:PYTHONPATH = "backend"
python -m uvicorn app.main:app --app-dir backend --reload --host 127.0.0.1 --port 8000
```

### `No module named uvicorn`

Cause:

```text
backend requirements were not installed.
```

Fix:

```powershell
python -m pip install -r backend\requirements.txt
```

### `/api/v1/chat` returns `grounded = false`

Possible causes:

```text
chroma_db/ has not been created
RAG index has not been built
chromadb or sentence-transformers dependencies are missing
```

Fix:

```powershell
python scripts\build_rag_index.py
```

### Browser cannot open `127.0.0.1:8000`

Possible causes:

```text
backend server is not running
server was stopped
port 8000 is already in use
```

Fix by restarting the backend, or use a different port:

```powershell
python -m uvicorn app.main:app --app-dir backend --reload --host 127.0.0.1 --port 8001
```

Then open:

```text
http://127.0.0.1:8001/docs
```

### Frontend cannot open `127.0.0.1:5173`

Possible causes:

```text
frontend dev server is not running
npm dependencies were not installed
another process is already using the port
```

Fix:

```powershell
cd frontend
cmd /c npm install
cmd /c npm run dev
```

## 15. Git Check Before Commit

Check changed files:

```powershell
git status
```

Files that are usually safe to commit:

```text
README.md
docs/WEEK1_WEEK2_RUN_STEPS.md
notebooks/week1/*.ipynb
notebooks/week2/*.ipynb
scripts/*.py
backend/app/**/*.py
backend/tests/*.py
MODEL_RESULTS.md
models/*.joblib
models/*.csv
docs/figures/week1/*.png
docs/figures/week2/*.png
docs/rag/*.md
docs/rag/*.json
data/processed/*.csv
data/processed/*.json
```

Files that should not be committed:

```text
.venv/
chroma_db/
__pycache__/
.pytest_cache/
.ipynb_checkpoints/
```

## 16. Current Project Meaning

Current project state:

```text
Week 1:
Data foundation and descriptive analytics are ready.

Week 2:
ML training works.
RAG retrieval works.
Backend API runs locally.
Frontend dashboard runs locally.
Plan generation is now rule-based and more complete than the older prototype.
Chat endpoint retrieves evidence and assembles grounded answers, but does not generate final LLM answers yet.
```

Recommended next tasks:

```text
1. Add Tableau embedding to the final dashboard.
2. Capture final frontend screenshots and live demo evidence.
3. Decide whether to keep the current retrieval-grounded assistant for submission or add an external LLM API as a final enhancement step.
4. Improve /chat from retrieval-grounded response assembly into retrieval + LLM answer generation if time remains.
5. Expand RAG evaluation beyond 10 manual queries.
```
