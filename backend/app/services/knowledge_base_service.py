"""
Knowledge base service for managing documents and website sources
"""
import logging
import re
import os
import shutil
from datetime import datetime, timezone
from io import BytesIO
from typing import List, Optional
from urllib.parse import urlparse, urljoin
import urllib.parse
import requests
from bs4 import BeautifulSoup
from docx import Document as DocxDocument
from postgrest.exceptions import APIError
from PyPDF2 import PdfReader
from supabase import Client

# Shim for huggingface_hub cached_download deprecation in newer huggingface_hub versions
import huggingface_hub
if not hasattr(huggingface_hub, "cached_download"):
    from huggingface_hub import hf_hub_download
    
    def cached_download(url, **kwargs):
        parsed = urllib.parse.urlparse(url)
        path_parts = [p for p in parsed.path.split("/") if p]
        repo_id = None
        filename = None
        
        if "resolve" in path_parts:
            idx = path_parts.index("resolve")
            repo_id = "/".join(path_parts[:idx])
            filename = "/".join(path_parts[idx+2:])
        elif "api" in path_parts and "models" in path_parts:
            idx = path_parts.index("models")
            if "file" in path_parts:
                f_idx = path_parts.index("file")
                repo_id = "/".join(path_parts[idx+1:f_idx])
                filename = "/".join(path_parts[f_idx+1:])
                
        if repo_id and filename:
            mapped_kwargs = {}
            for key in ["force_download", "proxies", "token", "local_files_only"]:
                if key in kwargs:
                    mapped_kwargs[key] = kwargs[key]
            if "use_auth_token" in kwargs:
                mapped_kwargs["token"] = kwargs["use_auth_token"]
            
            # Download file using hf_hub_download
            downloaded = hf_hub_download(repo_id=repo_id, filename=filename, **mapped_kwargs)
            
            # Copy to cache_dir if specified
            if "cache_dir" in kwargs:
                target_path = os.path.join(kwargs["cache_dir"], filename)
                os.makedirs(os.path.dirname(target_path), exist_ok=True)
                shutil.copy2(downloaded, target_path)
                return target_path
            return downloaded
            
        # Fallback
        import requests
        cache_dir = kwargs.get("cache_dir") or os.path.expanduser("~/.cache/huggingface/hub")
        os.makedirs(cache_dir, exist_ok=True)
        local_path = os.path.join(cache_dir, os.path.basename(parsed.path))
        r = requests.get(url, stream=True)
        r.raise_for_status()
        with open(local_path, "wb") as f:
            for chunk in r.iter_content(chunk_size=8192):
                f.write(chunk)
        return local_path

    huggingface_hub.cached_download = cached_download

import numpy as np
from app.schemas import WebsiteSourceRequest, KnowledgeBaseItem
from app.db import get_service_db

logger = logging.getLogger(__name__)
MAX_CONTENT_CHARS = 12000

_embedding_model = None

