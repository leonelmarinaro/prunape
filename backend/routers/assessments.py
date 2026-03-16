from decimal import Decimal
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from .. import models, schemas
from ..services import age_service, evaluation

router = APIRouter(prefix="/api/assessments", tags=["assessments"])


@router.post("/calculate-age", response_model=schemas.AgeCalculationResponse)
def calculate_age(req: schemas.AgeCalculationRequest, db: Session = Depends(get_db)):
    birth_date = req.birth_date
    gestational_age_weeks = req.gestational_age_weeks

    if req.patient_id:
        patient = db.query(models.Patient).filter(models.Patient.id == req.patient_id).first()
        if not patient:
            raise HTTPException(status_code=404, detail="Paciente no encontrado")
        birth_date = patient.birth_date
        gestational_age_weeks = patient.gestational_age_weeks

    if not birth_date:
        raise HTTPException(status_code=400, detail="Se requiere fecha de nacimiento")

    chrono = age_service.calculate_chronological_age(birth_date, req.assessment_date)
    corrected = age_service.calculate_corrected_age(birth_date, req.assessment_date, gestational_age_weeks)
    effective = corrected if corrected is not None else chrono
    applicable = age_service.get_applicable_pautas(effective)

    return schemas.AgeCalculationResponse(
        chronological_age=float(chrono),
        corrected_age=float(corrected) if corrected is not None else None,
        applicable_pautas=applicable,
    )


@router.post("", response_model=schemas.AssessmentResponse, status_code=201)
def create_assessment(req: schemas.AssessmentCreate, db: Session = Depends(get_db)):
    patient = db.query(models.Patient).filter(models.Patient.id == req.patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Paciente no encontrado")

    chrono = age_service.calculate_chronological_age(patient.birth_date, req.assessment_date)
    corrected = age_service.calculate_corrected_age(
        patient.birth_date, req.assessment_date, patient.gestational_age_weeks
    )
    effective = corrected if corrected is not None else chrono

    # Build items for evaluation
    eval_items = []
    for item in req.items:
        pauta = age_service.get_pauta_by_id(item.pauta_id)
        if not pauta:
            raise HTTPException(status_code=400, detail=f"Pauta {item.pauta_id} no encontrada")
        eval_items.append({"pauta_id": item.pauta_id, "passed": item.passed})

    result, details = evaluation.evaluate(eval_items, effective)

    # Persist
    assessment = models.Assessment(
        patient_id=req.patient_id,
        assessment_date=req.assessment_date,
        chronological_age=float(chrono),
        corrected_age=float(corrected) if corrected is not None else None,
        result=result,
    )
    db.add(assessment)
    db.flush()

    for item in req.items:
        pauta = age_service.get_pauta_by_id(item.pauta_id)
        pauta_type = "A" if pauta.is_pauta_a(effective) else "B"
        db_item = models.AssessmentItem(
            assessment_id=assessment.id,
            pauta_id=item.pauta_id,
            pauta_name=pauta.name,
            area=pauta.area.name,
            pauta_type=pauta_type,
            passed=item.passed,
        )
        db.add(db_item)

    db.commit()
    db.refresh(assessment)
    return assessment


@router.get("/{assessment_id}", response_model=schemas.AssessmentResponse)
def get_assessment(assessment_id: int, db: Session = Depends(get_db)):
    assessment = db.query(models.Assessment).filter(models.Assessment.id == assessment_id).first()
    if not assessment:
        raise HTTPException(status_code=404, detail="Evaluación no encontrada")
    return assessment


@router.delete("/{assessment_id}", status_code=204)
def delete_assessment(assessment_id: int, db: Session = Depends(get_db)):
    assessment = db.query(models.Assessment).filter(models.Assessment.id == assessment_id).first()
    if not assessment:
        raise HTTPException(status_code=404, detail="Evaluación no encontrada")
    db.delete(assessment)
    db.commit()
