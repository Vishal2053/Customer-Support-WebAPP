"""
Analytics routes
"""
import logging
from fastapi import APIRouter, HTTPException, Depends
from postgrest.exceptions import APIError
from app.db import get_service_db
from supabase import Client

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/analytics", tags=["analytics"])


def _is_missing_table_error(error: Exception) -> bool:
    return isinstance(error, APIError) and "PGRST205" in str(error)


def _empty_stats() -> dict:
    return {
        "total_conversations": 0,
        "total_messages": 0,
        "average_messages_per_conversation": 0,
    }


@router.get("/stats/{user_id}")
async def get_stats(
    user_id: str,
    db: Client = Depends(get_service_db)
):
    """Get conversation statistics"""
    try:
        # Get total conversations
        conv_response = db.table("conversations").select(
            "id", count="exact"
        ).eq("user_id", user_id).execute()
        total_conversations = len(conv_response.data)
        
        # Get total messages
        msg_response = db.table("messages").select(
            "id", count="exact"
        ).execute()
        total_messages = len(msg_response.data)
        
        return {
            "total_conversations": total_conversations,
            "total_messages": total_messages,
            "average_messages_per_conversation": (
                total_messages / total_conversations 
                if total_conversations > 0 else 0
            ),
        }
    except Exception as e:
        logger.error(f"Get stats error: {e}")
        if _is_missing_table_error(e):
            return _empty_stats()
        raise HTTPException(status_code=500, detail="Failed to get statistics")


@router.get("/leads/{user_id}")
async def get_leads(
    user_id: str,
    db: Client = Depends(get_service_db)
):
    """Get leads (unique visitors)"""
    try:
        response = db.table("conversations").select("*").eq(
            "user_id", user_id
        ).order("created_at", desc=True).execute()
        
        leads = []
        for conv in response.data:
            leads.append({
                "id": conv["id"],
                "name": conv["visitor_name"],
                "email": conv["visitor_email"],
                "first_contact_date": conv["created_at"],
                "last_contact_date": conv["updated_at"],
            })
        
        return {"leads": leads}
    except Exception as e:
        logger.error(f"Get leads error: {e}")
        if _is_missing_table_error(e):
            return {"leads": []}
        raise HTTPException(status_code=500, detail="Failed to get leads")
