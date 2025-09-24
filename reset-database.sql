-- Reset Database Script
-- This will delete all user data and reset the database

-- Delete all user-related data
DELETE FROM public.user_subscriptions;
DELETE FROM public.user_usage;
DELETE FROM public.audit_history;

-- Delete all users from auth
DELETE FROM auth.users;

-- Reset any sequences (if you have auto-incrementing IDs)
-- ALTER SEQUENCE public.user_subscriptions_id_seq RESTART WITH 1;
-- ALTER SEQUENCE public.user_usage_id_seq RESTART WITH 1;
-- ALTER SEQUENCE public.audit_history_id_seq RESTART WITH 1;

-- Verify the tables are empty
SELECT 'user_subscriptions' as table_name, COUNT(*) as row_count FROM public.user_subscriptions
UNION ALL
SELECT 'user_usage' as table_name, COUNT(*) as row_count FROM public.user_usage
UNION ALL
SELECT 'audit_history' as table_name, COUNT(*) as row_count FROM public.audit_history
UNION ALL
SELECT 'auth.users' as table_name, COUNT(*) as row_count FROM auth.users;
