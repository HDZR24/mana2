from sqlalchemy.orm import Session
from app.models.chat_message import ChatMessage
from app.schemas.chat_message import ChatMessageCreate
from typing import List

def create_chat_message(db: Session, message: ChatMessageCreate):
    db_message = ChatMessage(**message.model_dump())
    db.add(db_message)
    db.commit()
    db.refresh(db_message)
    return db_message

def get_chat_messages_by_user(db: Session, user_id: int, skip: int = 0, limit: int = 100):
    return db.query(ChatMessage)\
        .filter(ChatMessage.user_id == user_id)\
        .order_by(ChatMessage.timestamp.asc())\
        .offset(skip)\
        .limit(limit)\
        .all()

def get_chat_message(db: Session, message_id: int):
    return db.query(ChatMessage).filter(ChatMessage.id == message_id).first()
