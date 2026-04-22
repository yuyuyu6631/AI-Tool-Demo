from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field, field_validator
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.services.rag_chat_service import stream_chat_rag

router = APIRouter()


class ChatMessage(BaseModel):
    role: str = Field(min_length=1, max_length=32)
    content: str = Field(min_length=1)

    @field_validator("role", mode="before")
    @classmethod
    def normalize_role(cls, value: str) -> str:
        normalized = value.strip().lower() if isinstance(value, str) else value
        if normalized not in {"user", "assistant", "system"}:
            raise ValueError("role must be one of: user, assistant, system")
        return normalized

    @field_validator("content", mode="before")
    @classmethod
    def strip_content(cls, value: str) -> str:
        return value.strip() if isinstance(value, str) else value


class ChatRequest(BaseModel):
    messages: list[ChatMessage] = Field(min_length=1)


@router.post("")
def chat_stream(payload: ChatRequest, db: Session = Depends(get_db)):
    """流式 SSE 对话接口，返回标准 Server-Sent Events 格式。"""
    messages_dict = [{"role": msg.role, "content": msg.content} for msg in payload.messages]
    return StreamingResponse(
        stream_chat_rag(db=db, messages=messages_dict),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",  # Nginx 代理不缓冲
        },
    )
