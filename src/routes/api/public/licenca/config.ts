import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";

const getCorsHeaders = (request: Request) => ({
  "Access-Control-Allow-Origin": request.headers.get("origin")?.startsWith("chrome-extension://") 
    ? request.headers.get("origin")! 
    : "*",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
  "Access-Control-Allow-Headers": "content-type",
  "content-type": "application/json",
  "cache-control": "public, max-age=60",
});

export const Route = createFileRoute("/api/public/licenca/config")({
  server: {
    handlers: {
      OPTIONS: async ({ request }) => new Response(null, { status: 204, headers: getCorsHeaders(request) }),
      POST: async ({ request }) => {
        const cors = getCorsHeaders(request);
        const sb = createClient(
          process.env.SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!,
          { auth: { persistSession: false, autoRefreshToken: false } },
        );
        const { data } = await sb
          .from("admin_settings")
          .select("config_extensao")
          .eq("singleton", true)
          .maybeSingle();

        const config = data?.config_extensao as any;
        
        return new Response(
          JSON.stringify({
            ok: true,
            versao_min: config?.versao_minima ?? "7.10.6",
            extension_id: "mr-social-glow",
            product: "MR Social Glow",
            config: config ?? {
              versao_minima: "7.10.6",
              heartbeat_intervalo_seg: 300,
              endpoints: {},
              feature_flags: {},
              aviso: null,
            },
          }),
          { status: 200, headers: cors },
        );
      },
      GET: async ({ request }) => {
        const cors = getCorsHeaders(request);
        const sb = createClient(
          process.env.SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!,
          { auth: { persistSession: false, autoRefreshToken: false } },
        );
        const { data } = await sb
          .from("admin_settings")
          .select("config_extensao")
          .eq("singleton", true)
          .maybeSingle();

        return new Response(
          JSON.stringify({
            ok: true,
            config: data?.config_extensao ?? {
              versao_minima: "1.0.0",
              heartbeat_intervalo_seg: 300,
              endpoints: {},
              feature_flags: {},
              aviso: null,
            },
          }),
          { status: 200, headers: cors },
        );
      },
    },
  },
});
