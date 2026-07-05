import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Loader2, Pencil, Plus, Search, Trash2, Upload, X } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { resourceByKey, type Field, type Resource } from "@/lib/admin/resources";

// The generated Database types don't yet reflect the new tables; the resource
// engine is generic across many tables, so we access supabase.from() dynamically.
const db = supabase as unknown as {
  from: (table: string) => ReturnType<typeof supabase.from>;
};

export const Route = createFileRoute("/admin/$resource")({
  component: ResourcePage,
});

type Row = Record<string, unknown> & { id: string };

function ResourcePage() {
  const { resource: resourceKey } = Route.useParams();
  const navigate = useNavigate();
  const resource = resourceByKey.get(resourceKey);

  if (!resource) {
    return (
      <div className="glass rounded-2xl p-10 text-center">
        <p className="text-sm text-muted-foreground">Recurso não encontrado.</p>
        <Button className="mt-4" onClick={() => navigate({ to: "/admin" })}>
          Voltar ao painel
        </Button>
      </div>
    );
  }

  return <ResourceView key={resource.key} resource={resource} />;
}

function ResourceView({ resource }: { resource: Resource }) {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Row | null>(null);
  const [creating, setCreating] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<Row | null>(null);

  const { data: rows = [], isLoading } = useQuery({
    queryKey: ["admin-list", resource.table],
    queryFn: async () => {
      let q = (supabase as any).from(resource.table).select("*");
      if (resource.orderBy) {
        q = q.order(resource.orderBy.column, { ascending: resource.orderBy.ascending });
      }
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as Row[];
    },
  });

  const filtered = useMemo(() => {
    if (!search.trim()) return rows;
    const s = search.trim().toLowerCase();
    const cols = resource.searchColumns ?? [];
    return rows.filter((r) =>
      cols.some((c) => String(r[c] ?? "").toLowerCase().includes(s)),
    );
  }, [rows, search, resource.searchColumns]);

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any).from(resource.table).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Excluído");
      qc.invalidateQueries({ queryKey: ["admin-list", resource.table] });
      qc.invalidateQueries({ queryKey: ["admin-count", resource.table] });
      setConfirmDelete(null);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            Gestão
          </div>
          <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
            <span className="gradient-text-warm">{resource.label}</span>
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {rows.length} registro{rows.length === 1 ? "" : "s"}
          </p>
        </div>
        <Button className="gradient-primary" onClick={() => setCreating(true)}>
          <Plus className="size-4" /> Novo{resource.singular.endsWith("a") ? "a" : ""}{" "}
          {resource.singular.toLowerCase()}
        </Button>
      </header>

      {resource.searchColumns && resource.searchColumns.length > 0 && (
        <div className="glass flex items-center gap-3 rounded-2xl px-4 py-3">
          <Search className="size-4 text-muted-foreground" />
          <input
            type="search"
            placeholder="Buscar…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground/70"
          />
        </div>
      )}

      <div className="glass overflow-hidden rounded-2xl">
        <table className="w-full text-sm">
          <thead className="border-b border-white/5 bg-white/[0.02] text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              {resource.listColumns.map((c) => (
                <th key={c.key} className="px-4 py-3 font-medium">
                  {c.label}
                </th>
              ))}
              <th className="w-24 px-4 py-3 text-right font-medium">Ações</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={resource.listColumns.length + 1} className="p-8 text-center">
                  <Loader2 className="mx-auto size-5 animate-spin text-muted-foreground" />
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={resource.listColumns.length + 1}
                  className="p-10 text-center text-sm text-muted-foreground"
                >
                  Nenhum registro. Clique em “Novo” para criar.
                </td>
              </tr>
            ) : (
              filtered.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-white/5 last:border-0 hover:bg-white/[0.02]"
                >
                  {resource.listColumns.map((c) => (
                    <td key={c.key} className="px-4 py-3">
                      {formatCell(row[c.key], c.format)}
                    </td>
                  ))}
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => setEditing(row)}
                        aria-label="Editar"
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => setConfirmDelete(row)}
                        aria-label="Excluir"
                      >
                        <Trash2 className="size-4 text-red-400" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {(creating || editing) && (
        <ResourceFormDialog
          resource={resource}
          initial={editing}
          onClose={() => {
            setCreating(false);
            setEditing(null);
          }}
        />
      )}

      <AlertDialog open={!!confirmDelete} onOpenChange={(o) => !o && setConfirmDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir registro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => confirmDelete && deleteMutation.mutate(confirmDelete.id)}
              className="bg-red-500 hover:bg-red-500/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function formatCell(v: unknown, format?: "text" | "boolean" | "date" | "currency" | "number") {
  if (v === null || v === undefined || v === "") return <span className="text-muted-foreground">—</span>;
  if (format === "boolean")
    return (
      <span
        className={
          v
            ? "inline-flex rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs text-emerald-300"
            : "inline-flex rounded-full bg-white/5 px-2 py-0.5 text-xs text-muted-foreground"
        }
      >
        {v ? "Sim" : "Não"}
      </span>
    );
  if (format === "date")
    return new Date(String(v)).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  if (format === "currency") return `R$ ${Number(v).toFixed(2).replace(".", ",")}`;
  if (format === "number") return String(v);
  return String(v);
}

