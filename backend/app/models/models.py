"""
Database models and table definitions
"""
from datetime import datetime
from typing import Optional


class User:
    """User model - Maps to Supabase users table"""
    id: str
    email: str
    company_name: str
    first_name: Optional[str]
    last_name: Optional[str]
    created_at: datetime
    updated_at: datetime


class KnowledgeBase:
    """Knowledge base model - Stores scraped/uploaded content"""
    id: str
    user_id: str
    type: str  # "website" or "document"
    source: str  # URL or file name
    title: str
    content: str
    embedding: Optional[list]  # Vector embedding
    created_at: datetime
    updated_at: datetime


class Conversation:
    """Conversation model - Stores customer interactions"""
    id: str
    user_id: str
    visitor_name: str
    visitor_email: str
    status: str  # "active", "closed"
    created_at: datetime
    updated_at: datetime


class Message:
    """Message model - Individual chat messages"""
    id: str
    conversation_id: str
    sender: str  # "user", "assistant", "visitor"
    message: str
    created_at: datetime


class WebsiteSource:
    """Website source model"""
    id: str
    user_id: str
    url: str
    name: Optional[str]
    last_scraped: datetime
    created_at: datetime


class Document:
    """Document model - Uploaded files"""
    id: str
    user_id: str
    file_name: str
    file_type: str
    file_size: int
    storage_path: str
    created_at: datetime


class ChatbotWidget:
    """Chatbot widget configuration"""
    id: str
    user_id: str
    widget_id: str  # Unique identifier
    title: str
    description: Optional[str]
    theme: dict  # Color scheme, positioning, etc.
    created_at: datetime
    updated_at: datetime
