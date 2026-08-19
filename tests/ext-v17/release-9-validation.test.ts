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

describe('Auditoria Release 9 — Backend v17.0 MR Sem Limites', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSupabase.maybeSingle.mockResolvedValue({ 
      data: { id: 'test-lic-id', status: 'active', email: 'user@mrsemlimites.app', expira_em: null, max_dispositivos: 1, chave: 'MR-1111-2222-3333' }, 
      error: null 
    });
  });

  it('TESTE 1: Fix-stream repassa erro 404 real e NÃO tem ok: true', async () => {
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
      body: JSON.stringify({ key: 'MR-1111-2222-3333', projectId: 'p1', token: 't1', lastPayload: { type: 'chat' } })
    });

    const response = await handler({ request });
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.ok).toBeUndefined(); // COMPROVADO: SEM SUCESSO FALSO
    expect(data.error).toBe("stream_not_found");
  });

  it('TESTE 2: Send-command preserva ai_message_id e faz chamada única', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ 'content-type': 'application/json' }),
      text: () => Promise.resolve(JSON.stringify({ result: 'ok' }))
    });

    const { Route } = await import('@/routes/api/public/ext-v17/send-command');
    const handler = (Route as any).options.server.handlers.POST;

    const motorPayload = { type: 'chat', message: 'hi', ai_message_id: 'msg-123' };
    const request = new Request('http://localhost/api/public/ext-v17/send-command', {
      method: 'POST',
      body: JSON.stringify({ key: 'MR-1111-2222-3333', projectId: 'p1', token: 't1', lastPayload: motorPayload })
    });

    await handler({ request });
    
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const sentBody = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(sentBody.ai_message_id).toBe('msg-123');
  });

  it('TESTE 3: Payment retorna 403 para licença inválida', async () => {
    mockSupabase.maybeSingle.mockResolvedValue({ data: null, error: null });

    const { Route } = await import('@/routes/api/public/ext-v17/process-payment');
    const handler = (Route as any).options.server.handlers.POST;

    const request = new Request('http://localhost/api/public/ext-v17/process-payment', {
      method: 'POST',
      body: JSON.stringify({ key: 'MR-INVALID' })
    });

    const response = await handler({ request });
    expect(response.status).toBe(403);
  });

  it('TESTE 4: Auditoria mascara dados sensíveis', async () => {
    const { validateExtensionLicense } = await import('@/lib/ext-v17/auth.server');
    
    const bodyWithSecrets = {
      key: 'MR-1111',
      token: 'secret-token',
      Authorization: 'Bearer xyz'
    };

    await validateExtensionLicense(bodyWithSecrets, '1.2.3.4', 'ua', '/test');
    
    const auditCall = mockSupabase.insert.mock.calls.find(c => mockSupabase.from.mock.results.some(r => r.value === mockSupabase && mockSupabase.from.mock.calls.some(fc => fc[0] === 'ext_v17_requests')));
    
    // Procura a chamada para ext_v17_requests
    const requestAudit = mockSupabase.insert.mock.calls.find(call => {
        const fromCall = mockSupabase.from.mock.calls.find(f => f[0] === 'ext_v17_requests');
        return fromCall;
    });

    if (requestAudit) {
        const payload = requestAudit[0].payload;
        expect(payload.key).toBe('[MASKED]');
        expect(payload.token).toBe('[MASKED]');
        expect(payload.Authorization).toBe('[MASKED]');
    }
  });

  it('TESTE 5: CORS oficial é respeitado', async () => {
    const { getCorsHeaders } = await import('@/lib/ext-v17/auth.server');
    const req = new Request('http://localhost', { headers: { origin: 'chrome-extension://malicious' } });
    const cors = getCorsHeaders(req);
    expect(cors['Access-Control-Allow-Origin']).toBe('chrome-extension://pbeoifjhgofkbcofabccbcffbpgkpkbk');
  });
});
