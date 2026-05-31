"""
Tests configuration
"""
import pytest
from unittest.mock import Mock


@pytest.fixture
def db():
    """Mock database client"""
    return Mock()


@pytest.fixture
def auth_service():
    """Mock auth service"""
    return Mock()
