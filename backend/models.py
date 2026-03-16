from datetime import date, datetime
from sqlalchemy import Column, Integer, String, Date, DateTime, Float, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from .database import Base


class Patient(Base):
    __tablename__ = "patients"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    birth_date = Column(Date, nullable=False)
    gestational_age_weeks = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    assessments = relationship("Assessment", back_populates="patient", cascade="all, delete-orphan")


class Assessment(Base):
    __tablename__ = "assessments"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    assessment_date = Column(Date, nullable=False)
    chronological_age = Column(Float, nullable=False)
    corrected_age = Column(Float, nullable=True)
    result = Column(String(10), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    patient = relationship("Patient", back_populates="assessments")
    items = relationship("AssessmentItem", back_populates="assessment", cascade="all, delete-orphan")


class AssessmentItem(Base):
    __tablename__ = "assessment_items"

    id = Column(Integer, primary_key=True, index=True)
    assessment_id = Column(Integer, ForeignKey("assessments.id"), nullable=False)
    pauta_id = Column(Integer, nullable=False)
    pauta_name = Column(String(200), nullable=False)
    area = Column(String(50), nullable=False)
    pauta_type = Column(String(1), nullable=False)
    passed = Column(Boolean, nullable=False)

    assessment = relationship("Assessment", back_populates="items")
