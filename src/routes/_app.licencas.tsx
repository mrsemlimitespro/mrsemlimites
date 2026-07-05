import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  Copy,
  MoreHorizontal,
  Plus,
  Search,
  FlaskConical,
  KeyRound,
  Hourglass,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/_app/licencas")({
  head: () => ({
    meta: [
      { title: "Licenças — MR sem limites" },
      { name: "description", content: "Gestão de licenças no MR sem limites." },
    ],
  }),
  component: LicencasPage,
});

type License = {
  key: string;
  client: string | null;
  email: string;
  status: "ativa" | "expirada" | "revogada";
  device: string | null;
  expires: string;
  expiresState: "waiting" | "active" | "expired";
};

const licenses: License[] = [
  {
    key: "75HKS-66300-27TEV-89W03",
    client: null,
    email: "estoque",
    status: "ativa",
    device: null,
    expires: "30d (aguardando)",
    expiresState: "waiting",
  },
];

type Filter = "todos" | "ativas" | "expiradas" | "revogadas";

function LicencasPage() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("todos");
  const [openNova, setOpenNova] = useState(false);
  const [openTeste, setOpenTeste] = useState(false);

  const filtered = licenses.filter((l) => {
    const q = query.trim().toLowerCase();
    const matchQ =
      !q ||
      l.key.toLowerCase().includes(q) ||
      l.email.toLowerCase().includes(q) ||
      (l.client ?? "").toLowerCase().includes(q);
    const matchF =
      filter === "todos" ||
      (filter === "ativas" && l.status === "ativa") ||
      (filter === "expiradas" && l.status === "expirada") ||
      (filter === "revogadas" && l.status === "revogada");
    return matchQ && matchF;
  });

  const available = licenses.filter((l) => l.status === "ativa" && !l.client).length;
  const total = licenses.length;

  return (
    <div className="mx-auto w-full max-w-[1280px] space-y-6">
      {/* Header */}
      <header className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] gradient-text-warm">
            Gestão
          </p>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight md:text-5xl">
            Licenças
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Gerencie as licenças criadas por você
          </p>
          <p className="mt-3 inline-flex items-center gap-1.5 text-sm">
            <KeyRound className="size-3.5 text-primary" strokeWidth={2} />
            <span className="font-semibold text-primary">{available} disponíveis</span>
            <span className="text-muted-foreground">/ {total} total</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="ghost"
            className="rounded-full border border-border/70 bg-surface/50 px-4 backdrop-blur-xl hover:bg-white/5"
            onClick={() => setOpenTeste(true)}
          >
            <FlaskConical className="size-4" strokeWidth={2} />
            Chave Teste
          </Button>
          <Button
            className="rounded-full gradient-primary text-primary-foreground shadow-[0_0_24px_-4px_color-mix(in_oklab,var(--primary)_70%,transparent)] hover:opacity-95"
            onClick={() => setOpenNova(true)}
          >
            <Plus className="size-4" strokeWidth={2.5} />
            Nova Licença
          </Button>
        </div>
      </header>

      {/* Search + filter */}
      <div className="flex flex-col gap-3 md:flex-row">
        <label className="glass relative flex h-12 flex-1 items-center rounded-2xl pl-11 pr-4">
          <Search
            className="absolute left-4 size-4 text-muted-foreground"
            strokeWidth={2}
            aria-hidden
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por chave, email ou cliente..."
            className="h-full w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground/70"
          />
        </label>

        <Select value={filter} onValueChange={(v) => setFilter(v as Filter)}>
          <SelectTrigger className="glass h-12 rounded-2xl md:w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            <SelectItem value="ativas">Ativas</SelectItem>
            <SelectItem value="expiradas">Expiradas</SelectItem>
            <SelectItem value="revogadas">Revogadas</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="glass overflow-hidden rounded-2xl">
        <div className="grid grid-cols-[minmax(220px,1.4fr)_1fr_1fr_120px_1fr_1fr_40px] gap-4 border-b border-border/60 px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          <div>Chave</div>
          <div>Cliente</div>
          <div>Email</div>
          <div>Status</div>
          <div>Device</div>
          <div>Expira</div>
          <div />
        </div>

        {filtered.length === 0 ? (
          <div className="px-6 py-14 text-center text-sm text-muted-foreground">
            Nenhuma licença encontrada.
          </div>
        ) : (
          <ul>
            {filtered.map((l) => (
              <li
                key={l.key}
                className="grid grid-cols-[minmax(220px,1.4fr)_1fr_1fr_120px_1fr_1fr_40px] items-center gap-4 border-b border-border/40 px-6 py-4 text-sm transition-colors last:border-0 hover:bg-white/[0.03]"
              >
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[13px] tracking-tight text-foreground">
                    {l.key}
                  </span>
                  <button
                    type="button"
                    aria-label="Copiar chave"
                    onClick={() => navigator.clipboard?.writeText(l.key)}
                    className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground"
                  >
                    <Copy className="size-3.5" strokeWidth={2} />
                  </button>
                </div>
                <div className="text-muted-foreground">{l.client ?? "—"}</div>
                <div className="truncate text-foreground/85">{l.email}</div>
                <div>
                  <StatusPill status={l.status} />
                </div>
                <div className="text-muted-foreground">{l.device ?? "—"}</div>
                <div className="flex items-center gap-1.5 text-foreground/85">
                  <Hourglass className="size-3.5 text-primary" strokeWidth={2} />
                  <span className="text-sm">{l.expires}</span>
                </div>
                <button
                  type="button"
                  aria-label="Mais opções"
                  className="justify-self-end rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground"
                >
                  <MoreHorizontal className="size-4" strokeWidth={2} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <NovaLicencaModal open={openNova} onOpenChange={setOpenNova} />
      <ChaveTesteModal open={openTeste} onOpenChange={setOpenTeste} />
    </div>
  );
}

function StatusPill({ status }: { status: License["status"] }) {
  const map: Record<
    License["status"],
    { label: string; color: string; bg: string; text: string }
  > = {
    ativa: {
      label: "ATIVA",
      color: "var(--brand-emerald)",
      bg: "color-mix(in oklab, var(--brand-emerald) 20%, transparent)",
      text: "oklch(0.88 0.14 165)",
    },
    expirada: {
      label: "EXPIRADA",
      color: "var(--brand-orange)",
      bg: "color-mix(in oklab, var(--brand-orange) 20%, transparent)",
      text: "oklch(0.9 0.16 60)",
    },
    revogada: {
      label: "REVOGADA",
      color: "var(--destructive)",
      bg: "color-mix(in oklab, var(--destructive) 22%, transparent)",
      text: "oklch(0.88 0.16 25)",
    },
  };
  const s = map[status];
  return (
    <span
      className="inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em]"
      style={{
        background: s.bg,
        color: s.text,
        border: `1px solid color-mix(in oklab, ${s.color} 45%, transparent)`,
      }}
    >
      {s.label}
    </span>
  );
}

function NovaLicencaModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-strong sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Criar Nova Licença</DialogTitle>
          <DialogDescription>Gere uma nova chave de licença</DialogDescription>
        </DialogHeader>

        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            onOpenChange(false);
          }}
        >
          <Field label="Nome do cliente">
            <Input placeholder="Ex: João Silva" autoFocus />
          </Field>
          <Field label="Email do cliente">
            <Input type="email" placeholder="cliente@exemplo.com" />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Duração (dias)">
              <Input type="number" defaultValue={30} min={1} />
            </Field>
            <Field label="Preço (R$)">
              <Input type="number" step="0.01" defaultValue="0.00" />
            </Field>
          </div>
          <Field label="Observações">
            <Textarea placeholder="Notas..." rows={3} />
          </Field>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="gradient-primary text-primary-foreground"
            >
              Criar Licença
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function ChaveTesteModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-strong sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Criar Chave Teste</DialogTitle>
          <DialogDescription>
            Chave de 10 minutos, sem custo de crédito. Expira automaticamente.
          </DialogDescription>
        </DialogHeader>

        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            onOpenChange(false);
          }}
        >
          <Field label="Nome do cliente">
            <Input placeholder="Ex: João Silva" autoFocus />
          </Field>
          <Field label="Email do cliente">
            <Input type="email" placeholder="cliente@exemplo.com" />
          </Field>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="gradient-primary text-primary-foreground"
            >
              Criar Teste
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className={cn("text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground")}>{label}</Label>
      {children}
    </div>
  );
}
