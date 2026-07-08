import asyncio

from fastapi import APIRouter, HTTPException                                # Router groups chat endpoints under one API tag.
from fastapi.concurrency import run_in_threadpool

from app.core.config import settings
from app.schemas.chat import ChatRequest, ChatResponse                      # Request and response schemas keep chat payloads predictable.
from app.services.chat_service import answer_chat                           # Service layer contains retrieval-only chat logic.


router = APIRouter(prefix="/chat", tags=["chat"])                           # Final route path becomes /api/v1/chat after main.py adds prefix.


@router.post("", response_model=ChatResponse)
async def chat(payload: ChatRequest) -> ChatResponse:
    if settings.CHAT_TIMEOUT_SECONDS <= 0:
        return await run_in_threadpool(answer_chat, payload)

    try:
        return await asyncio.wait_for(
            run_in_threadpool(answer_chat, payload),
            timeout=settings.CHAT_TIMEOUT_SECONDS,
        )
    except asyncio.TimeoutError as exc:
        raise HTTPException(
            status_code=504,
            detail=(
                "Chat request timed out while generating a response. "
                "Please retry with a shorter question or try again shortly."
            ),
        ) from exc
