"""
Tests for authentication service
"""
import pytest
from app.services import AuthService
from app.schemas import UserSignupRequest, UserLoginRequest


@pytest.fixture
def auth_service(db):
    return AuthService(db)


@pytest.mark.asyncio
async def test_signup_success(auth_service):
    """Test successful signup"""
    user_data = UserSignupRequest(
        email="test@example.com",
        password="securepassword123",
        company_name="Test Company",
    )
    
    result = await auth_service.signup(user_data)
    assert result["user_id"] is not None
    assert result["message"] == "Signup successful"


@pytest.mark.asyncio
async def test_signup_duplicate_email(auth_service):
    """Test signup with duplicate email"""
    user_data = UserSignupRequest(
        email="test@example.com",
        password="securepassword123",
        company_name="Test Company",
    )
    
    with pytest.raises(ValueError):
        await auth_service.signup(user_data)


@pytest.mark.asyncio
async def test_login_success(auth_service):
    """Test successful login"""
    login_data = UserLoginRequest(
        email="test@example.com",
        password="securepassword123",
    )
    
    result = await auth_service.login(login_data)
    assert result["access_token"] is not None
    assert result["user"] is not None
