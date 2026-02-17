def test_protected_route_requires_token(client):
    r = client.get("/leads")
    assert r.status_code == 401


def test_login_returns_token(client):
    # Ensure admin exists by hitting startup route indirectly
    # Root call triggers app startup in TestClient
    client.get("/")

    # OAuth2PasswordRequestForm expects form data:
    data = {"username": "admin@example.com", "password": "admin123"}
    r = client.post("/auth/login", data=data)

    assert r.status_code == 200
    body = r.json()
    assert "access_token" in body
    assert body["token_type"] == "bearer"

