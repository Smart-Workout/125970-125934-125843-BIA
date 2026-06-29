from fastapi import APIRouter                                               # Router groups chat endpoints under one API tag.

from app.schemas.chat import ChatRequest, ChatResponse                      # Request and response schemas keep chat payloads predictable.
from app.services.chat_service import answer_chat                           # Service layer contains retrieval-only chat logic.


router = APIRouter(prefix="/chat", tags=["chat"])                           # Final route path becomes /api/v1/chat after main.py adds prefix.


@router.post("", response_model=ChatResponse)
def chat(payload: ChatRequest) -> ChatResponse:
    return answer_chat(payload)                                             # Endpoint delegates retrieval and answer formatting to the service layer.
