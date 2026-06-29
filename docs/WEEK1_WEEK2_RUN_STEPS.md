# Week 1 to Week 2 Run Steps

This document explains how to run the Smart Workout project from the Week 1 data foundation stage to the latest Week 2 ML, RAG, and backend API stage.

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
cd "C:\Users\Waranon-021\Desktop\125970-125934-125843-BIA"
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
| `/api/v1/dashboard/summary` | GET | Returns dashboard summary data |
| `/api/v1/workout/preprocess` | POST | Preprocesses a user profile |
| `/api/v1/workout/recommend-exercises` | POST | Recommends exercises from ExerciseDB |
| `/api/v1/workout/generate-plan` | POST | Generates a mock workout plan |
| `/api/v1/chat` | POST | Runs the retrieval-only RAG chat stub |

## 10. Test the Chat Endpoint

Open a second PowerShell terminal and run:

```powershell
$response = Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/v1/chat" -Method Post -ContentType "application/json" -Body '{"message":"beginner dumbbell chest workout after poor sleep"}'
$response | ConvertTo-Json -Depth 10
```

Expected result:

```text
mock_mode = true
grounded = true
retrieved_snippets = 5 items
```

Why the answer is still a retrieval preview:

```text
Week 2 TODO says: retrieval only, no LLM yet
```

Therefore, `/chat` is not the final chatbot yet. It proves that the backend can retrieve grounding evidence from ExerciseDB and the curated rule corpus.

## 11. Run Backend Tests

Run:

```powershell
$env:PYTHONPATH = "backend"
python -m pytest backend\tests -q
```

The tests cover:

| Test area | What it checks |
|---|---|
| Health | API heartbeat and readiness payload |
| Workout preprocess | BMI category and input validation |
| Exercise recommendation | Real ExerciseDB IDs are used instead of hard-coded mock IDs |
| Fallback recommendation | Recommendations still work when no equipment is provided |
| Generate plan | The plan endpoint still returns a response |
| Dashboard summary | Dashboard payload still contains KPI and chart labels |

## 12. Recommended Full Rerun Order

If a teammate starts from a fresh local copy, use this order:

```powershell
cd "C:\Users\Waranon-021\Desktop\125970-125934-125843-BIA"
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

## 13. Troubleshooting

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

### `/api/v1/chat` returns `mock_mode = true`

This is expected. Week 2 only implements retrieval. Final LLM answer generation is not connected yet.

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

## 14. Git Check Before Commit

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

## 15. Current Week 2 Meaning

Current project state:

```text
Week 1:
Data foundation and descriptive analytics are ready.

Week 2:
ML training works.
RAG retrieval works.
Backend API runs locally.
Chat endpoint retrieves evidence but does not generate final LLM answers yet.
```

Recommended next tasks:

```text
1. Integrate saved .joblib models into predict-calories and predict-intensity endpoints.
2. Improve /chat from retrieval-only into retrieval + LLM answer generation.
3. Add frontend screens that call backend endpoints.
4. Add model input mapping from user profile to training feature schema.
5. Expand RAG evaluation beyond 10 manual queries.
```
