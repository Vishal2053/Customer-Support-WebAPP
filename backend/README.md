# FastAPI Backend README

## Overview
FastAPI backend for the AI Customer Support application. Handles authentication, knowledge base management, chat interactions, and analytics.

## Quick Start

### Prerequisites
- Python 3.9+
- Supabase account
- OpenAI API key (for AI responses)
- Serper API key (for web scraping)

### Installation

1. **Setup virtual environment**
```bash
python -m venv venv
source venv/Scripts/activate  # Windows: venv\Scripts\activate
```

2. **Install dependencies**
```bash
pip install -r requirements.txt
```

3. **Create .env file**
```bash
cp .env.example .env
```

4. **Update .env with your credentials**
```
SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
JWT_SECRET=your_random_secret_key
OPENAI_API_KEY=your_openai_api_key
SERPER_API_KEY=your_serper_api_key
```

5. **Run development server**
```bash
python main.py
```

Server will start at `http://localhost:8000`

## API Documentation

### Auto-generated docs
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

### Key Endpoints

**Health Check**
```bash
GET http://localhost:8000/health
```

**Authentication**
```bash
# Signup
POST http://localhost:8000/api/v1/auth/signup
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword",
  "company_name": "My Company",
  "first_name": "John",
  "last_name": "Doe"
}

# Login
POST http://localhost:8000/api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword"
}
```

## Project Structure

```
backend/
├── app/
│   ├── api/
│   │   └── routes/          # API endpoint implementations
│   ├── core/
│   │   └── config.py        # Configuration management
│   ├── db/
│   │   └── database.py      # Database connections
│   ├── middleware/          # Custom middleware
│   ├── models/              # Data models
│   ├── schemas/             # Pydantic schemas
│   ├── services/            # Business logic
│   └── utils/               # Utility functions
├── tests/                   # Unit tests
├── main.py                  # Application entry point
├── requirements.txt         # Python dependencies
├── .env.example            # Environment template
└── DATABASE_SCHEMA.md      # Database setup
```

## Database Setup

1. Log in to Supabase console
2. Create new project or use existing
3. Open SQL Editor
4. Copy and run SQL from `DATABASE_SCHEMA.md`
5. Enable Row Level Security (RLS) for all tables

## Running Tests

```bash
pytest tests/
```

## Deployment

### Docker
```bash
docker build -t ai-support-backend .
docker run -p 8000:8000 --env-file .env ai-support-backend
```

### Production Considerations
- Use environment variables for all secrets
- Enable HTTPS
- Set up proper logging
- Configure CORS appropriately
- Use connection pooling
- Implement rate limiting
- Set up monitoring and alerting

## Architecture

### Authentication Flow
1. User signs up with email/password
2. Supabase creates auth user
3. User profile stored in database
4. JWT token issued on login
5. Token used for subsequent requests

### Knowledge Base Pipeline
1. User submits URL or uploads document
2. Content scraped/extracted
3. Text processed and cleaned
4. Embeddings generated
5. Stored in vector database
6. Ready for RAG queries

### Chat Flow
1. Visitor starts conversation
2. Conversation ID generated
3. Visitor info captured
4. Messages exchanged
5. Context retrieved from knowledge base
6. AI generates responses using RAG

## Troubleshooting

### Connection Issues
- Verify Supabase URL and keys
- Check network connectivity
- Ensure service is running

### Authentication Errors
- Verify JWT_SECRET is set
- Check token expiration
- Clear browser cache

### Database Errors
- Ensure database schema is created
- Check user permissions (RLS)
- Verify table structure

## Contributing

1. Create feature branch
2. Make changes
3. Run tests
4. Submit pull request

## License

MIT
