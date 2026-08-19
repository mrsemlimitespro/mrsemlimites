import { supabaseAdmin } from '../src/integrations/supabase/client.server';

async function check() {
  const fileName = 'mr-sem-limites-backend-extension-v17-completo.zip';
  const bucketName = 'extension-releases';

  console.log(`Checking bucket "${bucketName}" for file "${fileName}"...`);
  
  const { data, error } = await supabaseAdmin.storage
    .from(bucketName)
    .list('', { search: fileName });

  if (error) {
    console.error('Error listing files:', error);
    process.exit(1);
  }

  const file = data?.find(f => f.name === fileName);
  if (file) {
    console.log('File found in storage:', file);
    
    // Test signed URL generation
    const { data: signData, error: signError } = await supabaseAdmin.storage
      .from(bucketName)
      .createSignedUrl(fileName, 60);
      
    if (signError) {
      console.error('Error generating signed URL:', signError);
    } else {
      console.log('Successfully generated signed URL:', signData.signedUrl);
    }
  } else {
    console.log('File NOT found in storage bucket.');
    
    // Upload if missing
    const fs = await import('fs');
    const path = await import('path');
    const localPath = path.join(process.cwd(), 'public', fileName);
    
    if (fs.existsSync(localPath)) {
      console.log('Uploading from public folder...');
      const fileBuffer = fs.readFileSync(localPath);
      const { error: uploadError } = await supabaseAdmin.storage
        .from(bucketName)
        .upload(fileName, fileBuffer, {
          contentType: 'application/zip',
          upsert: true
        });
        
      if (uploadError) {
        console.error('Upload failed:', uploadError);
      } else {
        console.log('Upload successful!');
      }
    } else {
      console.error('Local file not found in public/ either.');
    }
  }
}

check();
