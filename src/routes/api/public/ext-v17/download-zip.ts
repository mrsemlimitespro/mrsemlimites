import { createFileRoute } from '@tanstack/react-router';
import { supabase } from '@/integrations/supabase/client';

export const Route = createFileRoute('/api/public/ext-v17/download-zip')({
  server: {
    handlers: {
      GET: async () => {
        try {
          const { data, error } = await supabase.storage
            .from('extension-releases')
            .createSignedUrl('mr-sem-limites-backend-extension-v17-completo.zip', 3600, { download: true });

          if (error || !data?.signedUrl) {
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
