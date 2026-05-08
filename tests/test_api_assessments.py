def test_calculate_age_with_birth_date(client):
    response = client.post(
        "/api/assessments/calculate-age",
        json={
            "birth_date": "2023-01-01",
            "assessment_date": "2024-06-01",
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert "chronological_age" in data
    assert "applicable_pautas" in data
    assert isinstance(data["applicable_pautas"], list)


def test_calculate_age_with_patient_id(client, sample_patient_data):
    sample_patient_data["birth_date"] = "2023-01-01"
    created = client.post("/api/patients", json=sample_patient_data).json()
    response = client.post(
        "/api/assessments/calculate-age",
        json={
            "patient_id": created["id"],
            "assessment_date": "2024-06-01",
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert data["corrected_age"] is None


def test_calculate_age_premature(client, sample_premature_patient_data):
    sample_premature_patient_data["birth_date"] = "2023-06-01"
    created = client.post("/api/patients", json=sample_premature_patient_data).json()
    response = client.post(
        "/api/assessments/calculate-age",
        json={
            "patient_id": created["id"],
            "assessment_date": "2024-06-01",
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert data["corrected_age"] is not None


def test_calculate_age_patient_not_found(client):
    response = client.post(
        "/api/assessments/calculate-age",
        json={
            "patient_id": 9999,
            "assessment_date": "2024-06-01",
        },
    )
    assert response.status_code == 404


def test_calculate_age_no_birth_date(client):
    response = client.post(
        "/api/assessments/calculate-age",
        json={
            "assessment_date": "2024-06-01",
        },
    )
    assert response.status_code == 400


def test_create_assessment_pasa(client, sample_patient_data):
    sample_patient_data["birth_date"] = "2022-01-01"
    patient = client.post("/api/patients", json=sample_patient_data).json()
    response = client.post(
        "/api/assessments",
        json={
            "patient_id": patient["id"],
            "assessment_date": "2025-01-01",
            "items": [{"pauta_id": 1, "passed": True}],
        },
    )
    assert response.status_code == 201
    data = response.json()
    assert data["result"] == "PASA"
    assert "id" in data


def test_create_assessment_no_pasa(client, sample_patient_data):
    sample_patient_data["birth_date"] = "2022-01-01"
    patient = client.post("/api/patients", json=sample_patient_data).json()
    response = client.post(
        "/api/assessments",
        json={
            "patient_id": patient["id"],
            "assessment_date": "2025-01-01",
            "items": [{"pauta_id": 1, "passed": False}],
        },
    )
    assert response.status_code == 201
    assert response.json()["result"] == "NO_PASA"


def test_create_assessment_patient_not_found(client):
    response = client.post(
        "/api/assessments",
        json={
            "patient_id": 9999,
            "assessment_date": "2024-01-01",
            "items": [{"pauta_id": 1, "passed": True}],
        },
    )
    assert response.status_code == 404


def test_get_assessment(client, sample_patient_data):
    sample_patient_data["birth_date"] = "2022-01-01"
    patient = client.post("/api/patients", json=sample_patient_data).json()
    created = client.post(
        "/api/assessments",
        json={
            "patient_id": patient["id"],
            "assessment_date": "2025-01-01",
            "items": [{"pauta_id": 1, "passed": True}],
        },
    ).json()
    response = client.get(f"/api/assessments/{created['id']}")
    assert response.status_code == 200
    assert response.json()["id"] == created["id"]


def test_get_assessment_not_found(client):
    response = client.get("/api/assessments/9999")
    assert response.status_code == 404


def test_delete_assessment(client, sample_patient_data):
    sample_patient_data["birth_date"] = "2022-01-01"
    patient = client.post("/api/patients", json=sample_patient_data).json()
    created = client.post(
        "/api/assessments",
        json={
            "patient_id": patient["id"],
            "assessment_date": "2025-01-01",
            "items": [{"pauta_id": 1, "passed": True}],
        },
    ).json()
    response = client.delete(f"/api/assessments/{created['id']}")
    assert response.status_code == 204
    get_response = client.get(f"/api/assessments/{created['id']}")
    assert get_response.status_code == 404


def test_delete_assessment_not_found(client):
    response = client.delete("/api/assessments/9999")
    assert response.status_code == 404


def test_create_assessment_invalid_pauta(client, sample_patient_data):
    sample_patient_data["birth_date"] = "2022-01-01"
    patient = client.post("/api/patients", json=sample_patient_data).json()
    response = client.post(
        "/api/assessments",
        json={
            "patient_id": patient["id"],
            "assessment_date": "2025-01-01",
            "items": [{"pauta_id": 9999, "passed": True}],
        },
    )
    assert response.status_code == 422


def test_create_assessment_empty_items(client, sample_patient_data):
    sample_patient_data["birth_date"] = "2022-01-01"
    patient = client.post("/api/patients", json=sample_patient_data).json()
    response = client.post(
        "/api/assessments",
        json={
            "patient_id": patient["id"],
            "assessment_date": "2025-01-01",
            "items": [],
        },
    )
    assert response.status_code == 422


def test_create_assessment_duplicate_pautas(client, sample_patient_data):
    sample_patient_data["birth_date"] = "2022-01-01"
    patient = client.post("/api/patients", json=sample_patient_data).json()
    response = client.post(
        "/api/assessments",
        json={
            "patient_id": patient["id"],
            "assessment_date": "2025-01-01",
            "items": [
                {"pauta_id": 1, "passed": True},
                {"pauta_id": 1, "passed": False},
            ],
        },
    )
    assert response.status_code == 422


def test_create_assessment_date_before_birth(client, sample_patient_data):
    sample_patient_data["birth_date"] = "2022-06-01"
    patient = client.post("/api/patients", json=sample_patient_data).json()
    response = client.post(
        "/api/assessments",
        json={
            "patient_id": patient["id"],
            "assessment_date": "2022-05-31",
            "items": [{"pauta_id": 1, "passed": True}],
        },
    )
    assert response.status_code == 422


def test_pauta_type_stored_correctly_type_a(client, sample_patient_data):
    """Pauta tipo A debe guardarse con pauta_type='A', no 'B'."""
    sample_patient_data["birth_date"] = "2022-01-01"
    patient = client.post("/api/patients", json=sample_patient_data).json()
    # Pauta 1 (p90=0.27) → a los 3 años es tipo A
    created = client.post(
        "/api/assessments",
        json={
            "patient_id": patient["id"],
            "assessment_date": "2025-01-01",
            "items": [{"pauta_id": 1, "passed": False}],
        },
    ).json()
    item = created["items"][0]
    assert item["pauta_type"] == "A"


def test_pauta_type_stored_correctly_type_b(client, sample_patient_data):
    """Pauta tipo B debe guardarse con pauta_type='B'."""
    sample_patient_data["birth_date"] = "2022-01-01"
    patient = client.post("/api/patients", json=sample_patient_data).json()
    # Pauta 30 (p75=2.61, p90=3.12) → a los 3 años es tipo B
    created = client.post(
        "/api/assessments",
        json={
            "patient_id": patient["id"],
            "assessment_date": "2025-01-01",
            "items": [{"pauta_id": 30, "passed": False}],
        },
    ).json()
    item = created["items"][0]
    assert item["pauta_type"] == "B"


def test_pauta_type_stored_correctly_type_na(client, sample_patient_data):
    """Pauta futura (age < p75) debe guardarse con pauta_type='N/A', no 'B'."""
    # Niño de ~0.5 años. Pauta 4 (p75=0.55, p90=0.68) → age < p75 → N/A
    sample_patient_data["birth_date"] = "2024-01-01"
    patient = client.post("/api/patients", json=sample_patient_data).json()
    created = client.post(
        "/api/assessments",
        json={
            "patient_id": patient["id"],
            "assessment_date": "2024-07-01",
            "items": [{"pauta_id": 4, "passed": True}],
        },
    ).json()
    item = created["items"][0]
    assert item["pauta_type"] == "N/A"
