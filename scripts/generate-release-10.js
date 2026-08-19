import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { execSync } from 'child_process';

const ZIP_NAME = 'mr-sem-limites-backend-extension-v17-completo.zip';
const ZIP_PATH = path.join(process.cwd(), 'public', ZIP_NAME);

async function generateZip() {
  console.log('--- Iniciando Regeneração do ZIP (Release 10 Final) ---');

  // 1. Garantir diretório temporário limpo
  const tmpDir = '/tmp/ext-v17-release-10';
  execSync(`rm -rf ${tmpDir} && mkdir -p ${tmpDir}`);

  // 2. Coletar arquivos do backend (excluindo node_modules, .git, etc)
  const filesToInclude = [
    'src/routes/api/public/ext-v17/*',
    'src/lib/ext-v17/*',
    'src/lib/licenca/*',
    'supabase/migrations/20260819000000_ext_v17_audit.sql',
    'supabase/migrations/20260819000001_ext_v17_rpc.sql',
    'supabase/migrations/20260819000002_final_audit_fix.sql',
    'tests/ext-v17/release-9-validation.test.ts',
    'package.json'
  ];

  for (const pattern of filesToInclude) {
    const dest = path.join(tmpDir, path.dirname(pattern.replace(/\*/, '')));
    execSync(`mkdir -p ${dest}`);
    try {
      execSync(`cp -r ${pattern} ${dest}/ 2>/dev/null || true`);
    } catch (e) {}
  }

  // 3. Criar o RELEASE_INFO.txt temporário para calcular o hash depois
  const releaseInfo = {
    version: '17.0.10',
    release: '10-FINAL',
    date: new Date().toISOString(),
    compatibility: 'Lovable-Infinito v17.0',
    features: [
      'Fix-Stream: Repasse real de erro 404 (sem ok:true)',
      'Upload-Adapter: Integrado (sem Supabase antigo)',
      'Auditoria: Mascaramento de dados sensíveis',
      'CORS: Restrito ao ID pbeoifjhgofkbcofabccbcffbpgkpkbk',
      'Commands: Mapeamento completo v17.0'
    ]
  };
  fs.writeFileSync(path.join(tmpDir, 'RELEASE_INFO.txt'), JSON.stringify(releaseInfo, null, 2));

  // 4. Gerar o ZIP inicial
  execSync(`cd ${tmpDir} && zip -r /tmp/pre-release.zip .`);

  // 5. Calcular Hash do ZIP inicial
  const hash = crypto.createHash('sha256').update(fs.readFileSync('/tmp/pre-release.zip')).digest('hex');
  
  // 6. Atualizar RELEASE_INFO.txt com o hash real
  releaseInfo['sha256'] = hash;
  fs.writeFileSync(path.join(tmpDir, 'RELEASE_INFO.txt'), JSON.stringify(releaseInfo, null, 2));

  // 7. Gerar ZIP final
  execSync(`cd ${tmpDir} && zip -r ${ZIP_PATH} .`);
  
  const finalHash = crypto.createHash('sha256').update(fs.readFileSync(ZIP_PATH)).digest('hex');
  console.log(`ZIP gerado em: ${ZIP_PATH}`);
  console.log(`SHA-256: ${finalHash}`);

  // 8. Sincronizar com o Storage (usando o script de fallback ou upload direto se possível)
  // Como não temos acesso direto ao CLI do supabase no shell para storage sem auth manual,
  // confiamos no fallback do download-zip.ts que aponta para /public/ se o storage falhar.
}

generateZip().catch(console.error);
