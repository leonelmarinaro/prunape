from datetime import date
from decimal import Decimal
from typing import Optional

import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
from percetiles import PautasRepository


_repo = PautasRepository()


def calculate_chronological_age(birth_date: date, assessment_date: date) -> Decimal:
    """Calculate chronological age in decimal years."""
    delta = assessment_date - birth_date
    age_years = Decimal(delta.days / 365.25).quantize(Decimal("0.01"))
    return age_years


def calculate_corrected_age(
    birth_date: date,
    assessment_date: date,
    gestational_age_weeks: Optional[int] = None,
) -> Optional[Decimal]:
    """Calculate corrected age for prematurity. Returns None if no correction needed."""
    if gestational_age_weeks is None or gestational_age_weeks >= 37:
        return None

    chronological_age = calculate_chronological_age(birth_date, assessment_date)

    # Correction only applies under 2 years
    if chronological_age >= 2:
        return None

    weeks_premature = 40 - gestational_age_weeks
    years_correction = Decimal(weeks_premature / 52).quantize(Decimal("0.01"))
    corrected = chronological_age - years_correction
    return corrected


def get_effective_age(
    birth_date: date,
    assessment_date: date,
    gestational_age_weeks: Optional[int] = None,
) -> Decimal:
    """Get the age to use for evaluation (corrected if applicable, otherwise chronological)."""
    corrected = calculate_corrected_age(birth_date, assessment_date, gestational_age_weeks)
    if corrected is not None:
        return corrected
    return calculate_chronological_age(birth_date, assessment_date)


def get_applicable_pautas(age: Decimal) -> list[dict]:
    """Get pautas that should be evaluated for a child of the given age."""
    result = []
    for pauta in _repo.pautas:
        if pauta.should_evaluate(age):
            pauta_type = "A" if pauta.is_pauta_a(age) else "B" if pauta.is_pauta_b(age) else "B"
            result.append({
                "id": pauta.id,
                "name": pauta.name,
                "area": pauta.area.name,
                "p75": float(pauta.p75),
                "p90": float(pauta.p90),
                "tipo_pauta": pauta.tipo_pauta.name,
                "pauta_type": pauta_type,
                "rango_aprobacion": pauta.rango_aprobacion,
            })
    return result


def get_pauta_by_id(pauta_id: int):
    """Get a pauta by its ID."""
    return _repo.find_by_id(pauta_id)


def get_all_pautas() -> list[dict]:
    """Get all 79 pautas as dicts."""
    result = []
    for pauta in _repo.pautas:
        result.append({
            "id": pauta.id,
            "name": pauta.name,
            "area": pauta.area.name,
            "p75": float(pauta.p75),
            "p90": float(pauta.p90),
            "tipo_pauta": pauta.tipo_pauta.name,
            "rango_aprobacion": pauta.rango_aprobacion,
        })
    return result
