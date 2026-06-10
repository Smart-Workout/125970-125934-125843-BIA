from fastapi import APIRouter, HTTPException

from app.schemas.workout import (
    CaloriePredictionResponse,
    ExerciseRecommendationResponse,
    GeneratedPlanResponse,
    GeneratePlanRequest,
    IntensityPredictionResponse,
    PreprocessResponse,
    UserProfileRequest,
)
from app.services import workout_service


router = APIRouter(prefix="/workout", tags=["workout"])


@router.post("/preprocess", response_model=PreprocessResponse)
def preprocess(payload: UserProfileRequest) -> PreprocessResponse:
    try:
        return workout_service.preprocess_profile(payload)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc


@router.post("/predict-calories", response_model=CaloriePredictionResponse)
def predict_calories(payload: UserProfileRequest) -> CaloriePredictionResponse:
    return workout_service.predict_calories(payload)


@router.post("/predict-intensity", response_model=IntensityPredictionResponse)
def predict_intensity(payload: UserProfileRequest) -> IntensityPredictionResponse:
    return workout_service.predict_intensity(payload)


@router.post("/recommend-exercises", response_model=ExerciseRecommendationResponse)
def recommend_exercises(payload: UserProfileRequest) -> ExerciseRecommendationResponse:
    return workout_service.recommend_exercises(payload)


@router.post("/generate-plan", response_model=GeneratedPlanResponse)
def generate_plan(payload: GeneratePlanRequest) -> GeneratedPlanResponse:
    return workout_service.generate_plan(payload)

