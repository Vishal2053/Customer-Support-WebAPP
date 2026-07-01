"""
Pydantic schemas for request/response validation
"""
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, EmailStr, Field


# Authentication Schemas
class UserSignupRequest(BaseModel):
    """User signup request schema"""
    email: EmailStr
    password: str = Field(..., min_length=8)
    company_name: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None


class UserLoginRequest(BaseModel):
    """User login request schema"""
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    """User response schema"""
    id: str
    email: str
    company_name: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    created_at: datetime
    updated_at: datetime


# Knowledge Base Schemas
class WebsiteSourceRequest(BaseModel):
    """Website source submission"""
    url: str
    name: Optional[str] = None
    crawl: Optional[bool] = False



class DocumentUploadRequest(BaseModel):
    """Document upload metadata"""
    file_name: str
    file_type: str


class KnowledgeBaseItem(BaseModel):
    """Knowledge base item"""
    id: str
    user_id: str
    type: str  # "website" or "document"
    source: str  # URL or file name
    content: str
    created_at: datetime


# Chat Schemas
class ChatMessage(BaseModel):
    """Chat message schema"""
    id: str
    conversation_id: str
    sender: str  # "user" or "assistant"
    message: str
    created_at: datetime


class ConversationResponse(BaseModel):
    """Conversation response"""
    id: str
    visitor_name: str
    visitor_email: str
    user_id: str
    messages: List[ChatMessage]
    created_at: datetime
    updated_at: datetime


class VisitorChatRequest(BaseModel):
    """Visitor chat message request"""
    conversation_id: Optional[str] = None
    visitor_name: Optional[str] = None
    visitor_email: Optional[str] = None
    message: str


class ChatbotWidgetResponse(BaseModel):
    """Chatbot widget embed code response"""
    embed_code: str
    widget_url: str


# Analytics Schemas
class ConversationStats(BaseModel):
    """Conversation statistics"""
    total_conversations: int
    total_messages: int
    average_messages_per_conversation: float
    today_conversations: int
    this_week_conversations: int
    this_month_conversations: int


class LeadResponse(BaseModel):
    """Lead information response"""
    id: str
    name: str
    email: str
    first_contact_date: datetime
    last_contact_date: datetime
    total_messages: int
