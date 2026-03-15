from datetime import date, datetime
from typing import Optional
from pydantic import BaseModel


# Patient schemas
class PatientCreate(BaseModel):
    name: str
    birth_date: date
    gestational_age_weeks: Optional[int] = None


class PatientUpdate(BaseModel):
    name: Optional[str] = None
    birth_date: Optional[date] = None
    gestational_age_weeks: Optional[int] = None


class PatientResponse(BaseModel):
    id: int
    name: str
    birth_date: date
    gestational_age_weeks: Optional[int]
    created_at: datetime

    class Config:
        from_attributes = True


# Pauta schemas
class PautaResponse(BaseModel):
    id: int
    name: str
    area: str
    p75: float
    p90: float
    tipo_pauta: str
    rango_aprobacion: str


# Age calculation
class AgeCalculationRequest(BaseModel):
    patient_id: Optional[int] = None
    birth_date: Optional[date] = None
    gestational_age_weeks: Optional[int] = None
    assessment_date: date


class ApplicablePauta(BaseModel):
    id: int
    name: str
    area: str
    p75: float
    p90: float
    tipo_pauta: str
    pauta_type: str  # "A" or "B"
    rango_aprobacion: str


class AgeCalculationResponse(BaseModel):
    chronological_age: float
    corrected_age: Optional[float]
    applicable_pautas: list[ApplicablePauta]


# Assessment schemas
class AssessmentItemCreate(BaseModel):
    pauta_id: int
    passed: bool


class AssessmentCreate(BaseModel):
    patient_id: int
    assessment_date: date
    items: list[AssessmentItemCreate]


class AssessmentItemResponse(BaseModel):
    id: int
    pauta_id: int
    pauta_name: str
    area: str
    pauta_type: str
    passed: bool

    class Config:
        from_attributes = True


class AssessmentResponse(BaseModel):
    id: int
    patient_id: int
    assessment_date: date
    chronological_age: float
    corrected_age: Optional[float]
    result: str
    created_at: datetime
    items: list[AssessmentItemResponse] = []

    class Config:
        from_attributes = True


class PatientDetailResponse(PatientResponse):
    assessments: list[AssessmentResponse] = []
