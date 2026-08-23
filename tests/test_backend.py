import os
import sys
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Add backend app to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../backend')))

# Delete test DB file before imports
TEST_DB_PATH = "./test_braintumorai.db"
if os.path.exists(TEST_DB_PATH):
    try:
        os.remove(TEST_DB_PATH)
    except Exception:
        pass

from app.main import app
from app.core.config import settings
from app.core.deps import get_db
from app.core.security import hash_password, verify_password, create_access_token, verify_token
from app.models.database import Base
from app.services.storage_service import storage_service

# Create test engine and sessionmaker
test_engine = create_engine(f"sqlite:///{TEST_DB_PATH}", connect_args={"check_same_thread": False})
TestSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)

# Create the test database tables
Base.metadata.create_all(bind=test_engine)

# Dependency override
def override_get_db():
    db = TestSessionLocal()
    try:
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

# Use test client
client = TestClient(app)

@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
    yield
    # Clean up test DB after all tests
    if os.path.exists(TEST_DB_PATH):
        try:
            os.remove(TEST_DB_PATH)
        except Exception:
            pass

def test_security():
    password = "testpassword123"
    hashed = hash_password(password)
    assert verify_password(password, hashed)
    assert not verify_password("wrongpassword", hashed)
    
    token = create_access_token({"sub": "testuser"})
    payload = verify_token(token)
    assert payload["sub"] == "testuser"

def test_health_check():
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_auth_flow():
    # Register
    reg_data = {
        "email": "test@example.com",
        "username": "testuser",
        "password": "testpassword"
    }
    response = client.post("/api/auth/register", json=reg_data)
    assert response.status_code == 200
    assert "access_token" in response.json()
    
    # Login
    login_data = {
        "email": "test@example.com",
        "password": "testpassword"
    }
    response = client.post("/api/auth/login", json=login_data)
    assert response.status_code == 200
    assert "access_token" in response.json()
    token = response.json()["access_token"]
    
    # Get current user (me)
    headers = {"Authorization": f"Bearer {token}"}
    response = client.get("/api/auth/me", headers=headers)
    assert response.status_code == 200
    assert response.json()["email"] == "test@example.com"
    assert response.json()["username"] == "testuser"

@pytest.mark.asyncio
async def test_prediction_validation():
    # Test upload validation logic
    from fastapi import UploadFile
    from io import BytesIO
    
    # Test invalid file type
    from starlette.datastructures import Headers
    headers = Headers({"content-type": "text/plain"})
    file = UploadFile(filename="test.txt", file=BytesIO(b"Hello World"), headers=headers)
    with pytest.raises(Exception):
        await storage_service.validate_image(file)
