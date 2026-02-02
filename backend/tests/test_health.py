from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_root_ok():
    res = client.get("/")
    assert res.status_code == 200
    assert res.json() == {"status": "ok"}
