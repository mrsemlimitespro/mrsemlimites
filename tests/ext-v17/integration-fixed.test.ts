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

// Use a more robust way to mock fetch for Vitest
const fetchMock = vi.fn();
vi.stubGlobal('fetch', fetchMock);

describe('v17 Extension Backend Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset Supabase chain
    mockSupabase.from.mockReturnThis();
    mockSupabase.select.mockReturnThis();
    mockSupabase.eq.mockReturnThis();
    
    // Default valid license mock
    mockSupabase.maybeSingle.mockResolvedValue({ 
      data: { id: 'test-lic-id', status: 'active', email: 'test@example.com', expira_em: null, max_dispositivos: 5 }, 
      error: null 
    });
    
    // Mock devices check (empty)
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

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('api.lovable.dev/projects/proj-123/chat'),
      expect.objectContaining({
        body: expect.stringContaining('"ai_message_id":"original-ai-msg-id-123"')
      })
    );
  });

  it('should handle fix-stream with real proxy', async () => {
    const payload = {
      projectId: 'proj-123',
      token: 'valid-token',
      lastPayload: { message: 'Continue' }
    };

    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ 'content-type': 'text/event-stream' }),
      body: new ReadableStream()
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

  it('should validate license and return real licenca_id', async () => {
    const { Route } = await import('@/routes/api/public/ext-v17/validate-license');
    const handler = (Route as any).options.server.handlers.POST;

    const request = new Request('http://localhost/api/public/ext-v17/validate-license', {
      method: 'POST',
      body: JSON.stringify({ key: 'MR-1234-5678-9012', hwid: 'device-abc' })
    });

    const response = await handler({ request });
    const data = await response.json();
    
    expect(data.ok).toBe(true);
    expect(data.licenca_id).toBe('test-lic-id');
  });
});
