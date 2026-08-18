import { supabaseAdmin } from '../src/integrations/supabase/client.server';
import fs from 'fs';
import path from 'path';

async function uploadZip() {
  const fileName = 'mr-sem-limites-backend-extension-v17-completo.zip';
  const filePath = path.join(process.cwd(), 'public', fileName);

  if (!fs.existsSync(filePath)) {
    console.error(`File not found at ${filePath}`);
    return;
  }

  console.log(`Checking bucket 'extension-releases'...`);
  const { data: buckets } = await supabaseAdmin.storage.listBuckets();
  const bucketExists = buckets?.find(b => b.name === 'extension-releases');

  if (!bucketExists) {
    console.log(`Creating bucket 'extension-releases'...`);
    await supabaseAdmin.storage.createBucket('extension-releases', { public: false });
  }

  console.log(`Uploading ${fileName} to storage...`);
  const fileBuffer = fs.readFileSync(filePath);
  const { error } = await supabaseAdmin.storage
    .from('extension-releases')
    .upload(fileName, fileBuffer, {
      contentType: 'application/zip',
      upsert: true
    });

  if (error) {
    console.error('Upload failed:', error);
  } else {
    console.log('Upload successful!');
  }
}

uploadZip().catch(console.error);