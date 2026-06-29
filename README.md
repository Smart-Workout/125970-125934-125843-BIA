# Smart Workout DSS/BIS Project

Smart Workout is a Decision Support System (DSS) and Business Intelligence System (BIS) project for personalized workout planning. The current repository contains Week 1 data foundation work and Week 2 core ML/RAG work.

The project is built around four main ideas:

- Data preparation: inspect, clean, validate, and export reliable datasets.
- Descriptive analytics: summarize workout, sleep, nutrition, exercise, and gym-management patterns.
- Machine learning: train calorie-burn-rate regression and workout-intensity classification models.
- Retrieval-Augmented Generation (RAG): retrieve exercise instructions and curated workout rules for a future chat assistant.

## Current Status

Documentation status updated: `2026-06-29`

| Area | Status | Main output |
|---|---|---|
| Week 1 data foundation | Complete for Earth and Non scope | cleaned CSVs, validation tables, plots |
| Week 1 descriptive analytics | Complete for Earth and Non scope | EDA tables, GymDB marts, and PNG charts |
| Relational GymDB dashboard layer | Working | backend summary payload plus frontend `Gym Membership` tab |
| Lifestyle clustering dashboard layer | Working | cluster profile cards, scatter view, silhouette and archetype charts |
| Week 2 ML pipeline | Working | `MODEL_RESULTS.md`, `.joblib` models, SHAP/importance plots |
| Week 2 RAG pipeline | Working | ChromaDB index, retrieval test report, grounded chat snippets |
| Backend API prototype | Working locally | FastAPI endpoints under `/api/v1` with model-backed prediction endpoints |
| Plan generation workflow | Working and improved | rule-based weekly split, ExerciseDB-backed session assembly, RAG rationale snippets |
| Frontend dashboard shell | Working | BIA-inspired shell, floating assistant, proposal-aligned tabs |

## Remaining Proposal Gaps

Status checked on: `2026-06-29`

- The plan generator is no longer the old fixed-template prototype, but it may still need final tuning after local verification and professor feedback.
- Tableau embedding is still not implemented. The current dashboard is React + FastAPI only, even though the proposal mentions embedded Tableau views.
- Backend tests have now been verified on a normal local machine: `12 passed, 2 warnings in 6.09s` on `2026-06-29`.
- Final local verification and screenshot capture are still needed from a normal local machine for the report and presentation.

## Folder Structure

| Path | Purpose |
|---|---|
| `data/raw/` | Original raw datasets used by the project. |
| `data/raw/Gym Database Management System/` | Relational gym-management dataset with check-in fact table and dimension tables. |
| `data/processed/` | Cleaned Week 1 outputs, validation proof tables, dashboard marts, and model-ready datasets. |
| `docs/` | Project documentation, demo script, manual test checklist, figures, and RAG documents. |
| `docs/figures/week1/` | Week 1 EDA and dashboard-ready charts saved as PNG. |
| `docs/figures/week2/` | Week 2 confusion matrices and SHAP/fallback explanation plots. |
| `docs/rag/` | Curated RAG corpus, system prompt, chat examples, index manifest, and retrieval test reports. |
| `notebooks/week1/` | Week 1 notebooks for data cleaning, validation, EDA, and final-product preparation. |
| `notebooks/week2/` | Week 2 notebook for ML and RAG pipeline execution. |
| `scripts/` | Re-runnable Python scripts for Week 2 ML training, RAG indexing, and retrieval testing. |
| `backend/` | FastAPI backend application and tests. |
| `models/` | Week 2 trained model artifacts and cross-validation result tables. |
| `proposal/` | Proposal source, proposal PDF, and outline notes. |
| `requirements/` | Assignment requirements and supporting brief documents. |
| `references/` | Supporting reference material. |
| `TODO.md` | Working task list for weekly project planning. |

## Dataset Files

### Raw Data

| File or folder | Purpose |
|---|---|
| `data/raw/daily_food_nutrition_dataset.csv` | Nutrition dataset used to clean macro columns and summarize macro mix by meal type. |
| `data/raw/exercisedb_all_raw_flat.csv` | ExerciseDB raw catalogue used for exercise body parts, equipment, target muscles, and instructions. |
| `data/raw/gym_members_exercise_tracking.csv` | Workout-session dataset used for calories, BPM ratio, intensity band, and calorie-burn-rate ML target. |
| `data/raw/Sleep_health_and_lifestyle_dataset.csv` | Sleep/lifestyle dataset used for readiness rules and K-Means archetype clustering. |
| `data/raw/Gym Database Management System/checkin_checkout_history_updated.csv` | Large gym visit fact table with check-in/out history, workout type, and calories burned. |
| `data/raw/Gym Database Management System/users_data.csv` | Gym member dimension table. |
| `data/raw/Gym Database Management System/gym_locations_data.csv` | Gym location dimension table. |
| `data/raw/Gym Database Management System/subscription_plans.csv` | Subscription plan dimension table. |

