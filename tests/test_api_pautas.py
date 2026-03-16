def test_get_pautas(client):
    response = client.get("/api/pautas")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 79


def test_pautas_structure(client):
    response = client.get("/api/pautas")
    p = response.json()[0]
    assert "id" in p
    assert "name" in p
    assert "area" in p
    assert "p75" in p
    assert "p90" in p
    assert "tipo_pauta" in p
    assert "rango_aprobacion" in p
