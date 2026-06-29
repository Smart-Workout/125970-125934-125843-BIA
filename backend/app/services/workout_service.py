from app.core.config import settings
from app.core.constants import INTENSITY_RULES
from app.schemas.common import RetrievedSnippet
from app.schemas.workout import (
    CaloriePredictionResponse,
    ExerciseRecommendation,
    ExerciseRecommendationResponse,
    GeneratedPlanResponse,
    GeneratePlanRequest,
    IntensityPredictionResponse,
    PlanDay,
    PlanExercise,
    PreprocessResponse,
    ProcessedProfile,
    ReadinessResult,
    UserProfileRequest,
)
from app.services.data_service import parse_list_field, read_csv_rows
from app.services import ml_service
from app.services.rag_service import retrieve_snippets


BODY_PART_ALIASES = {
    "arms": {"upper arms", "lower arms"},
    "legs": {"upper legs", "lower legs"},
    "core": {"waist"},
    "full body": set(),
}

FOCUS_TITLE_MAP = {
    "chest": "Chest",
    "back": "Back",
    "legs": "Legs",
    "arms": "Arms",
    "shoulders": "Shoulders",
    "core": "Core",
    "waist": "Core",
    "full body": "Full Body",
}

FOCUS_ROTATIONS = {
    "chest": ["chest", "back", "legs", "shoulders", "core", "full body"],
    "back": ["back", "chest", "legs", "shoulders", "core", "full body"],
    "legs": ["legs", "back", "chest", "core", "shoulders", "full body"],
    "arms": ["arms", "back", "chest", "shoulders", "core", "full body"],
    "shoulders": ["shoulders", "back", "chest", "legs", "core", "full body"],
    "core": ["core", "legs", "back", "chest", "shoulders", "full body"],
    "waist": ["core", "legs", "back", "chest", "shoulders", "full body"],
    "full body": ["full body", "legs", "back", "chest", "shoulders", "core"],
}

GOAL_REP_MAP = {
    "strength": {"Low": "8-10", "Medium": "6-8", "High": "4-6"},
    "muscle gain": {"Low": "10-12", "Medium": "8-12", "High": "6-10"},
    "fat loss": {"Low": "12-15", "Medium": "10-12", "High": "8-12"},
    "general fitness": {"Low": "10-12", "Medium": "8-12", "High": "6-10"},
}

GOAL_REST_ADJUSTMENT = {
    "strength": 20,
    "muscle gain": 0,
    "fat loss": -15,
    "general fitness": -5,
}

GOAL_FOCUS_SUFFIX = {
    "strength": "strength block",
    "muscle gain": "hypertrophy block",
    "fat loss": "conditioning block",
    "general fitness": "balanced session",
}


def _normalize_equipment(equipment: list[str]) -> list[str]:
    aliases = {
        "dumbbells": "dumbbell",
        "dumbbell": "dumbbell",
        "bench": "bench",
        "barbells": "barbell",
        "barbell": "barbell",
        "bodyweight": "body weight",
        "body weight": "body weight",
        "machine": "machine",
        "cable": "cable",
    }
    normalized = []
    for item in equipment:
        key = item.strip().lower()
        normalized.append(aliases.get(key, key))
    return sorted(set(normalized))


def _focus_title(body_part: str, goal: str) -> str:
    base = FOCUS_TITLE_MAP.get(body_part, body_part.title())
    suffix = GOAL_FOCUS_SUFFIX.get(goal, "training block")
    return f"{base} {suffix}"


def _split_blood_pressure(value: str) -> tuple[int, int]:
    try:
        systolic, diastolic = value.split("/", 1)
        return int(systolic.strip()), int(diastolic.strip())
    except (ValueError, AttributeError) as exc:
        raise ValueError("blood_pressure must use format like 120/80") from exc


def _bmi_category(bmi: float) -> str:
    if bmi < 18.5:
        return "Underweight"
    if bmi < 25:
        return "Normal"
    if bmi < 30:
        return "Overweight"
    return "Obese"


