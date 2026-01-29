from sqlalchemy import Column, Integer, String, Float, Text, DateTime
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime

Base = declarative_base()

class EmailClassification(Base):
    __tablename__ = "email_classifications"
    id = Column(Integer, primary_key=True, autoincrement=True)
    content = Column(Text, nullable=False)
    subject = Column(String(500), nullable=True)
    category = Column(String(50), nullable=False)
    confidence = Column(Float, nullable=False)
    suggested_response = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    def __repr__(self):
        return f"<EmailClassification(id={self.id}, category={self.category})>"
