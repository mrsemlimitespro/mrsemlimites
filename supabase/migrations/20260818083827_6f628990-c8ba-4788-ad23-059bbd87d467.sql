-- 1. Garante que a coluna 'chave' tenha um índice único e não nulo na tabela 'licencas'
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'licencas_chave_unique_idx') THEN
        CREATE UNIQUE INDEX licencas_chave_unique_idx ON public.licencas (chave);
    END IF;
END $$;

-- 2. Garante campos básicos (usando expira_em que já existe)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'licencas' AND column_name = 'premium') THEN
        ALTER TABLE public.licencas ADD COLUMN premium BOOLEAN DEFAULT FALSE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'licencas' AND column_name = 'active') THEN
        ALTER TABLE public.licencas ADD COLUMN active BOOLEAN DEFAULT TRUE;
    END IF;
    -- Criação da coluna expires_at para compatibilidade total com o pedido do usuário
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'licencas' AND column_name = 'expires_at') THEN
        ALTER TABLE public.licencas ADD COLUMN expires_at TIMESTAMPTZ;
    END IF;
END $$;

-- 3. Inserir ou Atualizar a chave de teste MR-FFA8-D87F-DAP3
INSERT INTO public.licencas (
    chave, 
    status, 
    tipo, 
    premium, 
    expires_at, 
    expira_em, 
    created_at, 
    updated_at
) 
VALUES (
    'MR-FFA8-D87F-DAP3', 
    'ativa', 
    'premium', 
    TRUE, 
    '2026-08-19 23:59:59+00', 
    '2026-08-19 23:59:59+00', 
    NOW(), 
    NOW()
)
ON CONFLICT (chave) DO UPDATE SET 
    status = 'ativa',
    tipo = 'premium',
    premium = TRUE,
    expires_at = '2026-08-19 23:59:59+00',
    expira_em = '2026-08-19 23:59:59+00',
    updated_at = NOW();

-- 4. GRANTs
GRANT SELECT, UPDATE ON public.licencas TO authenticated;
GRANT SELECT, UPDATE ON public.licencas TO service_role;
GRANT SELECT ON public.licencas TO anon;
