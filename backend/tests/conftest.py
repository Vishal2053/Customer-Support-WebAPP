"""
Tests configuration
"""
import pytest
from unittest.mock import MagicMock


@pytest.fixture
def db():
    """Mock database client"""
    mock_db = MagicMock()
    
    # Mock database queries execution chain
    mock_execute = MagicMock()
    mock_execute.data = []
    
    mock_table = MagicMock()
    mock_table.select.return_value = mock_table
    mock_table.eq.return_value = mock_table
    mock_table.insert.return_value = mock_table
    mock_table.upsert.return_value = mock_table
    mock_table.delete.return_value = mock_table
    mock_table.order.return_value = mock_table
    mock_table.execute.return_value = mock_execute
    
    mock_db.table.return_value = mock_table
    
    # Mock auth response for create_user
    mock_user = MagicMock()
    mock_user.id = "mock-user-id"
    mock_user.email = "test@example.com"
    mock_user.user_metadata = {"company_name": "Test Company"}
    
    mock_auth_response = MagicMock()
    mock_auth_response.user = mock_user
    mock_db.auth.admin.create_user.return_value = mock_auth_response
    mock_db.auth.admin.get_user_by_id.return_value = mock_auth_response
    
    # Mock auth response for sign_in_with_password
    mock_session = MagicMock()
    mock_session.access_token = "mock-access-token"
    mock_login_response = MagicMock()
    mock_login_response.user = mock_user
    mock_login_response.session = mock_session
    mock_db.auth.sign_in_with_password.return_value = mock_login_response
    
    return mock_db


@pytest.fixture
def auth_service(db):
    """Mock auth service"""
    from app.services import AuthService
    return AuthService(db)

