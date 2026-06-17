# Week 2 RAG Retrieval Test Results

Top-5 retrieval results for 10 sample queries.

## Query: bodyweight chest exercise for low readiness

1. `exercise` from `exercisedb_cleaned_catalog.csv`
   - name: decline push-up
   - distance: 0.7190
   - text: Exercise: decline push-up Body parts: chest Equipment: body weight Target muscles: pectorals Instructions: step:1 place your hands on the ground slightly wider than shoulder-width apart, with your feet elevated on a stable surface. step:2 keep your body in a s
2. `exercise` from `exercisedb_cleaned_catalog.csv`
   - name: drop push up
   - distance: 0.7500
   - text: Exercise: drop push up Body parts: chest Equipment: body weight Target muscles: pectorals Instructions: step:1 start in a high plank position with your hands slightly wider than shoulder-width apart. step:2 lower your chest towards the ground, keeping your elb
3. `exercise` from `exercisedb_cleaned_catalog.csv`
   - name: light lever standing chest press
   - distance: 0.7512
   - text: Exercise: light lever standing chest press Body parts: chest Equipment: leverage machine Target muscles: pectorals Instructions: step:1 adjust the seat height and position yourself on the machine with your feet flat on the ground. step:2 grasp the handles with
4. `exercise` from `exercisedb_cleaned_catalog.csv`
   - name: push and pull bodyweight
   - distance: 0.7516
   - text: Exercise: push and pull bodyweight Body parts: chest Equipment: body weight Target muscles: pectorals Instructions: step:1 start in a push-up position with your hands slightly wider than shoulder-width apart and your body in a straight line. step:2 lower your 
5. `exercise` from `exercisedb_cleaned_catalog.csv`
   - name: full planche push-up
   - distance: 0.7556
   - text: Exercise: full planche push-up Body parts: chest Equipment: body weight Target muscles: pectorals Instructions: step:1 start in a push-up position with your hands placed slightly wider than shoulder-width apart. step:2 engage your core and lower your body down

## Query: dumbbell back exercise instructions

1. `exercise` from `exercisedb_cleaned_catalog.csv`
   - name: dumbbell lying rear delt row
   - distance: 0.3860
   - text: Exercise: dumbbell lying rear delt row Body parts: back Equipment: dumbbell Target muscles: upper back Instructions: step:1 lie face down on a flat bench with a dumbbell in each hand, palms facing inwards. step:2 extend your arms straight down towards the floo
2. `exercise` from `exercisedb_cleaned_catalog.csv`
   - name: dumbbell reverse grip row (female)
   - distance: 0.3864
   - text: Exercise: dumbbell reverse grip row (female) Body parts: back Equipment: dumbbell Target muscles: upper back Instructions: step:1 stand with your feet shoulder-width apart and knees slightly bent. step:2 hold a dumbbell in each hand with an overhand grip, palm
3. `exercise` from `exercisedb_cleaned_catalog.csv`
   - name: dumbbell upright row (back pov)
   - distance: 0.3980
   - text: Exercise: dumbbell upright row (back pov) Body parts: shoulders Equipment: dumbbell Target muscles: delts Instructions: step:1 stand with your feet shoulder-width apart, holding a dumbbell in each hand with an overhand grip. step:2 let the dumbbells hang in fr
4. `exercise` from `exercisedb_cleaned_catalog.csv`
   - name: dumbbell one arm bent-over row
   - distance: 0.4051
   - text: Exercise: dumbbell one arm bent-over row Body parts: back Equipment: dumbbell Target muscles: upper back Instructions: step:1 stand with your feet shoulder-width apart, holding a dumbbell in one hand with your palm facing your body. step:2 bend your knees slig
5. `exercise` from `exercisedb_cleaned_catalog.csv`
   - name: dumbbell bent over row
   - distance: 0.4089
   - text: Exercise: dumbbell bent over row Body parts: back Equipment: dumbbell Target muscles: upper back Instructions: step:1 stand with your feet shoulder-width apart, knees slightly bent, and hold a dumbbell in each hand with your palms facing your body. step:2 bend

## Query: substitute barbell exercise with dumbbell

