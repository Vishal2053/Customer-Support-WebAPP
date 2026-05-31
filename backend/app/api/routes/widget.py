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


@router.post("/generate")
async def generate_widget(
    user_id: str,
    db: Client = Depends(get_service_db)
):
    """Generate chatbot widget for user"""
    try:
        widget_id = generate_widget_id()
        _ensure_user_profile(db, user_id)
        
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
        }
    except Exception as e:
        logger.error(f"Generate widget error: {e}")
        if isinstance(e, APIError) and "PGRST205" in str(e):
            raise HTTPException(
                status_code=503,
                detail="Supabase widget table is missing. Run the updated backend/supabase_minimal_auth_knowledge_base.sql in the Supabase SQL Editor.",
            )
        raise HTTPException(status_code=500, detail="Failed to generate widget")


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

        context = _build_knowledge_context(db, user_id)
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
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Widget message error: {e}")
        raise HTTPException(status_code=500, detail="Failed to send widget message")


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

  const root = document.createElement('div');
  root.id = 'ai-support-widget-root-' + config.widgetId;
  root.style.cssText = 'position:fixed;right:20px;bottom:20px;z-index:2147483647;font-family:Arial,sans-serif;';

  const panel = document.createElement('div');
  panel.style.cssText = 'display:none;width:320px;max-width:calc(100vw - 40px);height:420px;background:#fff;border:1px solid #e5e7eb;border-radius:12px;box-shadow:0 18px 40px rgba(15,23,42,.22);overflow:hidden;margin-bottom:12px;';

  const header = document.createElement('div');
  header.style.cssText = 'background:' + (config.theme.primary_color || '#4F46E5') + ';color:#fff;padding:14px 16px;font-weight:700;';
  header.textContent = config.title || 'Chat with us';

  const messages = document.createElement('div');
  messages.style.cssText = 'height:292px;overflow:auto;padding:12px;background:#f8fafc;font-size:14px;';

  const form = document.createElement('form');
  form.style.cssText = 'display:flex;gap:8px;padding:10px;border-top:1px solid #e5e7eb;background:#fff;';

  const input = document.createElement('input');
  input.type = 'text';
  input.placeholder = 'Type your message...';
  input.style.cssText = 'flex:1;border:1px solid #d1d5db;border-radius:8px;padding:10px;font-size:14px;outline:none;';

  const send = document.createElement('button');
  send.type = 'submit';
  send.textContent = 'Send';
  send.style.cssText = 'border:0;border-radius:8px;background:' + (config.theme.primary_color || '#4F46E5') + ';color:#fff;padding:0 14px;font-weight:700;cursor:pointer;';

  const button = document.createElement('button');
  button.type = 'button';
  button.textContent = 'Chat';
  button.style.cssText = 'float:right;border:0;border-radius:999px;background:' + (config.theme.primary_color || '#4F46E5') + ';color:#fff;padding:14px 18px;font-weight:700;box-shadow:0 10px 25px rgba(15,23,42,.22);cursor:pointer;';

  let conversationId = null;
  function addMessage(text, sender) {{
    const item = document.createElement('div');
    item.style.cssText = 'margin:8px 0;display:flex;' + (sender === 'visitor' ? 'justify-content:flex-end;' : 'justify-content:flex-start;');
    const bubble = document.createElement('div');
    bubble.textContent = text;
    bubble.style.cssText = 'max-width:78%;padding:9px 11px;border-radius:10px;line-height:1.35;white-space:pre-wrap;' + (sender === 'visitor' ? 'background:#4F46E5;color:#fff;' : 'background:#fff;color:#111827;border:1px solid #e5e7eb;');
    item.appendChild(bubble);
    messages.appendChild(item);
    messages.scrollTop = messages.scrollHeight;
  }}

  button.addEventListener('click', function() {{
    panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
    if (messages.childElementCount === 0) addMessage(config.description || 'How can we help?', 'assistant');
  }});

  form.addEventListener('submit', async function(event) {{
    event.preventDefault();
    const text = input.value.trim();
    if (!text) return;
    input.value = '';
    addMessage(text, 'visitor');
    send.disabled = true;
    send.textContent = '...';
    try {{
      const response = await fetch(config.apiBaseUrl + '/api/v1/widget/' + config.widgetId + '/message', {{
        method: 'POST',
        headers: {{ 'Content-Type': 'application/json' }},
        body: JSON.stringify({{ message: text, conversation_id: conversationId }})
      }});
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Request failed');
      conversationId = data.conversation_id;
      addMessage(data.response, 'assistant');
    }} catch (error) {{
      addMessage('Sorry, I could not send that message. Please try again.', 'assistant');
    }} finally {{
      send.disabled = false;
      send.textContent = 'Send';
    }}
  }});

  form.appendChild(input);
  form.appendChild(send);
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
