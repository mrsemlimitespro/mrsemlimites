import { execSync } from 'child_process';
import { writeFileSync, mkdirSync } from 'fs';

const files = [
  'src/lib/ext-v17/auth.server.ts',
  'src/lib/ext-v17/lovable.server.ts',
  'src/routes/api/public/ext-v17/send-command.ts',
  'src/routes/api/public/ext-v17/fix-stream.ts',
  'src/routes/api/public/ext-v17/upload.ts',
  'src/routes/api/public/ext-v17/validate-license.ts',
  'src/routes/api/public/ext-v17/heartbeat.ts',
  'src/routes/api/public/ext-v17/process-payment.ts',
  'src/routes/api/public/ext-v17/create-project.ts',
  'src/routes/api/public/ext-v17/publish-project.ts',
  'src/lib/licenca/utils.ts'
];

try {
  execSync('zip -r public/mr-sem-limites-backend-extension-v17-completo.zip ' + files.join(' '));
  console.log('ZIP v17 Completo gerado com sucesso.');
} catch (e) {
  console.error('Erro ao gerar ZIP:', e);
}
