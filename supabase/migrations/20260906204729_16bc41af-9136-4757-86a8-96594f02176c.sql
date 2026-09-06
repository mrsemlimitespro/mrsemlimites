DO $$
DECLARE t record;
  publicas text[] := ARRAY['banners','carrossel_slides','produtos','planos','creditos_packs','premium_packs','promocoes','propagandas','imagens','logos','videos','aulas','system_modules','ai_prompts','ai_agents','licenca_produtos','extensao_configs','admin_settings'];
BEGIN
  FOR t IN SELECT c.relname FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
           WHERE n.nspname='public' AND c.relkind IN ('r','p') AND NOT (c.relname = ANY(publicas)) LOOP
    EXECUTE format('REVOKE ALL ON public.%I FROM anon', t.relname);
  END LOOP;
END $$;

REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM anon;