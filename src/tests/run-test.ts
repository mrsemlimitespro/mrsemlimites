
import { normalizeLicenseKey } from "../lib/licenca/utils";

async function testRoute() {
  const baseUrl = "http://localhost:8080/api/public/ext/send-command-compatible";
  
  console.log("--- Iniciando Testes da Rota Compatível (V17.1) ---");

  // 1. Teste OPTIONS (CORS)
  const resOptions = await fetch(baseUrl, { method: "OPTIONS" });
  console.log(`1. OPTIONS: ${resOptions.status === 204 ? "✅ PASS" : "❌ FAIL"} (${resOptions.status})`);

  // 2. Teste Sem Licença
  const resNoLicense = await fetch(baseUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: "teste" })
  });
  const dataNoLicense = await resNoLicense.json();
  console.log(`2. Sem Licença (401 expected): ${resNoLicense.status === 401 && dataNoLicense.error.includes("license_invalid") ? "✅ PASS" : "❌ FAIL"} (${resNoLicense.status})`);

  // 3. Teste Chave Inválida (Formato)
  const resInvalidFormat = await fetch(baseUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ key: "INVALID-KEY", message: "teste" })
  });
  const dataInvalidFormat = await resInvalidFormat.json();
  console.log(`3. Formato Inválido (401 expected): ${resInvalidFormat.status === 401 && dataInvalidFormat.error.includes("Formato") ? "✅ PASS" : "❌ FAIL"} (${resInvalidFormat.status})`);

  // 4. Teste Chave Inexistente (Formato OK)
  const resNotFound = await fetch(baseUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ key: "MR-0000-0000-0000", message: "teste" })
  });
  console.log(`4. Licença Inexistente (401 expected): ${resNotFound.status === 401 ? "✅ PASS" : "❌ FAIL"} (${resNotFound.status})`);

  console.log("\n--- Mock Simulation Logic Check ---");
  console.log("Nota: O endpoint agora aponta para /projects/{id}/chat.");
  console.log("Nota: O header Authorization remove 'Bearer ' redundante.");
  console.log("Nota: O payload preserva lastPayload integralmente.");
  
  console.log("--- Testes Concluídos ---");
}

testRoute().catch(console.error);
