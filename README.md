# AI Customer Support Application

Production-ready AI-powered customer support application built with FastAPI, React, and Supabase.

## Project Structure

```
support app/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── routes/
│   │   │   │   ├── auth.py              # Authentication endpoints
│   │   │   │   ├── knowledge_base.py    # Knowledge base management
│   │   │   │   ├── chat.py              # Chat endpoints
│   │   │   │   ├── widget.py            # Widget generation
│   │   │   │   └── analytics.py         # Analytics endpoints
│   │   │   └── __init__.py
│   │   ├── core/
│   │   │   ├── config.py                # Settings configuration
│   │   │   └── __init__.py
│   │   ├── db/
│   │   │   ├── database.py              # Supabase client
│   │   │   └── __init__.py
│   │   ├── middleware/
│   │   │   ├── cors.py                  # CORS setup
│   │   │   ├── logging_middleware.py    # Request logging
│   │   │   └── __init__.py
│   │   ├── models/
│   │   │   ├── models.py                # Data models
│   │   │   └── __init__.py
│   │   ├── schemas/
│   │   │   ├── schemas.py               # Pydantic schemas
│   │   │   └── __init__.py
│   │   ├── services/
│   │   │   ├── auth_service.py          # Auth business logic
│   │   │   ├── knowledge_base_service.py # KB management
│   │   │   ├── chat_service.py          # Chat logic
│   │   │   └── __init__.py
│   │   ├── utils/
│   │   │   ├── security.py              # Security utilities
│   │   │   ├── helpers.py               # Helper functions
│   │   │   └── __init__.py
│   │   └── __init__.py
│   ├── tests/                           # Unit tests
│   ├── logs/                            # Application logs
│   ├── main.py                          # FastAPI entry point
│   ├── requirements.txt                 # Python dependencies
│   ├── .env.example                     # Environment variables template
│   ├── DATABASE_SCHEMA.md               # Database schema
│   └── README.md
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── UI.jsx                   # Reusable UI components
│   │   │   ├── AuthForms.jsx            # Login/Signup forms
│   │   │   ├── KnowledgeBaseForm.jsx    # KB form component
│   │   │   ├── ChatComponents.jsx       # Chat widget components
│   │   │   └── Layout.jsx               # Layout components
│   │   ├── pages/
│   │   │   ├── Landing.jsx              # Landing page
│   │   │   ├── Login.jsx                # Login page
│   │   │   ├── Signup.jsx               # Signup page
│   │   │   └── Dashboard.jsx            # Main dashboard
│   │   ├── services/
│   │   │   ├── supabase.js              # Supabase client
│   │   │   ├── api.js                   # API client
│   │   │   └── index.js                 # API endpoints
│   │   ├── context/
│   │   │   └── store.js                 # Zustand stores
│   │   ├── hooks/
│   │   │   └── index.js                 # Custom hooks
│   │   ├── styles/
│   │   │   └── index.css                # Global styles
│   │   ├── assets/                      # Images, icons
│   │   ├── App.jsx                      # Main app component
│   │   └── main.jsx                     # React entry point
│   ├── public/                          # Static files
│   ├── index.html                       # HTML template
│   ├── package.json                     # Dependencies
│   ├── vite.config.js                   # Vite configuration
│   ├── tailwind.config.js               # Tailwind config
│   ├── postcss.config.js                # PostCSS config
│   ├── .env.example                     # Environment variables
│   └── README.md
│
└── README.md (root)
```

## Setup Instructions

### Backend Setup

1. **Create virtual environment**
```bash
cd backend
python -m venv venv
source venv/Scripts/activate  # On Windows
# or
source venv/bin/activate  # On macOS/Linux
```

2. **Install dependencies**
```bash
pip install -r requirements.txt
```

3. **Configure environment**
```bash
cp .env.example .env
# Edit .env with your Supabase credentials
```

4. **Set up database schema**
   - Log in to Supabase
   - Run SQL from `DATABASE_SCHEMA.md`
   - Enable Row Level Security (RLS)

5. **Run development server**
```bash
python main.py
# or
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend Setup

1. **Install dependencies**
```bash
cd frontend
npm install
```

2. **Configure environment**
```bash
cp .env.example .env
# Edit .env with your API and Supabase URLs
```

3. **Run development server**
```bash
npm run dev
```

Access the app at `http://localhost:5173`

## Key Features

### Authentication
- Supabase Authentication
- JWT token management
- Secure session handling
- Protected routes

### Knowledge Base Management
- Website URL submission
- Document upload (PDF, DOCX, TXT)
- Content extraction
- Embedding storage

### Chat System
- Real-time conversations
- Message history
- Visitor information capture
- Conversation tracking

### Dashboard
- Conversation statistics
- Lead management
- Document management
- Widget configuration

### Chatbot Widget
- Embeddable code generation
- Unique widget IDs
- Visitor capture
- Theme customization

## API Endpoints

### Authentication
- `POST /api/v1/auth/signup` - Register user
- `POST /api/v1/auth/login` - Login user
- `POST /api/v1/auth/logout` - Logout user
- `GET /api/v1/auth/me` - Get current user

### Knowledge Base
- `POST /api/v1/knowledge-base/website` - Add website
- `POST /api/v1/knowledge-base/document` - Upload document
- `GET /api/v1/knowledge-base/` - Get knowledge base items
- `DELETE /api/v1/knowledge-base/{item_id}` - Delete item

### Chat
- `POST /api/v1/chat/start` - Start conversation
- `POST /api/v1/chat/message` - Send message
- `GET /api/v1/chat/conversations/{user_id}` - Get conversations
- `GET /api/v1/chat/conversation/{conversation_id}` - Get conversation details

### Widget
- `POST /api/v1/widget/generate` - Generate widget
- `GET /api/v1/widget/{widget_id}` - Get widget config

### Analytics
- `GET /api/v1/analytics/stats/{user_id}` - Get statistics
- `GET /api/v1/analytics/leads/{user_id}` - Get leads

## Environment Variables

### Backend (.env)
```
SUPABASE_URL=your_url
SUPABASE_KEY=your_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
JWT_SECRET=your_secret
OPENAI_API_KEY=your_openai_key
SERPER_API_KEY=your_serper_key
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:8000
VITE_SUPABASE_URL=your_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

## Tech Stack

### Backend
- FastAPI
- Supabase
- PostgreSQL with pgvector
- Python 3.9+

### Frontend
- React 18
- Vite
- Tailwind CSS
- Zustand (state management)
- React Router (routing)

### AI/ML
- OpenAI or Anthropic APIs
- Sentence Transformers (embeddings)
- RAG pipeline

## Development

### Run both services
```bash
# Terminal 1 - Backend
cd backend
python main.py

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### Build for production
```bash
# Backend
pip install -r requirements.txt
# Build Dockerfile for container deployment

# Frontend
npm run build
```

## License

MIT