def _select_exercises(target_body_part: str, equipment: list[str], limit: int = 8) -> tuple[list[ExerciseRecommendation], bool]:
    normalized_equipment = _normalize_equipment(equipment)
    fallback_used = not normalized_equipment
    if fallback_used:
        normalized_equipment = ["body weight"]

    target_body_parts = BODY_PART_ALIASES.get(target_body_part, {target_body_part})
    recommendations: list[ExerciseRecommendation] = []

    for row in read_csv_rows("exercisedb_all_raw_flat.csv"):
        row_body_parts = parse_list_field(row.get("bodyParts"))
        row_equipment = parse_list_field(row.get("equipments"))
        target_muscles = parse_list_field(row.get("targetMuscles"))
        instructions = [
            step.replace("Step:", "").strip()
            for step in parse_list_field(row.get("instructions"))
        ]

        body_match = (
            target_body_part == "full body"
            or bool(set(row_body_parts) & target_body_parts)
        )
        if not body_match:
            continue

        exact_equipment_matches = set(row_equipment) & set(normalized_equipment)
        bodyweight_fallback = "body weight" in row_equipment
        if not exact_equipment_matches and not bodyweight_fallback:
            continue

        score = 0.70
        if exact_equipment_matches:
            score += 0.20
        if set(row_body_parts) & target_body_parts:
            score += 0.10

        recommendations.append(
            ExerciseRecommendation(
                exercise_id=row.get("exerciseId") or f"exercise_{len(recommendations) + 1}",
                name=(row.get("name") or "Unnamed exercise").title(),
                body_parts=row_body_parts,
                target_muscles=target_muscles,
                equipment=row_equipment,
                match_score=round(min(score, 1.0), 2),
                instructions=instructions[:6],
            )
        )

        if len(recommendations) >= limit:
            break

    if not recommendations:
        fallback_used = True
        recommendations = [
            ExerciseRecommendation(
                exercise_id=f"fallback_{target_body_part.replace(' ', '_')}",
                name="Push-Up" if target_body_part in {"chest", "arms", "shoulders"} else "Bodyweight Squat",
                body_parts=[target_body_part if target_body_part != "full body" else "full body"],
                target_muscles=["general conditioning"],
                equipment=["body weight"],
                match_score=0.65,
                instructions=[
                    "Start in a stable athletic position.",
                    "Move with controlled tempo through the full range of motion.",
                    "Stop early if form or breathing quality drops.",
                ],
            )
        ]

    return recommendations, fallback_used


def _rotation_for_profile(profile: ProcessedProfile, readiness_band: str) -> list[str]:
    primary = profile.target_body_part
    base_rotation = FOCUS_ROTATIONS.get(primary, [primary, "legs", "back", "core", "shoulders", "full body"])
    session_count = max(1, profile.sessions_per_week)

    if session_count == 1:
        return [primary]
    if session_count == 2:
        return [base_rotation[0], base_rotation[2]]
    if session_count == 3:
        return [base_rotation[0], base_rotation[1], base_rotation[2]]
    if session_count == 4:
        return [base_rotation[0], base_rotation[1], base_rotation[2], base_rotation[4]]
    if session_count == 5:
        plan = [base_rotation[0], base_rotation[1], base_rotation[2], base_rotation[4], base_rotation[5]]
        if readiness_band == "Low":
            plan[-1] = "core"
        return plan
    plan = [base_rotation[0], base_rotation[1], base_rotation[2], base_rotation[4], base_rotation[5], "core"]
    if readiness_band == "Low":
        plan[-1] = "full body"
    return plan


def _days_for_sessions(session_count: int) -> list[str]:
    if session_count <= 3:
        return ["Monday", "Wednesday", "Friday"][:session_count]
    if session_count == 4:
        return ["Monday", "Tuesday", "Thursday", "Saturday"]
    if session_count == 5:
        return ["Monday", "Tuesday", "Thursday", "Friday", "Sunday"]
    return ["Monday", "Tuesday", "Wednesday", "Friday", "Saturday", "Sunday"][:session_count]


def _exercise_count(predicted_intensity: str, readiness_band: str) -> int:
    base = {"Low": 3, "Medium": 4, "High": 5}.get(predicted_intensity, 4)
    if readiness_band == "Low":
        return max(2, base - 1)
    if readiness_band == "High" and predicted_intensity == "High":
        return min(5, base)
    return base


def _training_rule(goal: str, predicted_intensity: str, readiness_band: str) -> tuple[int, str, int]:
    base_rule = INTENSITY_RULES[predicted_intensity]
    sets = int(base_rule["sets"])
    if readiness_band == "Low":
        sets = max(2, sets - 1)
    elif readiness_band == "High" and predicted_intensity == "High":
        sets += 1

    reps = GOAL_REP_MAP.get(goal, GOAL_REP_MAP["general fitness"]).get(predicted_intensity, base_rule["reps"])
    rest_seconds = max(45, int(base_rule["rest_seconds"]) + GOAL_REST_ADJUSTMENT.get(goal, 0))
    if readiness_band == "Low":
        rest_seconds += 15
    return sets, reps, rest_seconds


