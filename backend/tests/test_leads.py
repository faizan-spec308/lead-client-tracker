def get_token(client):
    client.get("/")
    data = {"username": "admin@example.com", "password": "admin123"}
    r = client.post("/auth/login", data=data)
    return r.json()["access_token"]


def test_create_and_get_leads(client):
    token = get_token(client)
    headers = {"Authorization": f"Bearer {token}"}

    payload = {"name": "Test Lead", "email": "test@example.com", "phone": "123"}
    r = client.post("/leads", json=payload, headers=headers)
    assert r.status_code == 200

    r2 = client.get("/leads", headers=headers)
    assert r2.status_code == 200
    leads = r2.json()
    assert len(leads) == 1
    assert leads[0]["email"] == "test@example.com"
