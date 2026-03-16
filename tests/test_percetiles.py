from decimal import Decimal
import pytest
from backend.percetiles import PautasRepository, Area, TipoPauta, Pauta


@pytest.fixture(scope="module")
def repo():
    return PautasRepository()


def test_total_pautas(repo):
    assert len(repo.pautas) == 79


def test_area_counts(repo):
    ps = [p for p in repo.pautas if p.area.name == "Personal Social"]
    mf = [p for p in repo.pautas if p.area.name == "Motor Fino"]
    lng = [p for p in repo.pautas if p.area.name == "Lenguaje"]
    mg = [p for p in repo.pautas if p.area.name == "Motor Grueso"]
    assert len(ps) == 18
    assert len(mf) == 19
    assert len(lng) == 19
    assert len(mg) == 23


def test_find_by_id_valid(repo):
    p = repo.find_by_id(1)
    assert p is not None
    assert p.id == 1
    assert p.name == "Comunicación con el observador"


def test_find_by_id_invalid(repo):
    p = repo.find_by_id(999)
    assert p is None


def test_is_pauta_a_above_p90(repo):
    p = repo.find_by_id(1)  # p90 = 0.27
    assert p.is_pauta_a(Decimal("0.50")) is True


def test_is_pauta_a_at_p90(repo):
    p = repo.find_by_id(1)  # p90 = 0.27
    assert p.is_pauta_a(Decimal("0.27")) is False  # not strictly greater


def test_is_pauta_b_within_range(repo):
    p = repo.find_by_id(1)  # p75=0.12, p90=0.27
    assert p.is_pauta_b(Decimal("0.20")) is True


def test_is_pauta_b_at_p75(repo):
    p = repo.find_by_id(1)  # p75=0.12
    assert p.is_pauta_b(Decimal("0.12")) is True


def test_is_pauta_b_at_p90(repo):
    p = repo.find_by_id(1)  # p90=0.27
    assert p.is_pauta_b(Decimal("0.27")) is True


def test_should_evaluate_in_range(repo):
    p = repo.find_by_id(1)  # p75=0.12, p90=0.27
    assert p.should_evaluate(Decimal("0.20")) is True


def test_should_evaluate_too_old(repo):
    p = repo.find_by_id(1)  # p90=0.27
    # age - 1 = 1.28 + 1 = ... age must be > p90+1 = 1.27
    assert p.should_evaluate(Decimal("1.50")) is False


def test_should_evaluate_too_young(repo):
    p = repo.find_by_id(79)  # p75=5.28, p90=5.95
    assert p.should_evaluate(Decimal("1.00")) is False


def test_area_class():
    area = Area(1, "Test Area")
    assert str(area) == "Test Area"


def test_tipo_pauta_class():
    tipo = TipoPauta(1, "Prueba")
    assert str(tipo) == "Prueba"


def test_pauta_str(repo):
    p = repo.find_by_id(1)
    s = str(p)
    assert "1" in s
    assert "Comunicación" in s
