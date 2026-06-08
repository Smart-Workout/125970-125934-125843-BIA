# Smart Workout — Implementation TODO

**Project:** Smart Workout DSS/BIS for Personalized Weight Training
**Team:** Yolanda (st125970), Non (st125934), Earth (st125843)
**Implementation window:** 23 Jun – 20 Jul 2026 (4 weeks)
**Goal:** Working prototype + evaluated models + demo + final report

---

## Suggested role split (edit as you like)

| Member | Primary lane | Why |
|---|---|---|
| **Yolanda** | Frontend lead — React dashboard, form, chat widget UI | Heaviest single piece; needs one owner |
| **Non** | Backend/ML lead — FastAPI, ML training & evaluation, integration | Connects everything |
| **Earth** | RAG/Data lead — preprocessing, ChromaDB, rule corpus, plan generator logic | The knowledge-grounding work |

Adjust based on individual strengths. Pair on hard pieces, don't silo.

---

## Project management (Day-1 setup)

### Tooling
- [ ] Pick communication channel (Discord / LINE / Slack) — pin a #smart-workout room
- [ ] Shared Google Drive folder (figures, recordings, planning docs)
- [ ] GitHub repo with **branch protection** on `main` (no direct pushes)
- [ ] Branching: `main` ← PR from `feat/<feature-name>` branches
- [ ] PR rule: at least 1 review before merge
- [ ] GitHub Issues with milestones for W1 / W2 / W3 / W4

### Cadence
- **Daily standup** (15 min, async in chat OK): yesterday / today / blocked-on
- **Mid-week sync** (Wed, 30 min): check Week deliverable status; reassign if behind
- **End-of-week retro** (Sun, 30 min): what worked / what didn't / change next week
- **Final week**: daily in-person sync (integration crunch)

---

## Week 1 (23–29 Jun): Foundation

### Data (Earth + Non)
- [ ] Set up shared GitHub repo + branch protection + README
- [ ] Set up Python venv with pinned versions (pandas, scikit-learn, xgboost, chromadb, sentence-transformers, fastapi, uvicorn, shap, pydantic)
- [ ] Load + inspect all 4 CSVs (one notebook per dataset)
- [ ] Clean Sleep dataset: split blood pressure into systolic/diastolic, normalize BMI categories
- [ ] Clean Gym Members dataset: verify no missing, derive BPM-response ratio (Avg/Max), bin into Low/Mid/High intensity tertiles (≤0.70, 0.70–0.85, ≥0.85)
- [ ] Clean ExerciseDB: parse `bodyParts`, `equipments`, `targetMuscles` from string-list format → proper lists
- [ ] Clean Nutrition dataset: standardize macro columns
- [ ] Derive Training Readiness rule from Sleep dataset (composite of sleep quality + duration + stress + BMI → Low/Mid/High band)
- [ ] Outlier check on Calories_Burned (drop or cap >3σ)

### Descriptive (Earth)
- [ ] K-Means clustering on Sleep dataset → 3–4 user archetypes (try k=3, k=4, pick by silhouette score)
- [ ] Cross-dataset EDA: workout-type distribution, calorie-burn patterns by experience, exercise coverage by body part, nutrition macro mix by meal type
- [ ] Save EDA plots as PNG (for dashboard later)

### Project skeleton (Non)
- [ ] FastAPI hello-world endpoint + auto-Swagger at `/docs`
- [ ] React + Vite project scaffolded with TailwindCSS + shadcn/ui setup
- [ ] CORS configured so frontend can call backend
- [ ] Define API contract: request/response JSON shapes for `/predict-calories`, `/predict-intensity`, `/recommend-exercises`, `/generate-plan`, `/chat`

### RAG knowledge corpus drafting (Earth, ongoing)
- [ ] Start writing the curated rule corpus (target ~50–100 snippets by end of Week 2)
- [ ] Draft system prompt + 5–10 few-shot examples for the chat

### Frontend design lock-in (Yolanda) — see "Frontend design decisions" section below
- [ ] Pick component library (shadcn/ui), chart library (Recharts), state mgmt (React Context), routing (React Router v6)
- [ ] Hand-sketch wireframes for all 3 dashboard views + form + chat widget

**Week 1 deliverable:** All 4 datasets clean, K-Means clusters done, repo + venv + FastAPI/React skeletons running, wireframes locked, rule corpus 30% drafted.

---

## Week 2 (30 Jun – 6 Jul): Core ML + RAG

