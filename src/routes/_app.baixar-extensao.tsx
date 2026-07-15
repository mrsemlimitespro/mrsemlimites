import { createFileRoute } from "@tanstack/react-router";
import { Download, CheckCircle2, Package, Upload, Video, Loader2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { playSfx } from "@/lib/sfx";
import { supabase } from "@/integrations/supabase/client";
import { useUserRole } from "@/hooks/useUserRole";
const currentExtensionAsset = { url: "/mr-sem-limites-2.2.7.zip" };

export const Route = createFileRoute("/_app/baixar-extensao")({
  head: () => ({
    meta: [
      { title: "Baixar Extensão Atual — MR Sem Limites" },
      { name: "description", content: "Baixe a versão atualizada da extensão MR Sem Limites." },
    ],
  }),
  component: BaixarExtensaoPage,
});

type ExtensionRelease = {
  version: string;
  date: string;
  filename: string;
  downloadPath: string;
  size: string;
  latest?: boolean;
  changelog: string[];
};

const RELEASES: ExtensionRelease[] = [
  {
    version: "2.2.7",
    date: "13/07/2026",
    filename: "mr-sem-limites-2.2.7.zip",
    downloadPath: currentExtensionAsset.url,
    size: "750 KB",
    latest: true,
    changelog: [
      "Build de produção protegida: JS minificado, mangled, comentários e código morto removidos (terser em modo module para background/lib e script para os demais)",
      "Agora o ZIP descompacta em uma única pasta 'MR Sem Limites' — não bagunça mais os arquivos no diretório onde você extrair",
      "Bolinha flutuante virou um quadrado com a logo em destaque (mesmo drag e mesma função de ativar/desativar)",
      "Header do painel com nova logo em destaque também no canto direito, ao lado do Publish",
      "Dashboard da extensão modernizado: 6 cards de ação (Corrigir/Refatorar/Melhorar/Otimizar/Segurança/Responsivo) com ícones coloridos e efeito glass premium",
      "Removidas referências visíveis a 'LOV 3' — agora aparece 'MR Sem Limites' em todos os badges e status",
      "Nada mudou nas funções: envio, anexos, licença, download e Publish continuam iguais",
    ],
  },
];

const VIDEO_BUCKET = "extension-releases";
const VIDEO_FILENAME = "mr-sem-limites-2.2.8-video.zip";

function BaixarExtensaoPage() {
  const role = useUserRole();
  const canSeeVideo = role === "admin" || role === "revendedor";
  const isAdmin = role === "admin";

  return (
    <div className="mx-auto w-full max-w-4xl px-4 pb-24 pt-8 md:pt-12">
      <header className="mb-8">
        <div className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Extensão
        </div>
        <h1 className="text-3xl font-bold md:text-4xl">Baixar Extensão</h1>
        <p className="mt-2 text-muted-foreground">
          Somente a versão atualizada fica disponível para evitar instalar arquivo antigo.
        </p>
      </header>

      <InstallSteps />

      <div className="mt-8 flex flex-col gap-4">
        {RELEASES.map((r) => (
          <ReleaseCard key={r.version} release={r} />
        ))}

        {canSeeVideo && <VideoReleaseCard isAdmin={isAdmin} />}
      </div>
    </div>
  );
}

function InstallSteps() {
  return (
    <Card className="glass border-border/60">
      <CardHeader>
        <CardTitle className="text-base">Como instalar</CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">
        <ol className="list-decimal space-y-1 pl-5">
          <li>Baixe o arquivo <code className="rounded bg-muted/60 px-1">.zip</code> da versão mais recente.</li>
          <li>Descompacte em uma pasta no seu computador.</li>
          <li>Abra <code className="rounded bg-muted/60 px-1">chrome://extensions</code> no navegador.</li>
          <li>Ative o <strong>Modo desenvolvedor</strong> (canto superior direito).</li>
          <li>Clique em <strong>Carregar sem compactação</strong> e selecione a pasta descompactada.</li>
        </ol>
      </CardContent>
    </Card>
  );
}

function ReleaseCard({ release }: { release: ExtensionRelease }) {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    if (downloading) return;
    try {
      setDownloading(true);
      playSfx("swipe");
      const res = await fetch(release.downloadPath, { cache: "no-store" });
      if (!res.ok) throw new Error(`Falha ao baixar (${res.status})`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = release.filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1_000);
      toast.success(`Download iniciado — ${release.filename}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Falha ao baixar");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Card className="glass border-border/60 overflow-hidden">
      <CardContent className="flex flex-col gap-4 p-5 md:flex-row md:items-start md:justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="grid size-10 place-items-center rounded-xl gradient-primary">
              <Package className="size-5 text-primary-foreground" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold">Versão {release.version}</h2>
                {release.latest && (
                  <Badge className="gradient-primary text-primary-foreground border-0">
                    Mais recente
                  </Badge>
                )}
              </div>
              <div className="text-xs text-muted-foreground">
                {release.date} · {release.filename} · {release.size}
              </div>
            </div>
          </div>

          <ul className="mt-4 space-y-1.5">
            {release.changelog.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-foreground/80">
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-brand-cyan" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="shrink-0">
          <Button
            onClick={handleDownload}
            disabled={downloading}
            size="lg"
            className="w-full md:w-auto"
          >
            <Download className="mr-2 size-4" />
            {downloading ? "Baixando..." : "Baixar"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function formatSize(bytes: number | null | undefined): string {
  if (!bytes || bytes <= 0) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function VideoReleaseCard({ isAdmin }: { isAdmin: boolean }) {
  const [checking, setChecking] = useState(true);
  const [exists, setExists] = useState(false);
  const [size, setSize] = useState<number | null>(null);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const refresh = useCallback(async () => {
    setChecking(true);
    const { data, error } = await supabase.storage
      .from(VIDEO_BUCKET)
      .list("", { limit: 20, search: VIDEO_FILENAME });
    if (error) {
      setChecking(false);
      return;
    }
    const found = (data ?? []).find((f) => f.name === VIDEO_FILENAME);
    if (found) {
      setExists(true);
      const meta = found.metadata as { size?: number } | null;
      setSize(meta?.size ?? null);
      setUpdatedAt(found.updated_at ?? found.created_at ?? null);
    } else {
      setExists(false);
      setSize(null);
      setUpdatedAt(null);
    }
    setChecking(false);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const handleDownload = async () => {
    if (downloading) return;
    try {
      setDownloading(true);
      playSfx("swipe");
      const { data, error } = await supabase.storage
        .from(VIDEO_BUCKET)
        .createSignedUrl(VIDEO_FILENAME, 120, { download: VIDEO_FILENAME });
      if (error || !data?.signedUrl) throw new Error(error?.message ?? "Sem URL");
      const a = document.createElement("a");
      a.href = data.signedUrl;
      a.download = VIDEO_FILENAME;
      document.body.appendChild(a);
      a.click();
      a.remove();
      toast.success(`Download iniciado — ${VIDEO_FILENAME}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Falha ao baixar");
    } finally {
      setDownloading(false);
    }
  };

  const handlePickFile = () => inputRef.current?.click();

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".zip")) {
      toast.error("Envie um arquivo .zip");
      return;
    }
    try {
      setUploading(true);
      const { error } = await supabase.storage
        .from(VIDEO_BUCKET)
        .upload(VIDEO_FILENAME, file, {
          contentType: "application/zip",
          cacheControl: "no-store",
          upsert: true,
        });
      if (error) throw error;
      toast.success("Extensão vídeo enviada");
      await refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Falha no envio");
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card className="glass border-border/60 overflow-hidden relative">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-fuchsia-400/70 to-transparent" />
      <CardContent className="flex flex-col gap-4 p-5 md:flex-row md:items-start md:justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="grid size-10 place-items-center rounded-xl gradient-warm">
              <Video className="size-5 text-primary-foreground" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg font-semibold">Versão 2.2.8 · Vídeo</h2>
                <Badge className="gradient-warm text-primary-foreground border-0">
                  Ultra completa
                </Badge>
                <Badge variant="outline" className="border-fuchsia-400/40 text-fuchsia-300">
                  Somente revendedor
                </Badge>
              </div>
              <div className="text-xs text-muted-foreground">
                {VIDEO_FILENAME}
                {exists && size ? ` · ${formatSize(size)}` : ""}
                {exists && updatedAt
                  ? ` · atualizado ${new Date(updatedAt).toLocaleString("pt-BR")}`
                  : ""}
              </div>
            </div>
          </div>

          <ul className="mt-4 space-y-1.5 text-sm text-foreground/80">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-brand-cyan" />
              <span>Extensão Ultra completa: envio com <strong>vídeo</strong> e <strong>imagem</strong> como anexos.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-brand-cyan" />
              <span>Distribuição restrita: aparece apenas para revendedores e administradores.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-brand-cyan" />
              <span>Baseada na 2.2.7 — mesma estrutura, mesmas licenças, mesmos endpoints.</span>
            </li>
            {!exists && !checking && (
              <li className="flex items-start gap-2 text-fuchsia-300">
                <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
                <span>Aguardando envio do arquivo pelo administrador.</span>
              </li>
            )}
          </ul>
        </div>

        <div className="shrink-0 flex flex-col gap-2 md:min-w-[180px]">
          {isAdmin && (
            <>
              <input
                ref={inputRef}
                type="file"
                accept=".zip,application/zip"
                className="hidden"
                onChange={handleUpload}
              />
              <Button
                onClick={handlePickFile}
                disabled={uploading}
                size="lg"
                variant="outline"
                className="w-full border-fuchsia-400/50 hover:bg-fuchsia-500/10"
              >
                {uploading ? (
                  <Loader2 className="mr-2 size-4 animate-spin" />
                ) : (
                  <Upload className="mr-2 size-4" />
                )}
                {uploading ? "Enviando..." : exists ? "Substituir" : "Enviar .zip"}
              </Button>
            </>
          )}
          <Button
            onClick={handleDownload}
            disabled={downloading || checking || !exists}
            size="lg"
            className="w-full gradient-warm text-primary-foreground border-0"
          >
            {downloading ? (
              <Loader2 className="mr-2 size-4 animate-spin" />
            ) : (
              <Download className="mr-2 size-4" />
            )}
            {checking
              ? "Verificando..."
              : !exists
                ? "Indisponível"
                : downloading
                  ? "Baixando..."
                  : "Baixar"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
