import { createFileRoute } from '@tanstack/react-router';
// No longer using the regular client for this server-side operation

export const Route = createFileRoute('/api/public/ext-v17/download-zip')({
  server: {
    handlers: {
      GET: async () => {
        try {
          const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
          
          const { data, error } = await supabaseAdmin.storage
            .from('extension-releases')
            .createSignedUrl('mr-sem-limites-backend-extension-v17-completo.zip', 3600, { download: true });

          if (error || !data?.signedUrl) {
             console.error('Download error:', error);
             return new Response('File not found in storage', { status: 404 });
          }

          return new Response(null, {
            status: 302,
            headers: {
              'Location': data.signedUrl
            }
          });
        } catch (err) {
          return new Response('Server Error', { status: 500 });
        }
      }
    }
  }
});
