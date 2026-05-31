# React Frontend README

## Overview
Modern React frontend for the AI Customer Support application. Built with Vite, React Router, and Tailwind CSS.

## Quick Start

### Prerequisites
- Node.js 16+
- npm or yarn
- Supabase account

### Installation

1. **Install dependencies**
```bash
npm install
```

2. **Create .env file**
```bash
cp .env.example .env
```

3. **Update .env with your credentials**
```
VITE_API_URL=http://localhost:8000
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. **Start development server**
```bash
npm run dev
```

App will open at `http://localhost:5173`

## Available Scripts

```bash
# Development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint

# Format code
npm run format
```

## Project Structure

```
frontend/
├── src/
│   ├── components/          # Reusable React components
│   │   ├── UI.jsx          # UI primitives
│   │   ├── AuthForms.jsx   # Auth forms
│   │   ├── ChatComponents.jsx
│   │   ├── KnowledgeBaseForm.jsx
│   │   └── Layout.jsx      # Layout components
│   ├── pages/              # Page components
│   │   ├── Landing.jsx
│   │   ├── Login.jsx
│   │   ├── Signup.jsx
│   │   └── Dashboard.jsx
│   ├── services/           # API and external services
│   │   ├── api.js
│   │   ├── supabase.js
│   │   └── index.js
│   ├── context/            # State management (Zustand)
│   │   └── store.js
│   ├── hooks/              # Custom React hooks
│   │   └── index.js
│   ├── styles/             # Global styles
│   │   └── index.css
│   ├── assets/             # Images and static files
│   ├── App.jsx             # Main app component
│   └── main.jsx            # React entry point
├── public/                 # Static assets
├── index.html              # HTML template
├── vite.config.js          # Vite configuration
├── tailwind.config.js      # Tailwind CSS config
├── postcss.config.js       # PostCSS config
└── package.json            # Dependencies
```

## Key Technologies

### Frontend Framework
- **React 18** - UI library
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing

### Styling
- **Tailwind CSS** - Utility-first CSS
- **PostCSS** - CSS processing

### State Management
- **Zustand** - Lightweight state management

### API Communication
- **Axios** - HTTP client
- **@supabase/supabase-js** - Supabase client

### Form Handling
- **React Hook Form** - Efficient form management

## Pages

### Landing Page (`/`)
- Hero section
- Features showcase
- Call-to-action buttons
- Responsive design

### Login Page (`/login`)
- Email/password form
- Sign-up link
- Error handling
- Loading states

### Signup Page (`/signup`)
- Registration form
- Company information
- Password validation
- Login link

### Dashboard (`/dashboard`)
- Protected route
- Sidebar navigation
- Multiple sections:
  - Overview (statistics)
  - Knowledge Base (manage documents/URLs)
  - Widget (generate embed code)
  - Conversations (manage chats)
  - Leads (customer information)

## Components

### UI Components (`UI.jsx`)
- `Button` - Customizable button
- `Card` - Container component
- `Input` - Form input
- `Select` - Dropdown select
- `Badge` - Status badge
- `Spinner` - Loading indicator

### Auth Components
- `LoginForm` - Login form
- `SignupForm` - Registration form

### Chat Components
- `ChatWidget` - Chat conversation display
- `ConversationList` - List of conversations

### Layout Components
- `Navbar` - Top navigation
- `Sidebar` - Side navigation
- `Hero` - Hero section
- `Features` - Feature showcase

## State Management

### Auth Store
```javascript
const { user, token, setUser, setToken, login, logout } = useAuthStore()
```

### Chat Store
```javascript
const { conversations, messages, setMessages, addMessage } = useChatStore()
```

### Knowledge Base Store
```javascript
const { items, addItem, removeItem } = useKnowledgeBaseStore()
```

## API Integration

### Authentication API
```javascript
import { authAPI } from './services'

await authAPI.signup({ email, password, company_name })
await authAPI.login({ email, password })
await authAPI.logout()
```

### Knowledge Base API
```javascript
import { knowledgeBaseAPI } from './services'

await knowledgeBaseAPI.addWebsite(userId, { url, name })
await knowledgeBaseAPI.uploadDocument(userId, file)
await knowledgeBaseAPI.getKnowledgeBase(userId)
```

### Chat API
```javascript
import { chatAPI } from './services'

await chatAPI.startConversation(userId, visitorName, visitorEmail)
await chatAPI.sendMessage({ conversation_id, message })
await chatAPI.getConversations(userId)
```

### Widget API
```javascript
import { widgetAPI } from './services'

await widgetAPI.generateWidget(userId)
await widgetAPI.getWidget(widgetId)
```

### Analytics API
```javascript
import { analyticsAPI } from './services'

await analyticsAPI.getStats(userId)
await analyticsAPI.getLeads(userId)
```

## Styling

### Tailwind CSS
The project uses Tailwind CSS for styling. Customize in `tailwind.config.js`.

### Custom CSS
Global styles in `src/styles/index.css`

### Component Styles
Inline Tailwind classes in components for responsiveness and customization.

## Authentication Flow

1. User visits landing page
2. Clicks "Sign Up" or "Login"
3. Enters credentials
4. API request sent to backend
5. JWT token received
6. Token stored in localStorage
7. Redirected to dashboard
8. Token included in subsequent API requests

## Error Handling

- HTTP error responses handled in API client
- 401 errors trigger logout and redirect to login
- User-friendly error messages displayed
- Form validation errors shown inline

## Performance

- Code splitting with React Router
- Lazy loading of components
- Optimized bundle size
- Fast development with Vite
- CSS purging with Tailwind

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Troubleshooting

### API Calls Failing
- Verify VITE_API_URL is correct
- Check backend is running
- Look at network tab in DevTools
- Check CORS settings on backend

### Authentication Issues
- Clear localStorage and cookies
- Check token expiration
- Verify Supabase credentials
- Check browser console for errors

### Styling Issues
- Clear node_modules and reinstall
- Rebuild Tailwind cache
- Check Tailwind config
- Verify CSS files are imported

## Building for Production

```bash
npm run build
```

Build output goes to `dist/` directory. Serve with any static hosting.

### Environment Variables for Production
```
VITE_API_URL=https://api.yourdomain.com
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Contributing

1. Create feature branch
2. Make changes
3. Run `npm run lint`
4. Run `npm run format`
5. Submit pull request

## License

MIT
