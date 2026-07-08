import asyncio

from fastapi import APIRouter, HTTPException                                # HTTPException converts validation failures into API error responses.
from fastapi.concurrency import run_in_threadpool

from app.core.config import settings
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
async def generate_plan(payload: GeneratePlanRequest):
    if settings.GENERATE_PLAN_TIMEOUT_SECONDS <= 0:
        return await run_in_threadpool(workout_service.generate_plan, payload)

    try:
        return await asyncio.wait_for(
            run_in_threadpool(workout_service.generate_plan, payload),
            timeout=settings.GENERATE_PLAN_TIMEOUT_SECONDS,
        )
    except asyncio.TimeoutError as exc:
        raise HTTPException(
            status_code=504,
            detail=(
                "Plan generation timed out before completion. "
                "Please retry with fewer sessions/equipment filters or try again shortly."
            ),
        ) from exc
