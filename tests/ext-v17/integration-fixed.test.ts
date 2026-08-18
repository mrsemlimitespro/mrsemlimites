import { describe, it, expect, vi, beforeEach } from 'vitest';

// Supabase chain mocking helper
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

vi.mock("@/lib/licenca/utils", () => ({
  normalizeLicenseKey: vi.fn((k) => k),
  isValidLicenseFormat: vi.fn(() => true),
}));

const fetchMock = vi.fn();
vi.stubGlobal('fetch', fetchMock);

describe('v17 Extension Backend Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSupabase.from.mockReturnThis();
    mockSupabase.select.mockReturnThis();
    mockSupabase.eq.mockReturnThis();
    
    mockSupabase.maybeSingle.mockResolvedValue({ 
      data: { id: 'test-lic-id', status: 'active', email: 'test@example.com', expira_em: null, max_dispositivos: 5 }, 
      error: null 
    });
    
    mockSupabase.select.mockImplementation((columns) => {
        if (columns === 'device_id') {
            return { eq: () => Promise.resolve({ data: [], error: null }) };
        }
        return mockSupabase;
    });

    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ 'content-type': 'application/json' }),
      text: () => Promise.resolve(JSON.stringify({ text: 'Lovable Response' })),
      json: () => Promise.resolve({ text: 'Lovable Response' }),
      body: new ReadableStream()
    });
  });

  it('should preserve ai_message_id during send-command proxy', async () => {
    const payload = {
      key: 'MR-TEST-KEY', // Licença obrigatória
      projectId: 'proj-123',
      token: 'valid-token',
      lastPayload: {
        message: 'Hello Lovable',
        ai_message_id: 'original-ai-msg-id-123',
        thread_id: 'thread-456'
      }
    };

    const { Route } = await import('@/routes/api/public/ext-v17/send-command');
    const handler = (Route as any).options.server.handlers.POST;

    const request = new Request('http://localhost/api/public/ext-v17/send-command', {
      method: 'POST',
      body: JSON.stringify(payload)
    });

    await handler({ request });

    expect(fetchMock).toHaveBeenCalled();
    expect(fetchMock.mock.calls[0][1].body).toContain('"ai_message_id":"original-ai-msg-id-123"');
  });

  it('should handle fix-stream with real proxy', async () => {
    const payload = {
      key: 'MR-TEST-KEY', // Licença obrigatória
      projectId: 'proj-123',
      token: 'valid-token',
      lastPayload: { message: 'Continue' }
    };

    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ 'content-type': 'text/event-stream' }),
      body: new ReadableStream(),
      text: () => Promise.resolve("stream data")
    });

    const { Route } = await import('@/routes/api/public/ext-v17/fix-stream');
    const handler = (Route as any).options.server.handlers.POST;

    const request = new Request('http://localhost/api/public/ext-v17/fix-stream', {
      method: 'POST',
      body: JSON.stringify(payload)
    });

    const response = await handler({ request });
    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toContain('text/event-stream');
  });

  it('should restrict CORS to extension origins', async () => {
    const { getCorsHeaders } = await import('@/lib/ext-v17/auth.server');
    
    const reqExt = new Request('http://localhost', { headers: { origin: 'chrome-extension://abc' } });
    const corsExt = getCorsHeaders(reqExt);
    expect(corsExt['Access-Control-Allow-Origin']).toBe('chrome-extension://abc');

    const reqMalicious = new Request('http://localhost', { headers: { origin: 'https://malicious.com' } });
    const corsMalicious = getCorsHeaders(reqMalicious);
    expect(corsMalicious['Access-Control-Allow-Origin']).toBe('chrome-extension://id-null');
  });
});

  it('should handle real upload with license validation and audit', async () => {
    const { Route } = await import('@/routes/api/public/ext-v17/upload');
    const handler = (Route as any).options.server.handlers.POST;

    const formData = new FormData();
    formData.append('key', 'MR-TEST-KEY');
    formData.append('hwid', 'device-123');
    formData.append('file', new Blob(['test content'], { type: 'text/plain' }), 'test.txt');

    const request = new Request('http://localhost/api/public/ext-v17/upload', {
      method: 'POST',
      body: formData
    });

    const response = await handler({ request });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.ok).toBe(true);
    expect(data.url).toBe('http://test.url');
    expect(mockSupabase.storage.upload).toHaveBeenCalled();
    expect(mockSupabase.insert).toHaveBeenCalled(); // Audit record
  });

  it('should handle process-payment contract', async () => {
    const { Route } = await import('@/routes/api/public/ext-v17/process-payment');
    const handler = (Route as any).options.server.handlers.POST;

    const request = new Request('http://localhost/api/public/ext-v17/process-payment', {
      method: 'POST',
      body: JSON.stringify({ key: 'MR-TEST-KEY' })
    });

    const response = await handler({ request });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.status).toBe('redirect_required');
    expect(data.checkout_url).toContain('mrsemlimites.lovable.app/loja');
  });
});
