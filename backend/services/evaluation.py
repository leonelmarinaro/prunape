from decimal import Decimal
from typing import Optional

import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
from percetiles import PautasRepository


_repo = PautasRepository()


def evaluate(items: list[dict], age: Decimal) -> tuple[str, dict]:
    """
    Evaluate assessment items and determine PASA / NO_PASA.

    Args:
        items: list of {"pauta_id": int, "passed": bool}
        age: effective age in decimal years

    Returns:
        (result, details) where result is "PASA" or "NO_PASA"
    """
    type_a_failures = []
    type_b_failures = []

    for item in items:
        if item["passed"]:
            continue

        pauta = _repo.find_by_id(item["pauta_id"])
        if pauta is None:
            continue

        if pauta.is_pauta_a(age):
            type_a_failures.append({
                "pauta_id": pauta.id,
                "name": pauta.name,
                "area": pauta.area.name,
                "type": "A",
            })
        elif pauta.is_pauta_b(age):
            type_b_failures.append({
                "pauta_id": pauta.id,
                "name": pauta.name,
                "area": pauta.area.name,
                "type": "B",
            })

    # Determination logic
    if len(type_a_failures) > 0:
        result = "NO_PASA"
        reason = f"Falla en {len(type_a_failures)} pauta(s) tipo A (por encima de P90)"
    elif len(type_b_failures) >= 2:
        result = "NO_PASA"
        reason = f"Falla en {len(type_b_failures)} pautas tipo B (entre P75-P90)"
    else:
        result = "PASA"
        reason = "Aprobado"

    details = {
        "type_a_failures": type_a_failures,
        "type_b_failures": type_b_failures,
        "total_tested": len(items),
        "reason": reason,
    }

    return result, details
