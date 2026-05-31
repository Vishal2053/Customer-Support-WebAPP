# Database Schema for AI Customer Support

## Tables

### users
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT auth.uid(),
  email TEXT UNIQUE NOT NULL,
  company_name TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### website_sources
```sql
CREATE TABLE website_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  url TEXT NOT NULL,
  name TEXT,
  last_scraped TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### documents
```sql
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  file_name TEXT NOT NULL,
  file_type TEXT,
  file_size INTEGER,
  storage_path TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### knowledge_base
```sql
CREATE TABLE knowledge_base (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  type TEXT NOT NULL,
  source TEXT,
  title TEXT,
  content TEXT,
  embedding vector(1536),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### conversations
```sql
CREATE TABLE conversations (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id),
  visitor_name TEXT NOT NULL,
  visitor_email TEXT NOT NULL,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### messages
```sql
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id TEXT NOT NULL REFERENCES conversations(id),
  sender TEXT NOT NULL,
  message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### chatbot_widgets
```sql
CREATE TABLE chatbot_widgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  widget_id TEXT UNIQUE NOT NULL,
  title TEXT,
  description TEXT,
  theme JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Indexes

```sql
CREATE INDEX idx_user_website_sources ON website_sources(user_id);
CREATE INDEX idx_user_documents ON documents(user_id);
CREATE INDEX idx_user_knowledge_base ON knowledge_base(user_id);
CREATE INDEX idx_user_conversations ON conversations(user_id);
CREATE INDEX idx_conversation_messages ON messages(conversation_id);
CREATE INDEX idx_user_widgets ON chatbot_widgets(user_id);
CREATE INDEX idx_knowledge_base_embedding ON knowledge_base USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
```

## RLS Policies (Row Level Security)

Enable RLS on tables and add policies to ensure users can only access their own data.
