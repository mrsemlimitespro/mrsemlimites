import { supabaseAdmin } from "../src/integrations/supabase/client.server";
import fs from "fs";
import path from "path";

async function run() {
  const zipPath = path.join(process.cwd(), "public", "mr-sem-limites-backend-extension-v17-completo.zip");
  if (!fs.existsSync(zipPath)) {
    console.error("ZIP não encontrado em public/");
    process.exit(1);
  }

  const fileBuffer = fs.readFileSync(zipPath);
  
  console.log("Iniciando upload para extension-releases...");
  
  const { data, error } = await supabaseAdmin.storage
    .from("extension-releases")
    .upload("mr-sem-limites-backend-extension-v17-completo.zip", fileBuffer, {
      contentType: "application/zip",
      upsert: true
    });

  if (error) {
    console.error("Erro no upload:", error);
    process.exit(1);
  }

  console.log("Upload concluído com sucesso:", data.path);
}

run().catch(console.error);
