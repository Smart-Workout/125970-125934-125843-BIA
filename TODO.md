# Smart Workout Roadmap

This file tracks the current project state and the remaining work for the Smart Workout DSS/BIS prototype.

Status updated: `2026-06-29`

## Current Project State

The project is already functioning as a working prototype.

### Completed
- Week 1 data cleaning, validation, and EDA
- GymDB fact/dimension preparation and dashboard marts
- lifestyle clustering and readiness-related outputs
- ML training and model selection
- saved model artifacts connected to backend inference
- FastAPI backend for:
  - preprocessing
  - calorie prediction
  - intensity prediction
  - exercise recommendation
  - plan generation
  - dashboard summary
  - retrieval-grounded chat
- React frontend for:
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
- final tuning of the improved rule-based plan generator after local walkthrough
- progress-presentation and report evidence packaging

### To Do
- add Tableau embedding
- capture final screenshots for the presentation and report
- complete final local walkthrough of frontend + backend
- decide whether to keep the current retrieval-grounded assistant as final scope or add an external LLM API as an enhancement

## Immediate Next Steps

### 1. Presentation Evidence
- [ ] capture final screenshots for:
  - `Overview`
  - `Gym Membership`
  - `Lifestyle Profiles`
  - `Profile`
  - `Plan`
  - floating assistant
- [ ] finalize the progress presentation deck
- [ ] align screenshots, captions, and demo flow

### 2. Dashboard Completion
- [ ] add Tableau embedding placeholders or actual Tableau integration
- [ ] verify that React dashboard content and Tableau direction stay consistent with the proposal

### 3. Final Product Verification
- [ ] run backend and frontend locally together
- [ ] test the full flow:
  - profile input
  - readiness estimation
  - calorie prediction
  - intensity prediction
  - exercise recommendation
  - plan generation
  - RAG explanation
- [ ] confirm that the floating assistant behaves correctly in live use

### 4. Optional Enhancement
- [ ] decide whether to add an external LLM API
- [ ] only proceed if the current prototype, presentation, and Tableau work are already stable

## Current Remaining Gaps Against Proposal

### Required
- [ ] Tableau embedding is still not implemented
- [ ] final presentation/report screenshots still need to be captured

### Optional / Enhancement
- [ ] external LLM API for a richer assistant

## Notes

- The current assistant works without an LLM API.
- The current assistant is retrieval-grounded, not a full generative assistant.
- The correct wording for the project remains:
  - readiness is estimated first
  - calorie burn and intensity are predicted after preprocessing
  - the plan is generated after prediction
