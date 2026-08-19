import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mocks do Supabase
const mockSupabase = {
  from: vi.fn().mockReturnThis(),
  select: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  maybeSingle: vi.fn(),
  update: vi.fn().mockReturnThis(),
  upsert: vi.fn().mockReturnThis(),
  insert: vi.fn().mockReturnThis(),
  rpc: vi.fn().mockResolvedValue({}),
  storage: {
    from: vi.fn().mockReturnThis(),
    upload: vi.fn().mockResolvedValue({ data: {}, error: null }),
    getPublicUrl: vi.fn().mockReturnValue({ data: { publicUrl: 'http://test.url' } }),
    createSignedUrl: vi.fn().mockResolvedValue({ data: { signedUrl: 'http://signed.url' }, error: null })
  }
};

vi.mock('@/integrations/supabase/client.server', () => ({
  supabaseAdmin: mockSupabase
}));

vi.mock("@/lib/licenca/utils", () => ({
  normalizeLicenseKey: vi.fn((k) => k),
  isValidLicenseFormat: vi.fn((k) => k && k.startsWith('MR-')),
}));

const fetchMock = vi.fn();
vi.stubGlobal('fetch', fetchMock);

describe('Auditoria Final Release 10 — Backend v17.0 MR Sem Limites', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSupabase.maybeSingle.mockResolvedValue({ 
      data: { id: 'test-lic-id', status: 'active', email: 'user@mrsemlimites.app', chave: 'MR-1111-2222-3333' }, 
      error: null 
    });
  });

  it('TESTE CRÍTICO: Fix-stream repassa 404 e NÃO contém sucesso falso', async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 404,
      headers: new Headers({ 'content-type': 'application/json' }),
      text: () => Promise.resolve(JSON.stringify({ error: "stream_not_found" }))
    });

    const { Route } = await import('@/routes/api/public/ext-v17/fix-stream');
    const handler = (Route as any).options.server.handlers.POST;

    const request = new Request('http://localhost/api/public/ext-v17/fix-stream', {
      method: 'POST',
      body: JSON.stringify({ key: 'MR-1111', projectId: 'p1', token: 't1', lastPayload: { type: 'chat' } })
    });

    const response = await handler({ request });
    const text = await response.text();
    const data = JSON.parse(text);

    expect(response.status).toBe(404);
    expect(data.ok).toBeUndefined();
    expect(data.stream_fixed).toBeUndefined();
    expect(data.recovered).toBeUndefined();
    expect(data.error).toBe("stream_not_found");
  });
});
