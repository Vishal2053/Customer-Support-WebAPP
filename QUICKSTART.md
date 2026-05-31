# Quick Start Guide

## 5-Minute Setup

### Prerequisites Checklist
- [ ] Python 3.9+
- [ ] Node.js 16+
- [ ] Supabase account
- [ ] OpenAI API key
- [ ] Serper API key (optional, for web scraping)

### Step 1: Backend Setup (2 minutes)

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/Scripts/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Setup environment
cp .env.example .env
# Edit .env with your Supabase and API keys

# Start backend
python main.py
```

Backend runs on: `http://localhost:8000`
API Docs: `http://localhost:8000/docs`

### Step 2: Frontend Setup (2 minutes)

```bash
cd frontend

# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env with your API URLs

# Start frontend
npm run dev
```

Frontend runs on: `http://localhost:5173`

### Step 3: Database Setup (1 minute)

1. Open Supabase console: `https://app.supabase.com`
2. Select your project
3. Open SQL Editor
4. Copy all SQL from `backend/DATABASE_SCHEMA.md`
5. Run the SQL
6. Enable Row Level Security (RLS) on all tables

## Common Commands

### Backend
```bash
cd backend

# Development
python main.py

# Install new dependency
pip install package_name
pip freeze > requirements.txt

# Run tests
pytest tests/

# Format code
black app/

# Lint
flake8 app/
```

### Frontend
```bash
cd frontend

# Development
npm run dev

# Build
npm run build

# Preview build
npm run preview

# Install new dependency
npm install package_name

# Update dependencies
npm update

# Format code
npm run format

# Lint
npm run lint
```

## Environment Variables

### Backend (.env)
```
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_KEY=ey...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
JWT_SECRET=your_random_secret_key_here_min_32_chars
OPENAI_API_KEY=sk-...
SERPER_API_KEY=...
ENVIRONMENT=development
DEBUG=True
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:8000
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=ey...
```

## Troubleshooting

### Backend won't start
```bash
# Check if port 8000 is in use
lsof -i :8000  # macOS/Linux
netstat -ano | findstr :8000  # Windows

# Kill process and try again
```

### Frontend won't load
```bash
# Clear node_modules
rm -rf node_modules package-lock.json
npm install

# Check if port 5173 is available
```

### Database connection fails
```bash
# Verify credentials in .env
# Check Supabase project is active
# Test connection: psql postgresql://...
```

### API calls return 401
```bash
# Token expired - clear localStorage
# Supabase credentials wrong - verify .env
# Check browser console for errors
```

## Next Steps

1. **Customize UI**
   - Edit components in `frontend/src/components/`
   - Modify colors in `frontend/tailwind.config.js`

2. **Add Knowledge Base Processing**
   - Implement document extraction in backend
   - Add embedding generation with OpenAI
   - Create RAG pipeline

3. **Deploy to Production**
   - See DEPLOYMENT.md
   - Use Docker for containerization
   - Set up CI/CD pipeline

4. **Add Real-time Features**
   - Implement WebSocket for live chat
   - Add Socket.IO for notifications
   - Real-time conversation updates

## Documentation

- [Backend README](backend/README.md)
- [Frontend README](frontend/README.md)
- [Database Schema](backend/DATABASE_SCHEMA.md)
- [Architecture Guide](ARCHITECTURE.md)
- [API Documentation](http://localhost:8000/docs)

## Support

For issues:
1. Check existing documentation
2. Review error messages in console
3. Check .env configuration
4. Verify all dependencies installed
5. Clear cache and rebuild

## Production Deployment

### Backend Deployment
```bash
# Build Docker image
docker build -t ai-support-backend ./backend

# Run with environment variables
docker run -p 8000:8000 --env-file .env ai-support-backend
```

### Frontend Deployment
```bash
# Build
npm run build

# Deploy dist/ folder to:
# - Vercel
# - Netlify
# - AWS S3 + CloudFront
# - GitHub Pages
# - Any static hosting
```

## Security Checklist

- [ ] Never commit .env files
- [ ] Use strong JWT_SECRET (32+ characters)
- [ ] Enable HTTPS in production
- [ ] Set up CORS properly
- [ ] Enable RLS on database tables
- [ ] Use environment variables for secrets
- [ ] Keep dependencies updated
- [ ] Set up rate limiting
- [ ] Enable audit logging
- [ ] Regular security reviews

## Performance Tips

1. **Frontend**
   - Use React DevTools Profiler
   - Minimize bundle size
   - Enable code splitting
   - Optimize images

2. **Backend**
   - Use connection pooling
   - Cache frequently accessed data
   - Use async operations
   - Monitor slow queries

3. **Database**
   - Create appropriate indexes
   - Analyze query plans
   - Denormalize if needed
   - Archive old data

## Additional Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [React Documentation](https://react.dev/)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

Happy coding! 🚀
