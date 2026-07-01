-- SQL Migration: Add Role Column to Users Table
-- Execute this script in your Supabase SQL Editor (https://supabase.com/dashboard)

-- 1. Add the role column if it does not already exist
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user';

-- 2. Update the main admin user (using the email identified in your system)
UPDATE public.users SET role = 'admin' WHERE email = 'datascientistvishu@gmail.com';

-- 3. Confirm the update by selecting users
SELECT id, email, company_name, role FROM public.users;
