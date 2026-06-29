# Frontend Manual Test Checklist

Owner: Yolanda  
Use this checklist before taking screenshots for the report.

## Environment

- [ ] Backend starts with `python -m uvicorn app.main:app --app-dir backend --reload --host 127.0.0.1 --port 8000`.
- [ ] Frontend starts with `cmd /c npm run dev`.
- [ ] Frontend opens at `http://127.0.0.1:5173`.
- [ ] Swagger opens at `http://127.0.0.1:8000/docs`.
- [ ] `GET /api/v1/health` returns `200`.

## Screenshot evidence to capture

- [ ] Swagger page showing the main API endpoints.
- [ ] Overview tab with KPI cards and charts.
- [ ] Gym Membership tab.
- [ ] Lifestyle Profiles tab.
- [ ] Profile tab before submission.
- [ ] Profile tab showing validation message for invalid input.
- [ ] Plan tab after successful submission.
- [ ] Exercise table showing ExerciseDB recommendations.
- [ ] Intensity probability bars.
- [ ] Generated weekly plan card.
- [ ] Retrieved RAG snippets in the Plan tab.
- [ ] RAG Chat tab with one question and answer.
- [ ] Floating assistant with one grounded answer visible.
- [ ] Browser devtools Network tab showing successful API calls, if useful for report evidence.

## Happy-path test

Use this sample profile:

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

Expected result:

- [ ] No frontend error banner appears.
- [ ] Readiness result appears.
- [ ] Calorie prediction appears.
- [ ] Intensity label appears.
- [ ] Probability bars are visible.
- [ ] Exercise table has at least one row.
- [ ] Weekly plan has days, exercises, sets, reps, and rest.
- [ ] RAG snippets are visible.

## Validation test

Try invalid values:

- Age below allowed range.
- Height or weight left empty.
- Blood pressure not in `120/80` format.
- No target body part selected.

Expected result:

- [ ] Frontend validation message is visible.
- [ ] Submit does not silently fail.
- [ ] If backend validation catches the issue, an error message is shown.

## No-equipment fallback test

Submit a profile with only `body weight` or no selected equipment.

Expected result:

- [ ] Recommender still returns exercises.
- [ ] Returned exercises are bodyweight-friendly when possible.
- [ ] Plan still generates.

## Chat test

Ask:

```text
Why did you choose these exercises?
```

Expected result:

- [ ] Chat answer appears.
- [ ] Retrieved snippets appear with source/category labels.
- [ ] UI stays responsive while loading.

## Floating assistant test

- [ ] Assistant opens from the bottom-right launcher.
- [ ] Chat answer remains readable and is not covered by retrieved evidence.
- [ ] Assistant content scrolls correctly when the answer becomes longer.

## Final browser checks

- [ ] Desktop layout: no overlapping text or cards.
- [ ] Mobile/narrow layout: tabs and cards remain usable.
- [ ] Refresh button still reloads dashboard summary.
- [ ] Build passes with `npm run build`.
