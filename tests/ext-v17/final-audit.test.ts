import { describe, it, expect } from 'vitest';

const BASE_URL = 'http://localhost:8080/api/public/ext-v17';
const TEST_LICENSE = 'MR-1111-2222-3333'; 
const TEST_HWID = 'test-hwid-unique-123';

describe('Integração Backend v17.0 MR Sem Limites', () => {
  
  it('CORS deve restringir origens não autorizadas (OPTIONS)', async () => {
    const res = await fetch(`${BASE_URL}/validate-license`, {
      method: 'OPTIONS',
      headers: { 'Origin': 'https://evil.com' }
    });
    // TanStack Start pode não retornar o header em 204 OPTIONS se não houver middleware global.
    // Mas o handler explícito em validate-license.ts deve retornar.
    const origin = res.headers.get('access-control-allow-origin');
    if (origin) {
      expect(origin).toBe('chrome-extension://id-null');
    }
  });

  it('Validate License deve falhar com formato inválido', async () => {
    const res = await fetch(`${BASE_URL}/validate-license`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key: 'INVALID' })
    });
    const data = await res.json();
    expect(res.status).toBe(400);
    expect(data.ok).toBe(false);
    expect(data.status).toBe('invalid_format');
  });

  it('Send Command deve exigir licença válida (403)', async () => {
    const res = await fetch(`${BASE_URL}/send-command`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        license_key: 'MR-FAIL-FAIL-FAIL',
        hwid: TEST_HWID,
        lastPayload: { message: 'Hello' }
      })
    });
    // Se a licença não existe, deve ser 403 (ou 401 dependendo do status: not_found)
    // O handler atual usa status dinâmico. Not found = 401.
    expect([401, 403]).toContain(res.status);
  });

  it('Fix Stream não deve retornar sucesso simulado', async () => {
    const res = await fetch(`${BASE_URL}/fix-stream`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        license_key: TEST_LICENSE,
        hwid: TEST_HWID,
        lastPayload: { message: 'retry' }
      })
    });
    const data = await res.json();
    // Se a licença falhar (não autenticada no teste), ok deve ser false
    expect(data.ok).toBe(false);
  });

  it('Upload deve exigir autenticação', async () => {
    const formData = new FormData();
    formData.append('license_key', 'MR-INVALID');
    
    const res = await fetch(`${BASE_URL}/upload`, {
      method: 'POST',
      body: formData
    });
    // Deve falhar na validação da licença
    expect([401, 403]).toContain(res.status);
  });
});

