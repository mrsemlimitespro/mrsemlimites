-- TABELAS AUXILIARES PARA EXTENSÃO V17.0

CREATE TABLE IF NOT EXISTS public.ext_v17_sessions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    licenca_id uuid REFERENCES public.licencas(id) ON DELETE CASCADE,
    session_id text UNIQUE NOT NULL,
    device_id text NOT NULL,
    last_heartbeat timestamptz DEFAULT now(),
    ip text,
    user_agent text,
    created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.ext_v17_requests (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    licenca_id uuid REFERENCES public.licencas(id) ON DELETE SET NULL,
    path text NOT NULL,
    method text NOT NULL,
    payload jsonb,
    status_code integer,
    ip text,
    created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.ext_v17_uploads (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    licenca_id uuid REFERENCES public.licencas(id) ON DELETE SET NULL,
    file_name text NOT NULL,
    file_path text NOT NULL,
    content_type text,
    size_bytes bigint,
    created_at timestamptz DEFAULT now()
);

-- GRANTS
GRANT SELECT, INSERT, UPDATE ON public.ext_v17_sessions TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.ext_v17_sessions TO service_role;
GRANT SELECT, INSERT ON public.ext_v17_requests TO authenticated;
GRANT SELECT, INSERT ON public.ext_v17_requests TO service_role;
GRANT SELECT, INSERT ON public.ext_v17_uploads TO authenticated;
GRANT SELECT, INSERT ON public.ext_v17_uploads TO service_role;

-- RLS
ALTER TABLE public.ext_v17_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ext_v17_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ext_v17_uploads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow service role all on sessions" ON public.ext_v17_sessions FOR ALL TO service_role USING (true);
CREATE POLICY "Allow service role all on requests" ON public.ext_v17_requests FOR ALL TO service_role USING (true);
CREATE POLICY "Allow service role all on uploads" ON public.ext_v17_uploads FOR ALL TO service_role USING (true);
