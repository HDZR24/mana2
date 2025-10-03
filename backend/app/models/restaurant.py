from sqlalchemy import Column, Integer, String, Float, Text, Boolean
from sqlalchemy.dialects.postgresql import ARRAY
from app.db.session import Base

class Restaurant(Base):
    __tablename__ = "restaurant"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    location = Column(String)
    rating = Column(Float(2, 1))  
    image = Column(Text)
    description = Column(Text)
    specialties = Column(Text) 
