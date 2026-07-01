"""
Knowledge base routes
"""
import logging
from fastapi import APIRouter, HTTPException, Depends, UploadFile, File
from postgrest.exceptions import APIError
from app.schemas import WebsiteSourceRequest
from app.services import get_knowledge_base_service, KnowledgeBaseService

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/knowledge-base", tags=["knowledge-base"])


def _raise_knowledge_base_error(error: Exception, fallback: str):
    if isinstance(error, APIError) and "PGRST205" in str(error):
        raise HTTPException(
            status_code=503,
            detail="Supabase knowledge-base tables are missing. Run backend/supabase_schema.sql in the Supabase SQL Editor.",
        )
    raise HTTPException(status_code=500, detail=fallback)


@router.post("/website")
async def add_website(
    user_id: str,
    website_data: WebsiteSourceRequest,
    kb_service: KnowledgeBaseService = Depends(get_knowledge_base_service)
):
    """Add website source for scraping"""
    try:
        result = await kb_service.add_website_source(user_id, website_data)
        return result
    except Exception as e:
        logger.error(f"Add website error: {e}")
        _raise_knowledge_base_error(e, "Failed to add website")


@router.post("/document")
async def upload_document(
    user_id: str,
    file: UploadFile = File(...),
    kb_service: KnowledgeBaseService = Depends(get_knowledge_base_service)
):
    """Upload document"""
    try:
        if not file:
            raise HTTPException(status_code=400, detail="No file provided")

        file_content = await file.read()
        
        result = await kb_service.add_document(
            user_id=user_id,
            file_name=file.filename,
            file_type=file.content_type,
            file_size=len(file_content),
            storage_path=f"documents/{user_id}/{file.filename}",
            file_content=file_content,
        )
        return result
    except Exception as e:
        logger.error(f"Upload document error: {e}")
        _raise_knowledge_base_error(e, "Failed to upload document")


@router.get("/")
async def get_knowledge_base(
    user_id: str,
    kb_service: KnowledgeBaseService = Depends(get_knowledge_base_service)
):
    """Get knowledge base items"""
    try:
        items = await kb_service.get_knowledge_base(user_id)
        return {"items": items}
    except Exception as e:
        logger.error(f"Get knowledge base error: {e}")
        _raise_knowledge_base_error(e, "Failed to get knowledge base")


@router.delete("/{item_id}")
async def delete_knowledge_item(
    user_id: str,
    item_id: str,
    kb_service: KnowledgeBaseService = Depends(get_knowledge_base_service)
):
    """Delete knowledge base item"""
    try:
        success = await kb_service.delete_document(user_id, item_id)
        return {"success": success}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error(f"Delete item error: {e}")
        _raise_knowledge_base_error(e, "Failed to delete item")
