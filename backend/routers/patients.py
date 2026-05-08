from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from .. import models, schemas
from ..security.clerk_auth import ClerkUser, current_user

router = APIRouter(prefix="/api/patients", tags=["patients"])


@router.post("", response_model=schemas.PatientResponse, status_code=201)
def create_patient(
    patient: schemas.PatientCreate,
    db: Session = Depends(get_db),
    user: ClerkUser = Depends(current_user),
):
    db_patient = models.Patient(
        name=patient.name,
        birth_date=patient.birth_date,
        gestational_age_weeks=patient.gestational_age_weeks,
        created_by=user.user_id,
    )
    db.add(db_patient)
    db.commit()
    db.refresh(db_patient)
    return db_patient


@router.get("", response_model=list[schemas.PatientResponse])
def list_patients(
    search: str = "",
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    _user: ClerkUser = Depends(current_user),
):
    query = db.query(models.Patient)
    if search:
        query = query.filter(models.Patient.name.ilike(f"%{search}%"))
    return query.offset(skip).limit(limit).all()


@router.get("/{patient_id}", response_model=schemas.PatientDetailResponse)
def get_patient(
    patient_id: int,
    db: Session = Depends(get_db),
    _user: ClerkUser = Depends(current_user),
):
    patient = db.query(models.Patient).filter(models.Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Paciente no encontrado")
    return patient


@router.put("/{patient_id}", response_model=schemas.PatientResponse)
def update_patient(
    patient_id: int,
    update: schemas.PatientUpdate,
    db: Session = Depends(get_db),
    _user: ClerkUser = Depends(current_user),
):
    patient = db.query(models.Patient).filter(models.Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Paciente no encontrado")
    for field, value in update.model_dump(exclude_unset=True).items():
        setattr(patient, field, value)
    db.commit()
    db.refresh(patient)
    return patient


@router.delete("/{patient_id}", status_code=204)
def delete_patient(
    patient_id: int,
    db: Session = Depends(get_db),
    _user: ClerkUser = Depends(current_user),
):
    patient = db.query(models.Patient).filter(models.Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Paciente no encontrado")
    db.delete(patient)
    db.commit()