### Processed Week 1 Data

| File | Purpose |
|---|---|
| `data/processed/week1_manifest_complete.json` | High-level manifest of Week 1 complete outputs. |
| `data/processed/week1_todo_completion_checklist.csv` | Evidence table mapping Week 1 outputs to TODO items. |
| `data/processed/week1_raw_inspection_summary.csv` | Raw dataset inspection summary. |
| `data/processed/week1_data_contract_validation.csv` | Validation summary proving expected data contracts. |
| `data/processed/week1_csv_load_log.csv` | CSV loading log for Week 1 data sources. |
| `data/processed/gym_cleaned_intensity_calories.csv` | Cleaned workout-session dataset used by Week 2 ML models. |
| `data/processed/gym_calorie_outlier_proof.csv` | Outlier proof table for calorie-burn cleaning. |
| `data/processed/exercisedb_cleaned_catalog.csv` | Cleaned exercise catalogue used by RAG indexing and exercise recommendations. |
| `data/processed/exercisedb_parse_proof.csv` | Proof table showing ExerciseDB list-field parsing results. |
| `data/processed/nutrition_cleaned_macros.csv` | Cleaned nutrition macro dataset. |
| `data/processed/nutrition_numeric_validation.csv` | Validation proof for numeric macro columns. |
| `data/processed/nutrition_csv_repair_log.csv` | Log of nutrition CSV repair decisions. |
| `data/processed/sleep_cleaned_readiness.csv` | Cleaned sleep dataset with readiness scores and readiness bands. |
| `data/processed/sleep_cleaned_readiness_clusters.csv` | Sleep readiness data with K-Means cluster assignments. |
| `data/processed/sleep_kmeans_silhouette_scores.csv` | Silhouette scores used to compare clustering options. |
| `data/processed/sleep_cluster_profile.csv` | Cluster profile table for interpreting sleep archetypes. |
| `data/processed/readiness_component_summary.csv` | Summary of readiness components such as sleep duration, quality, stress, and BMI. |

### Gym Database Warehouse Outputs

| File | Purpose |
|---|---|
| `data/processed/gymdb_raw_inspection_summary.csv` | Raw inspection summary for the Gym Database Management System tables. |
| `data/processed/gymdb_relationship_validation.csv` | Relationship validation between fact and dimension tables. |
| `data/processed/gymdb_table_cleaning_proof.csv` | Cleaning proof for GymDB tables. |
| `data/processed/gymdb_warehouse_overview.csv` | Overview of the warehouse-style fact/dimension structure. |
| `data/processed/gymdb_fact_sessions_sample.csv` | Sample fact table for session-level analysis. |
| `data/processed/gymdb_dim_users_cleaned.csv` | Cleaned member dimension table. |
| `data/processed/gymdb_dim_locations_cleaned.csv` | Cleaned location dimension table. |
| `data/processed/gymdb_dim_subscription_plans_cleaned.csv` | Cleaned subscription plan dimension table. |
| `data/processed/gymdb_mart_hourly_usage.csv` | Dashboard mart for hourly usage patterns. |
| `data/processed/gymdb_mart_location_utilization.csv` | Dashboard mart for location utilization. |
| `data/processed/gymdb_mart_monthly_activity.csv` | Dashboard mart for monthly activity. |
| `data/processed/gymdb_mart_session_by_workout.csv` | Dashboard mart for workout-type session mix. |
| `data/processed/gymdb_mart_subscription_summary.csv` | Dashboard mart for subscription plan summary. |
| `data/processed/gymdb_mart_gym_type_workout_summary.csv` | Dashboard mart for gym type and workout pattern comparison. |

## Notebook Files

