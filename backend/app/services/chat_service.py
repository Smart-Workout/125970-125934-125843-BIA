from __future__ import annotations

import logging
import re
import time

from app.core.config import settings                                        # Settings expose mock mode and shared backend configuration.
from app.schemas.chat import ChatRequest, ChatResponse                      # Chat schemas keep request and response payloads explicit.
from app.services.rag_service import retrieve_snippets                      # Retrieval service returns top-k ExerciseDB/rule snippets.


logger = logging.getLogger("uvicorn.error")                                # Use uvicorn logger so INFO lines appear in Render logs.


def _detect_intent(message: str) -> str:
    lowered = message.lower()
    if any(term in lowered for term in {"replace", "substitute", "dumbbell", "barbell", "equipment"}):
        return "substitution"
    if any(term in lowered for term in {"sleep", "stress", "lighter", "recovery", "fatigue"}):
        return "recovery"
    if any(term in lowered for term in {"pressure", "blood pressure", "heart rate", "safe", "avoid"}):
        return "safety"
    if any(term in lowered for term in {"split", "schedule", "days", "week"}):
        return "schedule"
    if any(term in lowered for term in {"why", "explain", "reason"}):
        return "rationale"
    return "general"


def _clean_rule_text(text: str) -> str:
    cleaned = re.sub(r"\s+", " ", text).strip()
    return cleaned[0].upper() + cleaned[1:] if cleaned else cleaned


def _plan_context_summary(current_plan: dict) -> str:
    if not current_plan:
        return ""

    plan_type = str(current_plan.get("plan_type") or "").strip()
    readiness = str(current_plan.get("readiness_band") or "").strip()
    intensity = str(current_plan.get("predicted_intensity") or "").strip()
    sessions = current_plan.get("weekly_schedule") or []

    parts: list[str] = []
    if plan_type:
        parts.append(f"Current plan: {plan_type}.")
    if readiness or intensity:
        context = []
        if readiness:
            context.append(f"readiness is {readiness}")
        if intensity:
            context.append(f"predicted intensity is {intensity}")
        parts.append("Plan context: " + " and ".join(context) + ".")
    if isinstance(sessions, list) and sessions:
        parts.append(f"The plan currently schedules {len(sessions)} session{'s' if len(sessions) != 1 else ''}.")
    return " ".join(parts)


def _compose_answer(message: str, snippets: list, current_plan: dict) -> str:
    if not snippets:
        return (
            "The system could not retrieve grounded guidance for this question. "
            "Build the RAG index with scripts/build_rag_index.py, then retry the chat request."
        )

    intent = _detect_intent(message)
    top_rules = [_clean_rule_text(snippet.text) for snippet in snippets[:2]]
    evidence = " ".join(top_rules)
    plan_context = _plan_context_summary(current_plan)

    if intent == "substitution":
        lead = "Yes, equipment substitution is supported when the replacement keeps the same target muscle and matches the available equipment."
    elif intent == "recovery":
        lead = "The workout should be scaled down when recovery signals are weak."
    elif intent == "safety":
        lead = "Use a lighter and more controlled session when the safety-related signal is elevated."
    elif intent == "schedule":
        lead = "The training split should match the number of days available and leave recovery space between hard sessions."
    elif intent == "rationale":
        lead = "This recommendation is grounded in the retrieved workout rules and the current plan context."
    else:
        lead = "Here is the grounded guidance retrieved for your question."

    answer_parts = [lead, evidence]
    if plan_context:
        answer_parts.append(plan_context)
    answer_parts.append("This is decision support guidance from the project corpus, not medical advice.")
    return " ".join(part for part in answer_parts if part)


def answer_chat(payload: ChatRequest) -> ChatResponse:
    started = time.perf_counter()
    snippets = retrieve_snippets(payload.message, limit=5)                  # Chat endpoint retrieves top-k knowledge snippets before answer assembly.
    answer = _compose_answer(payload.message, snippets, payload.current_plan)
    elapsed_ms = (time.perf_counter() - started) * 1000
    logger.info(
        "PERF chat.total_ms=%.2f snippets=%d grounded=%s message_chars=%d",
        elapsed_ms,
        len(snippets),
        bool(snippets),
        len(payload.message or ""),
    )
    return ChatResponse(
        mock_mode=settings.MOCK_MODE,                                       # Mock mode tells the frontend that no full LLM answer is generated yet.
        answer=answer,                                                      # Answer is grounded and assembled from retrieved rules plus plan context.
        retrieved_snippets=snippets,                                        # Snippets expose the evidence used by the response.
        grounded=bool(snippets),                                            # Grounded flag confirms whether retrieval returned evidence.
    )

