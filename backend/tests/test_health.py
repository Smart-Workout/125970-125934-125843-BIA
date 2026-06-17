from fastapi.testclient import TestClient                                  # TestClient calls FastAPI endpoints without starting a real server.
import pytest                                                              # Pytest fixtures keep the client lifecycle clean.

from app.main import app                                                    # The real API app is tested instead of a mock router.


@pytest.fixture()
def client() -> TestClient:
    with TestClient(app) as test_client:
        yield test_client                                                   # Context manager closes the client after each test.


def test_health(client: TestClient) -> None:
    response = client.get("/api/v1/health")                                 # Health endpoint should be reachable immediately.
    assert response.status_code == 200                                      # HTTP 200 proves the route is registered.
    assert response.json()["status"] == "ok"                                # Status body proves the heartbeat contract.


def test_readiness(client: TestClient) -> None:
    response = client.get("/api/v1/health/readiness")                       # Readiness endpoint validates required data assets.
    assert response.status_code == 200                                      # HTTP 200 proves readiness route execution.
    assert "checks" in response.json()                                      # Checks object exposes detailed data availability signals.

