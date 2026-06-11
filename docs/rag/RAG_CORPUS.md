# Smart Workout RAG Corpus

This corpus provides curated rule snippets for the Smart Workout DSS/BIS system. Each snippet is written as a short factual rule for retrieval, plan explanation, and chat grounding.

---

## Recovery

### recovery_001
Category: Recovery  
Applies to: sleep_duration < 6  
Rule: If sleep duration is below 6 hours, reduce training volume by 20-30% for that session.  
Use in system: Readiness explanation, plan adjustment, chat answer.

### recovery_002
Category: Recovery  
Applies to: stress_level >= 7  
Rule: High stress should reduce workout intensity and prioritize controlled movements, lighter loads, or mobility work.  
Use in system: Readiness explanation, low-recovery workout adjustment.

### recovery_003
Category: Recovery  
Applies to: same muscle group trained recently  
Rule: The same major muscle group should not be trained heavily on two consecutive days.  
Use in system: Weekly schedule generation, split validation.

### recovery_004
Category: Recovery  
Applies to: heavy compound lifts  
Rule: Heavy compound lifts such as squats, deadlifts, and bench presses usually require at least 48 hours of recovery before repeating the same movement pattern.  
Use in system: Plan generator, recovery warning.

### recovery_005
Category: Recovery  
Applies to: low readiness + high fatigue  
Rule: Low readiness combined with high fatigue should shift the session toward technique practice, stretching, or low-intensity accessory work.  
Use in system: Plan adjustment, chat explanation.

---

## Readiness Scaling

### readiness_001
Category: Readiness Scaling  
Applies to: readiness_band = Low  
Rule: Low readiness should reduce total sets, avoid maximal loads, and emphasize mobility, form, and light accessory exercises.  
Use in system: Plan generator, readiness card.

### readiness_002
Category: Readiness Scaling  
Applies to: readiness_band = Mid  
Rule: Mid readiness supports moderate training volume with 3-4 sets, 8-12 repetitions, and controlled rest periods.  
Use in system: Plan generator.

### readiness_003
Category: Readiness Scaling  
Applies to: readiness_band = High  
Rule: High readiness supports higher training volume with 4-5 sets, heavier loads, and longer rest for compound movements.  
Use in system: Plan generator, intensity explanation.

### readiness_004
Category: Readiness Scaling  
Applies to: low sleep quality  
Rule: Low sleep quality should lower the recommended workout intensity even when planned training volume is high.  
Use in system: Readiness explanation, plan adjustment.

### readiness_005
Category: Readiness Scaling  
Applies to: high stress + low sleep  
Rule: High stress combined with low sleep should prioritize recovery-focused training over heavy strength work.  
Use in system: Safety note, chat answer.

---

## Equipment Substitution

### equipment_001
Category: Equipment Substitution  
Applies to: barbell unavailable  
Rule: Barbell exercises can often be substituted with dumbbell variations that train the same target muscle.  
Use in system: Exercise substitution, chat refinement.

### equipment_002
Category: Equipment Substitution  
Applies to: cable machine unavailable  
Rule: Cable exercises can often be replaced with resistance-band exercises that follow a similar pulling or pressing direction.  
Use in system: Equipment substitution.

### equipment_003
Category: Equipment Substitution  
Applies to: machine unavailable  
Rule: Machine-based exercises can often be replaced with dumbbell, band, or bodyweight alternatives that target the same body part.  
Use in system: Exercise recommender fallback.

### equipment_004
Category: Equipment Substitution  
Applies to: no equipment available  
Rule: When no equipment is available, bodyweight exercises should be prioritized before removing the target muscle from the plan.  
Use in system: Home workout plan generation.

### equipment_005
Category: Equipment Substitution  
Applies to: dumbbell unavailable  
Rule: Dumbbell exercises can often be replaced with resistance-band or bodyweight movements when the same movement pattern can be preserved.  
Use in system: Chat refinement, plan generator.

---

## Schedule / Split

### schedule_001
Category: Schedule / Split  
Applies to: training_days_per_week = 2  
Rule: A 2-day-per-week plan should usually use full-body sessions with recovery days between workouts.  
Use in system: Weekly plan generation.

### schedule_002
Category: Schedule / Split  
Applies to: training_days_per_week = 3  
Rule: A 3-day-per-week plan can use full-body rotation or push-pull-legs with rest days between sessions.  
Use in system: Weekly split selection.

### schedule_003
Category: Schedule / Split  
Applies to: training_days_per_week = 4  
Rule: A 4-day-per-week plan can use an upper-lower split to balance training volume and recovery.  
Use in system: Weekly split selection.

### schedule_004
Category: Schedule / Split  
Applies to: training_days_per_week = 5  
Rule: A 5-day-per-week plan can use a body-part split when recovery and experience level are sufficient.  
Use in system: Advanced schedule generation.

