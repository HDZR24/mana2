from sqlalchemy import Column, Integer, String, Float, Boolean, Text, Numeric
from app.db.session import Base


class Dish(Base):
    __tablename__ = "dishes"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(Text, index=True)
    restaurant_id = Column(Integer, nullable=False)
    restaurant = Column(Text, nullable=True)
    rating = Column(Float, nullable=True)
    description = Column(Text)
    health_benefits = Column(Text, nullable=True)
    category = Column(String, nullable=True)
    price_usd = Column(Numeric, nullable=True)
    price_cop = Column(Numeric, nullable=True)
    price_delivery = Column(Numeric, nullable=True)
    main_protein = Column(Text, nullable=True)
    ingredients = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True)
