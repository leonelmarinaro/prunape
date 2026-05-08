import pytest
from datetime import date


def test_create_patient(client, sample_patient_data):
    response = client.post("/api/patients", json=sample_patient_data)
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == sample_patient_data["name"]
    assert "id" in data


def test_create_premature_patient(client, sample_premature_patient_data):
    response = client.post("/api/patients", json=sample_premature_patient_data)
    assert response.status_code == 201
    data = response.json()
    assert data["gestational_age_weeks"] == 32


def test_list_patients_empty(client):
    response = client.get("/api/patients")
    assert response.status_code == 200
    assert response.json() == []


def test_list_patients_with_data(client, sample_patient_data):
    client.post("/api/patients", json=sample_patient_data)
    response = client.get("/api/patients")
    assert response.status_code == 200
    assert len(response.json()) == 1


def test_list_patients_search(client, sample_patient_data):
    client.post("/api/patients", json=sample_patient_data)
    response = client.get("/api/patients?search=Juan")
    assert response.status_code == 200
    assert len(response.json()) == 1
    response2 = client.get("/api/patients?search=NoExiste")
    assert len(response2.json()) == 0


def test_get_patient(client, sample_patient_data):
    created = client.post("/api/patients", json=sample_patient_data).json()
    response = client.get(f"/api/patients/{created['id']}")
    assert response.status_code == 200
    assert response.json()["id"] == created["id"]


def test_get_patient_not_found(client):
    response = client.get("/api/patients/9999")
    assert response.status_code == 404


def test_get_patient_with_assessments(client, sample_patient_data):
    created = client.post("/api/patients", json=sample_patient_data).json()
    response = client.get(f"/api/patients/{created['id']}")
    assert response.status_code == 200
    assert "assessments" in response.json()


def test_update_patient(client, sample_patient_data):
    created = client.post("/api/patients", json=sample_patient_data).json()
    response = client.put(
        f"/api/patients/{created['id']}", json={"name": "Nuevo Nombre"}
    )
    assert response.status_code == 200
    assert response.json()["name"] == "Nuevo Nombre"


def test_update_patient_partial(client, sample_patient_data):
    created = client.post("/api/patients", json=sample_patient_data).json()
    response = client.put(
        f"/api/patients/{created['id']}", json={"gestational_age_weeks": 35}
    )
    assert response.status_code == 200
    assert response.json()["gestational_age_weeks"] == 35


def test_update_patient_not_found(client):
    response = client.put("/api/patients/9999", json={"name": "Test"})
    assert response.status_code == 404


def test_delete_patient(client, sample_patient_data):
    created = client.post("/api/patients", json=sample_patient_data).json()
    response = client.delete(f"/api/patients/{created['id']}")
    assert response.status_code == 204
    # Verify deleted
    get_response = client.get(f"/api/patients/{created['id']}")
    assert get_response.status_code == 404


def test_delete_patient_not_found(client):
    response = client.delete("/api/patients/9999")
    assert response.status_code == 404


def test_create_patient_future_birth_date(client):
    response = client.post(
        "/api/patients",
        json={"name": "Futuro", "birth_date": "2099-01-01"},
    )
    assert response.status_code == 422


def test_create_patient_gestational_age_out_of_range(client):
    response = client.post(
        "/api/patients",
        json={"name": "Test", "birth_date": "2022-01-01", "gestational_age_weeks": 10},
    )
    assert response.status_code == 422


def test_update_patient_birth_date_valid(client, sample_patient_data):
    created = client.post("/api/patients", json=sample_patient_data).json()
    response = client.put(
        f"/api/patients/{created['id']}",
        json={"birth_date": "2020-06-15"},
    )
    assert response.status_code == 200
    assert response.json()["birth_date"] == "2020-06-15"


def test_update_patient_future_birth_date(client, sample_patient_data):
    created = client.post("/api/patients", json=sample_patient_data).json()
    response = client.put(
        f"/api/patients/{created['id']}",
        json={"birth_date": "2099-01-01"},
    )
    assert response.status_code == 422


def test_update_patient_gestational_age_out_of_range(client, sample_patient_data):
    created = client.post("/api/patients", json=sample_patient_data).json()
    response = client.put(
        f"/api/patients/{created['id']}",
        json={"gestational_age_weeks": 60},
    )
    assert response.status_code == 422
