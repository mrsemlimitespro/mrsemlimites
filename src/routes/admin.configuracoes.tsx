import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, Save, Upload, X } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

export const Route = createFileRoute("/admin/configuracoes")({
  component: ConfiguracoesPage,
});

type Settings = {
  id: string;
  site_name: string;
  logo_url: string | null;
  favicon_url: string | null;
  welcome_text: string | null;
  footer_text: string | null;
  notification_message: string | null;
  notification_active: boolean;
  primary_color: string;
  accent_color: string;
  extension_url: string | null;
  extension_filename: string | null;
};

function ConfiguracoesPage() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["admin-settings"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("admin_settings")
        .select("*")
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data as Settings | null;
    },
  });

  const [values, setValues] = useState<Partial<Settings>>({});
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (data) setValues(data);
  }, [data]);

  async function save() {
    if (!data?.id) return;
    setBusy(true);
    try {
      const { error } = await (supabase as any)
        .from("admin_settings")
        .update({
          site_name: values.site_name ?? "MR Lova",
          logo_url: values.logo_url || null,
          favicon_url: values.favicon_url || null,
          welcome_text: values.welcome_text || null,
          footer_text: values.footer_text || null,
          notification_message: values.notification_message || null,
          notification_active: !!values.notification_active,
          extension_url: values.extension_url || null,
          extension_filename: values.extension_filename || null,
        })
        .eq("id", data.id);
      if (error) throw error;
      toast.success("Configurações salvas");
      qc.invalidateQueries({ queryKey: ["admin-settings"] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Falha ao salvar");
    } finally {
      setBusy(false);
    }
  }

  if (isLoading) {
    return <Loader2 className="mx-auto mt-20 size-6 animate-spin text-muted-foreground" />;
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header>
        <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
          Sistema
        </div>
        <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
          <span className="gradient-text-warm">Configurações Gerais</span>
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Nome, logo, favicon, textos e mensagem global do sistema.
        </p>
      </header>

      <section className="glass space-y-5 rounded-2xl p-6">
        <div>
          <Label htmlFor="site-name">Nome do sistema</Label>
          <Input
            id="site-name"
            value={values.site_name ?? ""}
            onChange={(e) => setValues((v) => ({ ...v, site_name: e.target.value }))}
            placeholder="MR Lova"
          />
        </div>

        <UploadField
          label="Logo do sistema"
          value={values.logo_url ?? ""}
          onChange={(v) => setValues((s) => ({ ...s, logo_url: v }))}
        />

        <UploadField
          label="Favicon"
          value={values.favicon_url ?? ""}
          onChange={(v) => setValues((s) => ({ ...s, favicon_url: v }))}
        />

        <div>
          <Label htmlFor="welcome">Texto de boas-vindas</Label>
          <Textarea
            id="welcome"
            value={values.welcome_text ?? ""}
            onChange={(e) => setValues((v) => ({ ...v, welcome_text: e.target.value }))}
            rows={2}
          />
        </div>

        <div>
          <Label htmlFor="footer">Rodapé</Label>
          <Input
            id="footer"
            value={values.footer_text ?? ""}
            onChange={(e) => setValues((v) => ({ ...v, footer_text: e.target.value }))}
          />
        </div>
      </section>

      <ExtensionUploadSection
        url={values.extension_url ?? ""}
        filename={values.extension_filename ?? ""}
        onChange={(u, f) =>
          setValues((v) => ({ ...v, extension_url: u, extension_filename: f }))
        }
      />

      <section className="glass space-y-4 rounded-2xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold">Notificação global</div>
            <div className="text-xs text-muted-foreground">
              Mensagem exibida no topo do app quando ativa.
            </div>
          </div>
          <Switch
            checked={!!values.notification_active}
            onCheckedChange={(c) => setValues((v) => ({ ...v, notification_active: c }))}
          />
        </div>
        <Textarea
          value={values.notification_message ?? ""}
          onChange={(e) => setValues((v) => ({ ...v, notification_message: e.target.value }))}
          rows={2}
          placeholder="Mensagem que aparecerá para os usuários…"
        />
      </section>

      <div className="flex justify-end">
        <Button className="gradient-primary" onClick={save} disabled={busy}>
          {busy ? <Loader2 className="size-4 animate-spin" /> : <><Save className="size-4" /> Salvar</>}
        </Button>
      </div>
    </div>
  );
}

function UploadField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const [uploading, setUploading] = useState(false);
  async function handleFile(file: File) {
    setUploading(true);
    try {
      const ext = file.name.split(".").pop() ?? "bin";
      const path = `config/${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage.from("admin-media").upload(path, file, { upsert: false });
      if (error) throw error;
      const { data: signed, error: sErr } = await supabase.storage
        .from("admin-media")
        .createSignedUrl(path, 60 * 60 * 24 * 365 * 10);
      if (sErr) throw sErr;
      onChange(signed?.signedUrl ?? "");
      toast.success("Enviado");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Falha no upload");
    } finally {
      setUploading(false);
    }
  }
  return (
    <div>
      <Label>{label}</Label>
      <div className="space-y-2">
        {value && (
          <div className="relative w-fit">
            <img src={value} alt="" className="max-h-24 rounded-lg border border-white/10 object-cover" />
            <button
              type="button"
              onClick={() => onChange("")}
              className="absolute -right-2 -top-2 grid size-6 place-items-center rounded-full bg-black/70 text-white"
            >
              <X className="size-3" />
            </button>
          </div>
        )}
        <div className="flex items-center gap-2">
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm hover:bg-white/10">
            {uploading ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
            <span>{value ? "Trocar" : "Enviar"}</span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFile(f);
              }}
            />
          </label>
          <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="ou cole uma URL"
            className="flex-1"
          />
        </div>
      </div>
    </div>
  );
}
