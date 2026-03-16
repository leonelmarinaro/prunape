from datetime import date
from decimal import Decimal
import pytest
from backend.child import Child


def test_age_zero_days():
    child = Child(birth_date=date(2024, 1, 1), survey_date=date(2024, 1, 1))
    assert child.calculate_age() == Decimal("0.00")


def test_age_one_year():
    child = Child(birth_date=date(2023, 1, 1), survey_date=date(2024, 1, 1))
    age = child.calculate_age()
    assert Decimal("0.99") <= age <= Decimal("1.01")


def test_age_six_years():
    child = Child(birth_date=date(2018, 1, 1), survey_date=date(2024, 1, 1))
    age = child.calculate_age()
    assert Decimal("5.98") <= age <= Decimal("6.02")


def test_corrected_age_premature_under_2():
    # 32 weeks premature, assessed at 1 year
    child = Child(
        birth_date=date(2023, 1, 1),
        survey_date=date(2024, 1, 1),
        gestational_age_weeks=32,
    )
    corrected = child.calculate_corrected_age()
    chronological = child.calculate_age()
    # 8 weeks premature = 8/52 ≈ 0.15 year correction
    assert corrected < chronological
    assert corrected == chronological - Decimal(str(8 / 52)).quantize(Decimal("0.01"))


def test_corrected_age_premature_over_2():
    # 32 weeks premature, assessed at 3 years - no correction
    child = Child(
        birth_date=date(2021, 1, 1),
        survey_date=date(2024, 1, 1),
        gestational_age_weeks=32,
    )
    corrected = child.calculate_corrected_age()
    chronological = child.calculate_age()
    # Over 2 years, no correction applied
    assert corrected == chronological


def test_corrected_age_at_term():
    # 40 weeks = term, no correction
    child = Child(
        birth_date=date(2023, 1, 1),
        survey_date=date(2024, 1, 1),
        gestational_age_weeks=40,
    )
    corrected = child.calculate_corrected_age()
    chronological = child.calculate_age()
    assert corrected == chronological


def test_corrected_age_near_term():
    # 37 weeks = no correction (< 37 required)
    child = Child(
        birth_date=date(2023, 1, 1),
        survey_date=date(2024, 1, 1),
        gestational_age_weeks=37,
    )
    corrected = child.calculate_corrected_age()
    chronological = child.calculate_age()
    assert corrected == chronological


def test_str_no_correction():
    child = Child(
        birth_date=date(2023, 1, 1),
        survey_date=date(2024, 1, 1),
        gestational_age_weeks=40,
    )
    s = str(child)
    assert "Edad:" in s
    assert "corregida" not in s


def test_str_with_correction():
    child = Child(
        birth_date=date(2023, 1, 1),
        survey_date=date(2024, 1, 1),
        gestational_age_weeks=32,
    )
    s = str(child)
    assert "corregida" in s


def test_default_survey_date():
    from datetime import date as date_module

    child = Child(birth_date=date(2023, 1, 1))
    assert child.survey_date == date_module.today()
