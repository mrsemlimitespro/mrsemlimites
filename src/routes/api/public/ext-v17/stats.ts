import { createFileRoute } from "@tanstack/react-router";
import { getCorsHeaders, validateExtensionLicense } from "@/lib/ext-v17/auth.server";

export const Route = createFileRoute("/api/public/ext-v17/stats")({
  server: {
    handlers: {
      OPTIONS: async ({ request }) => new Response(null, { status: 204, headers: getCorsHeaders(request) }),
      POST: async ({ request }) => {
        const cors = { ...getCorsHeaders(request), "Content-Type": "application/json" };
        let body: any;
        try {
          body = await request.json();
        } catch {
          return new Response(JSON.stringify({ ok: false, error: "invalid_json" }), { status: 400, headers: cors });
        }
        const ip = request.headers.get("cf-connecting-ip") || request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || null;
        const auth = await validateExtensionLicense(body, ip, request.headers.get("user-agent"), "/stats");
        if (!auth.ok) return new Response(JSON.stringify(auth), { status: 403, headers: cors });

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data, error } = await (supabaseAdmin as any).rpc("ext_v17_stats", { _chave: auth.license_key });
        if (error) return new Response(JSON.stringify({ ok: false, error: "stats_failed" }), { status: 500, headers: cors });
        return new Response(JSON.stringify(data), { status: 200, headers: cors });
      },
    },
  },
});
