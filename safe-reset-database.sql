-- Safe Reset Database Script
-- This will only delete from tables that exist

-- Delete all user-related data (only if tables exist)
DO $$
BEGIN
    -- Delete from user_subscriptions if it exists
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_subscriptions') THEN
        DELETE FROM public.user_subscriptions;
        RAISE NOTICE 'Deleted from user_subscriptions';
    ELSE
        RAISE NOTICE 'user_subscriptions table does not exist';
    END IF;

    -- Delete from user_usage if it exists
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_usage') THEN
        DELETE FROM public.user_usage;
        RAISE NOTICE 'Deleted from user_usage';
    ELSE
        RAISE NOTICE 'user_usage table does not exist';
    END IF;

    -- Delete from audit_history if it exists
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'audit_history') THEN
        DELETE FROM public.audit_history;
        RAISE NOTICE 'Deleted from audit_history';
    ELSE
        RAISE NOTICE 'audit_history table does not exist';
    END IF;

    -- Delete from audit_results if it exists
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'audit_results') THEN
        DELETE FROM public.audit_results;
        RAISE NOTICE 'Deleted from audit_results';
    ELSE
        RAISE NOTICE 'audit_results table does not exist';
    END IF;

    -- Delete from sites if it exists
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'sites') THEN
        DELETE FROM public.sites;
        RAISE NOTICE 'Deleted from sites';
    ELSE
        RAISE NOTICE 'sites table does not exist';
    END IF;
END $$;

-- Delete all users from auth
DELETE FROM auth.users;

-- Show current table counts
SELECT 'user_subscriptions' as table_name, COUNT(*) as row_count FROM public.user_subscriptions
UNION ALL
SELECT 'user_usage' as table_name, COUNT(*) as row_count FROM public.user_usage
UNION ALL
SELECT 'audit_history' as table_name, COUNT(*) as row_count FROM public.audit_history
UNION ALL
SELECT 'sites' as table_name, COUNT(*) as row_count FROM public.sites
UNION ALL
SELECT 'auth.users' as table_name, COUNT(*) as row_count FROM auth.users;



