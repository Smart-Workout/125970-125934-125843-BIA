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

### recovery_006
Category: Recovery
Applies to: training session duration > 90 minutes
Rule: Sessions longer than 90 minutes should be followed by at least one full rest day for the same muscle groups to avoid overtraining.
Use in system: Schedule generation, recovery warning.

### recovery_007
Category: Recovery
Applies to: sleep_disorder = Insomnia or Sleep Apnea
Rule: Users with sleep disorders should schedule an extra rest day after heavy lower body or full-body workouts.
Use in system: Readiness-based plan adjustment.

### recovery_008
Category: Recovery
Applies to: physical_activity_level > 60 (daily steps > 8000)
Rule: High daily physical activity outside the gym reduces recovery capacity; total weekly training volume should be adjusted downward.
Use in system: Volume adjustment, chat explanation.

### recovery_009
Category: Recovery
Applies to: muscle soreness still high before next session
Rule: If the same muscle group is still sore on the planned training day, replace heavy work with light blood-flow or mobility movements.
Use in system: Plan adjustment, safety note.

### recovery_010
Category: Recovery
Applies to: consecutive training days without rest
Rule: Two consecutive days of hard training should be followed by at least one day focused on active recovery or complete rest.
Use in system: Weekly schedule validation.

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

### readiness_006
Category: Readiness Scaling
Applies to: readiness_band = Very Low (score < 0.3)
Rule: Very low readiness should cancel strength work and recommend only light walking, stretching, or complete rest.
Use in system: Readiness card, plan override.

### readiness_007
Category: Readiness Scaling
Applies to: resting_heart_rate > 75 bpm and sleep < 6 hours
Rule: Resting heart rate above 75 combined with short sleep lowers readiness by one full band.
Use in system: Composite rule for readiness score.

### readiness_008
Category: Readiness Scaling
Applies to: previous session perceived exertion high
Rule: A previous session with high perceived exertion without adequate recovery lowers readiness for the next session, especially for the same movement patterns.
Use in system: Plan adjustment, intensity reduction.

### readiness_009
Category: Readiness Scaling
Applies to: no sleep disorder but low sleep duration
Rule: Even without a diagnosed sleep disorder, sleep duration below 6 hours lowers recommended training intensity by 10-15%.
Use in system: Intensity scaling.

### readiness_010
Category: Readiness Scaling
Applies to: sudden increase in stress level (delta > 3 points)
Rule: A sudden increase in stress level by more than 3 points should temporarily lower training volume even if sleep quality remains normal.
Use in system: Dynamic readiness adjustment.

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

### equipment_006
Category: Equipment Substitution
Applies to: squat rack unavailable
Rule: Squat rack exercises can be replaced with goblet squats using a single dumbbell or kettlebell when the rack is not available.
Use in system: Exercise substitution.

### equipment_007
Category: Equipment Substitution
Applies to: leg press machine unavailable
Rule: Leg press can be replaced with barbell squats, dumbbell squats, or sissy squats depending on available equipment and user readiness.
Use in system: Exercise recommender fallback.

### equipment_008
Category: Equipment Substitution
Applies to: pull-up bar unavailable
Rule: Pull-ups can be replaced with lat pulldowns (cable or band) or inverted rows using a low bar or suspension trainer.
Use in system: Home workout adaptation.

### equipment_009
Category: Equipment Substitution
Applies to: bench press station unavailable
Rule: Bench press can be replaced with floor press (barbell or dumbbell) or push-ups with added resistance (bands or weighted vest).
Use in system: Equipment substitution.

### equipment_010
Category: Equipment Substitution
Applies to: no cable machine
Rule: Cable crossover can be substituted with dumbbell flys or resistance-band chest presses while maintaining chest activation.
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

### schedule_006
Category: Schedule / Split
Applies to: training_days_per_week = 6
Rule: A 6-day plan should use a push-pull-legs twice-per-week rotation with at least one complete rest day.
Use in system: Advanced schedule generation.

### schedule_007
Category: Schedule / Split
Applies to: training_days_per_week = 1
Rule: A single weekly workout should be full-body and include compound movements for major muscle groups to maximize efficiency.
Use in system: Minimalist plan generation.

### schedule_008
Category: Schedule / Split
Applies to: schedule preference = morning vs evening
Rule: Morning workouts may require a longer warm-up and lighter initial intensity due to lower body temperature and joint stiffness.
Use in system: Schedule-specific warm-up advice.

### schedule_009
Category: Schedule / Split
Applies to: fixed days (e.g., Mon/Wed/Fri)
Rule: When days are fixed, avoid scheduling two lower-body sessions with less than 48 hours between them to allow adequate recovery.
Use in system: Split validation.

### schedule_010
Category: Schedule / Split
Applies to: flexible schedule preference
Rule: For flexible schedules, spread training sessions evenly across the week with no more than two consecutive days of hard training.
Use in system: Schedule optimization.


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

