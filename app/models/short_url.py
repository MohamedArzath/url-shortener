from sqlalchemy import Column, DateTime, Integer, String
from app.core.database import Base
from datetime import datetime

class ShortUrl(Base):
    __tablename__ = "short_url"

    id = Column(Integer, primary_key=True, index=True)
    main_url = Column(String, index=True)
    short_url = Column(String)
    short_code = Column(String(12), unique=True, index=True)
    created_date = Column(DateTime, default=datetime.utcnow)
    expire_date = Column(DateTime, nullable=True)
    status = Column(Integer, default = 1)