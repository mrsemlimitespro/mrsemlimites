DO $$
DECLARE t record;
BEGIN
  FOR t IN
    SELECT c.relname
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace AND n.nspname = 'public'
    WHERE c.relkind = 'r'
  LOOP
    EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON public.%I TO authenticated', t.relname);
    EXECUTE format('GRANT ALL ON public.%I TO service_role', t.relname);
  END LOOP;

  FOR t IN
    SELECT DISTINCT tablename AS relname
    FROM pg_policies
    WHERE schemaname = 'public' AND 'anon' = ANY(roles)
  LOOP
    EXECUTE format('GRANT SELECT ON public.%I TO anon', t.relname);
  END LOOP;
END $$;

ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO service_role;