def _safety_notes(profile: ProcessedProfile, readiness: ReadinessResult, predicted_intensity: str, equipment: list[str]) -> list[str]:
    notes = [
        "This system provides decision support only and is not medical advice.",
        f"Current plan intensity is {predicted_intensity.lower()} with readiness marked {readiness.band.lower()}; reduce volume if form quality drops.",
    ]
    if profile.systolic_bp >= 140 or profile.diastolic_bp >= 90:
        notes.append("Blood pressure is elevated, so avoid maximal heavy lifting and keep rest periods controlled.")
    if profile.resting_heart_rate > 90:
        notes.append("Resting heart rate is elevated; extend rest and stop the session early if fatigue rises quickly.")
    if not equipment or equipment == ["body weight"]:
        notes.append("The plan relies on body-weight friendly substitutions because little or no equipment was provided.")
    return notes


def _readiness(
    sleep_hours: float,
    stress_level: int,
    systolic_bp: int,
    diastolic_bp: int,
    resting_heart_rate: int,
    bmi: float,
) -> ReadinessResult:
    score = 100
    factors: list[str] = []

    if sleep_hours < 6:
        score -= 25
        factors.append("Sleep is below 6 hours, so training volume should be reduced.")
    else:
        factors.append("Sleep duration is acceptable.")

    if stress_level >= 8:
        score -= 15
        factors.append("Stress level is high.")
    elif stress_level >= 5:
        score -= 8
        factors.append("Stress level is moderate.")
    else:
        factors.append("Stress level is low.")

    if systolic_bp >= 140 or diastolic_bp >= 90:
        score -= 20
        factors.append("Blood pressure is elevated; avoid maximal heavy lifting.")
    else:
        factors.append("Blood pressure is in normal training range.")

    if resting_heart_rate > 90:
        score -= 15
        factors.append("Resting heart rate is high; reduce intensity today.")
    else:
        factors.append("Resting heart rate is within normal training range.")

    if bmi >= 30:
        score -= 10
        factors.append("BMI is above 30; use controlled, lower-impact progression.")

    score = max(0, min(100, score))
    if score >= 80:
        band = "High"
    elif score >= 55:
        band = "Medium"
    else:
        band = "Low"

    return ReadinessResult(band=band, score=score, factors=factors)


def preprocess_profile(payload: UserProfileRequest) -> PreprocessResponse:
    systolic, diastolic = _split_blood_pressure(payload.blood_pressure)
    height_m = payload.height_cm / 100
    bmi = round(payload.weight_kg / (height_m * height_m), 2)
    equipment = _normalize_equipment(payload.available_equipment)
    readiness = _readiness(
        payload.sleep_hours,
        payload.stress_level,
        systolic,
        diastolic,
        payload.resting_heart_rate,
        bmi,
    )
    processed = ProcessedProfile(
        age=payload.age,
        height_cm=payload.height_cm,
        weight_kg=payload.weight_kg,
        bmi=bmi,
        bmi_category=_bmi_category(bmi),
        sleep_hours=payload.sleep_hours,
        stress_level=payload.stress_level,
        systolic_bp=systolic,
        diastolic_bp=diastolic,
        resting_heart_rate=payload.resting_heart_rate,
        target_body_part=payload.target_body_part,
        available_equipment=equipment,
        sessions_per_week=payload.sessions_per_week,
        goal=payload.goal,
    )
    return PreprocessResponse(
        mock_mode=settings.MOCK_MODE,
        processed_profile=processed,
        readiness=readiness,
    )


def predict_calories(payload: UserProfileRequest) -> CaloriePredictionResponse:
    processed = preprocess_profile(payload).processed_profile
    predicted_intensity, _, intensity_bundle = ml_service.predict_intensity(processed)
    prediction, calorie_bundle = ml_service.predict_calories(processed, intensity_band=predicted_intensity)
    return CaloriePredictionResponse(
        mock_mode=False,
        prediction=round(prediction, 1),
        unit="kcal_per_hour",
        model_name=calorie_bundle.name,
        confidence_note=(
            "Prediction produced by the saved Week 2 regression pipeline. "
            "User form values are translated into the model feature space using proxy fields."
        ),
        input_summary={
            "target_body_part": payload.target_body_part,
            "equipment_count": len(processed.available_equipment),
            "sessions_per_week": payload.sessions_per_week,
            "predicted_intensity_proxy": predicted_intensity,
            "intensity_model": intensity_bundle.name,
        },
    )


