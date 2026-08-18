import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock do supabaseAdmin com estrutura completa
const mockFrom = vi.fn().mockReturnValue({
  select: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
  upsert: vi.fn().mockResolvedValue({ error: null }),
  insert: vi.fn().mockResolvedValue({ error: null }),
  update: vi.fn().mockReturnThis(),
});

vi.mock('@/integrations/supabase/client.server', () => ({
  supabaseAdmin: {
    rpc: vi.fn().mockResolvedValue({ error: null }),
    from: (table: string) => mockFrom(table),
    storage: {
      from: vi.fn().mockReturnThis(),
      upload: vi.fn().mockResolvedValue({ data: {}, error: null }),
      getPublicUrl: vi.fn().mockReturnValue({ data: { publicUrl: 'http://test.com' } }),
    }
  }
}));

import { validateExtensionLicense } from '@/lib/ext-v17/auth.server';
import { supabaseAdmin } from '@/integrations/supabase/client.server';

describe('V17.0 Backend Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFrom.mockClear();
  });

  it('deve rejeitar formato de licença inválido', async () => {
    const result = await validateExtensionLicense({ key: 'INVALID' });
    expect(result.ok).toBe(false);
    expect(result.status).toBe('invalid_format');
  });

  it('deve rejeitar licença não encontrada', async () => {
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
    });
    const result = await validateExtensionLicense({ key: 'MR-AAAA-BBBB-CCCC' });
    expect(result.ok).toBe(false);
    expect(result.status).toBe('not_found');
  });

  it('deve validar licença ativa e retornar user_name', async () => {
    mockFrom.mockImplementation((table: string) => {
      const base = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValue({ 
          data: { 
            id: '123', 
            status: 'ativa', 
            email: 'teste@exemplo.com', 
            max_dispositivos: 5 
          }, 
          error: null 
        }),
        upsert: vi.fn().mockResolvedValue({ error: null }),
        insert: vi.fn().mockResolvedValue({ error: null }),
        update: vi.fn().mockReturnThis(),
      };

      if (table === 'licenca_dispositivos') {
        return {
          ...base,
          eq: vi.fn().mockResolvedValue({ data: [], error: null }),
        };
      }
      return base;
    });

    const result = await validateExtensionLicense({ key: 'MR-AW38-STAB-ZTL7', hwid: 'hw123' });
    expect(result.ok).toBe(true);
    expect(result.user_name).toBe('teste');
  });

  it('deve rejeitar HWID se exceder limite', async () => {
    mockFrom.mockImplementation((table: string) => {
      const base = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValue({ 
          data: { id: '123', status: 'ativa', max_dispositivos: 1 }, 
          error: null 
        }),
        upsert: vi.fn().mockResolvedValue({ error: null }),
        insert: vi.fn().mockResolvedValue({ error: null }),
        update: vi.fn().mockReturnThis(),
      };

      if (table === 'licenca_dispositivos') {
        return {
          ...base,
          eq: vi.fn().mockResolvedValue({ data: [{ device_id: 'outro' }], error: null }),
        };
      }
      return base;
    });

    const result = await validateExtensionLicense({ key: 'MR-AW38-STAB-ZTL7', hwid: 'novo' });
    expect(result.ok).toBe(false);
    expect(result.status).toBe('hwid_mismatch');
  });
});
