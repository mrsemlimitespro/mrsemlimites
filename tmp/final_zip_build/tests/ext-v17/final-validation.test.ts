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
    getPublicUrl: vi.fn().mockReturnValue({ data: { publicUrl: 'http://test.url' } })
  }
};

vi.mock('@/integrations/supabase/client.server', () => ({
  supabaseAdmin: mockSupabase
}));

// Mock do utilitário de licença
vi.mock("@/lib/licenca/utils", () => ({
  normalizeLicenseKey: vi.fn((k) => k),
  isValidLicenseFormat: vi.fn(() => true),
}));

const fetchMock = vi.fn();
vi.stubGlobal('fetch', fetchMock);

describe('Auditoria Final Backend v17.0', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSupabase.maybeSingle.mockResolvedValue({ 
      data: { id: 'test-lic-id', status: 'active', email: 'user@mrsemlimites.app', expira_em: null, max_dispositivos: 1 }, 
      error: null 
    });
  });

  it('CORREÇÃO FIX-STREAM: Não deve retornar ok: true em erro 404 do Lovable', async () => {
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
    expect(data.error).toBe("stream_not_found");
    expect(data.ok).toBeUndefined(); // Não deve ter ok: true simulado
  });

  it('CORREÇÃO SEND-COMMAND: Deve preservar integralmente o motorPayload e mapear endpoints', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ 'content-type': 'application/json' }),
      text: () => Promise.resolve(JSON.stringify({ result: 'ok' }))
    });

    const { Route } = await import('@/routes/api/public/ext-v17/send-command');
    const handler = (Route as any).options.server.handlers.POST;

    const complexPayload = {
      type: 'publish',
      thread_id: 't_123',
      ai_message_id: 'msg_456',
      files: [{ name: 'test.ts' }],
      custom_field: 'preserved'
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

    // Verifica se o fetch foi para /publish (mapeamento dinâmico)
    expect(fetchMock.mock.calls[0][0]).toContain('/projects/p1/publish');
    
    // Verifica preservação byte-a-byte do payload
    const sentBody = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(sentBody).toEqual(complexPayload);
  });

  it('CORREÇÃO PRIVACIDADE: Deve mascarar tokens no log de auditoria', async () => {
    const { Route } = await import('@/routes/api/public/ext-v17/send-command');
    const handler = (Route as any).options.server.handlers.POST;

    const request = new Request('http://localhost/api/public/ext-v17/send-command', {
      method: 'POST',
      body: JSON.stringify({ 
        key: 'MR-TOKEN-SENSITIVE', 
        Authorization: 'Bearer secret-token',
        lastPayload: { message: 'hi' } 
      })
    });

    await handler({ request });

    const auditInsert = mockSupabase.insert.mock.calls.find(c => c[0].path === '/send-command');
    const recordedPayload = auditInsert[0].payload;

    expect(recordedPayload.key).toBe('[MASKED]');
    expect(recordedPayload.Authorization).toBe('[MASKED]');
  });

  it('CORREÇÃO CORS: Deve restringir ao ID oficial', async () => {
    const { getCorsHeaders } = await import('@/lib/ext-v17/auth.server');
    
    // Tentativa de origem maliciosa
    const reqEvil = new Request('http://localhost', { headers: { origin: 'chrome-extension://malicious-id' } });
    const corsEvil = getCorsHeaders(reqEvil);
    expect(corsEvil['Access-Control-Allow-Origin']).toBe('chrome-extension://pbeoifjhgofkbcofabccbcffbpgkpkbk');

    // Origem oficial
    const reqOk = new Request('http://localhost', { headers: { origin: 'chrome-extension://pbeoifjhgofkbcofabccbcffbpgkpkbk' } });
    const corsOk = getCorsHeaders(reqOk);
    expect(corsOk['Access-Control-Allow-Origin']).toBe('chrome-extension://pbeoifjhgofkbcofabccbcffbpgkpkbk');
  });

  it('CORREÇÃO PAGAMENTO: Deve validar licença antes do redirect', async () => {
    mockSupabase.maybeSingle.mockResolvedValueOnce({ data: null, error: null }); // Licença não encontrada

    const { Route } = await import('@/routes/api/public/ext-v17/process-payment');
    const handler = (Route as any).options.server.handlers.POST;

    const request = new Request('http://localhost/api/public/ext-v17/process-payment', {
      method: 'POST',
      body: JSON.stringify({ key: 'MR-INVALID' })
    });

    const response = await handler({ request });
    expect(response.status).toBe(403);
  });
});