### ML pipeline (Non) — see "ML pipeline details" below
- [ ] **Calorie-burn-rate regression**: train Ridge, Random Forest, XGBoost on gym dataset (target = Calories_Burned / Session_Duration; exclude Session_Duration from features)
  - [ ] Apply StandardScaler for Ridge (tree models don't need it)
  - [ ] 5-fold cross-validation, `random_state=42` for reproducibility
  - [ ] Report RMSE, MAE, R² for each model
  - [ ] Select best, save as `.joblib` artifact in `models/`
- [ ] **Workout-intensity classifier**: train Logistic Regression, Random Forest, XGBoost on gym dataset (target = intensity tertile derived from BPM ratio)
  - [ ] Stratified 5-fold CV
  - [ ] Report accuracy, macro-F1, confusion matrix per model
  - [ ] Select best, save artifact
- [ ] Generate SHAP plots for selected models (save as PNG)
- [ ] Write `MODEL_RESULTS.md` with comparison table

### RAG pipeline (Earth)
- [ ] Install ChromaDB locally (persistent client, path `./chroma_db/`)
- [ ] Ingest all 1,500 ExerciseDB instructions as documents with metadata (`body_parts`, `equipment`, `target_muscles`)
- [ ] Ingest the curated rule corpus (target ~50 snippets by end of week) with category metadata
- [ ] Embed with `all-MiniLM-L6-v2` sentence-transformer
- [ ] Decide chunk strategy (full instruction set vs sentence-level)
- [ ] Test retrieval with 10 sample queries; verify top-5 are relevant
- [ ] Build `/chat` endpoint stub (retrieval only, no LLM yet)

### Backend endpoints (Non)
- [ ] `POST /preprocess` → takes user form input, returns feature vector
- [ ] `POST /predict-calories` → returns calorie-burn rate + confidence
- [ ] `POST /predict-intensity` → returns intensity band + class probabilities
- [ ] `POST /recommend-exercises` → filters ExerciseDB by body part + equipment
- [ ] Pydantic schemas for all request/response models
- [ ] FastAPI auto-Swagger endpoint reviewed at `/docs`

### Frontend shell (Yolanda)
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

### Plan generator (Earth)
- [ ] Write rule-based plan generator
  - Input: predicted intensity + readiness + body part + equipment + filtered exercise list
  - Output: structured plan (split, exercises with sets/reps/rest, intensity load)
- [ ] Rules:
  - Intensity High → 4–5 sets, lower reps (5–8), longer rest (2–3 min)
  - Intensity Mid → 3–4 sets, 8–12 reps, 90s rest
  - Intensity Low → 2–3 sets, 12–15 reps OR deload/mobility focus
  - Pull RAG snippets for plan rationale and equipment substitutions
- [ ] `POST /generate-plan` endpoint returning JSON plan

### LLM chat integration (Non + Earth) — see "LLM integration playbook" below
- [ ] Pick LLM provider (OpenAI GPT-4o-mini OR Grok — whichever team has API access for)
- [ ] Store API key in `.env`; never commit
- [ ] Write system prompt anchoring assistant to RAG context (see playbook template)
- [ ] `POST /chat` endpoint with streaming response
- [ ] **Tier 1 refinement** (must-have): equipment substitution ("substitute dumbbells for barbell" → deterministic swap)
- [ ] **Tier 2 refinement** (target): intensity tweak ("make Tuesday lighter" → reduce sets/reps for that day)
- [ ] **Tier 3 refinement** (stretch): free-form modification (LLM function-calling for plan edits)
- [ ] Write 5–10 example Q&A test cases; run and verify groundedness

### Dashboard views (Yolanda)
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

### Integration (all)
- [ ] End-to-end test: form → preprocess → predict → recommend → plan → display
- [ ] Mid-week demo internally — every component connected even if rough

**Week 3 deliverable:** Plan generation working, dashboard 3 views functional, chat answers Q&A and does Tier 1 (equipment substitution) refinement.

---

## Week 4 (14–20 Jul): Polish + Evaluation + Report

### Polish (all)
- [ ] Fix bugs from Week 3 integration
- [ ] Mobile-responsive check on dashboard (use Tailwind `md:` / `lg:` breakpoints)
- [ ] Loading states and error handling on all API calls
- [ ] Try Tier 2 refinement if Tier 1 stable
- [ ] Smooth visual polish (consistent spacing, typography, color scheme)

### Evaluation (Non)
- [ ] Document final ML results: best model per task + CV metrics + confusion matrices + SHAP plots
- [ ] Run a small user test (3–5 classmates if possible): record their feedback on form + plan + chat
- [ ] Latency benchmarks: time from form submit to plan render
- [ ] Cost benchmark: total LLM tokens used across testing

### Final Report (all — parallelize chapters) — see "Submission / admin" below
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
  - **Local-only (recommended for 4-week scope)**: simpler, no infra cost; team runs on laptop
  - **Deployed (stretch)**: prof can access via URL; adds 2–3 days; more polish

### If local-only
- [ ] Docker Compose with 3 services (backend, frontend, chromadb)
- [ ] Root `README.md` with `docker compose up` instructions
- [ ] Demo runs on team laptop during presentation

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
- [ ] **Scaling:** StandardScaler for Ridge & Logistic; not needed for tree models

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
- Tiebreaker: prefer simpler model (Ridge > Random Forest > XGBoost)

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
| Ollama too slow on team laptops | High | Fall back to OpenAI/Grok API (proposal already supports either) |
| LLM API quota exhausts mid-demo | Medium | Cache last working chat responses; screenshots as live-demo backup |
| XGBoost fails to converge / takes too long | Low | Drop to Random Forest only; report as model-selection finding |
| React dashboard runs over budget | High | Cut View 3 (RAG explanation) to a side-panel inside View 2 |
| ChromaDB metadata-filter bugs | Medium | Use Python-side filtering on retrieved docs instead |
| Plan refinement Tier 2/3 too complex | Medium | Ship Tier 1 only; document Tier 2/3 in final report as future work |
| Team member sick / unavailable | Medium | Pair-buddy each piece so no single point of failure |
| LaTeX final-report formatting blocker | Low | Use senior's template directly; no custom styling |
| Form-to-ML data type mismatch | Medium | Use Pydantic + Zod with shared schema definition |
| User test recruitment fails | Low | Use teammates + 2–3 classmates as informal testers |

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
1. React dashboard (5–7 days; one person owns it)
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