def get_embedding(text: str) -> list:
    global _embedding_model
    if _embedding_model is None:
        from sentence_transformers import SentenceTransformer
        logger.info("Initializing SentenceTransformer model 'all-MiniLM-L6-v2'...")
        _embedding_model = SentenceTransformer('all-MiniLM-L6-v2')
    try:
        embedding = _embedding_model.encode(text)
        padded = np.zeros(1536)
        padded[:len(embedding)] = embedding
        return padded.tolist()
    except Exception as e:
        logger.error(f"Error generating embedding: {e}")
        return None



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

    def _crawl_and_scrape_website(self, base_url: str, max_pages: int = 15) -> list:
        parsed_base = urlparse(base_url)
        base_domain = parsed_base.netloc
        
        visited = set()
        queue = [base_url]
        results = []
        
        while queue and len(visited) < max_pages:
            url = queue.pop(0)
            parsed_url = urlparse(url)
            normalized_url = f"{parsed_url.scheme}://{parsed_url.netloc}{parsed_url.path}"
            if normalized_url.endswith("/"):
                normalized_url = normalized_url[:-1]
                
            if normalized_url in visited:
                continue
                
            visited.add(normalized_url)
            
            try:
                logger.info(f"Crawling URL: {url}")
                response = requests.get(
                    url,
                    timeout=10,
                    headers={"User-Agent": "AI Support Knowledge Bot/1.0"},
                )
                if response.status_code != 200:
                    continue
                    
                content_type = response.headers.get("Content-Type", "")
                if "text/html" not in content_type:
                    continue
                    
                soup = BeautifulSoup(response.text, "html.parser")
                
                for tag in soup(["script", "style", "noscript", "svg"]):
                    tag.decompose()
                    
                title = soup.title.get_text(" ", strip=True) if soup.title else url
                content = self._clean_text(soup.get_text(" ", strip=True))
                
                if content:
                    results.append({
                        "url": url,
                        "title": title,
                        "content": content
                    })
                    
                # Find all internal links
                for anchor in soup.find_all("a", href=True):
                    href = anchor["href"]
                    full_url = urljoin(url, href)
                    parsed_full = urlparse(full_url)
                    
                    if parsed_full.netloc == base_domain:
                        path_lower = parsed_full.path.lower()
                        if any(path_lower.endswith(ext) for ext in [".pdf", ".jpg", ".jpeg", ".png", ".gif", ".zip", ".tar", ".gz", ".docx"]):
                            continue
                        norm_full = f"{parsed_full.scheme}://{parsed_full.netloc}{parsed_full.path}"
                        if norm_full.endswith("/"):
                            norm_full = norm_full[:-1]
                        if norm_full not in visited and norm_full not in queue:
                            queue.append(full_url)
                            
            except Exception as e:
                logger.warning(f"Failed to crawl/scrape {url}: {e}")
                
        return results

    def _save_knowledge_content(self, user_id: str, item_type: str, source: str, title: str, content: str):
        embedding = None
        try:
            embedding = get_embedding(content)
        except Exception as emb_err:
            logger.warning(f"Failed to generate embedding: {emb_err}")

        payload = {
            "user_id": user_id,
            "type": item_type,
            "source": source,
            "title": title,
            "content": content,
        }
        if embedding is not None:
            payload["embedding"] = embedding

        try:
            return self.db.table("knowledge_base").insert(payload).execute()
        except Exception as e:
            # If error is about missing embedding column, retry without it
            if "column" in str(e).lower() and "embedding" in str(e).lower():
                logger.warning("Database schema does not have the 'embedding' column. Retrying insert without embedding.")
                if "embedding" in payload:
                    del payload["embedding"]
                try:
                    return self.db.table("knowledge_base").insert(payload).execute()
                except Exception as retry_err:
                    if self._is_missing_table(retry_err):
                        logger.warning("knowledge_base table is missing")
                        return None
                    raise
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
            
            # Check if knowledge base is empty
            is_kb_empty = True
            try:
                existing_kb = self.db.table("knowledge_base").select("id").eq("user_id", user_id).limit(1).execute()
                if existing_kb.data:
                    is_kb_empty = False
            except Exception as e:
                logger.warning(f"Could not check existing knowledge base size: {e}")
            
            # Determine if we should crawl the entire site
            should_crawl = bool(source_data.crawl or is_kb_empty)
            
            website_record = {
                "user_id": user_id,
                "url": source_data.url,
                "name": source_data.name or source_data.url,
                "last_scraped": datetime.now(timezone.utc).isoformat(),
            }
            
            response = self.db.table("website_sources").insert(
                website_record
            ).execute()
            
            if should_crawl:
                logger.info(f"Crawling entire website: {source_data.url}")
                scraped_pages = self._crawl_and_scrape_website(source_data.url)
                
                # Save all pages in knowledge base
                for page in scraped_pages:
                    self._save_knowledge_content(
                        user_id=user_id,
                        item_type="website",
                        source=page["url"],
                        title=page["title"],
                        content=page["content"],
                    )
                
                # Use primary/homepage details for the returned API result
                primary_page = scraped_pages[0] if scraped_pages else {"title": source_data.name or source_data.url, "content": "No content found"}
                title_val = primary_page["title"]
                content_val = primary_page["content"]
            else:
                logger.info(f"Scraping single page: {source_data.url}")
                scraped = self._scrape_website(source_data.url)
                self._save_knowledge_content(
                    user_id=user_id,
                    item_type="website",
                    source=source_data.url,
                    title=source_data.name or scraped["title"],
                    content=scraped["content"],
                )
                title_val = source_data.name or scraped["title"]
                content_val = scraped["content"]
            
            logger.info(f"Website source added: {source_data.url}")
            result = response.data[0] if response.data else {}
            result.update({
                "type": "website",
                "source": source_data.url,
                "title": title_val,
                "content": content_val,
                "content_preview": content_val[:500],
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
        """Delete knowledge base item (document or website source) by ID"""
        try:
            deleted_any = False

            # 1. Try to delete from knowledge_base table first (which is the primary case)
            try:
                # Find the item to get its type and source for cascading deletes
                kb_item = self.db.table("knowledge_base").select("*").eq(
                    "id", document_id
                ).eq("user_id", user_id).execute()

                if kb_item.data:
                    item = kb_item.data[0]
                    item_type = item.get("type")
                    source = item.get("source")

                    # Delete from knowledge_base
                    self.db.table("knowledge_base").delete().eq("id", document_id).execute()
                    deleted_any = True
                    logger.info(f"Deleted knowledge_base item: {document_id}")

                    # Clean up matching documents / website_sources records
                    if item_type == "document" and source:
                        self.db.table("documents").delete().eq("user_id", user_id).eq("file_name", source).execute()
                        logger.info(f"Cleaned up documents record matching source: {source}")
                    elif item_type == "website" and source:
                        self.db.table("website_sources").delete().eq("user_id", user_id).eq("url", source).execute()
                        logger.info(f"Cleaned up website_sources record matching URL: {source}")

            except Exception as e:
                # Ignore if table is missing, otherwise raise
                if not self._is_missing_table(e):
                    raise
                logger.warning(f"knowledge_base table not available during delete: {e}")

            # 2. Check if the ID is a document ID (in documents table)
            if not deleted_any:
                doc = self.db.table("documents").select("*").eq(
                    "id", document_id
                ).eq("user_id", user_id).execute()

                if doc.data:
                    file_name = doc.data[0].get("file_name")
                    # Delete from documents table
                    self.db.table("documents").delete().eq("id", document_id).execute()
                    deleted_any = True
                    logger.info(f"Deleted document from documents table: {document_id}")

                    # Also delete corresponding knowledge_base items
                    try:
                        self.db.table("knowledge_base").delete().eq("user_id", user_id).eq("type", "document").eq("source", file_name).execute()
                    except Exception as e:
                        if not self._is_missing_table(e):
                            raise

            # 3. Check if the ID is a website source ID (in website_sources table)
            if not deleted_any:
                site = self.db.table("website_sources").select("*").eq(
                    "id", document_id
                ).eq("user_id", user_id).execute()

                if site.data:
                    url = site.data[0].get("url")
                    # Delete from website_sources table
                    self.db.table("website_sources").delete().eq("id", document_id).execute()
                    deleted_any = True
                    logger.info(f"Deleted website source: {document_id}")

                    # Also delete corresponding knowledge_base items
                    try:
                        self.db.table("knowledge_base").delete().eq("user_id", user_id).eq("type", "website").eq("source", url).execute()
                    except Exception as e:
                        if not self._is_missing_table(e):
                            raise

            if not deleted_any:
                raise ValueError("Knowledge base item not found")

            return True

        except Exception as e:
            logger.error(f"Delete document error: {e}")
            raise


def get_knowledge_base_service() -> KnowledgeBaseService:
    """Dependency for knowledge base service"""
    db = get_service_db()
    return KnowledgeBaseService(db)
