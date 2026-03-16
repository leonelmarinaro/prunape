from datetime import date, datetime
import pytest
from sqlalchemy import create_engine, StaticPool
from sqlalchemy.orm import sessionmaker
from backend.database import Base
from backend import models


@pytest.fixture(scope="function")
def db():
    engine = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(bind=engine)
    Session = sessionmaker(bind=engine)
    session = Session()
    yield session
    session.close()
    Base.metadata.drop_all(bind=engine)
    engine.dispose()


def test_create_patient(db):
    patient = models.Patient(name="Test", birth_date=date(2023, 1, 1))
    db.add(patient)
    db.commit()
    assert patient.id is not None
    assert patient.name == "Test"


def test_patient_with_gestational_age(db):
    patient = models.Patient(
        name="Prem", birth_date=date(2024, 1, 1), gestational_age_weeks=32
    )
    db.add(patient)
    db.commit()
    assert patient.gestational_age_weeks == 32


def test_create_assessment(db):
    patient = models.Patient(name="Test", birth_date=date(2023, 1, 1))
    db.add(patient)
    db.flush()
    assessment = models.Assessment(
        patient_id=patient.id,
        assessment_date=date(2024, 1, 1),
        chronological_age=1.0,
        result="PASA",
    )
    db.add(assessment)
    db.commit()
    assert assessment.id is not None


def test_patient_assessment_cascade(db):
    patient = models.Patient(name="Test", birth_date=date(2023, 1, 1))
    db.add(patient)
    db.flush()
    assessment = models.Assessment(
        patient_id=patient.id,
        assessment_date=date(2024, 1, 1),
        chronological_age=1.0,
        result="PASA",
    )
    db.add(assessment)
    db.commit()

    # Delete patient, assessment should cascade
    db.delete(patient)
    db.commit()
    remaining = db.query(models.Assessment).filter_by(id=assessment.id).first()
    assert remaining is None


def test_get_db_yields_session():
    from backend.database import get_db

    gen = get_db()
    db = next(gen)
    assert db is not None
    try:
        next(gen)
    except StopIteration:
        pass


def test_create_assessment_item(db):
    patient = models.Patient(name="Test", birth_date=date(2023, 1, 1))
    db.add(patient)
    db.flush()
    assessment = models.Assessment(
        patient_id=patient.id,
        assessment_date=date(2024, 1, 1),
        chronological_age=1.0,
        result="PASA",
    )
    db.add(assessment)
    db.flush()
    item = models.AssessmentItem(
        assessment_id=assessment.id,
        pauta_id=1,
        pauta_name="Test pauta",
        area="Personal Social",
        pauta_type="A",
        passed=True,
    )
    db.add(item)
    db.commit()
    assert item.id is not None
