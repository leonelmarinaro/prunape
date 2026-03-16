from datetime import date
from decimal import Decimal
import pytest
from backend.services.age_service import (
    calculate_chronological_age,
    calculate_corrected_age,
    get_effective_age,
    get_applicable_pautas,
    get_all_pautas,
    get_pauta_by_id,
)


def test_chronological_age_one_year():
    age = calculate_chronological_age(date(2023, 1, 1), date(2024, 1, 1))
    assert Decimal("0.99") <= age <= Decimal("1.01")


def test_chronological_age_365_days():
    age = calculate_chronological_age(date(2023, 1, 1), date(2024, 1, 1))
    assert isinstance(age, Decimal)


def test_corrected_age_premature_under_2():
    corrected = calculate_corrected_age(
        date(2023, 6, 1), date(2024, 6, 1), gestational_age_weeks=32
    )
    assert corrected is not None
    assert corrected < Decimal("1.00")


def test_corrected_age_term():
    corrected = calculate_corrected_age(
        date(2023, 1, 1), date(2024, 1, 1), gestational_age_weeks=40
    )
    assert corrected is None


def test_corrected_age_none_gestational():
    corrected = calculate_corrected_age(
        date(2023, 1, 1), date(2024, 1, 1), gestational_age_weeks=None
    )
    assert corrected is None


def test_corrected_age_37_weeks():
    corrected = calculate_corrected_age(
        date(2023, 1, 1), date(2024, 1, 1), gestational_age_weeks=37
    )
    assert corrected is None


def test_corrected_age_over_2_years():
    corrected = calculate_corrected_age(
        date(2021, 1, 1), date(2024, 1, 1), gestational_age_weeks=32
    )
    assert corrected is None


def test_get_effective_age_uses_corrected():
    # premature under 2
    effective = get_effective_age(
        date(2023, 6, 1), date(2024, 6, 1), gestational_age_weeks=32
    )
    chrono = calculate_chronological_age(date(2023, 6, 1), date(2024, 6, 1))
    assert effective < chrono


def test_get_effective_age_uses_chronological():
    effective = get_effective_age(
        date(2023, 1, 1), date(2024, 1, 1), gestational_age_weeks=40
    )
    chrono = calculate_chronological_age(date(2023, 1, 1), date(2024, 1, 1))
    assert effective == chrono


def test_get_applicable_pautas_returns_list():
    pautas = get_applicable_pautas(Decimal("1.50"))
    assert isinstance(pautas, list)
    assert len(pautas) > 0


def test_get_applicable_pautas_type_a_b():
    pautas = get_applicable_pautas(Decimal("1.50"))
    for p in pautas:
        assert p["pauta_type"] in ("A", "B")
        assert "id" in p
        assert "name" in p
        assert "area" in p


def test_get_all_pautas_79():
    all_p = get_all_pautas()
    assert len(all_p) == 79


def test_get_all_pautas_structure():
    all_p = get_all_pautas()
    p = all_p[0]
    assert "id" in p
    assert "name" in p
    assert "area" in p
    assert "p75" in p
    assert "p90" in p
    assert "tipo_pauta" in p
    assert "rango_aprobacion" in p
    # No pauta_type in get_all_pautas
    assert "pauta_type" not in p


def test_get_pauta_by_id_exists():
    p = get_pauta_by_id(1)
    assert p is not None
    assert p.id == 1


def test_get_pauta_by_id_not_found():
    p = get_pauta_by_id(999)
    assert p is None
