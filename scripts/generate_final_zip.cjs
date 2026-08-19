const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

async function generateZip() {
  const zipName = 'mr-sem-limites-backend-extension-v17-completo.zip';
  const outputPath = path.join(process.cwd(), 'public', zipName);
  
  console.log(`Gerando pacote final: ${zipName}`);

  // Arquivos obrigatórios do backend v17
  const files = [
    'src/lib/ext-v17/auth.server.ts',
    'src/lib/ext-v17/lovable.server.ts',
    'src/routes/api/public/ext-v17/fix-stream.ts',
    'src/routes/api/public/ext-v17/send-command.ts',
    'src/routes/api/public/ext-v17/upload.ts',
    'src/routes/api/public/ext-v17/process-heartbeat.ts',
    'src/routes/api/public/ext-v17/process-payment.ts',
    'src/routes/api/public/ext-v17/download-zip.ts',
    'supabase/migrations/20260819000001_final_v17_infra.sql',
    'tests/ext-v17/final-validation.test.ts'
  ];

  const tmpDir = path.join(process.cwd(), '/tmp/final_zip_build');
  if (fs.existsSync(tmpDir)) fs.rmSync(tmpDir, { recursive: true });
  fs.mkdirSync(tmpDir, { recursive: true });

  files.forEach(f => {
    const dest = path.join(tmpDir, f);
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    if (fs.existsSync(f)) {
      fs.copyFileSync(f, dest);
    } else {
      console.warn(`Aviso: Arquivo ${f} não encontrado.`);
    }
  });

  // Gera o ZIP
  try {
    process.chdir(tmpDir);
    execSync(`zip -r ${outputPath} .`);
    process.chdir(process.cwd());
    console.log(`Sucesso: ${zipName} gerado em public/`);
    
    const stats = fs.statSync(outputPath);
    console.log(`Tamanho: ${(stats.size / 1024).toFixed(2)} KB`);
    
    // Hash SHA-256 para auditoria
    const crypto = require('crypto');
    const fileBuffer = fs.readFileSync(outputPath);
    const hashSum = crypto.createHash('sha256');
    hashSum.update(fileBuffer);
    const hex = hashSum.digest('hex');
    console.log(`SHA-256: ${hex}`);
    
    return hex;
  } catch (err) {
    console.error('Falha ao gerar ZIP:', err);
    process.exit(1);
  }
}

generateZip();
