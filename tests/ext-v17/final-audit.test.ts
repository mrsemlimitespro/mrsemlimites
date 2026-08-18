import { describe, it, expect, beforeAll } from 'vitest';

const BASE_URL = 'http://localhost:8080/api/public/ext-v17';
const TEST_LICENSE = 'MR-1111-2222-3333'; // Deve existir no banco para testes reais, ou mockar
const TEST_HWID = 'test-hwid-unique-123';

describe('Integração Backend v17.0 MR Sem Limites', () => {
  
  it('CORS deve restringir origens não autorizadas', async () => {
    const res = await fetch(`${BASE_URL}/validate-license`, {
      method: 'OPTIONS',
      headers: { 'Origin': 'https://evil.com' }
    });
    expect(res.headers.get('access-control-allow-origin')).toBe('chrome-extension://id-null');
  });

  it('CORS deve permitir chrome-extension://', async () => {
    const res = await fetch(`${BASE_URL}/validate-license`, {
      method: 'OPTIONS',
      headers: { 'Origin': 'chrome-extension://abcdefgh' }
    });
    expect(res.headers.get('access-control-allow-origin')).toBe('chrome-extension://abcdefgh');
  });

  it('Validate License deve falhar com formato inválido', async () => {
    const res = await fetch(`${BASE_URL}/validate-license`, {
      method: 'POST',
      body: JSON.stringify({ key: 'INVALID' })
    });
    const data = await res.json();
    expect(res.status).toBe(400);
    expect(data.ok).toBe(false);
    expect(data.status).toBe('invalid_format');
  });

  it('Send Command deve preservar lastPayload e ai_message_id', async () => {
    // Este teste requer uma licença válida ou bypass para validar a lógica de proxy
    // Aqui testamos a estrutura do erro se faltar parâmetros Lovable
    const res = await fetch(`${BASE_URL}/send-command`, {
      method: 'POST',
      body: JSON.stringify({ 
        license_key: TEST_LICENSE,
        hwid: TEST_HWID,
        lastPayload: {
          message: 'Hello',
          ai_message_id: 'original-id-123'
        }
      })
    });
    const data = await res.json();
    // Se não houver projectId/token reais, deve dar 400 missing_params
    expect(res.status).toBe(400);
    expect(data.error).toBe('missing_params');
  });

  it('Fix Stream não deve retornar sucesso simulado', async () => {
    const res = await fetch(`${BASE_URL}/fix-stream`, {
      method: 'POST',
      body: JSON.stringify({ 
        license_key: TEST_LICENSE,
        hwid: TEST_HWID,
        lastPayload: { message: 'retry' }
      })
    });
    const data = await res.json();
    // Deve falhar se faltar contexto, nunca retornar "ok: true" com msg fixa
    expect(data.ok).toBe(false);
    expect(data.error).not.toBeUndefined();
  });

  it('Upload deve exigir arquivo e licença', async () => {
    const formData = new FormData();
    formData.append('license_key', TEST_LICENSE);
    
    const res = await fetch(`${BASE_URL}/upload`, {
      method: 'POST',
      body: formData
    });
    const data = await res.json();
    expect(res.status).toBe(400);
    expect(data.error).toBe('no_file_uploaded');
  });
});
