from fastapi.testclient import TestClient
import pytest

from app.main import app


@pytest.fixture()
def client() -> TestClient:
    with TestClient(app) as test_client:
        yield test_client


def test_chat_returns_grounded_recovery_answer(client: TestClient) -> None:
    response = client.post(
        "/api/v1/chat",
        json={"message": "I slept 5 hours and feel stressed. Should the workout be lighter?"},
    )
    assert response.status_code == 200
    payload = response.json()
    assert payload["grounded"] is True
    assert payload["retrieved_snippets"]
    assert "scaled down" in payload["answer"] or "lighter" in payload["answer"]


def test_chat_uses_current_plan_context(client: TestClient) -> None:
    response = client.post(
        "/api/v1/chat",
        json={
            "message": "Why this plan?",
            "current_plan_id": "mock-plan-001",
            "current_plan": {
                "plan_type": "3-day strength plan",
                "readiness_band": "Medium",
                "predicted_intensity": "Medium",
                "weekly_schedule": [
                    {"day": "Monday"},
                    {"day": "Wednesday"},
                    {"day": "Friday"},
                ],
            },
        },
    )
    assert response.status_code == 200
    payload = response.json()
    assert payload["grounded"] is True
    assert "3-day strength plan" in payload["answer"]
    assert "readiness is Medium" in payload["answer"]
