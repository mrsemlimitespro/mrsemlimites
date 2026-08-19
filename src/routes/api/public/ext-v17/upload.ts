import { createFileRoute } from "@tanstack/react-router";
import { validateExtensionLicense, getCorsHeaders } from "@/lib/ext-v17/auth.server";

export const Route = createFileRoute("/api/public/ext-v17/upload")({
  server: {
    handlers: {
      OPTIONS: async ({ request }) => new Response(null, { status: 204, headers: getCorsHeaders(request) }),
      POST: async ({ request }) => {
        const cors = getCorsHeaders(request);
        const ip = request.headers.get("cf-connecting-ip") || request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || null;
        
        let formData: FormData;
        try {
          formData = await request.formData();
        } catch {
          return new Response(JSON.stringify({ ok: false, error: "invalid_form_data" }), { status: 400, headers: cors });
        }

        const licenseKey = formData.get("license_key") as string || formData.get("key") as string || formData.get("user_license_key") as string;
        const hwid = formData.get("hwid") as string || formData.get("device_id") as string;
        const file = formData.get("file") as File;

        const authResult = await validateExtensionLicense({ license_key: licenseKey, hwid }, ip, request.headers.get("user-agent"), "/upload");
        if (!authResult.ok) {
          return new Response(JSON.stringify(authResult), { status: 403, headers: cors });
        }

        if (!file) {
          return new Response(JSON.stringify({ ok: false, error: "no_file_uploaded" }), { status: 400, headers: cors });
        }

        // Validação de segurança básica do arquivo
        const allowedTypes = [
          "image/png", "image/jpeg", "image/jpg", "image/webp", "image/gif",
          "application/pdf", "text/plain", "application/json", "application/zip",
          "video/mp4", "video/webm", "audio/mpeg", "audio/wav", "audio/ogg"
        ];
        
        if (!allowedTypes.includes(file.type)) {
          return new Response(JSON.stringify({ 
            ok: false, 
            error: "mime_type_not_allowed", 
            details: \`Type \${file.type} is not supported\` 
          }), { status: 400, headers: cors });
        }

        if (file.size > 50 * 1024 * 1024) { // 50MB limit para vídeos
             return new Response(JSON.stringify({ ok: false, error: "file_too_large" }), { status: 400, headers: cors });
        }

        try {
          const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
          // Nome seguro: UUID + timestamp + sanitize name
          const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
          const fileName = `${crypto.randomUUID()}-${Date.now()}-${safeName}`;
          const filePath = `v17-uploads/${fileName}`;

          const { data, error } = await supabaseAdmin.storage
            .from("ext_v17_uploads")
            .upload(filePath, file, {
              contentType: file.type,
              upsert: false
            });

          if (error) throw error;

          const { data: { publicUrl } } = supabaseAdmin.storage
            .from("ext_v17_uploads")
            .getPublicUrl(filePath);

          // Registrar no banco de auditoria com ID real da licença
          await supabaseAdmin.from("ext_v17_uploads").insert({
            licenca_id: authResult.licenca_id,
            file_name: file.name,
            file_path: filePath,
            content_type: file.type,
            size_bytes: file.size
          });

          return new Response(JSON.stringify({
            ok: true,
            valid: true,
            licenca_id: authResult.licenca_id,
            user_name: authResult.user_name,
            status: authResult.status,
            expires_at: authResult.expires_at,
            url: publicUrl,
            file_path: filePath
          }), { status: 200, headers: cors });

        } catch (err: any) {
          return new Response(JSON.stringify({ ok: false, error: "storage_upload_failed", details: err.message }), { status: 500, headers: cors });
        }
      },
    },
  },
});
