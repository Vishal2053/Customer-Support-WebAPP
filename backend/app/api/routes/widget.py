"""
Widget routes
"""
import json
import logging
import re
from typing import Optional
from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import Response
from pydantic import BaseModel
from postgrest.exceptions import APIError
from app.core.config import settings
from app.utils.security import generate_widget_id
from app.db import get_service_db
from app.services import get_ai_service, GroqAIService
from supabase import Client

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/widget", tags=["widget"])


class WidgetMessageRequest(BaseModel):
    message: str
    conversation_id: Optional[str] = None
    visitor_name: Optional[str] = "Website Visitor"
    visitor_email: Optional[str] = "visitor@example.com"


class ChatModeUpdateRequest(BaseModel):
    conversation_id: str
    chat_mode: str


class WidgetUpdateRequest(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    theme: Optional[dict] = None


@router.post("/generate")
async def generate_widget(
    user_id: str,
    db: Client = Depends(get_service_db)
):
    """Generate chatbot widget for user (one per user)"""
    try:
        _ensure_user_profile(db, user_id)
        
        # Check if user already has a widget
        existing_widget = db.table("chatbot_widgets").select("*").eq(
            "user_id", user_id
        ).execute()
        
        if existing_widget.data:
            # Return existing widget
            widget = existing_widget.data[0]
            widget_id = widget["widget_id"]
            script_url = f"{settings.public_api_base_url.rstrip('/')}/api/v1/widget/{widget_id}.js"
            embed_code = _build_embed_code(script_url)
            return {
                "widget_id": widget_id,
                "embed_code": embed_code,
                "widget_url": script_url,
                "is_existing": True
            }
        
        # Create new widget
        widget_id = generate_widget_id()
        
        widget_config = {
            "user_id": user_id,
            "widget_id": widget_id,
            "title": "Chat with us",
            "description": "How can we help?",
            "theme": {
                "primary_color": "#4F46E5",
                "secondary_color": "#FFFFFF",
                "position": "bottom-right"
            }
        }
        
        # Save widget configuration
        response = db.table("chatbot_widgets").insert(widget_config).execute()
        script_url = f"{settings.public_api_base_url.rstrip('/')}/api/v1/widget/{widget_id}.js"
        
        # Generate embed code
        embed_code = _build_embed_code(script_url)
        
        return {
            "widget_id": widget_id,
            "embed_code": embed_code,
            "widget_url": script_url,
            "is_existing": False
        }
    except Exception as e:
        logger.error(f"Generate widget error: {e}")
        if isinstance(e, APIError) and "PGRST205" in str(e):
            raise HTTPException(
                status_code=503,
                detail="Supabase widget table is missing. Run the updated backend/supabase_minimal_auth_knowledge_base.sql in the Supabase SQL Editor.",
            )
        raise HTTPException(status_code=500, detail="Failed to generate widget")


@router.get("/user/{user_id}")
async def get_user_widget(
    user_id: str,
    db: Client = Depends(get_service_db)
):
    """Get existing widget for a user (if any)"""
    try:
        response = db.table("chatbot_widgets").select("*").eq(
            "user_id", user_id
        ).execute()
        
        if not response.data:
            return {"widget": None}
        
        widget = response.data[0]
        widget_id = widget["widget_id"]
        script_url = f"{settings.public_api_base_url.rstrip('/')}/api/v1/widget/{widget_id}.js"
        embed_code = _build_embed_code(script_url)
        
        return {
            "widget": {
                "widget_id": widget_id,
                "embed_code": embed_code,
                "widget_url": script_url,
                "title": widget.get("title"),
                "description": widget.get("description"),
                "theme": widget.get("theme"),
                "created_at": widget.get("created_at")
            }
        }
    except Exception as e:
        logger.error(f"Get user widget error: {e}")
        raise HTTPException(status_code=500, detail="Failed to get widget")


@router.get("/{widget_id}.js")
async def get_widget_script(
    widget_id: str,
    db: Client = Depends(get_service_db)
):
    """Serve embeddable JavaScript for a chatbot widget."""
    widget = _get_widget_config(db, widget_id)
    api_base_url = settings.public_api_base_url.rstrip("/")
    config = {
        "widgetId": widget_id,
        "apiBaseUrl": api_base_url,
        "title": widget.get("title") or "Chat with us",
        "description": widget.get("description") or "How can we help?",
        "theme": widget.get("theme") or {},
    }

    script = _build_widget_script(config)
    return Response(content=script, media_type="application/javascript")


@router.post("/{widget_id}/message")
async def send_widget_message(
    widget_id: str,
    request: WidgetMessageRequest,
    db: Client = Depends(get_service_db),
    ai_service: GroqAIService = Depends(get_ai_service),
):
    """Public message endpoint used by embedded widgets."""
    try:
        widget = _get_widget_config(db, widget_id)
        user_id = widget["user_id"]
        conversation_id = request.conversation_id

        try:
            if not conversation_id:
                conversation_id = _create_conversation(
                    db,
                    user_id=user_id,
                    visitor_name=request.visitor_name or "Website Visitor",
                    visitor_email=request.visitor_email or "visitor@example.com",
                )
            _add_message(db, conversation_id, "visitor", request.message)
        except Exception as e:
            if isinstance(e, APIError) and "PGRST205" in str(e):
                conversation_id = conversation_id or "untracked"
            else:
                raise

        chat_mode = "bot"
        if conversation_id and conversation_id != "untracked":
            try:
                conv_res = db.table("conversations").select("chat_mode").eq("id", conversation_id).execute()
                if conv_res.data:
                    chat_mode = conv_res.data[0].get("chat_mode", "bot")
            except Exception as e:
                logger.warning(f"Failed to fetch conversation chat_mode: {e}")

        if chat_mode == "human":
            return {
                "conversation_id": conversation_id,
                "response": None,
                "chat_mode": "human"
            }

        context = _build_semantic_knowledge_context(db, user_id, request.message)
        try:
            answer = await ai_service.generate_response(
                prompt=request.message,
                context=context or "Answer as a helpful customer support assistant for this website.",
            )
        except Exception as e:
            logger.error(f"Widget AI response error: {e}")
            answer = _fallback_answer(request.message, context)

        try:
            if conversation_id != "untracked":
                _add_message(db, conversation_id, "assistant", answer)
        except Exception as e:
            if not (isinstance(e, APIError) and "PGRST205" in str(e)):
                raise

        return {
            "conversation_id": conversation_id,
            "response": answer,
            "chat_mode": chat_mode
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Widget message error: {e}")
        raise HTTPException(status_code=500, detail="Failed to send widget message")


@router.get("/{widget_id}/admin-status")
async def get_admin_status(
    widget_id: str,
    db: Client = Depends(get_service_db)
):
    """Check if the admin who owns this widget is active (active in last 5 minutes)"""
    try:
        widget = _get_widget_config(db, widget_id)
        user_id = widget["user_id"]
        
        user_res = db.table("users").select("last_active_at").eq("id", user_id).execute()
        if not user_res.data:
            return {"online": False}
            
        last_active_str = user_res.data[0].get("last_active_at")
        if not last_active_str:
            return {"online": False}
            
        from datetime import datetime, timezone
        try:
            # Parse ISO string
            last_active = datetime.fromisoformat(last_active_str.replace("Z", "+00:00"))
            now = datetime.now(timezone.utc)
            diff = (now - last_active).total_seconds()
            # Active in last 3 minutes is considered online
            return {"online": diff < 180}
        except Exception as parse_err:
            logger.error(f"Error parsing timestamp {last_active_str}: {parse_err}")
            return {"online": False}
    except Exception as e:
        logger.error(f"Error checking admin status: {e}")
        return {"online": False}


@router.post("/{widget_id}/chat-mode")
async def update_chat_mode(
    widget_id: str,
    request: ChatModeUpdateRequest,
    db: Client = Depends(get_service_db)
):
    """Update chat mode for a conversation"""
    try:
        widget = _get_widget_config(db, widget_id)
        user_id = widget["user_id"]
        
        # Verify conversation belongs to widget user
        conv_res = db.table("conversations").select("user_id").eq("id", request.conversation_id).execute()
        if not conv_res.data or conv_res.data[0]["user_id"] != user_id:
            raise HTTPException(status_code=403, detail="Unauthorized")
            
        db.table("conversations").update({"chat_mode": request.chat_mode, "updated_at": "now()"}).eq("id", request.conversation_id).execute()
        return {"status": "ok", "chat_mode": request.chat_mode}
    except Exception as e:
        logger.error(f"Error updating chat mode: {e}")
        raise HTTPException(status_code=500, detail="Failed to update chat mode")


@router.get("/{widget_id}/conversation/{conversation_id}/status")
async def get_conversation_status(
    widget_id: str,
    conversation_id: str,
    db: Client = Depends(get_service_db)
):
    """Get conversation status/mode"""
    try:
        widget = _get_widget_config(db, widget_id)
        user_id = widget["user_id"]
        
        conv_res = db.table("conversations").select("chat_mode").eq("id", conversation_id).eq("user_id", user_id).execute()
        if not conv_res.data:
            raise HTTPException(status_code=404, detail="Conversation not found")
            
        return {"chat_mode": conv_res.data[0].get("chat_mode", "bot")}
    except Exception as e:
        logger.error(f"Error getting conversation status: {e}")
        raise HTTPException(status_code=500, detail="Failed to get conversation status")


@router.get("/{widget_id}/conversation/{conversation_id}/messages")
async def get_widget_conversation_messages(
    widget_id: str,
    conversation_id: str,
    db: Client = Depends(get_service_db)
):
    """Get messages for a conversation (used by widget for live polling)"""
    try:
        widget = _get_widget_config(db, widget_id)
        user_id = widget["user_id"]
        
        # Verify conversation belongs to this widget's user
        conv_res = db.table("conversations").select("user_id").eq("id", conversation_id).execute()
        if not conv_res.data or conv_res.data[0]["user_id"] != user_id:
            raise HTTPException(status_code=403, detail="Unauthorized")
            
        # Fetch messages
        msgs_res = db.table("messages").select("*").eq("conversation_id", conversation_id).order("created_at", desc=False).execute()
        
        # Fetch chat mode
        conv_res = db.table("conversations").select("chat_mode").eq("id", conversation_id).execute()
        chat_mode = conv_res.data[0].get("chat_mode", "bot") if conv_res.data else "bot"
        
        return {"messages": msgs_res.data or [], "chat_mode": chat_mode}
    except Exception as e:
        logger.error(f"Error fetching messages: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch messages")


@router.put("/{widget_id}")
async def update_widget(
    widget_id: str,
    request: WidgetUpdateRequest,
    db: Client = Depends(get_service_db)
):
    """Update widget configuration"""
    try:
        # Check if widget exists
        existing = db.table("chatbot_widgets").select("*").eq(
            "widget_id", widget_id
        ).execute()
        if not existing.data:
            raise HTTPException(status_code=404, detail="Widget not found")
        
        # Build update payload
        update_data = {}
        if request.title is not None:
            update_data["title"] = request.title
        if request.description is not None:
            update_data["description"] = request.description
        if request.theme is not None:
            update_data["theme"] = request.theme
            
        update_data["updated_at"] = "now()"
        
        response = db.table("chatbot_widgets").update(update_data).eq(
            "widget_id", widget_id
        ).execute()
        
        return response.data[0]
    except Exception as e:
        logger.error(f"Update widget error: {e}")
        raise HTTPException(status_code=500, detail="Failed to update widget")


@router.get("/{widget_id}")
async def get_widget(
    widget_id: str,
    db: Client = Depends(get_service_db)
):
    """Get widget configuration"""
    try:
        response = db.table("chatbot_widgets").select("*").eq(
            "widget_id", widget_id
        ).execute()
        
        if not response.data:
            raise HTTPException(status_code=404, detail="Widget not found")
        
        return response.data[0]
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Get widget error: {e}")
        raise HTTPException(status_code=500, detail="Failed to get widget")


def _get_widget_config(db: Client, widget_id: str) -> dict:
    response = db.table("chatbot_widgets").select("*").eq(
        "widget_id", widget_id
    ).execute()

    if not response.data:
        raise HTTPException(status_code=404, detail="Widget not found")

    return response.data[0]


def _ensure_user_profile(db: Client, user_id: str):
    existing = db.table("users").select("id").eq("id", user_id).execute()
    if existing.data:
        return

    try:
        auth_user = db.auth.admin.get_user_by_id(user_id).user
    except Exception as e:
        logger.warning(f"Could not fetch auth user {user_id}; creating fallback profile: {e}")
        auth_user = None

    metadata = auth_user.user_metadata if auth_user and auth_user.user_metadata else {}
    db.table("users").upsert({
        "id": auth_user.id if auth_user else user_id,
        "email": auth_user.email if auth_user and auth_user.email else f"{user_id}@unknown.local",
        "company_name": metadata.get("company_name") or "Unknown Company",
        "first_name": metadata.get("first_name"),
        "last_name": metadata.get("last_name"),
    }).execute()


def _create_conversation(db: Client, user_id: str, visitor_name: str, visitor_email: str) -> str:
    # Check if conversation already exists for this user and email
    existing = db.table("conversations").select("id").eq("user_id", user_id).eq("visitor_email", visitor_email).execute()
    if existing.data:
        conv_id = existing.data[0]["id"]
        if visitor_name and visitor_name != "Website Visitor":
            db.table("conversations").update({"visitor_name": visitor_name}).eq("id", conv_id).execute()
        return conv_id

    from app.utils.security import generate_conversation_id

    conversation = {
        "id": generate_conversation_id(),
        "user_id": user_id,
        "visitor_name": visitor_name,
        "visitor_email": visitor_email,
        "status": "active",
    }
    response = db.table("conversations").insert(conversation).execute()
    return response.data[0]["id"] if response.data else conversation["id"]


def _add_message(db: Client, conversation_id: str, sender: str, message: str):
    return db.table("messages").insert({
        "conversation_id": conversation_id,
        "sender": sender,
        "message": message,
    }).execute()


def _build_semantic_knowledge_context(db: Client, user_id: str, query: str, limit: int = 5) -> str:
    """Retrieve relevant knowledge base items for a query using semantic search."""
    try:
        from app.services.knowledge_base_service import get_embedding
        import numpy as np

        query_emb = get_embedding(query)
        if query_emb is None:
            return _build_knowledge_context(db, user_id)

        # 1. Try DB-side RPC matching first
        try:
            rpc_response = db.rpc("match_knowledge", {
                "query_embedding": query_emb,
                "match_threshold": 0.15,
                "match_count": limit,
                "p_user_id": user_id
            }).execute()
            if rpc_response.data:
                parts = []
                for item in rpc_response.data:
                    content = (item.get("content") or "").strip()
                    if content:
                        parts.append(
                            f"Source: {item.get('source') or item.get('title')}\n"
                            f"Content: {content}"
                        )
                if parts:
                    return "\n\n".join(parts)
        except Exception as rpc_err:
            logger.warning(f"Database RPC search failed: {rpc_err}. Falling back to Python-side similarity search.")

        # 2. Python-side similarity search fallback
        response = db.table("knowledge_base").select("id,type,source,title,content,embedding").eq("user_id", user_id).execute()
        if not response.data:
            return ""

        valid_items = [item for item in response.data if (item.get("content") or "").strip()]
        if not valid_items:
            return ""

        # If database items lack embeddings, skip them. On-the-fly generation blocks the chat response.
        embeddings_list = []
        filtered_items = []
        for item in valid_items:
            emb = item.get("embedding")
            if emb:
                embeddings_list.append(emb)
                filtered_items.append(item)
            
        valid_items = filtered_items
        if not valid_items:
            return _build_knowledge_context(db, user_id)

        # Perform Cosine Similarity in Python using original 384 dimensions to be fast
        query_vector = np.array(query_emb[:384])
        doc_vectors = np.array([emb[:384] for emb in embeddings_list])

        query_norm = query_vector / (np.linalg.norm(query_vector) + 1e-9)
        doc_norms = doc_vectors / (np.linalg.norm(doc_vectors, axis=1, keepdims=True) + 1e-9)

        similarities = np.dot(doc_norms, query_norm)
        sorted_indices = np.argsort(similarities)[::-1]

        parts = []
        count = 0
        for idx in sorted_indices:
            # Only include elements with reasonable similarity score
            if similarities[idx] < 0.1 or count >= limit:
                continue
            item = valid_items[idx]
            parts.append(
                f"Source: {item.get('source') or item.get('title')}\n"
                f"Content: {item['content'].strip()}"
            )
            count += 1

        if parts:
            return "\n\n".join(parts)

    except Exception as e:
        logger.error(f"Error in _build_semantic_knowledge_context: {e}", exc_info=True)

    return _build_knowledge_context(db, user_id)


def _build_knowledge_context(db: Client, user_id: str) -> str:
    parts = []
    try:
        knowledge_items = db.table("knowledge_base").select("type,source,title,content").eq("user_id", user_id).execute()
        for item in knowledge_items.data or []:
            content = (item.get("content") or "").strip()
            if content:
                parts.append(
                    f"{item.get('type', 'source').title()}: {item.get('title') or item.get('source')}\n"
                    f"Source: {item.get('source')}\n"
                    f"Content: {content[:4000]}"
                )
        if parts:
            return "\n\n".join(parts)
    except Exception as e:
        if not (isinstance(e, APIError) and "PGRST205" in str(e)):
            raise

    try:
        websites = db.table("website_sources").select("url,name").eq("user_id", user_id).execute()
        for item in websites.data or []:
            parts.append(f"Website: {item.get('name') or item.get('url')} - {item.get('url')}")
    except Exception as e:
        if not (isinstance(e, APIError) and "PGRST205" in str(e)):
            raise

    try:
        documents = db.table("documents").select("file_name,file_type").eq("user_id", user_id).execute()
        for item in documents.data or []:
            parts.append(f"Document: {item.get('file_name')} ({item.get('file_type') or 'unknown type'})")
    except Exception as e:
        if not (isinstance(e, APIError) and "PGRST205" in str(e)):
            raise

    return "\n".join(parts)


def _fallback_answer(message: str, context: str) -> str:
    if not context:
        return "I do not have enough knowledge base content yet. Please add a website or upload a document, then try again."

    query_terms = [
        term.lower()
        for term in re.findall(r"[A-Za-z0-9]+", message)
        if len(term) > 2
    ]
    sentences = re.split(r"(?<=[.!?])\s+", context)
    matches = [
        sentence.strip()
        for sentence in sentences
        if sentence.strip() and any(term in sentence.lower() for term in query_terms)
    ]
    selected = matches[:3] or sentences[:3]
    answer = " ".join(part.strip() for part in selected if part.strip())
    return answer[:900] or "I found knowledge base content, but could not match a clear answer. Please ask in a different way."


def _build_widget_script(config: dict) -> str:
    config_json = json.dumps(config)
    return f"""
(function() {{
  const config = {config_json};

  function mountWidget() {{
  if (document.getElementById('ai-support-widget-root-' + config.widgetId)) return;

  const styleEl = document.createElement('style');
  styleEl.textContent = `
    @keyframes widget-fade-in-up {{
      from {{ opacity: 0; transform: translateY(10px); }}
      to {{ opacity: 1; transform: translateY(0); }}
    }}
    .widget-bubble-dismiss:hover {{ color: #475569 !important; }}
  `;
  document.head.appendChild(styleEl);

  const root = document.createElement('div');
  root.id = 'ai-support-widget-root-' + config.widgetId;
  const isLeft = config.theme.position === 'bottom-left';
  root.style.cssText = 'position:fixed;' + (isLeft ? 'left:20px;' : 'right:20px;') + 'bottom:20px;z-index:2147483647;font-family:Arial,sans-serif;box-sizing:border-box;';

  const panel = document.createElement('div');
  panel.style.cssText = 'display:none;width:320px;max-width:calc(100vw - 40px);height:420px;background:#fff;border:1px solid #e5e7eb;border-radius:12px;box-shadow:0 18px 40px rgba(15,23,42,.22);overflow:hidden;margin-bottom:12px;';

  const header = document.createElement('div');
  header.style.cssText = 'background:' + (config.theme.primary_color || '#4F46E5') + ';color:' + (config.theme.header_text_color || '#ffffff') + ';padding:14px 16px;font-weight:700;display:flex;justify-content:space-between;align-items:center;';
  
  const headerText = document.createElement('span');
  headerText.textContent = config.title || 'Chat with us';
  header.appendChild(headerText);

  const humanBtn = document.createElement('button');
  humanBtn.type = 'button';
  humanBtn.style.cssText = 'background:rgba(255,255,255,0.2);color:' + (config.theme.header_text_color || '#ffffff') + ';border:1px solid rgba(255,255,255,0.4);border-radius:4px;padding:3px 8px;font-size:11px;font-weight:700;cursor:pointer;display:none;outline:none;';
  humanBtn.textContent = 'Chat with Human';
  header.appendChild(humanBtn);

  const messages = document.createElement('div');
  messages.style.cssText = 'height:292px;overflow:auto;padding:12px;background:#f8fafc;font-size:14px;';

  const form = document.createElement('form');
  form.style.cssText = 'display:flex;gap:8px;padding:10px;border-top:1px solid #e5e7eb;background:#fff;';

  const input = document.createElement('input');
  input.type = 'text';
  input.placeholder = 'Type your message...';
  input.required = true;
  input.style.cssText = 'flex:1;border:1px solid #d1d5db;border-radius:8px;padding:10px;font-size:14px;outline:none;';

  const send = document.createElement('button');
  send.type = 'submit';
  send.textContent = 'Send';
  send.style.cssText = 'border:0;border-radius:8px;background:' + (config.theme.primary_color || '#4F46E5') + ';color:' + (config.theme.button_text_color || '#ffffff') + ';padding:0 14px;font-weight:700;cursor:pointer;';

  form.appendChild(input);
  form.appendChild(send);

  // Circular FAB Button
  const button = document.createElement('button');
  button.type = 'button';
  button.style.cssText = 'display:flex;align-items:center;justify-content:center;width:56px;height:56px;border:0;border-radius:50%;background:' + (config.theme.primary_color || '#4F46E5') + ';color:' + (config.theme.button_text_color || '#ffffff') + ';box-shadow:0 4px 12px rgba(15,23,42,.25);cursor:pointer;transition:transform 0.2s ease;outline:none;position:relative;z-index:9999;float:' + (isLeft ? 'left' : 'right') + ';';

  // Toggle button hover scale
  button.addEventListener('mouseenter', () => button.style.transform = 'scale(1.08)');
  button.addEventListener('mouseleave', () => button.style.transform = 'scale(1)');

  const launcherIcons = {{
    chat_bubble: '<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-message-square"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path><line x1="8" y1="9" x2="16" y2="9"></line><line x1="8" y1="13" x2="14" y2="13"></line></svg>',
    support_agent: '<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-7.6-4.7 8.38 8.38 0 0 1-.9-3.8v-.5a8 8 0 0 1 16 0v.5z"></path><path d="M18 10a6 6 0 0 0-12 0"></path><path d="M12 18h.01"></path><path d="M21 11.5a1.5 1.5 0 0 1-3 0v-1a1.5 1.5 0 0 1 3 0v1z"></path><path d="M6 11.5a1.5 1.5 0 0 1-3 0v-1a1.5 1.5 0 0 1 3 0v1z"></path></svg>',
    chat_dots: '<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path><circle cx="8" cy="10" r="1"></circle><circle cx="12" cy="10" r="1"></circle><circle cx="16" cy="10" r="1"></circle></svg>',
    sparkles: '<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"></path><path d="m5 3 1 2.5L8.5 6 6 7 5 9.5 4 7 1.5 6 4 5.5 5 3Z"></path><path d="m19 17 1 2.5 2.5.5-2.5 1-1 2.5-1-2.5-2.5-1 2.5-1 1-2.5Z"></path></svg>'
  }};

  const iconName = config.theme.launcher_icon || 'chat_bubble';
  const iconSvg = launcherIcons[iconName] || launcherIcons.chat_bubble;
  const closeIconSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';

  button.innerHTML = iconSvg;

  function updateButtonIcon() {{
    if (panel.style.display === 'block') {{
      button.innerHTML = closeIconSvg;
    }} else {{
      button.innerHTML = iconSvg;
    }}
  }}

  let conversationId = localStorage.getItem('ai_support_conv_id_' + config.widgetId) || null;
  let storedName = localStorage.getItem('ai_support_name_' + config.widgetId) || '';
  let storedEmail = localStorage.getItem('ai_support_email_' + config.widgetId) || '';
  
  let onboardingStep = (storedName && storedEmail) ? 2 : 0;
  let chatMode = 'bot';
  let isAdminOnline = false;
  let pollInterval = null;
  let lastMessageCount = 0;

  function updateHumanButtonVisibility() {{
    if (isAdminOnline && onboardingStep === 2 && conversationId) {{
      humanBtn.style.display = 'block';
      humanBtn.textContent = chatMode === 'human' ? 'Chat with AI' : 'Chat with Human';
    }} else {{
      humanBtn.style.display = 'none';
    }}
  }}

  async function checkAdminStatus() {{
    try {{
      const res = await fetch(config.apiBaseUrl + '/api/v1/widget/' + config.widgetId + '/admin-status');
      const data = await res.json();
      isAdminOnline = !!data.online;
      updateHumanButtonVisibility();
    }} catch (err) {{}}
  }}

  async function checkChatMode() {{
    if (!conversationId) return;
    try {{
      const res = await fetch(config.apiBaseUrl + '/api/v1/widget/' + config.widgetId + '/conversation/' + conversationId + '/status');
      const data = await res.json();
      chatMode = data.chat_mode || 'bot';
      updateHumanButtonVisibility();
      if (chatMode === 'human') {{
        startPolling();
      }} else {{
        stopPolling();
      }}
    }} catch (err) {{}}
  }}

  function startPolling() {{
    if (pollInterval) return;
    pollInterval = setInterval(async () => {{
      if (!conversationId) return;
      try {{
        const res = await fetch(config.apiBaseUrl + '/api/v1/widget/' + config.widgetId + '/conversation/' + conversationId + '/messages');
        const data = await res.json();
        
        if (data.chat_mode && data.chat_mode !== chatMode) {{
          chatMode = data.chat_mode;
          updateHumanButtonVisibility();
          if (chatMode === 'bot') {{
            stopPolling();
            addMessage("Switched back to AI Bot.", 'assistant');
          }}
        }}

        if (data.messages) {{
          if (data.messages.length > lastMessageCount) {{
            for (let i = lastMessageCount; i < data.messages.length; i++) {{
              const m = data.messages[i];
              if (m.sender === 'assistant') {{
                addMessage(m.message, 'assistant');
              }}
            }}
            lastMessageCount = data.messages.length;
          }}
        }}
      }} catch (err) {{}}
    }}, 3000);
  }}

  function stopPolling() {{
    if (pollInterval) {{
      clearInterval(pollInterval);
      pollInterval = null;
    }}
  }}

  humanBtn.addEventListener('click', async function() {{
    if (!conversationId) return;
    const newMode = chatMode === 'bot' ? 'human' : 'bot';
    humanBtn.disabled = true;
    try {{
      const res = await fetch(config.apiBaseUrl + '/api/v1/widget/' + config.widgetId + '/chat-mode', {{
        method: 'POST',
        headers: {{ 'Content-Type': 'application/json' }},
        body: JSON.stringify({{ conversation_id: conversationId, chat_mode: newMode }})
      }});
      if (res.ok) {{
        chatMode = newMode;
        updateHumanButtonVisibility();
        if (chatMode === 'human') {{
          addMessage("Switched to Live Chat. An admin will reply to you shortly.", 'assistant');
          startPolling();
        }} else {{
          addMessage("Switched back to AI Bot.", 'assistant');
          stopPolling();
        }}
      }}
    }} catch (err) {{
    }} finally {{
      humanBtn.disabled = false;
      updateHumanButtonVisibility();
    }}
  }});

  function addMessage(text, sender) {{
    const item = document.createElement('div');
    item.style.cssText = 'margin:8px 0;display:flex;' + (sender === 'visitor' ? 'justify-content:flex-end;' : 'justify-content:flex-start;');
    const bubble = document.createElement('div');
    bubble.textContent = text;
    bubble.style.cssText = 'max-width:78%;padding:9px 11px;border-radius:10px;line-height:1.35;white-space:pre-wrap;' + 
      (sender === 'visitor' 
        ? 'background:' + (config.theme.primary_color || '#4F46E5') + ';color:' + (config.theme.button_text_color || '#ffffff') + ';' 
        : 'background:' + (config.theme.assistant_bg_color || '#ffffff') + ';color:' + (config.theme.assistant_text_color || '#111827') + ';border:1px solid #e5e7eb;');
    item.appendChild(bubble);
    messages.appendChild(item);
    messages.scrollTop = messages.scrollHeight;
  }}

  // Welcome Bubble
  let welcomeBubble = null;
  const isBubbleEnabled = config.theme.bubble_enabled !== false;
  const isDismissed = sessionStorage.getItem('ai_support_bubble_dismissed_' + config.widgetId);

  if (isBubbleEnabled && !isDismissed) {{
    welcomeBubble = document.createElement('div');
    welcomeBubble.style.cssText = 'position:absolute;bottom:8px;' + (isLeft ? 'left:70px;' : 'right:70px;') + 'width:220px;background:#fff;border:1px solid #e2e8f0;border-top:4px solid ' + (config.theme.primary_color || '#4F46E5') + ';border-radius:12px;box-shadow:0 10px 25px rgba(15,23,42,.15);padding:12px 16px;cursor:pointer;z-index:10000;animation:widget-fade-in-up 0.5s ease forwards;font-family:Arial,sans-serif;box-sizing:border-box;';

    const tail = document.createElement('div');
    if (isLeft) {{
      tail.style.cssText = 'position:absolute;left:-6px;top:calc(50% - 6px);width:12px;height:12px;background:#fff;transform:rotate(45deg);border-left:1px solid #e2e8f0;border-bottom:1px solid #e2e8f0;z-index:9999;';
    }} else {{
      tail.style.cssText = 'position:absolute;right:-6px;top:calc(50% - 6px);width:12px;height:12px;background:#fff;transform:rotate(45deg);border-right:1px solid #e2e8f0;border-top:1px solid #e2e8f0;z-index:9999;';
    }}
    welcomeBubble.appendChild(tail);

    const titleText = document.createElement('div');
    titleText.style.cssText = 'font-weight:bold;font-size:14px;color:#1e293b;margin-bottom:4px;padding-right:12px;word-break:break-word;';
    titleText.textContent = config.theme.welcome_title || 'Hii there!';
    welcomeBubble.appendChild(titleText);

    const descText = document.createElement('div');
    descText.style.cssText = 'font-size:12px;color:#64748b;line-height:1.3;word-break:break-word;';
    descText.textContent = config.theme.welcome_message || 'Hii, how can I help you?';
    welcomeBubble.appendChild(descText);

    const closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.className = 'widget-bubble-dismiss';
    closeBtn.style.cssText = 'position:absolute;right:8px;top:4px;border:0;background:transparent;font-size:14px;color:#94a3b8;cursor:pointer;line-height:1;padding:2px;font-weight:bold;outline:none;';
    closeBtn.textContent = '×';
    closeBtn.addEventListener('click', (e) => {{
      e.stopPropagation();
      welcomeBubble.remove();
      sessionStorage.setItem('ai_support_bubble_dismissed_' + config.widgetId, 'true');
    }});
    welcomeBubble.appendChild(closeBtn);

    welcomeBubble.addEventListener('click', () => {{
      panel.style.display = 'block';
      welcomeBubble.remove();
      sessionStorage.setItem('ai_support_bubble_dismissed_' + config.widgetId, 'true');
      updateButtonIcon();
      checkAdminStatus();
      if (conversationId) {{
        checkChatMode();
      }}
      if (messages.childElementCount === 0) {{
        if (onboardingStep === 0) {{
          addMessage('Hi! Before we begin, what is your name?', 'assistant');
        }} else {{
          addMessage(config.description || 'How can we help?', 'assistant');
        }}
      }}
    }});

    root.appendChild(welcomeBubble);
  }}

  button.addEventListener('click', function() {{
    panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
    updateButtonIcon();
    
    if (panel.style.display === 'block') {{
      if (welcomeBubble) {{
        welcomeBubble.remove();
        sessionStorage.setItem('ai_support_bubble_dismissed_' + config.widgetId, 'true');
      }}
      checkAdminStatus();
      if (conversationId) {{
        checkChatMode();
      }}
    }}
    if (messages.childElementCount === 0) {{
      if (onboardingStep === 0) {{
        addMessage('Hi! Before we begin, what is your name?', 'assistant');
      }} else {{
        addMessage(config.description || 'How can we help?', 'assistant');
      }}
    }}
  }});

  form.addEventListener('submit', async function(event) {{
    event.preventDefault();
    const text = input.value.trim();
    if (!text) return;
    
    input.value = '';
    addMessage(text, 'visitor');
    
    if (onboardingStep === 0) {{
      storedName = text;
      localStorage.setItem('ai_support_name_' + config.widgetId, storedName);
      onboardingStep = 1;
      setTimeout(() => {{
        addMessage('Thanks, ' + storedName + '! What is your email address?', 'assistant');
      }}, 500);
      return;
    }}
    
    if (onboardingStep === 1) {{
      if (!text.includes('@')) {{
        setTimeout(() => {{
          addMessage('Please enter a valid email address.', 'assistant');
        }}, 500);
        return;
      }}
      storedEmail = text;
      localStorage.setItem('ai_support_email_' + config.widgetId, storedEmail);
      onboardingStep = 2;
      checkAdminStatus();
      setTimeout(() => {{
        addMessage(config.description || 'How can we help?', 'assistant');
      }}, 500);
      return;
    }}

    send.disabled = true;
    send.textContent = '...';
    try {{
      const response = await fetch(config.apiBaseUrl + '/api/v1/widget/' + config.widgetId + '/message', {{
        method: 'POST',
        headers: {{ 'Content-Type': 'application/json' }},
        body: JSON.stringify({{ message: text, conversation_id: conversationId, visitor_name: storedName, visitor_email: storedEmail }})
      }});
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Request failed');
      
      const isNewConv = !conversationId;
      conversationId = data.conversation_id;
      localStorage.setItem('ai_support_conv_id_' + config.widgetId, conversationId);
      
      if (isNewConv) {{
        checkChatMode();
      }}

      if (data.chat_mode === 'human') {{
        chatMode = 'human';
        updateHumanButtonVisibility();
        startPolling();
      }} else {{
        if (data.response) {{
          addMessage(data.response, 'assistant');
        }}
      }}
    }} catch (error) {{
      addMessage('Sorry, I could not send that message. Please try again.', 'assistant');
    }} finally {{
      send.disabled = false;
      send.textContent = 'Send';
    }}
  }});

  panel.appendChild(header);
  panel.appendChild(messages);
  panel.appendChild(form);
  root.appendChild(panel);
  root.appendChild(button);
  document.body.appendChild(root);
  }}

  if (document.body) {{
    mountWidget();
  }} else {{
    document.addEventListener('DOMContentLoaded', mountWidget, {{ once: true }});
  }}
}})();
"""


def _build_embed_code(script_url: str) -> str:
    script_url_json = json.dumps(script_url)
    return f"""
<script>
  (function() {{
    function loadSupportWidget() {{
      if (document.querySelector('script[data-ai-support-widget="true"]')) return;

      const script = document.createElement('script');
      script.src = {script_url_json};
      script.async = true;
      script.dataset.aiSupportWidget = 'true';
      document.body.appendChild(script);
    }}

    if (document.body) {{
      loadSupportWidget();
    }} else {{
      document.addEventListener('DOMContentLoaded', loadSupportWidget, {{ once: true }});
    }}
  }})();
</script>
"""
