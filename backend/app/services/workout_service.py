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


BODY_PART_ALIASES = {
    "arms": {"upper arms", "lower arms"},
    "legs": {"upper legs", "lower legs"},
    "core": {"waist"},
    "full body": set(),
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
    base = 280 + (processed.weight_kg * 2.1) + (payload.sessions_per_week * 12)
    if payload.goal in {"strength", "muscle gain"}:
        base += 35
    prediction = round(base, 1)
    return CaloriePredictionResponse(
        mock_mode=settings.MOCK_MODE,
        prediction=prediction,
        unit="kcal_per_hour",
        model_name="mock-calorie-regressor",
        confidence_note="Mock response for frontend integration. Replace with trained model output later.",
        input_summary={
            "target_body_part": payload.target_body_part,
            "equipment_count": len(processed.available_equipment),
            "sessions_per_week": payload.sessions_per_week,
        },
    )


def predict_intensity(payload: UserProfileRequest) -> IntensityPredictionResponse:
    preprocessed = preprocess_profile(payload)
    band = preprocessed.readiness.band
    probabilities = {
        "Low": 0.15,
        "Medium": 0.25,
        "High": 0.60,
    }
    if band == "Medium":
        probabilities = {"Low": 0.20, "Medium": 0.60, "High": 0.20}
    elif band == "Low":
        probabilities = {"Low": 0.70, "Medium": 0.25, "High": 0.05}

    return IntensityPredictionResponse(
        mock_mode=settings.MOCK_MODE,
        predicted_class=band,
        class_probabilities=probabilities,
        model_name="mock-intensity-classifier",
        readiness_band=band,
        explanation=preprocessed.readiness.factors,
    )


def recommend_exercises(payload: UserProfileRequest) -> ExerciseRecommendationResponse:
    equipment = _normalize_equipment(payload.available_equipment)
    fallback_used = not equipment
    if fallback_used:
        equipment = ["body weight"]

    target_body_parts = BODY_PART_ALIASES.get(
        payload.target_body_part,
        {payload.target_body_part},
    )
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
            payload.target_body_part == "full body"
            or bool(set(row_body_parts) & target_body_parts)
        )
        if not body_match:
            continue

        exact_equipment_matches = set(row_equipment) & set(equipment)
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

        if len(recommendations) >= 8:
            break

    if not recommendations:
        fallback_used = True
        recommendations = [
            ExerciseRecommendation(
                exercise_id="fallback_push_up",
                name="Push-Up",
                body_parts=["chest"],
                target_muscles=["pectorals", "triceps"],
                equipment=["body weight"],
                match_score=0.65,
                instructions=[
                    "Start in a high plank position.",
                    "Lower the chest toward the floor.",
                    "Push back to the starting position.",
                ],
            )
        ]

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
    rule = INTENSITY_RULES[payload.predicted_intensity]
    recommended = recommend_exercises(payload.profile).recommendations[:2]

    days = ["Monday", "Wednesday", "Friday", "Saturday", "Sunday"][: payload.profile.sessions_per_week]
    schedule: list[PlanDay] = []
    for index, day in enumerate(days):
        focus = payload.profile.target_body_part.title()
        if index == 1:
            focus = "Back and core"
        elif index == 2:
            focus = "Legs and full body"

        exercises = [
            PlanExercise(
                exercise_id=item.exercise_id,
                name=item.name,
                sets=rule["sets"],
                reps=rule["reps"],
                rest_seconds=rule["rest_seconds"],
            )
            for item in recommended
        ]
        schedule.append(PlanDay(day=day, focus=focus, exercises=exercises))

    return GeneratedPlanResponse(
        mock_mode=settings.MOCK_MODE,
        plan_id="mock-plan-001",
        plan_type=f"{payload.profile.sessions_per_week}-day {payload.profile.goal} plan",
        readiness_band=readiness_band,
        predicted_intensity=payload.predicted_intensity,
        weekly_schedule=schedule,
        safety_notes=[
            "This system provides decision support only and is not medical advice.",
            "Use lighter volume if sleep, stress, blood pressure, or heart rate suggests low readiness.",
        ],
        rag_snippets=[
            RetrievedSnippet(
                source="RAG_CORPUS.md",
                category="Intensity / readiness scaling",
                text="Medium readiness uses moderate training volume with 3-4 sets and 8-12 reps.",
            )
        ],
    )
