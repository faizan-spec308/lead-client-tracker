import os
os.environ["TESTING"] = "1"
import pytest
from sqlmodel import SQLModel, create_engine, Session
from fastapi.testclient import TestClient
from main import app
from deps import get_session
from auth import hash_password
import models

# Create a separate test database (SQLite in memory)
TEST_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(TEST_DATABASE_URL, connect_args={"check_same_thread": False})


# Create tables before tests
@pytest.fixture(name="session")
def session_fixture():
    SQLModel.metadata.create_all(engine)
    with Session(engine) as session:
        yield session
    SQLModel.metadata.drop_all(engine)

def create_test_admin(session):
    admin = models.User(
        email="admin@example.com",
        hashed_password=hash_password("admin123")
    )
    session.add(admin)
    session.commit()


# Override dependency
@pytest.fixture(name="client")
def client_fixture(session):
    def override_get_session():
        yield session
        

    app.dependency_overrides[get_session] = override_get_session
    with Session(engine) as session:
      create_test_admin(session)


    with TestClient(app) as client:
        yield client

    app.dependency_overrides.clear()
