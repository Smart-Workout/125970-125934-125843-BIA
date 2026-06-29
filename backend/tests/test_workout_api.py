from fastapi.testclient import TestClient                                  # TestClient exercises API endpoints without launching uvicorn.
import pytest                                                              # Fixture support keeps setup and teardown explicit.

from app.main import app                                                    # Tests run against the same FastAPI app used in development.


@pytest.fixture()
def client() -> TestClient:
    with TestClient(app) as test_client:
        yield test_client                                                   # Client closes after each test, avoiding hanging resources.


PROFILE = {
    "age": 22,                                                             # Age supports profile validation and future model features.
    "height_cm": 165,                                                       # Height is used to derive BMI.
    "weight_kg": 60,                                                        # Weight is used to derive BMI.
    "sleep_hours": 7,                                                       # Sleep supports readiness-style plan decisions.
    "stress_level": 4,                                                      # Stress supports readiness-style plan decisions.
    "blood_pressure": "120/80",                                            # Blood pressure format validates health-safety parsing.
    "resting_heart_rate": 72,                                               # Resting heart rate supports safety and readiness context.
    "target_body_part": "chest",                                           # Body part drives ExerciseDB recommendations.
    "available_equipment": ["dumbbell", "bench"],                          # Equipment list drives recommendation filtering.
    "sessions_per_week": 3,                                                 # Weekly sessions support plan generation.
    "goal": "strength",                                                    # Goal supports plan text and future model logic.
}


def test_preprocess(client: TestClient) -> None:
    response = client.post("/api/v1/workout/preprocess", json=PROFILE)      # Preprocess endpoint derives profile features.
    assert response.status_code == 200                                      # Valid profile should pass request validation.
    assert response.json()["processed_profile"]["bmi_category"] == "Normal" # BMI category proves height and weight logic is working.


def test_invalid_blood_pressure(client: TestClient) -> None:
    payload = {**PROFILE, "blood_pressure": "120-80"}                       # Invalid delimiter tests blood-pressure parsing protection.
    response = client.post("/api/v1/workout/preprocess", json=payload)      # Preprocess should reject malformed safety data.
    assert response.status_code == 422                                      # HTTP 422 proves invalid input is surfaced clearly.


def test_recommend_exercises_uses_real_ids(client: TestClient) -> None:
    response = client.post("/api/v1/workout/recommend-exercises", json=PROFILE) # Recommendation endpoint should read real ExerciseDB rows.
    assert response.status_code == 200                                      # Valid profile should return recommendations.
    recommendations = response.json()["recommendations"]                    # Recommendation list is extracted for focused assertions.
    assert recommendations                                                  # At least one exercise should match chest/dumbbell context.
    assert recommendations[0]["exercise_id"] != "ex_dumbbell_bench_press"   # Hard-coded mock ID should not be used.


def test_recommend_exercises_no_equipment_uses_fallback(client: TestClient) -> None:
    payload = {**PROFILE, "available_equipment": []}                        # Empty equipment list tests fallback recommendation behavior.
    response = client.post("/api/v1/workout/recommend-exercises", json=payload) # Endpoint should still return useful body-part matches.
    assert response.status_code == 200                                      # Fallback should not be treated as an API failure.
    assert response.json()["fallback_used"] is True                         # Response should disclose that fallback logic was used.
    assert response.json()["recommendations"]                               # Fallback should still return recommendation candidates.


def test_generate_plan(client: TestClient) -> None:
    response = client.post(
        "/api/v1/workout/generate-plan",                                    # Plan endpoint combines profile and intensity.
        json={"profile": PROFILE, "predicted_intensity": "Medium"},         # Medium intensity checks the standard plan rule path.
    )
    assert response.status_code == 200                                      # Valid plan request should succeed.
    assert response.json()["plan_id"] == "mock-plan-001"                    # Current Week 2 API still returns a mock plan identifier.


def test_dashboard_summary(client: TestClient) -> None:
    response = client.get("/api/v1/dashboard/summary")                      # Dashboard summary should stay available after Week 2 backend additions.
    assert response.status_code == 200                                      # HTTP 200 proves dashboard route is registered and executable.
    payload = response.json()                                               # Payload is inspected for key BI fields.
    assert payload["kpis"]["raw_dataset_count"] == 4                        # Existing Week 1 contract is preserved for current tests.
    assert payload["body_part_coverage"]["labels"]                          # Chart labels prove dashboard aggregation returns usable data.