| Notebook | Purpose |
|---|---|
| `notebooks/week1/smart_workout_week1_complete_final_product.ipynb` | Main Week 1 final notebook. It inspects raw data, cleans datasets, proves validation, creates summary tables, exports processed data, and saves dashboard-ready plots. |
| `notebooks/week1/smart_workout_week1_complete_final_product_backup.ipynb` | Backup copy of the older Week 1 notebook before the latest Gym Database Management System integration. |
| `notebooks/week2/smart_workout_week2_ml_rag_pipeline.ipynb` | Week 2 notebook wrapper for running ML training, RAG indexing, retrieval tests, and output inspection. |
| `notebooks/eda-on-gym-members-data-analysis.ipynb` | Earlier exploratory notebook for gym-member exercise analysis. |

## Week 2 Script Files

| Script | What it does | Main outputs |
|---|---|---|
| `scripts/train_week2_ml.py` | Trains calorie-burn-rate regression models and workout-intensity classifiers. It prevents target leakage, uses 5-fold CV, compares models, saves selected pipelines, and creates model explanation plots. | `MODEL_RESULTS.md`, `models/*.joblib`, `models/*_cv_predictions.csv`, `docs/figures/week2/*.png` |
| `scripts/build_rag_index.py` | Builds a local ChromaDB vector index from 1,500 ExerciseDB instructions and curated rule snippets. | `chroma_db/`, `docs/rag/rag_index_manifest.json` |
| `scripts/test_rag_retrieval.py` | Runs 10 sample RAG queries and saves top-5 retrieval results for manual relevance checking. | `docs/rag/rag_retrieval_test_results.md` |

## Week 2 Model Outputs

| File | Purpose |
|---|---|
| `MODEL_RESULTS.md` | Human-readable model comparison report for Week 2. |
| `models/best_calorie_regressor.joblib` | Selected regression pipeline for calorie-burn-rate prediction. |
| `models/best_intensity_classifier.joblib` | Selected classifier pipeline for Low/Mid/High workout-intensity prediction. |
| `models/week2_model_metadata.json` | Metadata for selected models, feature lists, CV settings, and explanation mode. |
| `models/*_regression_cv_predictions.csv` | Cross-validation prediction tables for regression models. |
| `models/*_classification_cv_predictions.csv` | Cross-validation prediction tables for classifier models. |
| `models/*_confusion_matrix.csv` | Confusion matrix tables for classifier comparison. |
| `docs/figures/week2/selected_calorie_regressor_shap.png` | Explanation plot for selected calorie regression model. |
| `docs/figures/week2/selected_intensity_classifier_shap.png` | Explanation/fallback importance plot for selected intensity classifier. |
| `docs/figures/week2/*_confusion_matrix.png` | Visual confusion matrices for classifier models. |

## RAG Files

| File | Purpose |
|---|---|
| `docs/rag/RAG_CORPUS.md` | Curated workout-rule corpus with categories such as recovery, readiness scaling, equipment substitution, schedule/split, experience level, safety, exercise selection, and nutrition context. |
| `docs/rag/system_prompt.md` | Draft system prompt for the future Smart Workout chat assistant. |
| `docs/rag/rag_chat_examples.md` | Few-shot chat examples for future LLM behavior. |
| `docs/rag/rag_index_manifest.json` | Proof that the RAG index was built, including document counts and chunk strategy. |
| `docs/rag/rag_retrieval_test_queries.md` | The 10 sample queries used for retrieval testing. |
| `docs/rag/rag_retrieval_test_results.md` | Top-5 retrieval output for each sample query. |
| `chroma_db/` | Local persistent ChromaDB vector database. This folder is generated locally and ignored by Git. |

## Backend Files

| File | Purpose |
|---|---|
| `backend/requirements.txt` | Python dependencies for backend, ML, RAG, and testing. |
| `backend/app/main.py` | FastAPI application entry point. It registers health, workout, dashboard, and chat routers. |
| `backend/app/core/config.py` | Shared configuration and project path detection. |
| `backend/app/core/constants.py` | Shared workout-intensity rule table for Low/Mid/High planning. |
| `backend/app/api/v1/health.py` | Health and readiness endpoints. |
| `backend/app/api/v1/workout.py` | Workout preprocessing, model-backed calorie prediction, model-backed intensity prediction, recommendation, and plan generation endpoints. |
| `backend/app/api/v1/dashboard.py` | Dashboard summary endpoint. |
| `backend/app/api/v1/chat.py` | Grounded chat endpoint built from retrieved rules and current plan context. |
| `backend/app/schemas/*.py` | Pydantic request/response schemas. |
| `backend/app/services/data_service.py` | CSV loading, parsing, and readiness helper functions. |
| `backend/app/services/dashboard_service.py` | Dashboard summary aggregation service. |
| `backend/app/services/workout_service.py` | Workout profile processing and ExerciseDB recommendation logic. |
| `backend/app/services/rag_service.py` | ChromaDB retrieval service with fallback corpus search. |
| `backend/app/services/chat_service.py` | Grounded chat response builder using retrieved snippets and plan context. |
| `backend/tests/*.py` | API regression tests for health, workout, recommendation, plan, and dashboard behavior. |

