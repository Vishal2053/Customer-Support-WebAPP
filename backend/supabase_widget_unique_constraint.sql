-- Add unique constraint to ensure only one widget per user
-- Run this SQL in Supabase SQL Editor to enforce one-widget-per-user rule

ALTER TABLE public.chatbot_widgets
ADD CONSTRAINT unique_user_widget UNIQUE (user_id);
