from datetime import date, datetime
from decimal import Decimal
import pytest
from pydantic import ValidationError
from backend.schemas import (
    PatientCreate,
    PatientResponse,
    AgeCalculationRequest,
    AssessmentCreate,
    AssessmentItemCreate,
    ApplicablePauta,
)


def test_patient_create_valid():
    p = PatientCreate(name="Juan", birth_date=date(2023, 1, 1))
    assert p.name == "Juan"
    assert p.gestational_age_weeks is None


def test_patient_create_with_gestational():
    p = PatientCreate(
        name="María", birth_date=date(2024, 1, 1), gestational_age_weeks=32
    )
    assert p.gestational_age_weeks == 32


def test_patient_response_from_attributes():
    # Should accept from_attributes = True (ORM mode)
    assert PatientResponse.model_config.get("from_attributes") is True


def test_age_calculation_request_with_patient_id():
    req = AgeCalculationRequest(patient_id=1, assessment_date=date(2024, 1, 1))
    assert req.patient_id == 1
    assert req.birth_date is None


def test_age_calculation_request_with_birth_date():
    req = AgeCalculationRequest(
        birth_date=date(2023, 1, 1), assessment_date=date(2024, 1, 1)
    )
    assert req.birth_date == date(2023, 1, 1)
    assert req.patient_id is None


def test_assessment_create_with_items():
    req = AssessmentCreate(
        patient_id=1,
        assessment_date=date(2024, 1, 1),
        items=[AssessmentItemCreate(pauta_id=1, passed=True)],
    )
    assert len(req.items) == 1
    assert req.items[0].pauta_id == 1


def test_applicable_pauta_types():
    p = ApplicablePauta(
        id=1,
        name="Test",
        area="Personal Social",
        p75=0.12,
        p90=0.27,
        tipo_pauta="Prueba",
        pauta_type="A",
        rango_aprobacion="",
    )
    assert p.pauta_type == "A"
