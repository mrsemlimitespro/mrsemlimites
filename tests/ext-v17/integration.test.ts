import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock do supabaseAdmin
vi.mock('@/integrations/supabase/client.server', () => ({
  supabaseAdmin: {
    rpc: vi.fn().mockResolvedValue({ error: null }),
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn(),
      upsert: vi.fn().mockResolvedValue({ error: null }),
      insert: vi.fn().mockResolvedValue({ error: null }),
      update: vi.fn().mockReturnThis(),
    }),
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
  });

  it('deve rejeitar formato de licença inválido', async () => {
    const result = await validateExtensionLicense({ key: 'INVALID' });
    expect(result.ok).toBe(false);
    expect(result.status).toBe('invalid_format');
  });

  it('deve rejeitar licença não encontrada', async () => {
    (supabaseAdmin.maybeSingle as any).mockResolvedValue({ data: null, error: null });
    const result = await validateExtensionLicense({ key: 'MR-AAAA-BBBB-CCCC' });
    expect(result.ok).toBe(false);
    expect(result.status).toBe('not_found');
  });

  it('deve validar licença ativa e retornar user_name', async () => {
    (supabaseAdmin.from as any).mockReturnValue({
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
    });

    // Sub-mock para contagem de dispositivos
    vi.spyOn(supabaseAdmin, 'from').mockImplementation((table: string) => {
      if (table === 'licenca_dispositivos') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockResolvedValue({ data: [], error: null }),
          insert: vi.fn().mockResolvedValue({ error: null })
        } as any;
      }
      return {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValue({ 
          data: { id: '123', status: 'ativa', email: 'teste@exemplo.com' }, 
          error: null 
        }),
        update: vi.fn().mockReturnThis(),
        upsert: vi.fn().mockResolvedValue({ error: null }),
        insert: vi.fn().mockResolvedValue({ error: null })
      } as any;
    });

    const result = await validateExtensionLicense({ key: 'MR-AW38-STAB-ZTL7', hwid: 'hw123' });
    expect(result.ok).toBe(true);
    expect(result.user_name).toBe('teste');
    expect(result.status).toBe('active');
  });

  it('deve rejeitar HWID se exceder limite', async () => {
     (supabaseAdmin.maybeSingle as any).mockResolvedValue({ 
      data: { id: '123', status: 'ativa', max_dispositivos: 1 }, 
      error: null 
    });
    
    (supabaseAdmin.from as any).mockImplementation((table: string) => {
      if (table === 'licenca_dispositivos') {
        return {
          select: () => ({
            eq: () => Promise.resolve({ data: [{ device_id: 'outro-hw' }], error: null })
          })
        };
      }
      return supabaseAdmin;
    });

    const result = await validateExtensionLicense({ key: 'MR-AW38-STAB-ZTL7', hwid: 'novo-hw' });
    expect(result.ok).toBe(false);
    expect(result.status).toBe('hwid_mismatch');
  });
});
