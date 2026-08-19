-- FINAL MIGRATION V17.0 - MR Sem Limites (Fixed)
-- Tabelas de Auditoria e RPCs

-- 1. Auditoria de Sessões
CREATE TABLE IF NOT EXISTS public.ext_v17_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    licenca_id UUID REFERENCES public.licencas(id) ON DELETE CASCADE NOT NULL,
    session_id TEXT UNIQUE NOT NULL,
    device_id TEXT NOT NULL,
    last_heartbeat TIMESTAMPTZ DEFAULT now(),
    ip TEXT,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Auditoria de Requisições (Proxy)
CREATE TABLE IF NOT EXISTS public.ext_v17_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    licenca_id UUID REFERENCES public.licencas(id) ON DELETE CASCADE NOT NULL,
    path TEXT NOT NULL,
    method TEXT NOT NULL,
    payload JSONB,
    ip TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Auditoria de Uploads
CREATE TABLE IF NOT EXISTS public.ext_v17_uploads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    licenca_id UUID REFERENCES public.licencas(id) ON DELETE CASCADE NOT NULL,
    file_name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    content_type TEXT,
    size_bytes BIGINT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Índices de Performance
CREATE INDEX IF NOT EXISTS idx_ext_v17_sessions_licenca ON public.ext_v17_sessions(licenca_id);
CREATE INDEX IF NOT EXISTS idx_ext_v17_requests_licenca ON public.ext_v17_requests(licenca_id);
CREATE INDEX IF NOT EXISTS idx_ext_v17_uploads_licenca ON public.ext_v17_uploads(licenca_id);
CREATE INDEX IF NOT EXISTS idx_ext_v17_sessions_heartbeat ON public.ext_v17_sessions(last_heartbeat);

-- 5. Permissões e RLS
GRANT SELECT, INSERT, UPDATE ON public.ext_v17_sessions TO authenticated;
GRANT ALL ON public.ext_v17_sessions TO service_role;

GRANT INSERT ON public.ext_v17_requests TO authenticated;
GRANT ALL ON public.ext_v17_requests TO service_role;

GRANT INSERT ON public.ext_v17_uploads TO authenticated;
GRANT ALL ON public.ext_v17_uploads TO service_role;

ALTER TABLE public.ext_v17_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ext_v17_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ext_v17_uploads ENABLE ROW LEVEL SECURITY;

-- Políticas de Auditoria (Service Role bypassa, mas deixamos explícito)
CREATE POLICY "Admins can view v17 sessions" ON public.ext_v17_sessions FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can view v17 requests" ON public.ext_v17_requests FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can view v17 uploads" ON public.ext_v17_uploads FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- 6. RPC: Expirar Trials Vencidos (Drop and Create)
DROP FUNCTION IF EXISTS public.expirar_trials_vencidos();

CREATE OR REPLACE FUNCTION public.expirar_trials_vencidos()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    UPDATE public.licencas
    SET status = 'expirada'
    WHERE status = 'ativa'
      AND tipo = 'teste'
      AND expira_em < now();
END;
$$;

-- 7. Storage Policies for ext_v17_uploads
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage' AND policyname = 'Admin management of v17 uploads'
    ) THEN
        CREATE POLICY "Admin management of v17 uploads" ON storage.objects
        FOR ALL TO service_role
        USING (bucket_id = 'ext_v17_uploads')
        WITH CHECK (bucket_id = 'ext_v17_uploads');
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage' AND policyname = 'Admin management of releases'
    ) THEN
        CREATE POLICY "Admin management of releases" ON storage.objects
        FOR ALL TO service_role
        USING (bucket_id = 'extension-releases')
        WITH CHECK (bucket_id = 'extension-releases');
    END IF;
END $$;
