from typing import Any

from pydantic import BaseModel, Field

from app.schemas.common import RetrievedSnippet


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, examples=["Why did you choose dumbbell bench press?"])
    current_plan_id: str | None = Field(default=None, examples=["mock-plan-001"])
    current_plan: dict[str, Any] = Field(default_factory=dict)


class ChatResponse(BaseModel):
    mock_mode: bool
    answer: str
    retrieved_snippets: list[RetrievedSnippet]
    grounded: bool

