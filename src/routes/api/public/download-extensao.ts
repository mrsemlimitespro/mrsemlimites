import { createFileRoute } from "@tanstack/react-router";

// Nome do arquivo publicado em /public. Ao subir uma nova versão da extensão,
// atualize APENAS esta constante e coloque o zip correspondente em /public.
const FILENAME = "mr-sem-limites-2.2.3.zip";

export const Route = createFileRoute("/api/public/download-extensao")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const assetUrl = `${url.origin}/${FILENAME}`;

        // Buscamos o zip no próprio host (arquivo estático em /public),
        // lemos como ArrayBuffer (evita qualquer transformação de stream
        // que pudesse corromper o binário) e validamos a assinatura ZIP
        // (PK\x03\x04) antes de servir. Se algo estiver errado, devolvemos
        // 502 em vez de um arquivo quebrado que o Windows recusa abrir.
        const upstream = await fetch(assetUrl);
        if (!upstream.ok) {
          return new Response(
            `Falha ao obter extensão (${upstream.status}) em ${FILENAME}`,
            { status: 502 },
          );
        }

        const buf = await upstream.arrayBuffer();
        const bytes = new Uint8Array(buf);

        // ZIP local file header magic: 50 4B 03 04
        const isZip =
          bytes.length > 4 &&
          bytes[0] === 0x50 &&
          bytes[1] === 0x4b &&
          bytes[2] === 0x03 &&
          bytes[3] === 0x04;

        if (!isZip) {
          return new Response(
            "Arquivo da extensão inválido no servidor (assinatura ZIP ausente). Publique novamente.",
            { status: 502 },
          );
        }

        return new Response(buf, {
          status: 200,
          headers: {
            "Content-Type": "application/zip",
            "Content-Length": String(buf.byteLength),
            "Content-Disposition": `attachment; filename="${FILENAME}"`,
            "Cache-Control": "no-store",
            "X-Content-Type-Options": "nosniff",
          },
        });
      },
    },
  },
});
