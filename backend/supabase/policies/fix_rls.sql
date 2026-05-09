-- Run this in your Supabase SQL Editor to fix the insertion errors!

-- This disables Row Level Security (RLS) for the MVP phase, 
-- allowing your frontend to instantly read/write to all tables without strict policies.

ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE resources DISABLE ROW LEVEL SECURITY;
ALTER TABLE bookings DISABLE ROW LEVEL SECURITY;
ALTER TABLE service_requests DISABLE ROW LEVEL SECURITY;
ALTER TABLE announcements DISABLE ROW LEVEL SECURITY;
ALTER TABLE events DISABLE ROW LEVEL SECURITY;
