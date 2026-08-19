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

describe('Auditoria Release 6 — Backend v17.0 MR Sem Limites', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSupabase.maybeSingle.mockResolvedValue({ 
      data: { id: 'test-lic-id', status: 'active', email: 'user@mrsemlimites.app', expira_em: null, max_dispositivos: 1, chave: 'MR-1111-2222-3333' }, 
      error: null 
    });
  });

  it('CORREÇÃO 1: Fix-stream não deve retornar ok: true em erro upstream 404', async () => {
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
    expect(data.ok).toBeUndefined(); // COMPROVADO: SEM SUCESSO FALSO
  });

  it('CORREÇÃO 2: Send-command deve mapear comandos avançados (terminal) e preservar motorPayload', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ 'content-type': 'application/json' }),
      text: () => Promise.resolve(JSON.stringify({ result: 'ok' }))
    });

    const { Route } = await import('@/routes/api/public/ext-v17/send-command');
    const handler = (Route as any).options.server.handlers.POST;

    const terminalPayload = { type: 'terminal_command', command: 'ls' };
    const request = new Request('http://localhost/api/public/ext-v17/send-command', {
      method: 'POST',
      body: JSON.stringify({ 
        key: 'MR-1111-2222-3333', 
        projectId: 'p1', 
        token: 't1', 
        lastPayload: terminalPayload
      })
    });

    await handler({ request });
    expect(fetchMock.mock.calls[0][0]).toContain('/projects/p1/terminal'); // MAPEAMENTO CORRETO
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual(terminalPayload); // PRESERVAÇÃO TOTAL
  });

  it('CORREÇÃO 3: Process-payment deve redirecionar com licenca_id vinculado e status redirect_required', async () => {
    const { Route } = await import('@/routes/api/public/ext-v17/process-payment');
    const handler = (Route as any).options.server.handlers.POST;

    const request = new Request('http://localhost/api/public/ext-v17/process-payment', {
      method: 'POST',
      body: JSON.stringify({ key: 'MR-1111-2222-3333' })
    });

    const response = await handler({ request });
    const data = await response.json();
    expect(data.status).toBe('redirect_required');
    expect(data.checkout_url).toContain('licenca_id=test-lic-id');
  });

  it('CORREÇÃO 4: Upload deve autenticar e registrar na auditoria', async () => {
    const { Route } = await import('@/routes/api/public/ext-v17/upload');
    const handler = (Route as any).options.server.handlers.POST;

    const formData = new FormData();
    formData.append('key', 'MR-1111-2222-3333');
    formData.append('file', new Blob(['fake image'], { type: 'image/png' }), 'test.png');

    const request = new Request('http://localhost/api/public/ext-v17/upload', {
      method: 'POST',
      body: formData
    });

    const response = await handler({ request });
    expect(response.status).toBe(200);
    expect(mockSupabase.from).toHaveBeenCalledWith('ext_v17_uploads');
  });

  it('CORREÇÃO 5: CORS deve ser restrito ao ID oficial pbeo...', async () => {
    const { getCorsHeaders } = await import('@/lib/ext-v17/auth.server');
    const req = new Request('http://localhost', { headers: { origin: 'chrome-extension://malicious' } });
    const cors = getCorsHeaders(req);
    expect(cors['Access-Control-Allow-Origin']).toBe('chrome-extension://pbeoifjhgofkbcofabccbcffbpgkpkbk');
  });
});
