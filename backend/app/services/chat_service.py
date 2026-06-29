from app.core.config import settings                                        # Settings expose mock mode and shared backend configuration.
from app.schemas.chat import ChatRequest, ChatResponse                      # Chat schemas keep request and response payloads explicit.
from app.services.rag_service import retrieve_snippets                      # Retrieval service returns top-k ExerciseDB/rule snippets.


def answer_chat(payload: ChatRequest) -> ChatResponse:
    snippets = retrieve_snippets(payload.message, limit=5)                  # Chat stub retrieves top-5 knowledge snippets before any LLM integration.
    if snippets:
        evidence_text = " ".join(snippet.text for snippet in snippets[:2])  # First two snippets create a short grounded answer preview.
        answer = (
            "Retrieved relevant Smart Workout knowledge for this question. " # Response states that retrieval succeeded.
            "Use these snippets to ground the final plan explanation: "      # Text clarifies that this is retrieval evidence, not final LLM reasoning.
            f"{evidence_text[:500]}"                                        # Preview stays short enough for UI testing.
        )
    else:
        answer = (
            "No retrieval snippets were available yet. "                    # Response explains why grounding is unavailable.
            "Build the RAG index with scripts/build_rag_index.py, then retry this chat request." # Next action is explicit for debugging.
        )
    return ChatResponse(
        mock_mode=settings.MOCK_MODE,                                       # Mock mode tells the frontend that no full LLM answer is generated yet.
        answer=answer,                                                      # Answer is a retrieval-only placeholder for Week 2.
        retrieved_snippets=snippets,                                        # Snippets expose the evidence used by the response.
        grounded=bool(snippets),                                            # Grounded flag confirms whether retrieval returned evidence.
    )