1. `exercise` from `exercisedb_cleaned_catalog.csv`
   - name: barbell decline pullover
   - distance: 0.6859
   - text: Exercise: barbell decline pullover Body parts: chest Equipment: barbell Target muscles: pectorals Instructions: step:1 lie down on a decline bench with your head lower than your hips and your feet secured. step:2 hold the barbell with a pronated grip (palms fa
2. `exercise` from `exercisedb_cleaned_catalog.csv`
   - name: barbell clean and press
   - distance: 0.6901
   - text: Exercise: barbell clean and press Body parts: upper legs Equipment: barbell Target muscles: quads Instructions: step:1 stand with your feet shoulder-width apart and the barbell on the floor in front of you. step:2 bend your knees and hinge at the hips to lower
3. `exercise` from `exercisedb_cleaned_catalog.csv`
   - name: dumbbell one arm snatch
   - distance: 0.7132
   - text: Exercise: dumbbell one arm snatch Body parts: upper legs Equipment: dumbbell Target muscles: glutes Instructions: step:1 stand with your feet shoulder-width apart, holding a dumbbell in one hand with an overhand grip. step:2 bend your knees slightly and hinge 
4. `exercise` from `exercisedb_cleaned_catalog.csv`
   - name: power clean
   - distance: 0.7171
   - text: Exercise: power clean Body parts: upper legs Equipment: barbell Target muscles: hamstrings Instructions: step:1 start with the barbell on the ground in front of you, with your feet shoulder-width apart. step:2 bend down and grip the barbell with an overhand gr
5. `exercise` from `exercisedb_cleaned_catalog.csv`
   - name: barbell one arm snatch
   - distance: 0.7216
   - text: Exercise: barbell one arm snatch Body parts: shoulders Equipment: barbell Target muscles: delts Instructions: step:1 stand with your feet shoulder-width apart, toes pointing slightly outwards. step:2 hold the barbell with an overhand grip, hands slightly wider

## Query: reduce workout volume after poor sleep

1. `rule` from `RAG_CORPUS.md`
   - category: Recovery
   - distance: 0.9413
   - text: Rule category: Recovery Applies to: sleep_duration < 6 Rule: If sleep duration is below 6 hours, reduce training volume by 20-30% for that session. Use in system: Readiness explanation, plan adjustment, chat answer.
2. `rule` from `RAG_CORPUS.md`
   - category: Readiness Scaling
   - distance: 0.9692
   - text: Rule category: Readiness Scaling Applies to: no sleep disorder but low sleep duration Rule: Even without a diagnosed sleep disorder, sleep duration below 6 hours lowers recommended training intensity by 10-15%. Use in system: Intensity scaling.
3. `rule` from `RAG_CORPUS.md`
   - category: Readiness Scaling
   - distance: 1.0812
   - text: Rule category: Readiness Scaling Applies to: low sleep quality Rule: Low sleep quality should lower the recommended workout intensity even when planned training volume is high. Use in system: Readiness explanation, plan adjustment.
4. `rule` from `RAG_CORPUS.md`
   - category: Recovery
   - distance: 1.0967
   - text: Rule category: Recovery Applies to: physical_activity_level > 60 (daily steps > 8000) Rule: High daily physical activity outside the gym reduces recovery capacity; total weekly training volume should be adjusted downward. Use in system: Volume adjustment, chat
5. `rule` from `RAG_CORPUS.md`
   - category: Recovery
   - distance: 1.1191
   - text: Rule category: Recovery Applies to: sleep_disorder = Insomnia or Sleep Apnea Rule: Users with sleep disorders should schedule an extra rest day after heavy lower body or full-body workouts. Use in system: Readiness-based plan adjustment.

## Query: high stress recovery workout rule

1. `rule` from `RAG_CORPUS.md`
   - category: Recovery
   - distance: 0.3486
   - text: Rule category: Recovery Applies to: stress_level >= 7 Rule: High stress should reduce workout intensity and prioritize controlled movements, lighter loads, or mobility work. Use in system: Readiness explanation, low-recovery workout adjustment.
2. `rule` from `RAG_CORPUS.md`
   - category: Recovery
   - distance: 0.6886
   - text: Rule category: Recovery Applies to: muscle soreness still high before next session Rule: If the same muscle group is still sore on the planned training day, replace heavy work with light blood-flow or mobility movements. Use in system: Plan adjustment, safety 
3. `rule` from `RAG_CORPUS.md`
   - category: Recovery
   - distance: 0.7745
   - text: Rule category: Recovery Applies to: low readiness + high fatigue Rule: Low readiness combined with high fatigue should shift the session toward technique practice, stretching, or low-intensity accessory work. Use in system: Plan adjustment, chat explanation.
4. `rule` from `RAG_CORPUS.md`
   - category: Recovery
   - distance: 0.7861
   - text: Rule category: Recovery Applies to: heavy compound lifts Rule: Heavy compound lifts such as squats, deadlifts, and bench presses usually require at least 48 hours of recovery before repeating the same movement pattern. Use in system: Plan generator, recovery w
5. `rule` from `RAG_CORPUS.md`
   - category: Recovery
   - distance: 0.7987
   - text: Rule category: Recovery Applies to: same muscle group trained recently Rule: The same major muscle group should not be trained heavily on two consecutive days. Use in system: Weekly schedule generation, split validation.

## Query: leg workout with no machine available

1. `exercise` from `exercisedb_cleaned_catalog.csv`
   - name: lever horizontal one leg press
   - distance: 0.6320
   - text: Exercise: lever horizontal one leg press Body parts: upper legs Equipment: leverage machine Target muscles: glutes Instructions: step:1 adjust the seat of the machine so that your knees are at a 90-degree angle when your feet are on the footplate. step:2 sit o
2. `exercise` from `exercisedb_cleaned_catalog.csv`
   - name: lever alternate leg press
   - distance: 0.7009
   - text: Exercise: lever alternate leg press Body parts: upper legs Equipment: leverage machine Target muscles: quads Instructions: step:1 adjust the seat and foot platform of the leverage machine to your desired position. step:2 sit on the machine with your back again
3. `exercise` from `exercisedb_cleaned_catalog.csv`
   - name: lever leg extension
   - distance: 0.7078
   - text: Exercise: lever leg extension Body parts: upper legs Equipment: leverage machine Target muscles: quads Instructions: step:1 adjust the seat height and backrest of the machine to fit your body. step:2 sit on the machine with your back against the backrest and y
4. `exercise` from `exercisedb_cleaned_catalog.csv`
   - name: lever lying two-one leg curl
   - distance: 0.7191
   - text: Exercise: lever lying two-one leg curl Body parts: upper legs Equipment: leverage machine Target muscles: hamstrings Instructions: step:1 adjust the machine to fit your body and sit on it with your back against the backrest. step:2 place your legs on the lever
5. `exercise` from `exercisedb_cleaned_catalog.csv`
   - name: self assisted inverse leg curl
   - distance: 0.7462
   - text: Exercise: self assisted inverse leg curl Body parts: upper legs Equipment: body weight Target muscles: hamstrings Instructions: step:1 lie face down on a leg curl machine with your legs extended and your ankles hooked under the padded lever. step:2 place your 

## Query: exercise for shoulders using cable

1. `exercise` from `exercisedb_cleaned_catalog.csv`
   - name: cable upright row
   - distance: 0.3559
   - text: Exercise: cable upright row Body parts: shoulders Equipment: cable Target muscles: delts Instructions: step:1 stand with your feet shoulder-width apart, knees slightly bent, and hold the cable attachment with an overhand grip. step:2 keep your back straight an
2. `exercise` from `exercisedb_cleaned_catalog.csv`
   - name: cable seated shoulder internal rotation
   - distance: 0.3924
   - text: Exercise: cable seated shoulder internal rotation Body parts: shoulders Equipment: cable Target muscles: delts Instructions: step:1 sit on a bench or chair facing the cable machine with your feet flat on the ground. step:2 hold the cable handle with your arm e
3. `exercise` from `exercisedb_cleaned_catalog.csv`
   - name: cable standing shoulder external rotation
   - distance: 0.4038
   - text: Exercise: cable standing shoulder external rotation Body parts: shoulders Equipment: cable Target muscles: delts Instructions: step:1 stand with your feet shoulder-width apart and your knees slightly bent. step:2 hold the cable handle with your arm extended in
4. `exercise` from `exercisedb_cleaned_catalog.csv`
   - name: cable shrug
   - distance: 0.4279
   - text: Exercise: cable shrug Body parts: back Equipment: cable Target muscles: traps Instructions: step:1 stand facing the cable machine with your feet shoulder-width apart. step:2 grasp the cable handles with an overhand grip and let your arms hang down in front of 
5. `exercise` from `exercisedb_cleaned_catalog.csv`
   - name: cable forward raise
   - distance: 0.4348
   - text: Exercise: cable forward raise Body parts: shoulders Equipment: cable Target muscles: delts Instructions: step:1 stand with your feet shoulder-width apart and your knees slightly bent. step:2 hold the cable handle with an overhand grip, palms facing down, and y

## Query: nutrition macro guidance for workout dashboard

1. `rule` from `RAG_CORPUS.md`
   - category: Nutrition Context
   - distance: 0.7991
   - text: Rule category: Nutrition Context Applies to: meal_type = Dinner Rule: Dinner often contains the largest macro total in the nutrition dataset and can be used for dashboard-level macro mix explanation. Use in system: Descriptive dashboard explanation.
2. `rule` from `RAG_CORPUS.md`
   - category: Nutrition Context
   - distance: 0.9208
   - text: Rule category: Nutrition Context Applies to: low protein meal pattern Rule: Low protein intake can be highlighted as a nutrition context note for users pursuing strength or muscle-building goals. Use in system: Dashboard insight, chat explanation.
3. `rule` from `RAG_CORPUS.md`
   - category: Nutrition Context
   - distance: 0.9541
   - text: Rule category: Nutrition Context Applies to: high carbohydrate snack pattern Rule: High carbohydrate snack patterns can be shown as energy context but should not be treated as a workout prescription by itself. Use in system: Nutrition dashboard explanation.
4. `rule` from `RAG_CORPUS.md`
   - category: Nutrition Context
   - distance: 1.0088
   - text: Rule category: Nutrition Context Applies to: low carbohydrate pattern before high-intensity workout Rule: Low carbohydrate intake before a high-intensity session may cause early fatigue; suggest a small carb snack 30-60 minutes prior. Use in system: Plan note,
5. `rule` from `RAG_CORPUS.md`
   - category: Nutrition Context
   - distance: 1.0479
   - text: Rule category: Nutrition Context Applies to: low water intake Rule: Low water intake should trigger a hydration reminder before or after training. Use in system: Dashboard note, chat answer.

## Query: how to adjust plan for beginner

1. `exercise` from `exercisedb_cleaned_catalog.csv`
   - name: full planche
   - distance: 1.0724
   - text: Exercise: full planche Body parts: waist Equipment: body weight Target muscles: abs Instructions: step:1 start in a push-up position with your hands shoulder-width apart and your fingers pointing forward. step:2 engage your core and slowly shift your weight fo
2. `exercise` from `exercisedb_cleaned_catalog.csv`
   - name: straddle planche
   - distance: 1.1129
   - text: Exercise: straddle planche Body parts: waist Equipment: body weight Target muscles: abs Instructions: step:1 start in a push-up position with your hands shoulder-width apart and your feet spread wide apart. step:2 engage your core and slowly shift your weight 
3. `exercise` from `exercisedb_cleaned_catalog.csv`
   - name: lean planche
   - distance: 1.1217
   - text: Exercise: lean planche Body parts: waist Equipment: body weight Target muscles: abs Instructions: step:1 start in a push-up position with your hands shoulder-width apart and your body straight. step:2 engage your core and slowly shift your weight forward, brin
4. `exercise` from `exercisedb_cleaned_catalog.csv`
   - name: frog planche
   - distance: 1.2281
   - text: Exercise: frog planche Body parts: waist Equipment: body weight Target muscles: abs Instructions: step:1 start in a push-up position with your hands shoulder-width apart and your feet together. step:2 bend your elbows and lower your body towards the ground, ke
5. `exercise` from `exercisedb_cleaned_catalog.csv`
   - name: elbow-to-knee
   - distance: 1.2380
   - text: Exercise: elbow-to-knee Body parts: waist Equipment: body weight Target muscles: abs Instructions: step:1 start by lying flat on your back with your knees bent and feet flat on the ground. step:2 place your hands behind your head with your elbows pointing outw

## Query: weekly schedule avoid training same muscle two days

1. `rule` from `RAG_CORPUS.md`
   - category: Schedule / Split
   - distance: 0.5309
   - text: Rule category: Schedule / Split Applies to: training_days_per_week = 2 Rule: A 2-day-per-week plan should usually use full-body sessions with recovery days between workouts. Use in system: Weekly plan generation.
2. `rule` from `RAG_CORPUS.md`
   - category: Schedule / Split
   - distance: 0.5562
   - text: Rule category: Schedule / Split Applies to: training_days_per_week = 1 Rule: A single weekly workout should be full-body and include compound movements for major muscle groups to maximize efficiency. Use in system: Minimalist plan generation.
3. `rule` from `RAG_CORPUS.md`
   - category: Schedule / Split
   - distance: 0.6140
   - text: Rule category: Schedule / Split Applies to: training_days_per_week = 3 Rule: A 3-day-per-week plan can use full-body rotation or push-pull-legs with rest days between sessions. Use in system: Weekly split selection.
4. `rule` from `RAG_CORPUS.md`
   - category: Schedule / Split
   - distance: 0.6572
   - text: Rule category: Schedule / Split Applies to: training_days_per_week = 6 Rule: A 6-day plan should use a push-pull-legs twice-per-week rotation with at least one complete rest day. Use in system: Advanced schedule generation.
5. `rule` from `RAG_CORPUS.md`
   - category: Schedule / Split
   - distance: 0.7015
   - text: Rule category: Schedule / Split Applies to: training_days_per_week = 4 Rule: A 4-day-per-week plan can use an upper-lower split to balance training volume and recovery. Use in system: Weekly split selection.