function ResourceFormDialog({
  resource,
  initial,
  onClose,
}: {
  resource: Resource;
  initial: Row | null;
  onClose: () => void;
}) {
  const qc = useQueryClient();
  const [values, setValues] = useState<Record<string, unknown>>(() => {
    if (initial) return { ...initial };
    const empty: Record<string, unknown> = {};
    for (const f of resource.fields) {
      if (f.type === "boolean") empty[f.key] = true;
      else empty[f.key] = "";
    }
    return empty;
  });
  const [busy, setBusy] = useState(false);

  const isEdit = !!initial;

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const payload: Record<string, unknown> = {};
      for (const f of resource.fields) {
        let v = values[f.key];
        if (v === "" || v === undefined) v = null;
        if (f.type === "number" && v !== null) v = Number(v);
        payload[f.key] = v;
      }
      if (isEdit) {
        const { error } = await supabase
          .from(resource.table as never)
          .update(payload)
          .eq("id", initial!.id);
        if (error) throw error;
        toast.success("Atualizado");
      } else {
        const { error } = await (supabase as any).from(resource.table).insert(payload);
        if (error) throw error;
        toast.success("Criado");
      }
      qc.invalidateQueries({ queryKey: ["admin-list", resource.table] });
      qc.invalidateQueries({ queryKey: ["admin-count", resource.table] });
      onClose();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Falha ao salvar";
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Editar" : "Nova"} {resource.singular.toLowerCase()}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={onSave} className="space-y-4">
          {resource.fields.map((f) => (
            <FieldInput
              key={f.key}
              field={f}
              value={values[f.key]}
              onChange={(v) => setValues((s) => ({ ...s, [f.key]: v }))}
            />
          ))}
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose} disabled={busy}>
              Cancelar
            </Button>
            <Button type="submit" className="gradient-primary" disabled={busy}>
              {busy ? <Loader2 className="size-4 animate-spin" /> : "Salvar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function FieldInput({
  field,
  value,
  onChange,
}: {
  field: Field;
  value: unknown;
  onChange: (v: unknown) => void;
}) {
  const id = `field-${field.key}`;

  if (field.type === "boolean") {
    return (
      <div className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2">
        <Label htmlFor={id}>{field.label}</Label>
        <Switch id={id} checked={!!value} onCheckedChange={onChange} />
      </div>
    );
  }
  if (field.type === "textarea") {
    return (
      <div>
        <Label htmlFor={id}>{field.label}</Label>
        <Textarea
          id={id}
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
          required={field.required}
          rows={3}
        />
      </div>
    );
  }
  if (field.type === "number") {
    return (
      <div>
        <Label htmlFor={id}>{field.label}</Label>
        <Input
          id={id}
          type="number"
          step={field.step ?? 1}
          value={(value as number | string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
          required={field.required}
        />
      </div>
    );
  }
  if (field.type === "datetime") {
    const str = value ? new Date(String(value)).toISOString().slice(0, 16) : "";
    return (
      <div>
        <Label htmlFor={id}>{field.label}</Label>
        <Input
          id={id}
          type="datetime-local"
          value={str}
          onChange={(e) =>
            onChange(e.target.value ? new Date(e.target.value).toISOString() : null)
          }
        />
      </div>
    );
  }
  if (field.type === "select" && field.options) {
    return (
      <div>
        <Label htmlFor={id}>{field.label}</Label>
        <Select value={(value as string) ?? ""} onValueChange={onChange}>
          <SelectTrigger id={id}>
            <SelectValue placeholder="Selecione…" />
          </SelectTrigger>
          <SelectContent>
            {field.options.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  }
  if (field.type === "select_from_table" && field.fromTable) {
    return <SelectFromTableInput field={field} value={value} onChange={onChange} />;
  }
  if (field.type === "image") {
    return <ImageInput field={field} value={value} onChange={onChange} />;
  }

  return (
    <div>
      <Label htmlFor={id}>{field.label}</Label>
      <Input
        id={id}
        type="text"
        value={(value as string) ?? ""}
        onChange={(e) => onChange(e.target.value)}
        required={field.required}
        placeholder={field.placeholder}
      />
    </div>
  );
}

function SelectFromTableInput({
  field,
  value,
  onChange,
}: {
  field: Field;
  value: unknown;
  onChange: (v: unknown) => void;
}) {
  const table = field.fromTable!.table;
  const labelKey = field.fromTable!.labelKey;
  const valueKey = field.fromTable!.valueKey ?? "id";

  const { data = [] } = useQuery({
    queryKey: ["admin-lookup", table],
    queryFn: async () => {
      const { data, error } = await supabase
        .from(table as never)
        .select(`${valueKey}, ${labelKey}`)
        .order(labelKey, { ascending: true });
      if (error) throw error;
      return data as Array<Record<string, string>>;
    },
  });

  return (
    <div>
      <Label>{field.label}</Label>
      <Select
        value={(value as string) ?? ""}
        onValueChange={(v) => onChange(v === "__none__" ? null : v)}
      >
        <SelectTrigger>
          <SelectValue placeholder="Selecione…" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__none__">— nenhum —</SelectItem>
          {data.map((o) => (
            <SelectItem key={o[valueKey]} value={o[valueKey]}>
              {o[labelKey] ?? o[valueKey]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function ImageInput({
  field,
  value,
  onChange,
}: {
  field: Field;
  value: unknown;
  onChange: (v: unknown) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const url = (value as string) || "";

  async function handleFile(file: File) {
    setUploading(true);
    try {
      const ext = file.name.split(".").pop() ?? "bin";
      const path = `${field.key}/${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage.from("admin-media").upload(path, file, {
        cacheControl: "3600",
        upsert: false,
      });
      if (error) throw error;
      const { data: signed, error: sErr } = await supabase.storage
        .from("admin-media")
        .createSignedUrl(path, 60 * 60 * 24 * 365 * 10); // 10 anos
      if (sErr) throw sErr;
      onChange(signed?.signedUrl ?? "");
      toast.success("Arquivo enviado");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Falha no upload");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <Label>{field.label}</Label>
      <div className="space-y-2">
        {url && (
          <div className="relative w-fit">
            <img
              src={url}
              alt=""
              className="max-h-32 rounded-lg border border-white/10 object-cover"
            />
            <button
              type="button"
              onClick={() => onChange("")}
              className="absolute -right-2 -top-2 grid size-6 place-items-center rounded-full bg-black/70 text-white"
              aria-label="Remover"
            >
              <X className="size-3" />
            </button>
          </div>
        )}
        <div className="flex items-center gap-2">
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm hover:bg-white/10">
            {uploading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Upload className="size-4" />
            )}
            <span>{url ? "Trocar arquivo" : "Enviar arquivo"}</span>
            <input
              type="file"
              accept="image/*,video/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFile(f);
              }}
            />
          </label>
          <Input
            type="text"
            value={url}
            onChange={(e) => onChange(e.target.value)}
            placeholder="ou cole uma URL"
            className="flex-1"
          />
        </div>
      </div>
    </div>
  );
}
