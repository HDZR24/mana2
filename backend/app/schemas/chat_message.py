from pydantic import BaseModel
from datetime import datetime

class ChatMessageBase(BaseModel):
    user_id: int
    role: str
    content: str

class ChatMessageCreate(ChatMessageBase):
    pass

class ChatMessage(ChatMessageBase):
    id: int
    timestamp: datetime

    class Config:
        from_attributes = True