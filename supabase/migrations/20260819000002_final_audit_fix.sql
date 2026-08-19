-- Garantir que as tabelas existam
CREATE TABLE IF NOT EXISTS public.ext_v17_sessions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    licenca_id uuid REFERENCES public.licencas(id) ON DELETE CASCADE NOT NULL,
    session_id text UNIQUE NOT NULL,
    device_id text,
    last_heartbeat timestamptz DEFAULT now(),
    ip text,
    user_agent text,
    created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.ext_v17_requests (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    licenca_id uuid REFERENCES public.licencas(id) ON DELETE CASCADE,
    path text NOT NULL,
    method text NOT NULL,
    payload jsonb,
    ip text,
    created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.ext_v17_uploads (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    licenca_id uuid REFERENCES public.licencas(id) ON DELETE CASCADE,
    file_path text NOT NULL,
    file_url text NOT NULL,
    mime_type text,
    size_bytes bigint,
    created_at timestamptz DEFAULT now()
);

-- Grants
GRANT SELECT, INSERT, UPDATE ON public.ext_v17_sessions TO authenticated, service_role;
GRANT SELECT, INSERT ON public.ext_v17_requests TO authenticated, service_role;
GRANT SELECT, INSERT ON public.ext_v17_uploads TO authenticated, service_role;

-- RLS
ALTER TABLE public.ext_v17_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ext_v17_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ext_v17_uploads ENABLE ROW LEVEL SECURITY;

-- Política básica para permitir auditoria via server functions (service_role já tem ALL)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow service_role full access' AND tablename = 'ext_v17_sessions') THEN
        CREATE POLICY "Allow service_role full access" ON public.ext_v17_sessions FOR ALL TO service_role USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow service_role full access' AND tablename = 'ext_v17_requests') THEN
        CREATE POLICY "Allow service_role full access" ON public.ext_v17_requests FOR ALL TO service_role USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow service_role full access' AND tablename = 'ext_v17_uploads') THEN
        CREATE POLICY "Allow service_role full access" ON public.ext_v17_uploads FOR ALL TO service_role USING (true);
    END IF;
END $$;
