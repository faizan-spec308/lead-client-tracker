def get_token(client):
    client.get("/")
    data = {"username": "admin@example.com", "password": "admin123"}
    r = client.post("/auth/login", data=data)
    return r.json()["access_token"]


def test_convert_lead_to_client(client):
    token = get_token(client)
    headers = {"Authorization": f"Bearer {token}"}

    # create lead
    payload = {"name": "Convert Me", "email": "convert@example.com", "phone": "555"}
    r = client.post("/leads", json=payload, headers=headers)
    assert r.status_code == 200
    lead_id = r.json()["id"]

    # convert
    r2 = client.post(f"/leads/{lead_id}/convert", headers=headers)
    assert r2.status_code == 200
    client_obj = r2.json()
    assert client_obj["email"] == "convert@example.com"

    # lead status should update
    r3 = client.get("/leads", headers=headers)
    lead = r3.json()[0]
    assert lead["status"] == "Converted"
