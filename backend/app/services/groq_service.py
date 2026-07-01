"""
AI/LLM service using Groq API
"""
import logging
from typing import Optional
from groq import AsyncGroq
from app.core.config import settings

logger = logging.getLogger(__name__)


class GroqAIService:
    """Groq AI service for generating responses"""
    
    def __init__(self):
        self.client = AsyncGroq(api_key=settings.GROQ_API_KEY)
        self.model = "llama-3.1-8b-instant"
    
    async def generate_response(
        self, 
        prompt: str, 
        context: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: int = 1024
    ) -> str:
        """
        Generate AI response using Groq API
        
        Args:
            prompt: User message
            context: Additional context from knowledge base
            temperature: Response creativity (0.0-2.0)
            max_tokens: Maximum response length
        
        Returns:
            Generated response text
        """
        try:
            # Build system message with context
            system_message = (
                "You are a helpful, polite customer support assistant for this website.\n"
                "- If the user says hello or greets you, greet them back warmly and ask how you can help.\n"
                "- Use the Knowledge Base Context provided below to answer their questions.\n"
                "- DO NOT just copy-paste the raw context or spit out raw links unless asked.\n"
                "- Answer in a natural, conversational tone."
            )
            if context:
                system_message += f"\n\nKnowledge Base Context:\n{context}"
            
            # Call Groq API
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {
                        "role": "system",
                        "content": system_message
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                temperature=temperature,
                max_tokens=max_tokens,
            )
            
            # Extract response
            generated_text = response.choices[0].message.content
            logger.info(f"Generated response using {self.model}")
            
            return generated_text
            
        except Exception as e:
            logger.error(f"Groq API error: {e}")
            raise
    
    async def generate_conversation_response(
        self,
        user_message: str,
        conversation_history: list,
        knowledge_base_context: Optional[str] = None
    ) -> str:
        """
        Generate response in a conversation
        
        Args:
            user_message: Latest user message
            conversation_history: List of previous messages
            knowledge_base_context: Relevant knowledge base content
        
        Returns:
            Generated response
        """
        try:
            # Build messages list
            messages = [
                {
                    "role": "system",
                    "content": "You are a helpful customer support chatbot. Provide clear, concise, and accurate answers."
                    + (f"\n\nRelevant Information:\n{knowledge_base_context}" if knowledge_base_context else "")
                }
            ]
            
            # Add conversation history
            for msg in conversation_history[-5:]:  # Keep last 5 messages for context
                messages.append({
                    "role": msg.get("sender", "user"),
                    "content": msg.get("message", "")
                })
            
            # Add current message
            messages.append({
                "role": "user",
                "content": user_message
            })
            
            # Call Groq API
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                temperature=0.7,
                max_tokens=1024,
            )
            
            return response.choices[0].message.content
            
        except Exception as e:
            logger.error(f"Error generating conversation response: {e}")
            raise
    
    async def summarize_text(self, text: str, max_length: int = 200) -> str:
        """
        Summarize text using Groq
        
        Args:
            text: Text to summarize
            max_length: Maximum summary length
        
        Returns:
            Summarized text
        """
        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {
                        "role": "system",
                        "content": f"Summarize the following text in approximately {max_length} characters. Be concise and clear."
                    },
                    {
                        "role": "user",
                        "content": text
                    }
                ],
                temperature=0.5,
                max_tokens=256,
            )
            
            return response.choices[0].message.content
            
        except Exception as e:
            logger.error(f"Error summarizing text: {e}")
            raise


def get_ai_service() -> GroqAIService:
    """Dependency for AI service"""
    return GroqAIService()