### experience_006
Category: Experience Level
Applies to: experience_level = 1 and low readiness
Rule: Beginner users with low readiness should reduce sets to 2 per exercise and avoid failure on all sets.
Use in system: Beginner safety plan.

### experience_007
Category: Experience Level
Applies to: experience_level = 2 and target muscle group unfamiliar
Rule: Intermediate users should spend extra warm-up sets on new or unfamiliar movement patterns before working sets.
Use in system: Plan instruction, exercise note.

### experience_008
Category: Experience Level
Applies to: experience_level = 3 and high readiness
Rule: Advanced users with high readiness can incorporate intensity techniques such as drop sets, rest-pause, or clusters.
Use in system: Advanced intensity options.

### experience_009
Category: Experience Level
Applies to: experience_level = 1 and compound lift
Rule: Beginners should learn compound lifts with light weight or just the barbell before adding load.
Use in system: Exercise progression note.

### experience_010
Category: Experience Level
Applies to: experience_level = 2 and plateau
Rule: Intermediate users hitting a plateau can benefit from changing exercise variation, rep range, or adding periodization.
Use in system: Chat advice, plan variation.

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

### safety_006
Category: Safety
Applies to: history of joint pain (user reported)
Rule: Users with joint pain history should avoid deep ranges of motion on loaded exercises until cleared by a professional.
Use in system: Safety note, exercise modification.

### safety_007
Category: Safety
Applies to: bmi_category = Obese and jumping exercise
Rule: Obese users should avoid high-impact jumping exercises (e.g., box jumps, jump squats) and choose low-impact alternatives.
Use in system: Exercise substitution.

### safety_008
Category: Safety
Applies to: resting_heart_rate > 100 bpm
Rule: Resting heart rate above 100 bpm is unusually high; suggest medical evaluation before starting a workout plan.
Use in system: Safety warning, stop recommendation.

### safety_009
Category: Safety
Applies to: systolic_bp > 160 or diastolic_bp > 100
Rule: Severely elevated blood pressure requires medical clearance before any resistance training.
Use in system: Hard stop recommendation.

### safety_010
Category: Safety
Applies to: dizziness or lightheadedness reported
Rule: Any report of dizziness during exercise should stop the session and recommend hydration and rest; if persistent, seek medical advice.
Use in system: Chat emergency response.
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

### exercise_006
Category: Exercise Selection
Applies to: target_body_part = Legs and no squat rack
Rule: Legs without a squat rack can use dumbbell lunges, step-ups, and goblet squats as primary movements.
Use in system: Exercise recommender.

### exercise_007
Category: Exercise Selection
Applies to: target_body_part = Shoulders and equipment = resistance band
Rule: Shoulders with resistance bands can prioritize band presses, band lateral raises, and face pulls.
Use in system: Filtered recommendation.

### exercise_008
Category: Exercise Selection
Applies to: warm-up set count
Rule: Warm-up sets should use lighter weights and higher reps, gradually increasing load, but are not counted toward working sets.
Use in system: Plan generation, exercise detail.

### exercise_009
Category: Exercise Selection
Applies to: user lacks equipment for a primary movement
Rule: When primary equipment is missing, suggest a similar movement pattern using available equipment even if it targets a slightly different angle.
Use in system: Fallback recommendation.

### exercise_010
Category: Exercise Selection
Applies to: multiple target body parts selected
Rule: When multiple body parts are selected, prioritize exercises that work them in the same compound movement to save time and fatigue.
Use in system: Multi-target plan generation.
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

### nutrition_006
Category: Nutrition Context
Applies to: high sodium food pattern
Rule: High sodium intake may increase water retention and blood pressure; consider reducing processed foods before heavy sessions.
Use in system: Dashboard insight, chat explanation.

### nutrition_007
Category: Nutrition Context
Applies to: low carbohydrate pattern before high-intensity workout
Rule: Low carbohydrate intake before a high-intensity session may cause early fatigue; suggest a small carb snack 30-60 minutes prior.
Use in system: Plan note, chat recommendation.

### nutrition_008
Category: Nutrition Context
Applies to: meal_type = Snack and high sugar
Rule: High sugar snacks provide quick energy but may lead to energy crashes; pair with protein for sustained energy.
Use in system: Descriptive dashboard note.

### nutrition_009
Category: Nutrition Context
Applies to: water_intake < 1.5 L per day
Rule: Very low water intake increases the risk of dehydration during exercise; aim for 2-3 L daily.
Use in system: Hydration reminder.

### nutrition_010
Category: Nutrition Context
Applies to: post-workout meal timing
Rule: The nutrition dataset suggests that a meal within 2 hours after training is common; timing may affect recovery speed.
Use in system: Descriptive insight.