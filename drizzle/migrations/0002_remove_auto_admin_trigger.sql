DROP TRIGGER IF EXISTS ensure_admin_role_on_user ON auth.users;
DROP FUNCTION IF EXISTS public.ensure_admin_role();