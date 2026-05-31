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

create index if not exists idx_user_widgets on public.chatbot_widgets(user_id);

alter table public.chatbot_widgets enable row level security;

create policy "users can read own widgets"
  on public.chatbot_widgets for select
  using (auth.uid() = user_id);

create policy "users can manage own widgets"
  on public.chatbot_widgets for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
