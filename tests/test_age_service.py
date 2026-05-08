from datetime import date
from decimal import Decimal
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


def test_chronological_age_returns_decimal():
    age = calculate_chronological_age(date(2023, 1, 1), date(2024, 1, 1))
    assert isinstance(age, Decimal)


def test_chronological_age_quantized_to_two_decimals():
    age = calculate_chronological_age(date(2023, 3, 15), date(2025, 7, 20))
    assert age == age.quantize(Decimal("0.01"))


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


def test_corrected_age_37_weeks_no_correction():
    """37 semanas exactas NO debe aplicar corrección (límite: < 37)."""
    corrected = calculate_corrected_age(
        date(2023, 1, 1), date(2024, 1, 1), gestational_age_weeks=37
    )
    assert corrected is None


def test_corrected_age_36_weeks_applies_correction():
    """36 semanas (< 37) SÍ debe aplicar corrección."""
    corrected = calculate_corrected_age(
        date(2023, 1, 1), date(2024, 1, 1), gestational_age_weeks=36
    )
    assert corrected is not None


def test_corrected_age_over_2_years():
    corrected = calculate_corrected_age(
        date(2021, 1, 1), date(2024, 1, 1), gestational_age_weeks=32
    )
    assert corrected is None


def test_corrected_age_exactly_2_years_no_correction():
    """Niño prematuro con edad cronológica exactamente 2 años NO debe tener corrección."""
    # 2 años exactos (730 días ~ 2.00)
    corrected = calculate_corrected_age(
        date(2022, 1, 1), date(2024, 1, 1), gestational_age_weeks=30
    )
    assert corrected is None


def test_corrected_age_just_under_2_years_applies():
    """Niño prematuro con menos de 2 años SÍ debe tener corrección."""
    corrected = calculate_corrected_age(
        date(2022, 3, 1), date(2024, 1, 1), gestational_age_weeks=30
    )
    assert corrected is not None


def test_get_effective_age_uses_corrected():
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


def test_get_applicable_pautas_valid_types():
    """pauta_type debe ser A, B o N/A — nunca un valor arbitrario."""
    pautas = get_applicable_pautas(Decimal("1.50"))
    for p in pautas:
        assert p["pauta_type"] in ("A", "B", "N/A")
        assert "id" in p
        assert "name" in p
        assert "area" in p


def test_get_applicable_pautas_includes_upcoming_labeled_na():
    """Pautas próximas (p75 > age pero dentro de la ventana de 0.5 años) deben etiquetarse N/A."""
    # A edad 0.05, pauta 1 (p75=0.12, p90=0.27) es upcoming → N/A
    pautas = get_applicable_pautas(Decimal("0.05"))
    types = {p["pauta_type"] for p in pautas}
    assert "N/A" in types


def test_get_applicable_pautas_no_b_mislabeled():
    """Ninguna pauta debe estar etiquetada B si is_pauta_b es False para esa edad."""
    from backend.percentiles import pautas_repo

    age = Decimal("0.05")
    pautas = get_applicable_pautas(age)
    for p in pautas:
        pauta_obj = pautas_repo.find_by_id(p["id"])
        assert pauta_obj is not None, f"Pauta {p['id']} no encontrada en el repositorio"
        if p["pauta_type"] == "B":
            assert pauta_obj.is_pauta_b(age), (
                f"Pauta {p['id']} etiquetada B pero is_pauta_b=False"
            )
        if p["pauta_type"] == "A":
            assert pauta_obj.is_pauta_a(age), (
                f"Pauta {p['id']} etiquetada A pero is_pauta_a=False"
            )


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
    assert "pauta_type" not in p


def test_get_pauta_by_id_exists():
    p = get_pauta_by_id(1)
    assert p is not None
    assert p.id == 1


def test_get_pauta_by_id_not_found():
    p = get_pauta_by_id(999)
    assert p is None