## Quick Start

Open PowerShell in the repository root:

```powershell
cd "C:\Users\Windows\Desktop\125970-125934-125843"
```

Create and activate a virtual environment:

```powershell
python -m venv .venv
Set-ExecutionPolicy -Scope Process -ExecutionPolicy RemoteSigned
.\.venv\Scripts\Activate.ps1
```

Install dependencies:

```powershell
python -m pip install --upgrade pip
python -m pip install -r backend\requirements.txt
```

Run Week 2 ML:

```powershell
python scripts\train_week2_ml.py
```

Build and test RAG:

```powershell
python scripts\build_rag_index.py
python scripts\test_rag_retrieval.py
```

Run the backend:

```powershell
$env:PYTHONPATH = "backend"
python -m uvicorn app.main:app --app-dir backend --reload --host 127.0.0.1 --port 8000
```

Open another PowerShell window and run the frontend:

```powershell
cd "C:\Users\Windows\Desktop\125970-125934-125843\frontend"
cmd /c npm install
cmd /c npm run dev
```

Open:

- Frontend: `http://127.0.0.1:5173`
- Root API: `http://127.0.0.1:8000`
- API docs: `http://127.0.0.1:8000/docs`
- Health check: `http://127.0.0.1:8000/api/v1/health`

Recommended local check flow:

1. Open Swagger and confirm `/api/v1/health`, `/api/v1/dashboard/summary`, `/api/v1/workout/*`, and `/api/v1/chat` load.
2. Open the frontend and inspect `Overview`, `Gym Membership`, and `Lifestyle Profiles`.
3. Submit a sample profile from the `Profile` tab.
4. Inspect the `Plan` tab for readiness, calories, intensity, recommended exercises, and weekly split.
5. Open the floating assistant or `RAG Chat` tab and ask:
   - `Why this plan?`
   - `Can I replace barbell exercises with dumbbells?`
6. Capture screenshots for the report and presentation once the output looks correct.

## Detailed Workflow

For a step-by-step guide from Week 1 to the current Week 2 state, read:

`docs/WEEK1_WEEK2_RUN_STEPS.md`

## What Is Done

- Week 1 raw-data inspection, cleaning, validation, and EDA are complete.
- GymDB fact and dimension cleaning plus descriptive marts are complete.
- Lifestyle clustering and readiness-preparation outputs are complete.
- Week 2 calorie regression and intensity classification training are complete.
- Saved model artifacts are already wired into the backend prediction endpoints.
- RAG corpus creation, ChromaDB indexing, retrieval testing, and grounded chat responses are complete at prototype level.
- Frontend dashboard now includes:
  - `Overview`
  - `Gym Membership`
  - `Lifestyle Profiles`
  - `Profile`
  - `Plan`
  - `RAG Chat`
  - floating bottom-right assistant
- The weekly plan generator now produces a structured split using readiness, predicted intensity, goal, target body part, equipment, and ExerciseDB candidates.

## What Still Needs To Be Done

- Add the final Tableau embeds promised in the proposal.
- Run the full backend `pytest` suite on a normal local machine.
- Do a full local walkthrough and capture final screenshots for the report and presentation.
- Tighten the final plan-generator logic further if needed after local inspection and professor feedback.
- Decide whether to add an external LLM API for a richer assistant, or keep the current retrieval-grounded assistant for submission.

## Git Notes

Before committing, check the working tree:

```powershell
git status
```

Recommended commit groups:

```powershell
git add README.md docs/WEEK1_WEEK2_RUN_STEPS.md
git commit -m "Document Week 1 and Week 2 workflow"
```

For generated Week 2 artifacts:

```powershell
git add MODEL_RESULTS.md models docs/figures/week2 docs/rag/rag_index_manifest.json docs/rag/rag_retrieval_test_queries.md docs/rag/rag_retrieval_test_results.md
git commit -m "Add Week 2 ML and RAG artifacts"
```

`chroma_db/` and `.venv/` should not be committed because they are generated local folders.