def predict_intensity(payload: UserProfileRequest) -> IntensityPredictionResponse:
    preprocessed = preprocess_profile(payload)
    band, probabilities, intensity_bundle = ml_service.predict_intensity(preprocessed.processed_profile)

    return IntensityPredictionResponse(
        mock_mode=False,
        predicted_class=band,
        class_probabilities=probabilities,
        model_name=intensity_bundle.name,
        readiness_band=preprocessed.readiness.band,
        explanation=preprocessed.readiness.factors,
    )


def recommend_exercises(payload: UserProfileRequest) -> ExerciseRecommendationResponse:
    equipment = _normalize_equipment(payload.available_equipment)
    recommendations, fallback_used = _select_exercises(payload.target_body_part, equipment, limit=8)
    if not equipment:
        equipment = ["body weight"]

    return ExerciseRecommendationResponse(
        mock_mode=settings.MOCK_MODE,
        target_body_part=payload.target_body_part,
        available_equipment=equipment,
        recommendations=recommendations,
        fallback_used=fallback_used,
    )


def generate_plan(payload: GeneratePlanRequest) -> GeneratedPlanResponse:
    preprocessed = preprocess_profile(payload.profile)
    readiness_band = payload.readiness_band or preprocessed.readiness.band
    profile = preprocessed.processed_profile
    days = _days_for_sessions(profile.sessions_per_week)
    focus_rotation = _rotation_for_profile(profile, readiness_band)
    sets, reps, rest_seconds = _training_rule(profile.goal, payload.predicted_intensity, readiness_band)
    exercises_per_day = _exercise_count(payload.predicted_intensity, readiness_band)
    seen_ids: set[str] = set()
    schedule: list[PlanDay] = []
    normalized_equipment = _normalize_equipment(payload.profile.available_equipment)
    for day, focus_key in zip(days, focus_rotation, strict=False):
        candidates, _ = _select_exercises(focus_key, normalized_equipment, limit=max(6, exercises_per_day + 2))
        picked: list[ExerciseRecommendation] = []
        for item in candidates:
            if item.exercise_id in seen_ids and len(candidates) > exercises_per_day:
                continue
            picked.append(item)
            seen_ids.add(item.exercise_id)
            if len(picked) >= exercises_per_day:
                break
        if len(picked) < exercises_per_day:
            for item in candidates:
                if item not in picked:
                    picked.append(item)
                if len(picked) >= exercises_per_day:
                    break

        exercises = [
            PlanExercise(
                exercise_id=item.exercise_id,
                name=item.name,
                sets=sets,
                reps=reps,
                rest_seconds=rest_seconds,
            )
            for item in picked
        ]
        schedule.append(
            PlanDay(
                day=day,
                focus=_focus_title(focus_key, profile.goal),
                exercises=exercises,
            )
        )

    rag_query = f"{profile.goal} {payload.predicted_intensity} intensity {readiness_band} readiness {profile.target_body_part} workout plan"
    rag_snippets = retrieve_snippets(rag_query, limit=2)

    return GeneratedPlanResponse(
        mock_mode=False,
        plan_id=f"plan-{profile.goal.replace(' ', '-')}-{profile.target_body_part.replace(' ', '-')}-{profile.sessions_per_week}d-{payload.predicted_intensity.lower()}",
        plan_type=f"{profile.sessions_per_week}-day {profile.goal} plan for {FOCUS_TITLE_MAP.get(profile.target_body_part, profile.target_body_part.title()).lower()} emphasis",
        readiness_band=readiness_band,
        predicted_intensity=payload.predicted_intensity,
        weekly_schedule=schedule,
        safety_notes=_safety_notes(profile, preprocessed.readiness, payload.predicted_intensity, normalized_equipment),
        rag_snippets=rag_snippets or [
            RetrievedSnippet(
                source="RAG_CORPUS.md",
                category="Intensity / readiness scaling",
                text=f"{readiness_band} readiness uses the {INTENSITY_RULES[payload.predicted_intensity]['volume_note'].lower()}",
            )
        ],
    )
