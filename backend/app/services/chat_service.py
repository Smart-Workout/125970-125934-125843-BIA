from app.core.config import settings
from app.schemas.chat import ChatRequest, ChatResponse
from app.schemas.common import RetrievedSnippet


def answer_chat(payload: ChatRequest) -> ChatResponse:
    snippet = RetrievedSnippet(
        source="RAG_CORPUS.md",
        category="Exercise recommendation",
        text="Exercises should match the user's target body part, available equipment, and readiness level.",
    )
    return ChatResponse(
        mock_mode=settings.MOCK_MODE,
        answer=(
            "This mock answer is grounded in the current plan context. "
            "The selected exercises match the target body part and available equipment, "
            "and the volume should be adjusted based on readiness."
        ),
        retrieved_snippets=[snippet],
        grounded=True,
    )

