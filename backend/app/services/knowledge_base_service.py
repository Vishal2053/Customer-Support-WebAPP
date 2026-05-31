"""
Knowledge base service for managing documents and website sources
"""
import logging
import re
from datetime import datetime, timezone
from io import BytesIO
from typing import List, Optional
import requests
from bs4 import BeautifulSoup
from docx import Document as DocxDocument
from postgrest.exceptions import APIError
from PyPDF2 import PdfReader
from supabase import Client
from app.schemas import WebsiteSourceRequest, KnowledgeBaseItem
from app.db import get_service_db

logger = logging.getLogger(__name__)
MAX_CONTENT_CHARS = 12000


class KnowledgeBaseService:
    """Knowledge base management service"""
    
    def __init__(self, db: Client):
        self.db = db

    def _ensure_user_profile(self, user_id: str):
        """Create the public.users row for auth users created before the table existed."""
        existing = self.db.table("users").select("id").eq("id", user_id).execute()
        if existing.data:
            return

        try:
            auth_user = self.db.auth.admin.get_user_by_id(user_id).user
        except Exception as e:
            logger.warning(f"Could not fetch auth user {user_id}; creating fallback profile: {e}")
            auth_user = None

        metadata = auth_user.user_metadata if auth_user and auth_user.user_metadata else {}
        self.db.table("users").upsert({
            "id": auth_user.id if auth_user else user_id,
            "email": auth_user.email if auth_user and auth_user.email else f"{user_id}@unknown.local",
            "company_name": metadata.get("company_name") or "Unknown Company",
            "first_name": metadata.get("first_name"),
            "last_name": metadata.get("last_name"),
        }).execute()

    @staticmethod
    def _is_missing_table(error: Exception) -> bool:
        return isinstance(error, APIError) and "PGRST205" in str(error)

    @staticmethod
    def _clean_text(text: str) -> str:
        return re.sub(r"\s+", " ", text).strip()[:MAX_CONTENT_CHARS]

    def _scrape_website(self, url: str) -> dict:
        response = requests.get(
            url,
            timeout=15,
            headers={"User-Agent": "AI Support Knowledge Bot/1.0"},
        )
        response.raise_for_status()

        soup = BeautifulSoup(response.text, "html.parser")
        for tag in soup(["script", "style", "noscript", "svg"]):
            tag.decompose()

        title = soup.title.get_text(" ", strip=True) if soup.title else url
        content = self._clean_text(soup.get_text(" ", strip=True))
        if not content:
            raise ValueError("No readable text found on website")
        return {"title": title, "content": content}

    def _extract_document_text(self, file_name: str, file_type: str, file_content: bytes) -> str:
        name = file_name.lower()
        content_type = (file_type or "").lower()

        if name.endswith(".pdf") or "pdf" in content_type:
            reader = PdfReader(BytesIO(file_content))
            return self._clean_text("\n".join(page.extract_text() or "" for page in reader.pages))

        if name.endswith(".docx") or "wordprocessingml" in content_type:
            doc = DocxDocument(BytesIO(file_content))
            return self._clean_text("\n".join(paragraph.text for paragraph in doc.paragraphs))

        return self._clean_text(file_content.decode("utf-8", errors="ignore"))

    def _save_knowledge_content(self, user_id: str, item_type: str, source: str, title: str, content: str):
        try:
            return self.db.table("knowledge_base").insert({
                "user_id": user_id,
                "type": item_type,
                "source": source,
                "title": title,
                "content": content,
            }).execute()
        except Exception as e:
            if self._is_missing_table(e):
                logger.warning("knowledge_base table is missing; content preview will not be stored")
                return None
            raise
    
    async def add_website_source(
        self, user_id: str, source_data: WebsiteSourceRequest
    ) -> dict:
        """Add website source for scraping"""
        try:
            self._ensure_user_profile(user_id)
            scraped = self._scrape_website(source_data.url)
            website_record = {
                "user_id": user_id,
                "url": source_data.url,
                "name": source_data.name or source_data.url,
                "last_scraped": datetime.now(timezone.utc).isoformat(),
            }
            
            response = self.db.table("website_sources").insert(
                website_record
            ).execute()
            self._save_knowledge_content(
                user_id=user_id,
                item_type="website",
                source=source_data.url,
                title=source_data.name or scraped["title"],
                content=scraped["content"],
            )
            
            logger.info(f"Website source added: {source_data.url}")
            result = response.data[0] if response.data else {}
            result.update({
                "type": "website",
                "source": source_data.url,
                "title": source_data.name or scraped["title"],
                "content": scraped["content"],
                "content_preview": scraped["content"][:500],
            })
            return result
            
        except Exception as e:
            logger.error(f"Add website source error: {e}")
            raise
    
    async def add_document(
        self, user_id: str, file_name: str, file_type: str, file_size: int, storage_path: str, file_content: bytes
    ) -> dict:
        """Add uploaded document"""
        try:
            self._ensure_user_profile(user_id)
            content = self._extract_document_text(file_name, file_type, file_content)
            document_record = {
                "user_id": user_id,
                "file_name": file_name,
                "file_type": file_type,
                "file_size": file_size,
                "storage_path": storage_path,
            }
            
            response = self.db.table("documents").insert(
                document_record
            ).execute()
            self._save_knowledge_content(
                user_id=user_id,
                item_type="document",
                source=file_name,
                title=file_name,
                content=content,
            )
            
            logger.info(f"Document added: {file_name}")
            result = response.data[0] if response.data else {}
            result.update({
                "type": "document",
                "source": file_name,
                "title": file_name,
                "content": content,
                "content_preview": content[:500],
            })
            return result
            
        except Exception as e:
            logger.error(f"Add document error: {e}")
            raise
    
    async def get_knowledge_base(self, user_id: str) -> List[dict]:
        """Get all knowledge base items for user"""
        try:
            try:
                knowledge = self.db.table("knowledge_base").select("*").eq(
                    "user_id", user_id
                ).order("created_at", desc=True).execute()
                if knowledge.data:
                    return [
                        {
                            "id": item["id"],
                            "type": item["type"],
                            "source": item.get("source"),
                            "title": item.get("title") or item.get("source"),
                            "content": item.get("content") or "",
                            "content_preview": (item.get("content") or "")[:500],
                            "created_at": item["created_at"],
                        }
                        for item in knowledge.data
                    ]
            except Exception as e:
                if not self._is_missing_table(e):
                    raise

            # Get documents
            docs = self.db.table("documents").select("*").eq(
                "user_id", user_id
            ).execute()
            
            # Get website sources
            websites = self.db.table("website_sources").select("*").eq(
                "user_id", user_id
            ).execute()
            
            items = []
            for doc in docs.data:
                items.append({
                    "id": doc["id"],
                    "type": "document",
                    "source": doc["file_name"],
                    "title": doc["file_name"],
                    "content": "",
                    "content_preview": "No extracted content stored yet. Upload this document again to extract text.",
                    "created_at": doc["created_at"],
                })
            
            for website in websites.data:
                items.append({
                    "id": website["id"],
                    "type": "website",
                    "source": website["url"],
                    "title": website.get("name") or website["url"],
                    "content": "",
                    "content_preview": "No scraped content stored yet. Add this website again to scrape readable page text.",
                    "created_at": website["created_at"],
                })
            
            return items
            
        except Exception as e:
            logger.error(f"Get knowledge base error: {e}")
            raise
    
    async def delete_document(self, user_id: str, document_id: str) -> bool:
        """Delete document"""
        try:
            # Verify user owns document
            doc = self.db.table("documents").select("*").eq(
                "id", document_id
            ).eq("user_id", user_id).execute()
            
            if not doc.data:
                raise ValueError("Document not found")
            
            self.db.table("documents").delete().eq("id", document_id).execute()
            
            logger.info(f"Document deleted: {document_id}")
            return True
            
        except Exception as e:
            logger.error(f"Delete document error: {e}")
            raise


def get_knowledge_base_service() -> KnowledgeBaseService:
    """Dependency for knowledge base service"""
    db = get_service_db()
    return KnowledgeBaseService(db)
