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

describe('Auditoria Release 8 — Verificação de Bloqueadores', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSupabase.maybeSingle.mockResolvedValue({ 
      data: { id: 'test-lic-id', status: 'active', email: 'user@mrsemlimites.app', expira_em: null, max_dispositivos: 1, chave: 'MR-1111-2222-3333' }, 
      error: null 
    });
  });

  it('VALIDAÇÃO: Fix-stream DEVE repassar erro 404 e NÃO retornar ok: true', async () => {
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
      body: JSON.stringify({ 
        key: 'MR-1111-2222-3333', 
        projectId: 'p1', 
        token: 't1', 
        lastPayload: { message: 'retry' } 
      })
    });

    const response = await handler({ request });
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.ok).toBeUndefined(); 
    expect(data.error).toBe("stream_not_found");
  });

  it('VALIDAÇÃO: Send-command deve preservar payload integral e não duplicar ai_message_id', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ 'content-type': 'application/json' }),
      text: () => Promise.resolve(JSON.stringify({ result: 'ok' }))
    });

    const { Route } = await import('@/routes/api/public/ext-v17/send-command');
    const handler = (Route as any).options.server.handlers.POST;

    const complexPayload = { 
      type: 'chat', 
      message: 'test', 
      ai_message_id: 'existing-id',
      current_viewport_width: 1920 
    };
    
    const request = new Request('http://localhost/api/public/ext-v17/send-command', {
      method: 'POST',
      body: JSON.stringify({ 
        key: 'MR-1111-2222-3333', 
        projectId: 'p1', 
        token: 't1', 
        lastPayload: complexPayload
      })
    });

    await handler({ request });
    
    const sentBody = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(sentBody.ai_message_id).toBe('existing-id'); // Preservado
    expect(sentBody.current_viewport_width).toBe(1920); // Preservado
    expect(fetchMock).toHaveBeenCalledTimes(1); // Chamada ÚNICA
  });
});
