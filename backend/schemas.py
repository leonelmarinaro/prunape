from datetime import date, datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, field_validator, model_validator


# Patient schemas
class PatientCreate(BaseModel):
    name: str
    birth_date: date
    gestational_age_weeks: Optional[int] = None

    @field_validator("birth_date")
    @classmethod
    def birth_date_not_future(cls, v: date) -> date:
        if v > date.today():
            raise ValueError("La fecha de nacimiento no puede ser en el futuro")
        return v

    @field_validator("gestational_age_weeks")
    @classmethod
    def gestational_age_in_range(cls, v: Optional[int]) -> Optional[int]:
        if v is not None and not (20 <= v <= 44):
            raise ValueError("La edad gestacional debe estar entre 20 y 44 semanas")
        return v


class PatientUpdate(BaseModel):
    name: Optional[str] = None
    birth_date: Optional[date] = None
    gestational_age_weeks: Optional[int] = None

    @field_validator("birth_date")
    @classmethod
    def birth_date_not_future(cls, v: Optional[date]) -> Optional[date]:
        if v is not None and v > date.today():
            raise ValueError("La fecha de nacimiento no puede ser en el futuro")
        return v

    @field_validator("gestational_age_weeks")
    @classmethod
    def gestational_age_in_range(cls, v: Optional[int]) -> Optional[int]:
        if v is not None and not (20 <= v <= 44):
            raise ValueError("La edad gestacional debe estar entre 20 y 44 semanas")
        return v


class PatientResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    birth_date: date
    gestational_age_weeks: Optional[int]
    created_at: datetime


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
    pauta_type: str  # "A", "B", or "N/A"
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

    @field_validator("items")
    @classmethod
    def items_not_empty(
        cls, v: list[AssessmentItemCreate]
    ) -> list[AssessmentItemCreate]:
        if not v:
            raise ValueError("La evaluación debe incluir al menos una pauta")
        return v

    @model_validator(mode="after")
    def no_duplicate_pautas(self) -> "AssessmentCreate":
        ids = [item.pauta_id for item in self.items]
        if len(ids) != len(set(ids)):
            raise ValueError("No se pueden repetir pautas en una misma evaluación")
        return self


class AssessmentItemResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    pauta_id: int
    pauta_name: str
    area: str
    pauta_type: str
    passed: bool


class AssessmentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    patient_id: int
    assessment_date: date
    chronological_age: float
    corrected_age: Optional[float]
    result: str
    created_at: datetime
    items: list[AssessmentItemResponse] = []


class PatientDetailResponse(PatientResponse):
    assessments: list[AssessmentResponse] = []
