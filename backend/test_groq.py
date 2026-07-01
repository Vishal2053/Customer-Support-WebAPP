import asyncio
import os
import sys
from dotenv import load_dotenv
load_dotenv()
sys.path.append(os.getcwd())
from app.services.groq_service import GroqAIService

async def test():
    try:
        service = GroqAIService()
        print(await service.generate_response('hii', 'context'))
    except Exception as e:
        import traceback
        traceback.print_exc()

asyncio.run(test())
