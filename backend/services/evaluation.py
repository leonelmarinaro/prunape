from decimal import Decimal

from backend.percentiles import pautas_repo as _repo


def evaluate(items: list[dict], age: Decimal) -> tuple[str, dict]:
    """
    Evaluate assessment items and determine PASA / NO_PASA.

    Raises:
        ValueError: if any pauta_id is not found in the repository.
    """
    type_a_failures = []
    type_b_failures = []

    for item in items:
        if item["passed"]:
            continue

        pauta = _repo.find_by_id(item["pauta_id"])
        if pauta is None:
            raise ValueError(f"Pauta {item['pauta_id']} no encontrada")

        if pauta.is_pauta_a(age):
            type_a_failures.append(
                {
                    "pauta_id": pauta.id,
                    "name": pauta.name,
                    "area": pauta.area.name,
                    "type": "A",
                }
            )
        elif pauta.is_pauta_b(age):
            type_b_failures.append(
                {
                    "pauta_id": pauta.id,
                    "name": pauta.name,
                    "area": pauta.area.name,
                    "type": "B",
                }
            )

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
