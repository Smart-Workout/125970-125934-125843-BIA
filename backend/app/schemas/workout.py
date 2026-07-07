from typing import Literal

from pydantic import BaseModel, Field

from app.schemas.common import RetrievedSnippet


BodyPart = Literal[
    "chest",
    "back",
    "legs",
    "arms",
    "shoulders",
    "core",
    "waist",
    "full body",
]
Goal = Literal["strength", "muscle gain", "fat loss", "general fitness"]
IntensityBand = Literal["Low", "Medium", "High"]


class UserProfileRequest(BaseModel):
    age: int = Field(..., ge=13, le=90, examples=[22])
    height_cm: float = Field(..., ge=100, le=230, examples=[165])
    weight_kg: float = Field(..., ge=30, le=250, examples=[60])
    sleep_hours: float = Field(..., ge=0, le=14, examples=[7])
    stress_level: int = Field(..., ge=1, le=10, examples=[4])
    blood_pressure: str = Field(..., examples=["120/80"])
    resting_heart_rate: int = Field(..., ge=35, le=140, examples=[72])
    target_body_part: BodyPart = Field(..., examples=["chest"])
    available_equipment: list[str] = Field(default_factory=list, examples=[["dumbbell", "bench"]])
    sessions_per_week: int = Field(..., ge=1, le=6, examples=[3])
    goal: Goal = Field(..., examples=["strength"])


class ProcessedProfile(BaseModel):
    age: int
    height_cm: float
    weight_kg: float
    bmi: float
    bmi_category: str
    sleep_hours: float
    stress_level: int
    systolic_bp: int
    diastolic_bp: int
    resting_heart_rate: int
    target_body_part: str
    available_equipment: list[str]
    sessions_per_week: int
    goal: str


class ReadinessFactorScore(BaseModel):
    signal: str
    label: str
    impact: int
    detail: str


class ReadinessResult(BaseModel):
    band: IntensityBand
    score: int
    factors: list[str]
    score_breakdown: list[ReadinessFactorScore]


class PreprocessResponse(BaseModel):
    mock_mode: bool
    processed_profile: ProcessedProfile
    readiness: ReadinessResult


class CaloriePredictionResponse(BaseModel):
    mock_mode: bool
    prediction: float
    unit: str
    model_name: str
    confidence_note: str
    input_summary: dict[str, str | int | float]


class IntensityPredictionResponse(BaseModel):
    mock_mode: bool
    predicted_class: IntensityBand
    class_probabilities: dict[str, float]
    model_name: str
    readiness_band: IntensityBand
    readiness_score: int
    explanation: list[str]


class ExerciseRecommendation(BaseModel):
    exercise_id: str
    name: str
    body_parts: list[str]
    target_muscles: list[str]
    equipment: list[str]
    match_score: float
    instructions: list[str]


class ExerciseRecommendationResponse(BaseModel):
    mock_mode: bool
    target_body_part: str
    available_equipment: list[str]
    recommendations: list[ExerciseRecommendation]
    fallback_used: bool


class GeneratePlanRequest(BaseModel):
    profile: UserProfileRequest
    predicted_intensity: IntensityBand = "Medium"
    readiness_band: IntensityBand | None = None
    recommended_exercise_ids: list[str] = Field(default_factory=list)


class PlanExercise(BaseModel):
    exercise_id: str
    name: str
    sets: int
    reps: str
    rest_seconds: int


class PlanDay(BaseModel):
    day: str
    focus: str
    exercises: list[PlanExercise]


class RecommendationMapping(BaseModel):
    readiness_score: int
    readiness_band: IntensityBand
    predicted_intensity: IntensityBand
    intensity_score: int
    combined_training_score: int
    recommendation_level: str
    volume_multiplier: float
    exercise_target_per_session: int
    sets_per_exercise: int
    reps: str
    rest_seconds: int
    readiness_cap_applied: bool
    primary_action: str
    rationale: list[str]


class GeneratedPlanResponse(BaseModel):
    mock_mode: bool
    plan_id: str
    plan_type: str
    readiness_band: IntensityBand
    predicted_intensity: IntensityBand
    decision_mapping: RecommendationMapping
    weekly_schedule: list[PlanDay]
    safety_notes: list[str]
    rag_snippets: list[RetrievedSnippet]

