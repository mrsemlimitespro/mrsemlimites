import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

const zipName = 'mr-sem-limites-backend-extension-v17-completo.zip';
const outputDir = 'public';

async function generateZip() {
  console.log('Building ZIP...');
  
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
  }

  // Create temporary documentation file inside the ZIP structure if needed
  const docs = `
# Backend MR Sem Limites - Extensão v17.0
Implementação oficial compatível com a extensão Chrome Manifest V3.

## Rotas Principais
- /api/public/ext-v17/validate-license
- /api/public/ext-v17/heartbeat
- /api/public/ext-v17/send-command
- /api/public/ext-v17/fix-stream
- /api/public/ext-v17/upload
- /api/public/ext-v17/process-payment

## Segurança
- CORS restrito a chrome-extension:// e localhost.
- Validação HWID e Expiração.
- Registro de auditoria em ext_v17_requests e ext_v17_sessions.
  `.trim();
  
  fs.writeFileSync('V17_BACKEND_INFO.md', docs);

  const filesToInclude = [
    'src/lib/ext-v17/*',
    'src/routes/api/public/ext-v17/*',
    'src/lib/licenca/utils.ts',
    'tests/ext-v17/*',
    'V17_BACKEND_INFO.md'
  ];

  try {
    // Zip command using shell
    execSync(\`zip -r \${outputDir}/\${zipName} \${filesToInclude.join(' ')}\`);
    console.log(\`ZIP generated at \${outputDir}/\${zipName}\`);
    
    const stats = fs.statSync(\`\${outputDir}/\${zipName}\`);
    console.log(\`Size: \${(stats.size / 1024 / 1024).toFixed(2)} MB\`);
    
    // Calculate SHA-256
    const sha = execSync(\`sha256sum \${outputDir}/\${zipName} | cut -d' ' -f1\`).toString().trim();
    console.log(\`SHA-256: \${sha}\`);

    // Upload to storage for the download route to work
    const { supabaseAdmin } = await import('../src/integrations/supabase/client.server');
    const zipBuffer = fs.readFileSync(\`\${outputDir}/\${zipName}\`);
    
    console.log('Uploading to extension-releases bucket...');
    const { error } = await supabaseAdmin.storage
      .from('extension-releases')
      .upload(zipName, zipBuffer, {
        contentType: 'application/zip',
        upsert: true
      });
      
    if (error) throw error;
    console.log('Upload successful.');

  } catch (err) {
    console.error('Failed to generate/upload ZIP:', err);
    process.exit(1);
  } finally {
    if (fs.existsSync('V17_BACKEND_INFO.md')) fs.unlinkSync('V17_BACKEND_INFO.md');
  }
}

generateZip();