### schedule_005
Category: Schedule / Split  
Applies to: low readiness schedule  
Rule: Low readiness should add more rest days or reduce the number of hard training days in the weekly plan.  
Use in system: Readiness-aware scheduling.

---

## Experience Level

### experience_001
Category: Experience Level  
Applies to: experience_level = 1  
Rule: Beginners should prioritize simple movements, controlled tempo, and moderate loads before advanced training methods.  
Use in system: Beginner plan generation.

### experience_002
Category: Experience Level  
Applies to: experience_level = 1  
Rule: Beginner plans should avoid too many complex free-weight exercises in the same session.  
Use in system: Exercise selection, safety note.

### experience_003
Category: Experience Level  
Applies to: experience_level = 2  
Rule: Intermediate users can combine compound movements with accessory exercises to improve strength and muscle balance.  
Use in system: Intermediate plan generation.

### experience_004
Category: Experience Level  
Applies to: experience_level = 3  
Rule: Advanced users can tolerate higher training volume when readiness, sleep, and stress indicators are favorable.  
Use in system: Advanced plan generation.

### experience_005
Category: Experience Level  
Applies to: experience_level = 3 + low readiness  
Rule: Advanced experience does not override low readiness; training volume should still be reduced when recovery indicators are poor.  
Use in system: Readiness explanation, plan adjustment.

---

## Safety

### safety_001
Category: Safety  
Applies to: systolic_bp >= 140 or diastolic_bp >= 90  
Rule: Elevated blood pressure should trigger a lighter plan and avoid heavy breath-holding or maximal-effort lifting.  
Use in system: Safety warning, plan adjustment.

### safety_002
Category: Safety  
Applies to: resting_heart_rate >= 90  
Rule: High resting heart rate should reduce session intensity and increase rest time during the workout.  
Use in system: Safety warning, readiness adjustment.

### safety_003
Category: Safety  
Applies to: bmi_category = Obese  
Rule: Obese BMI category should prioritize controlled, lower-impact exercises before high-impact or maximal-load movements.  
Use in system: Exercise selection, safety note.

### safety_004
Category: Safety  
Applies to: pain or discomfort reported  
Rule: Exercises that cause sharp pain or unusual discomfort should be stopped and replaced with a safer movement pattern.  
Use in system: Chat safety response.

### safety_005
Category: Safety  
Applies to: medical uncertainty  
Rule: Smart Workout provides decision support and should not replace medical advice from a qualified healthcare professional.  
Use in system: System prompt, safety disclaimer.

---

## Exercise Selection

### exercise_001
Category: Exercise Selection  
Applies to: target_body_part selected  
Rule: Exercise recommendations should prioritize movements that match the selected target body part.  
Use in system: Exercise recommender.

### exercise_002
Category: Exercise Selection  
Applies to: equipment selected  
Rule: Exercise recommendations should prioritize exercises that match the user’s available equipment.  
Use in system: Exercise recommender.

### exercise_003
Category: Exercise Selection  
Applies to: no exact equipment match  
Rule: If no exact equipment match is available, the recommender should search for bodyweight or band alternatives before returning no result.  
Use in system: Exercise recommender fallback.

### exercise_004
Category: Exercise Selection  
Applies to: target muscle available  
Rule: Target muscle matching should be used to rank exercises after body part and equipment filters are applied.  
Use in system: Exercise ranking.

### exercise_005
Category: Exercise Selection  
Applies to: low readiness  
Rule: Low readiness should prioritize lower-risk exercises with stable movement patterns and lighter loading options.  
Use in system: Readiness-aware exercise selection.

---

## Nutrition Context

### nutrition_001
Category: Nutrition Context  
Applies to: low protein meal pattern  
Rule: Low protein intake can be highlighted as a nutrition context note for users pursuing strength or muscle-building goals.  
Use in system: Dashboard insight, chat explanation.

### nutrition_002
Category: Nutrition Context  
Applies to: high carbohydrate snack pattern  
Rule: High carbohydrate snack patterns can be shown as energy context but should not be treated as a workout prescription by itself.  
Use in system: Nutrition dashboard explanation.

### nutrition_003
Category: Nutrition Context  
Applies to: low water intake  
Rule: Low water intake should trigger a hydration reminder before or after training.  
Use in system: Dashboard note, chat answer.

### nutrition_004
Category: Nutrition Context  
Applies to: meal_type = Dinner  
Rule: Dinner often contains the largest macro total in the nutrition dataset and can be used for dashboard-level macro mix explanation.  
Use in system: Descriptive dashboard explanation.

### nutrition_005
Category: Nutrition Context  
Applies to: nutrition uncertainty  
Rule: Nutrition insights should be presented as context from the dataset, not as medical or dietetic advice.  
Use in system: Safety disclaimer, chat response.