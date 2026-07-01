"""
Chat routes
"""
import logging
from fastapi import APIRouter, HTTPException, Depends, WebSocket
from pydantic import BaseModel
from supabase import Client
from app.db import get_service_db
from app.schemas import VisitorChatRequest
from app.services import get_chat_service, ChatService, get_ai_service, GroqAIService

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/chat", tags=["chat"])

class AdminChatMessageRequest(BaseModel):
    conversation_id: str
    message: str

class ChatModeRequest(BaseModel):
    chat_mode: str


@router.post("/start")
async def start_conversation(
    user_id: str,
    visitor_name: str,
    visitor_email: str,
    chat_service: ChatService = Depends(get_chat_service)
):
    """Start new conversation"""
    try:
        conversation = await chat_service.create_conversation(
            user_id, visitor_name, visitor_email
        )
        return conversation
    except Exception as e:
        logger.error(f"Start conversation error: {e}")
        raise HTTPException(status_code=500, detail="Failed to start conversation")


@router.post("/message")
async def send_message(
    request: VisitorChatRequest,
    chat_service: ChatService = Depends(get_chat_service),
    ai_service: GroqAIService = Depends(get_ai_service)
):
    """Send chat message"""
    try:
        # If no conversation ID, create new one
        if not request.conversation_id:
            conversation = await chat_service.create_conversation(
                user_id="system",  # Will be replaced with actual user
                visitor_name=request.visitor_name or "Anonymous",
                visitor_email=request.visitor_email or "unknown@example.com"
            )
            conversation_id = conversation["id"]
        else:
            conversation_id = request.conversation_id
        
        # Add user message
        await chat_service.add_message(
            conversation_id, "visitor", request.message
        )
        
        # Generate AI response using Groq
        ai_response = await ai_service.generate_response(
            prompt=request.message,
            context="You are a helpful customer support assistant."
        )
        
        # Add AI response
        await chat_service.add_message(
            conversation_id, "assistant", ai_response
        )
        
        return {
            "conversation_id": conversation_id,
            "response": ai_response
        }
    except Exception as e:
        logger.error(f"Send message error: {e}")
        raise HTTPException(status_code=500, detail="Failed to send message")


@router.get("/conversations/{user_id}")
async def get_conversations(
    user_id: str,
    chat_service: ChatService = Depends(get_chat_service),
    db: Client = Depends(get_service_db)
):
    """Get all conversations for user"""
    try:
        # Update last_active_at for the admin
        try:
            db.table("users").update({"last_active_at": "now()"}).eq("id", user_id).execute()
        except Exception as active_err:
            logger.warning(f"Failed to update last_active_at: {active_err}")

        conversations = await chat_service.get_conversations(user_id)
        return {"conversations": conversations}
    except Exception as e:
        logger.error(f"Get conversations error: {e}")
        raise HTTPException(status_code=500, detail="Failed to get conversations")


@router.post("/message/admin")
async def send_admin_message(
    request: AdminChatMessageRequest,
    chat_service: ChatService = Depends(get_chat_service),
    db: Client = Depends(get_service_db)
):
    """Admin sends message to visitor"""
    try:
        await chat_service.add_message(request.conversation_id, "assistant", request.message)
        # Update conversation updated_at and switch to 'human' mode
        db.table("conversations").update({"chat_mode": "human", "updated_at": "now()"}).eq("id", request.conversation_id).execute()
        return {"status": "ok"}
    except Exception as e:
        logger.error(f"Send admin message error: {e}")
        raise HTTPException(status_code=500, detail="Failed to send admin message")


@router.post("/conversation/{conversation_id}/mode")
async def update_conversation_mode(
    conversation_id: str,
    request: ChatModeRequest,
    db: Client = Depends(get_service_db)
):
    """Update chat mode for a conversation (admin taking over or handing back to AI)"""
    try:
        db.table("conversations").update({"chat_mode": request.chat_mode, "updated_at": "now()"}).eq("id", conversation_id).execute()
        return {"status": "ok", "chat_mode": request.chat_mode}
    except Exception as e:
        logger.error(f"Error updating conversation mode: {e}")
        raise HTTPException(status_code=500, detail="Failed to update conversation mode")


@router.get("/conversation/{conversation_id}")
async def get_conversation(
    conversation_id: str,
    chat_service: ChatService = Depends(get_chat_service)
):
    """Get specific conversation"""
    try:
        conversation = await chat_service.get_conversation(conversation_id)
        if not conversation:
            raise HTTPException(status_code=404, detail="Conversation not found")
        return conversation
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Get conversation error: {e}")
        raise HTTPException(status_code=500, detail="Failed to get conversation")
