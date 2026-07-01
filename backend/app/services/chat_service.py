"""
Chat service for managing conversations and messages
"""
import logging
from typing import List, Optional
from supabase import Client
from app.utils.security import generate_conversation_id
from app.db import get_service_db

logger = logging.getLogger(__name__)


class ChatService:
    """Chat management service"""
    
    def __init__(self, db: Client):
        self.db = db
    
    async def create_conversation(
        self, user_id: str, visitor_name: str, visitor_email: str
    ) -> dict:
        """Create new conversation"""
        try:
            conversation = {
                "id": generate_conversation_id(),
                "user_id": user_id,
                "visitor_name": visitor_name,
                "visitor_email": visitor_email,
                "status": "active",
            }
            
            response = self.db.table("conversations").insert(
                conversation
            ).execute()
            
            logger.info(f"Conversation created: {conversation['id']}")
            return response.data[0] if response.data else conversation
            
        except Exception as e:
            logger.error(f"Create conversation error: {e}")
            raise
    
    async def add_message(
        self, conversation_id: str, sender: str, message: str
    ) -> dict:
        """Add message to conversation"""
        try:
            msg_record = {
                "conversation_id": conversation_id,
                "sender": sender,
                "message": message,
            }
            
            response = self.db.table("messages").insert(
                msg_record
            ).execute()
            
            return response.data[0] if response.data else {}
            
        except Exception as e:
            logger.error(f"Add message error: {e}")
            raise
    
    async def get_conversation(self, conversation_id: str) -> Optional[dict]:
        """Get conversation with messages"""
        try:
            # Get conversation
            conv = self.db.table("conversations").select("*").eq(
                "id", conversation_id
            ).execute()
            
            if not conv.data:
                return None
            
            conversation = conv.data[0]
            
            # Get messages
            msgs = self.db.table("messages").select("*").eq(
                "conversation_id", conversation_id
            ).order("created_at", desc=False).execute()
            
            conversation["messages"] = msgs.data or []
            return conversation
            
        except Exception as e:
            logger.error(f"Get conversation error: {e}")
            raise
    
    async def get_conversations(self, user_id: str) -> List[dict]:
        """Get all conversations for user"""
        try:
            response = self.db.table("conversations").select("*").eq(
                "user_id", user_id
            ).order("created_at", desc=True).execute()
            
            return response.data or []
            
        except Exception as e:
            logger.error(f"Get conversations error: {e}")
            raise


def get_chat_service() -> ChatService:
    """Dependency for chat service"""
    db = get_service_db()
    return ChatService(db)
