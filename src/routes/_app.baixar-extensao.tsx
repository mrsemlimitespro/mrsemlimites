import { createFileRoute } from "@tanstack/react-router";
import { Download, CheckCircle2, Package } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { playSfx } from "@/lib/sfx";
import currentExtensionAsset from "../../public/mr-sem-limites-2.2.5.zip.asset.json";

export const Route = createFileRoute("/_app/baixar-extensao")({
  head: () => ({
    meta: [
      { title: "Baixar Extensão Atual — MR Sem Limites" },
      { name: "description", content: "Baixe a versão atualizada da extensão MR Sem Limites." },
    ],
  }),
  component: BaixarExtensaoPage,
});

/**
 * Versão atual da extensão.
 * Ao modificar a extensão, atualize somente estes dados e o arquivo servido pela API.
 */
type ExtensionRelease = {
  version: string;
  date: string; // ISO ou dd/mm/aaaa
  filename: string;
  downloadPath: string; // caminho servido publicamente
  size: string;
  latest?: boolean;
  changelog: string[];
};

const RELEASES: ExtensionRelease[] = [
  {
    version: "2.2.4",
    date: "13/07/2026",
    filename: "mr-sem-limites-2.2.4.zip",
    downloadPath: currentExtensionAsset.url,
    size: "774 KB",
    latest: true,
    changelog: [
      "Painel lateral agora segue exatamente o mesmo caminho da bolinha verde (digita no chat nativo e clica Enviar via content script)",
      "Envio pelo painel reativa a bolinha automaticamente caso ela tenha sumido",
      "Interceptor de fetch aplica o fluxo ativo no envio real, igual ao envio manual",
    ],
  },
];

function BaixarExtensaoPage() {
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

      const res = await fetch(release.downloadPath, {
        cache: "no-store",
      });

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
