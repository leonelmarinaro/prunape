from decimal import Decimal
import pytest
from backend.services.evaluation import evaluate


AGE = Decimal("3.00")
# Pauta 1: p75=0.12, p90=0.27 → type A at age 3.00 (p90 < age)
PAUTA_A_ID = 1
# Pauta 30: p75=2.61, p90=3.12 → type B at age 3.00 (p75 <= age <= p90)
PAUTA_B_ID = 30


def test_all_pass():
    items = [{"pauta_id": PAUTA_A_ID, "passed": True}]
    result, details = evaluate(items, AGE)
    assert result == "PASA"
    assert len(details["type_a_failures"]) == 0
    assert len(details["type_b_failures"]) == 0


def test_one_type_a_failure():
    items = [{"pauta_id": PAUTA_A_ID, "passed": False}]
    result, details = evaluate(items, AGE)
    assert result == "NO_PASA"
    assert len(details["type_a_failures"]) == 1
    assert details["type_a_failures"][0]["type"] == "A"


def test_two_type_b_failures():
    # Pauta 16: p75=2.74, p90=3.17 → type B at 3.00 ✓
    # Pauta 30: p75=2.61, p90=3.12 → type B at 3.00 ✓
    items = [
        {"pauta_id": 16, "passed": False},
        {"pauta_id": 30, "passed": False},
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
        {"pauta_id": PAUTA_A_ID, "passed": False},
        {"pauta_id": PAUTA_B_ID, "passed": False},
    ]
    result, details = evaluate(items, AGE)
    assert result == "NO_PASA"


def test_empty_items():
    result, details = evaluate([], AGE)
    assert result == "PASA"
    assert details["total_tested"] == 0


def test_unknown_pauta_id_ignored():
    items = [{"pauta_id": 9999, "passed": False}]
    result, details = evaluate(items, AGE)
    assert result == "PASA"  # Unknown pauta ignored


def test_details_structure():
    items = [{"pauta_id": PAUTA_A_ID, "passed": False}]
    result, details = evaluate(items, AGE)
    assert "type_a_failures" in details
    assert "type_b_failures" in details
    assert "total_tested" in details
    assert "reason" in details
    assert details["total_tested"] == 1
