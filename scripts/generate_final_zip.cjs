const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

async function main() {
  const zipPath = "public/mr-sem-limites-backend-extension-v17-completo.zip";
  const tempDir = "/tmp/zip_build_" + Date.now();
  fs.mkdirSync(tempDir, { recursive: true });

  // Estrutura de pastas no ZIP
  const folders = ["routes/ext-v17", "infra", "tests"];
  folders.forEach(f => fs.mkdirSync(path.join(tempDir, f), { recursive: true }));

  // Cópia de arquivos
  fs.copyFileSync("src/lib/ext-v17/auth.server.ts", path.join(tempDir, "auth.server.ts"));
  fs.copyFileSync("src/lib/ext-v17/lovable.server.ts", path.join(tempDir, "lovable.server.ts"));
  fs.copyFileSync("src/lib/licenca/utils.ts", path.join(tempDir, "licenca-utils.ts"));
  fs.copyFileSync("supabase/migrations/20260819000000_ext_v17_schema.sql", path.join(tempDir, "infra/migration.sql"));
  fs.copyFileSync("tests/ext-v17/final-audit.test.ts", path.join(tempDir, "tests/final-audit.test.ts"));

  const apiDir = "src/routes/api/public/ext-v17";
  fs.readdirSync(apiDir).forEach(file => {
    if (file.endsWith(".ts")) {
      fs.copyFileSync(path.join(apiDir, file), path.join(tempDir, "routes/ext-v17", file));
    }
  });

  // Usar comando zip do sistema (nixpkgs#zip está disponível no ambiente shell se necessário, mas geralmente 'zip' existe)
  try {
    process.chdir(tempDir);
    execSync(`zip -r ../backend.zip .`);
    process.chdir("/dev-server");
    fs.copyFileSync("/tmp/backend.zip", zipPath);
    console.log("ZIP Final gerado com sucesso via sistema.");
  } catch (e) {
    console.error("Falha ao usar comando zip:", e.message);
  }
}

main().catch(console.error);
