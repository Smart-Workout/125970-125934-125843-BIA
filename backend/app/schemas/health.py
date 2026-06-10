from pydantic import BaseModel


class HealthResponse(BaseModel):
    status: str
    service: str
    version: str


class ReadinessHealthResponse(BaseModel):
    status: str
    mock_mode: bool
    checks: dict[str, bool]

