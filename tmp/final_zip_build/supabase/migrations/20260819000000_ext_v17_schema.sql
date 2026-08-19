-- FASE 7: INFRAESTRUTURA PARA BACKEND EXTENSÃO V17.0

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

-- 4. Permissões
GRANT SELECT, INSERT, UPDATE ON public.ext_v17_sessions TO authenticated;
GRANT ALL ON public.ext_v17_sessions TO service_role;

GRANT INSERT ON public.ext_v17_requests TO authenticated;
GRANT ALL ON public.ext_v17_requests TO service_role;

GRANT INSERT ON public.ext_v17_uploads TO authenticated;
GRANT ALL ON public.ext_v17_uploads TO service_role;

-- 5. RLS
ALTER TABLE public.ext_v17_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ext_v17_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ext_v17_uploads ENABLE ROW LEVEL SECURITY;

-- 6. Políticas (Simplificadas para o proxy/extensão autenticada)
CREATE POLICY "Serviço pode gerenciar sessões" ON public.ext_v17_sessions FOR ALL TO service_role USING (true);
CREATE POLICY "Serviço pode gerenciar requisições" ON public.ext_v17_requests FOR ALL TO service_role USING (true);
CREATE POLICY "Serviço pode gerenciar uploads" ON public.ext_v17_uploads FOR ALL TO service_role USING (true);

-- Nota: O backend v17 usa supabaseAdmin (service_role) para auditoria, bypassando RLS.
