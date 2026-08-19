import fs from "fs";
import path from "path";
import archiver from "archiver";

async function main() {
  const output = fs.createWriteStream("public/mr-sem-limites-backend-extension-v17-completo.zip");
  const archive = archiver("zip", { zlib: { level: 9 } });

  output.on("close", () => {
    console.log("ZIP Final gerado com sucesso: " + archive.pointer() + " total bytes");
  });

  archive.on("error", (err) => { throw err; });
  archive.pipe(output);

  // Arquivos Core do Backend Isolado
  archive.file("src/lib/ext-v17/auth.server.ts", { name: "auth.server.ts" });
  archive.file("src/lib/ext-v17/lovable.server.ts", { name: "lovable.server.ts" });
  archive.file("src/lib/licenca/utils.ts", { name: "licenca-utils.ts" });

  // Rotas de API v17
  const apiDir = "src/routes/api/public/ext-v17";
  const apiFiles = fs.readdirSync(apiDir);
  for (const file of apiFiles) {
    if (file.endsWith(".ts")) {
      archive.file(path.join(apiDir, file), { name: `routes/ext-v17/${file}` });
    }
  }

  // Infra (SQL Migrations)
  archive.file("supabase/migrations/20260819000000_ext_v17_schema.sql", { name: "infra/migration.sql" });

  // Testes de Auditoria
  archive.file("tests/ext-v17/final-audit.test.ts", { name: "tests/final-audit.test.ts" });

  await archive.finalize();
}

main().catch(console.error);
