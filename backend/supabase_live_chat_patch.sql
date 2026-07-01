-- SQL Patch for Admin Live Chat Interruption Feature

-- Add last_active_at to users table to track if admin is online
alter table public.users add column if not exists last_active_at timestamp with time zone default now();

-- Add chat_mode to conversations table to switch between 'bot' and 'human'
alter table public.conversations add column if not exists chat_mode text default 'bot';
