from fastapi import APIRouter, HTTPException                                # HTTPException converts validation failures into API error responses.

from app.schemas.workout import GeneratePlanRequest, UserProfileRequest     # Schemas validate workout request payloads.
from app.services import workout_service                                    # Service layer contains workout processing and recommendation logic.


router = APIRouter(prefix="/workout", tags=["workout"])                     # Final route paths begin with /api/v1/workout.


@router.post("/preprocess")
def preprocess(payload: UserProfileRequest):
    try:
        return workout_service.preprocess_profile(payload)                  # Profile preprocessing derives BMI, BP status, and readiness inputs.
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc      # Invalid user input becomes a 422 validation response.


@router.post("/predict-calories")
def predict_calories(payload: UserProfileRequest):
    return workout_service.predict_calories(payload)                        # Endpoint exposes calorie prediction behavior for later model integration.


@router.post("/predict-intensity")
def predict_intensity(payload: UserProfileRequest):
    return workout_service.predict_intensity(payload)                       # Endpoint exposes Low/Mid/High intensity prediction behavior.


@router.post("/recommend-exercises")
def recommend_exercises(payload: UserProfileRequest):
    return workout_service.recommend_exercises(payload)                     # Endpoint returns ExerciseDB-based recommendations.


@router.post("/generate-plan")
def generate_plan(payload: GeneratePlanRequest):
    return workout_service.generate_plan(payload)                           # Endpoint combines profile, intensity, and recommendations into a plan.
