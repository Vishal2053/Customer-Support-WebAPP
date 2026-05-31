create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  company_name text not null,
  first_name text,
  last_name text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create table if not exists public.website_sources (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  url text not null,
  name text,
  last_scraped timestamp with time zone,
  created_at timestamp with time zone default now()
);

create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  file_name text not null,
  file_type text,
  file_size integer,
  storage_path text,
  created_at timestamp with time zone default now()
);

create table if not exists public.knowledge_base (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  type text not null,
  source text,
  title text,
  content text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create table if not exists public.conversations (
  id text primary key,
  user_id uuid not null references public.users(id) on delete cascade,
  visitor_name text not null,
  visitor_email text not null,
  status text default 'active',
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id text not null references public.conversations(id) on delete cascade,
  sender text not null,
  message text,
  created_at timestamp with time zone default now()
);

create table if not exists public.chatbot_widgets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  widget_id text unique not null,
  title text,
  description text,
  theme jsonb,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create index if not exists idx_user_website_sources on public.website_sources(user_id);
create index if not exists idx_user_documents on public.documents(user_id);
create index if not exists idx_user_knowledge_base on public.knowledge_base(user_id);
create index if not exists idx_user_conversations on public.conversations(user_id);
create index if not exists idx_conversation_messages on public.messages(conversation_id);
create index if not exists idx_user_widgets on public.chatbot_widgets(user_id);

alter table public.users enable row level security;
alter table public.website_sources enable row level security;
alter table public.documents enable row level security;
alter table public.knowledge_base enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;
alter table public.chatbot_widgets enable row level security;

create policy "users can read own profile"
  on public.users for select
  using (auth.uid() = id);

create policy "users can update own profile"
  on public.users for update
  using (auth.uid() = id);

create policy "users can read own website sources"
  on public.website_sources for select
  using (auth.uid() = user_id);

create policy "users can manage own website sources"
  on public.website_sources for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "users can read own documents"
  on public.documents for select
  using (auth.uid() = user_id);

create policy "users can manage own documents"
  on public.documents for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "users can read own knowledge base"
  on public.knowledge_base for select
  using (auth.uid() = user_id);

create policy "users can manage own knowledge base"
  on public.knowledge_base for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "users can read own conversations"
  on public.conversations for select
  using (auth.uid() = user_id);

create policy "users can manage own conversations"
  on public.conversations for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "users can read messages from own conversations"
  on public.messages for select
  using (
    exists (
      select 1
      from public.conversations
      where conversations.id = messages.conversation_id
        and conversations.user_id = auth.uid()
    )
  );

create policy "users can manage messages from own conversations"
  on public.messages for all
  using (
    exists (
      select 1
      from public.conversations
      where conversations.id = messages.conversation_id
        and conversations.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.conversations
      where conversations.id = messages.conversation_id
        and conversations.user_id = auth.uid()
    )
  );

create policy "users can read own widgets"
  on public.chatbot_widgets for select
  using (auth.uid() = user_id);

create policy "users can manage own widgets"
  on public.chatbot_widgets for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
