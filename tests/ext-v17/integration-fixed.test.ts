import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mocks simples para simular o ambiente
const mockSupabase = {
  from: vi.fn().mockReturnThis(),
  select: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  maybeSingle: vi.fn(),
  update: vi.fn().mockReturnThis(),
  upsert: vi.fn().mockReturnThis(),
  insert: vi.fn().mockReturnThis(),
  rpc: vi.fn().mockResolvedValue({}),
};

vi.mock('@/integrations/supabase/client.server', () => ({
  supabaseAdmin: mockSupabase
}));

vi.mock("@/lib/licenca/utils", () => ({
  normalizeLicenseKey: vi.fn((k) => k),
  isValidLicenseFormat: vi.fn(() => true),
}));

const fetchMock = vi.fn();
global.fetch = fetchMock;

describe('v17 Extension Backend Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default valid license mock
    mockSupabase.maybeSingle.mockResolvedValue({ 
      data: { id: 'test-lic-id', status: 'active', email: 'test@example.com', expira_em: null }, 
      error: null 
    });
  });

  it('should preserve ai_message_id during send-command proxy', async () => {
    // Payload da extensão com ai_message_id no lastPayload
    const payload = {
      projectId: 'proj-123',
      token: 'valid-token',
      lastPayload: {
        message: 'Hello Lovable',
        ai_message_id: 'original-ai-msg-id-123',
        thread_id: 'thread-456'
      }
    };

    // Mock do retorno do Lovable
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ 'content-type': 'application/json' }),
      text: () => Promise.resolve(JSON.stringify({ text: 'Lovable Response' }))
    });

    const { Route } = await import('@/routes/api/public/ext-v17/send-command');
    const handler = (Route as any).options.server.handlers.POST;

    const request = new Request('http://localhost/api/public/ext-v17/send-command', {
      method: 'POST',
      body: JSON.stringify(payload)
    });

    await handler({ request });

    // Verificar se o fetch para o Lovable preservou o ai_message_id
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
});
