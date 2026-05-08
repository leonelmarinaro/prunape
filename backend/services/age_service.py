from datetime import date
from decimal import Decimal
from typing import Optional

from backend.percentiles import pautas_repo as _repo


def calculate_chronological_age(birth_date: date, assessment_date: date) -> Decimal:
    delta = assessment_date - birth_date
    return (Decimal(delta.days) / Decimal("365.25")).quantize(Decimal("0.01"))


def calculate_corrected_age(
    birth_date: date,
    assessment_date: date,
    gestational_age_weeks: Optional[int] = None,
) -> Optional[Decimal]:
    if gestational_age_weeks is None or gestational_age_weeks >= 37:
        return None

    chronological_age = calculate_chronological_age(birth_date, assessment_date)

    if chronological_age >= 2:
        return None

    weeks_premature = 40 - gestational_age_weeks
    years_correction = (Decimal(weeks_premature) / Decimal("52")).quantize(
        Decimal("0.01")
    )
    return chronological_age - years_correction


def get_effective_age(
    birth_date: date,
    assessment_date: date,
    gestational_age_weeks: Optional[int] = None,
) -> Decimal:
    corrected = calculate_corrected_age(
        birth_date, assessment_date, gestational_age_weeks
    )
    if corrected is not None:
        return corrected
    return calculate_chronological_age(birth_date, assessment_date)


def get_applicable_pautas(age: Decimal) -> list[dict]:
    result = []
    for pauta in _repo.pautas:
        if not pauta.should_evaluate(age):
            continue
        if pauta.is_pauta_a(age):
            pauta_type = "A"
        elif pauta.is_pauta_b(age):
            pauta_type = "B"
        else:
            pauta_type = "N/A"
        result.append(
            {
                "id": pauta.id,
                "name": pauta.name,
                "area": pauta.area.name,
                "p75": float(pauta.p75),
                "p90": float(pauta.p90),
                "tipo_pauta": pauta.tipo_pauta.name,
                "pauta_type": pauta_type,
                "rango_aprobacion": pauta.rango_aprobacion,
            }
        )
    return result


def get_pauta_by_id(pauta_id: int):
    return _repo.find_by_id(pauta_id)


def get_all_pautas() -> list[dict]:
    result = []
    for pauta in _repo.pautas:
        result.append(
            {
                "id": pauta.id,
                "name": pauta.name,
                "area": pauta.area.name,
                "p75": float(pauta.p75),
                "p90": float(pauta.p90),
                "tipo_pauta": pauta.tipo_pauta.name,
                "rango_aprobacion": pauta.rango_aprobacion,
            }
        )
    return result
