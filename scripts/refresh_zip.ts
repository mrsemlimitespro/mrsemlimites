import { supabaseAdmin } from '../src/integrations/supabase/client.server';
import fs from 'fs';
import path from 'path';

async function refresh() {
  const fileName = 'mr-sem-limites-backend-extension-v17-completo.zip';
  const bucketName = 'extension-releases';
  const localPath = path.join(process.cwd(), 'public', fileName);

  if (!fs.existsSync(localPath)) {
    console.error('Local ZIP not found in public/');
    return;
  }

  console.log('Force refreshing ZIP in storage...');
  const fileBuffer = fs.readFileSync(localPath);
  
  const { error } = await supabaseAdmin.storage
    .from(bucketName)
    .upload(fileName, fileBuffer, {
      contentType: 'application/zip',
      upsert: true
    });

  if (error) {
    console.error('Refresh failed:', error);
  } else {
    console.log('Refresh successful!');
  }
}

refresh();
