from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


PROFILE = {
    "age": 22,
    "height_cm": 165,
    "weight_kg": 60,
    "sleep_hours": 7,
    "stress_level": 4,
    "blood_pressure": "120/80",
    "resting_heart_rate": 72,
    "target_body_part": "chest",
    "available_equipment": ["dumbbell", "bench"],
    "sessions_per_week": 3,
    "goal": "strength",
}


def test_preprocess() -> None:
    response = client.post("/api/v1/workout/preprocess", json=PROFILE)
    assert response.status_code == 200
    assert response.json()["processed_profile"]["bmi_category"] == "Normal"


def test_invalid_blood_pressure() -> None:
    payload = {**PROFILE, "blood_pressure": "120-80"}
    response = client.post("/api/v1/workout/preprocess", json=payload)
    assert response.status_code == 422


def test_recommend_exercises_uses_real_ids() -> None:
    response = client.post("/api/v1/workout/recommend-exercises", json=PROFILE)
    assert response.status_code == 200
    recommendations = response.json()["recommendations"]
    assert recommendations
    assert recommendations[0]["exercise_id"] != "ex_dumbbell_bench_press"


def test_recommend_exercises_no_equipment_uses_fallback() -> None:
    payload = {**PROFILE, "available_equipment": []}
    response = client.post("/api/v1/workout/recommend-exercises", json=payload)
    assert response.status_code == 200
    assert response.json()["fallback_used"] is True
    assert response.json()["recommendations"]


def test_generate_plan() -> None:
    response = client.post(
        "/api/v1/workout/generate-plan",
        json={"profile": PROFILE, "predicted_intensity": "Medium"},
    )
    assert response.status_code == 200
    assert response.json()["plan_id"] == "mock-plan-001"


def test_dashboard_summary() -> None:
    response = client.get("/api/v1/dashboard/summary")
    assert response.status_code == 200
    payload = response.json()
    assert payload["kpis"]["raw_dataset_count"] == 4
    assert payload["body_part_coverage"]["labels"]
