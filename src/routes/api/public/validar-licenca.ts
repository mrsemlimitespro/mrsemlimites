import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";

export const Route = createFileRoute("/api/public/validar-licenca")({
  server: {
    handlers: {
      OPTIONS: async () =>
        new Response(null, {
          status: 204,
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "content-type",
          },
        }),
      POST: async ({ request }) => {
        const cors = {
          "Access-Control-Allow-Origin": "*",
          "content-type": "application/json",
        };
        let body: any;
        try {
          body = await request.json();
        } catch {
          return new Response(
            JSON.stringify({ ok: false, error: "Licença inválida ou expirada." }),
            { status: 400, headers: cors },
          );
        }

        const email = String(body?.email ?? "").trim();
        const chave = String(body?.chave ?? "").trim();
        const device_id = body?.device_id ? String(body.device_id).trim() : null;

        if (!email || !chave) {
          return new Response(
            JSON.stringify({ ok: false, error: "Licença inválida ou expirada." }),
            { status: 200, headers: cors },
          );
        }

        const sb = createClient(
          process.env.SUPABASE_URL!,
          process.env.SUPABASE_PUBLISHABLE_KEY!,
          { auth: { persistSession: false, autoRefreshToken: false } },
        );

        const { data, error } = await sb.rpc("validar_licenca", {
          _email: email,
          _chave: chave,
          _device_id: device_id,
        });

        if (error) {
          return new Response(
            JSON.stringify({ ok: false, error: "Licença inválida ou expirada." }),
            { status: 200, headers: cors },
          );
        }

        return new Response(JSON.stringify(data), { status: 200, headers: cors });
      },
    },
  },
});
