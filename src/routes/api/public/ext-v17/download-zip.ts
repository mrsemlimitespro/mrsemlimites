import { createFileRoute } from '@tanstack/react-router';
import { getCorsHeaders } from '@/lib/ext-v17/auth.server';

export const Route = createFileRoute('/api/public/ext-v17/download-zip')({
  server: {
    handlers: {
      OPTIONS: async ({ request }) => new Response(null, { status: 204, headers: getCorsHeaders(request) }),
      GET: async ({ request }) => {
        const cors = getCorsHeaders(request);
        try {
          const { supabaseAdmin } = await import('@/integrations/supabase/client.server');

          const { data, error } = await supabaseAdmin.storage
            .from('extension-releases')
            .createSignedUrl('mr-sem-limites-backend-extension-v17-completo.zip', 3600, { download: true });

          if (error || !data?.signedUrl) {
            console.error('Download error:', error);
            return new Response(null, {
              status: 302,
              headers: { ...cors, Location: '/mr-sem-limites-backend-extension-v17-completo.zip' },
            });
          }

          return new Response(null, { status: 302, headers: { ...cors, Location: data.signedUrl } });
        } catch (err) {
          return new Response('Server Error', { status: 500, headers: cors });
        }
      },
    },
  },
});
