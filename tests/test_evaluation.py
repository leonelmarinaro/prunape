from decimal import Decimal
import pytest
from backend.services.evaluation import evaluate


AGE = Decimal("3.00")
# Pauta 1: p75=0.12, p90=0.27
PAUTA_1_ID = 1
PAUTA_1_P75 = Decimal("0.12")
PAUTA_1_P90 = Decimal("0.27")
# Pauta 30: p75=2.61, p90=3.12 → type B at age 3.00
PAUTA_B_ID = 30
# Pauta 16: p75=2.74, p90=3.17 → type B at age 3.00
PAUTA_B2_ID = 16


def test_all_pass():
    items = [{"pauta_id": PAUTA_1_ID, "passed": True}]
    result, details = evaluate(items, AGE)
    assert result == "PASA"
    assert len(details["type_a_failures"]) == 0
    assert len(details["type_b_failures"]) == 0


def test_one_type_a_failure():
    items = [{"pauta_id": PAUTA_1_ID, "passed": False}]
    result, details = evaluate(items, AGE)
    assert result == "NO_PASA"
    assert len(details["type_a_failures"]) == 1
    assert details["type_a_failures"][0]["type"] == "A"


def test_two_type_b_failures():
    items = [
        {"pauta_id": PAUTA_B2_ID, "passed": False},
        {"pauta_id": PAUTA_B_ID, "passed": False},
    ]
    result, details = evaluate(items, AGE)
    assert result == "NO_PASA"
    assert len(details["type_b_failures"]) == 2


def test_one_type_b_failure_passes():
    items = [{"pauta_id": PAUTA_B_ID, "passed": False}]
    result, details = evaluate(items, AGE)
    assert result == "PASA"
    assert len(details["type_b_failures"]) == 1


def test_mix_a_and_b_failures():
    items = [
        {"pauta_id": PAUTA_1_ID, "passed": False},
        {"pauta_id": PAUTA_B_ID, "passed": False},
    ]
    result, details = evaluate(items, AGE)
    assert result == "NO_PASA"


def test_empty_items():
    result, details = evaluate([], AGE)
    assert result == "PASA"
    assert details["total_tested"] == 0


def test_unknown_pauta_id_raises():
    """evaluate() debe lanzar ValueError para pauta_id desconocido (mismo contrato que el router)."""
    items = [{"pauta_id": 9999, "passed": False}]
    with pytest.raises(ValueError, match="9999"):
        evaluate(items, AGE)


def test_details_structure():
    items = [{"pauta_id": PAUTA_1_ID, "passed": False}]
    result, details = evaluate(items, AGE)
    assert "type_a_failures" in details
    assert "type_b_failures" in details
    assert "total_tested" in details
    assert "reason" in details
    assert details["total_tested"] == 1


# --- Boundary tests ---


def test_age_exactly_at_p90_is_type_b_not_a():
    """age == p90 debe clasificar como B (is_pauta_b incluye el límite superior)."""
    items = [{"pauta_id": PAUTA_1_ID, "passed": False}]
    result, details = evaluate(items, PAUTA_1_P90)
    assert len(details["type_a_failures"]) == 0
    assert len(details["type_b_failures"]) == 1
    assert result == "PASA"  # solo 1 B → PASA


def test_age_just_above_p90_is_type_a():
    """age > p90 (por un centésimo) debe clasificar como A."""
    age_just_above = PAUTA_1_P90 + Decimal("0.01")
    items = [{"pauta_id": PAUTA_1_ID, "passed": False}]
    result, details = evaluate(items, age_just_above)
    assert len(details["type_a_failures"]) == 1
    assert result == "NO_PASA"


def test_age_exactly_at_p75_is_type_b():
    """age == p75 debe clasificar como B."""
    items = [{"pauta_id": PAUTA_1_ID, "passed": False}]
    result, details = evaluate(items, PAUTA_1_P75)
    assert len(details["type_b_failures"]) == 1
    assert len(details["type_a_failures"]) == 0


def test_age_below_p75_not_counted_as_failure():
    """Falla en pauta donde age < p75 no debe sumar ni A ni B."""
    age_below = PAUTA_1_P75 - Decimal("0.01")
    items = [{"pauta_id": PAUTA_1_ID, "passed": False}]
    result, details = evaluate(items, age_below)
    assert len(details["type_a_failures"]) == 0
    assert len(details["type_b_failures"]) == 0
    assert result == "PASA"


def test_passed_item_never_counts_as_failure():
    """Pauta aprobada no debe aparecer en failures independientemente del tipo."""
    items = [
        {"pauta_id": PAUTA_1_ID, "passed": True},
        {"pauta_id": PAUTA_B_ID, "passed": True},
    ]
    result, details = evaluate(items, AGE)
    assert result == "PASA"
    assert details["type_a_failures"] == []
    assert details["type_b_failures"] == []
