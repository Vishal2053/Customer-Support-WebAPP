# Groq API Integration Guide

## Overview
This application uses the **Groq API** for AI-powered responses. Groq provides fast, cost-effective LLM inference.

## Setup

### 1. Get Groq API Key
- Visit [console.groq.com](https://console.groq.com)
- Sign up or login
- Navigate to API Keys
- Create a new API key
- Copy the key

### 2. Configure Environment
Add to `.env`:
```
GROQ_API_KEY=your_groq_api_key
GROQ_MODEL=mixtral-8x7b-32768
```

## Available Models

Groq offers several fast models:

### Recommended Models

| Model | Speed | Accuracy | Best For |
|-------|-------|----------|----------|
| `mixtral-8x7b-32768` | ⚡⚡⚡ | Excellent | General purpose, balanced |
| `llama-2-70b-chat` | ⚡⚡ | Very Good | Complex reasoning |
| `gemma-7b-it` | ⚡⚡⚡ | Good | Fast responses |

### Change Model
Edit `app/core/config.py` or update `GROQ_MODEL` in `.env`:
```python
# Currently using
GROQ_MODEL=mixtral-8x7b-32768

# Or try
GROQ_MODEL=llama-2-70b-chat
GROQ_MODEL=gemma-7b-it
```

## API Usage

### Chat Completion
```python
from app.services import get_ai_service

ai_service = get_ai_service()

# Generate response
response = await ai_service.generate_response(
    prompt="How do I reset my password?",
    context="Knowledge base information...",
    temperature=0.7,
    max_tokens=1024
)
```

### Conversation Response
```python
# Generate response in a conversation
response = await ai_service.generate_conversation_response(
    user_message="What's your refund policy?",
    conversation_history=[
        {"sender": "user", "message": "Hi there"},
        {"sender": "assistant", "message": "Hello! How can I help?"}
    ],
    knowledge_base_context="Our refund policy..."
)
```

### Summarization
```python
# Summarize text
summary = await ai_service.summarize_text(
    text="Long article or document...",
    max_length=200
)
```

## Features

### Key Benefits
- ✅ **Fast Inference** - Millisecond response times
- ✅ **Cost Effective** - Competitive pricing
- ✅ **High Quality** - Advanced models (Mixtral, Llama)
- ✅ **Reliable** - 99.99% uptime SLA
- ✅ **No Rate Limits** - Generous rate limiting

### Context Window
- Mixtral-8x7b: 32,768 tokens
- Llama-2-70b: 4,096 tokens
- Gemma-7b: 8,192 tokens

### Temperature Settings
- `0.0` - Deterministic, factual responses
- `0.5` - Balanced (default for summaries)
- `0.7` - Balanced (default for chat) 
- `1.0+` - Creative, varied responses

## Integration in Routes

### Chat Route Example
```python
@router.post("/chat/message")
async def send_message(
    request: VisitorChatRequest,
    ai_service: GroqAIService = Depends(get_ai_service)
):
    # Generate response
    response = await ai_service.generate_response(
        prompt=request.message,
        context="User context or knowledge base"
    )
    
    return {"response": response}
```

## Error Handling

```python
try:
    response = await ai_service.generate_response(prompt="...")
except Exception as e:
    logger.error(f"Groq API error: {e}")
    # Return fallback response
    return {"response": "I couldn't generate a response. Please try again."}
```

## Best Practices

### 1. Use Appropriate Temperature
```python
# For Q&A (factual)
temperature=0.3

# For creative writing
temperature=0.9

# Default balance
temperature=0.7
```

### 2. Limit Max Tokens
```python
# Short responses
max_tokens=256

# Medium responses
max_tokens=1024

# Long responses
max_tokens=2048
```

### 3. Provide Context
```python
knowledge_base_context = """
Our company provides cloud hosting services.
We offer 24/7 support and 99.9% uptime guarantee.
Pricing starts at $9.99/month.
"""

response = await ai_service.generate_response(
    prompt=user_message,
    context=knowledge_base_context
)
```

### 4. Handle Long Conversations
```python
# Keep only recent history for context
conversation_history[-5:]  # Last 5 messages
```

## Pricing

Visit [console.groq.com/docs/pricing](https://console.groq.com/docs/pricing) for current rates.

Generally:
- Mixtral: ~$0.27 per million input tokens
- Llama: ~$0.40 per million input tokens
- Gemma: ~$0.10 per million input tokens

Free tier includes:
- 30 requests per minute
- Access to all models

## Performance Tips

### Optimization Strategies
1. **Cache Common Responses** - Store frequent Q&As
2. **Batch Requests** - Group multiple requests
3. **Use Appropriate Models** - Match model to task complexity
4. **Reduce Context Size** - Only include relevant info
5. **Stream Long Responses** - For real-time chat

## Troubleshooting

### API Key Issues
```
Error: "Authentication failed"
Solution: Verify GROQ_API_KEY in .env
```

### Rate Limiting
```
Error: "Rate limit exceeded"
Solution: Implement retry logic with exponential backoff
```

### Timeout Issues
```
Error: "Request timeout"
Solution: Reduce max_tokens or simplify prompt
```

## Monitoring

### Track API Usage
```python
# Log request details
logger.info(f"Groq request: model={self.model}, tokens={max_tokens}")

# Monitor response quality
logger.info(f"Generated response: {generated_text[:100]}...")
```

### Set Up Alerts
- Monitor API quota usage
- Alert on errors
- Track response times

## Advanced Configuration

### Custom Parameters
```python
response = self.client.chat.completions.create(
    model="mixtral-8x7b-32768",
    messages=[...],
    temperature=0.7,
    max_tokens=1024,
    top_p=0.9,  # Nucleus sampling
    frequency_penalty=0,  # Reduce repetition
)
```

## Documentation
- [Groq Documentation](https://console.groq.com/docs)
- [API Reference](https://console.groq.com/docs/api-reference)
- [Models Info](https://console.groq.com/docs/models)

## Support
For issues or questions:
1. Check Groq documentation
2. Review logs for error messages
3. Contact Groq support
4. Check GitHub issues for similar problems

---

**Happy coding with Groq! ⚡**
