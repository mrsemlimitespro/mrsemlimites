import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Copy,
  ClipboardPaste,
  MoreHorizontal,
  Plus,
  Search,
  FlaskConical,
  KeyRound,
  Hourglass,
  Loader2,
  RotateCcw,
  History,
  CalendarPlus,
  Ban,
  PlayCircle,
} from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";


export const Route = createFileRoute("/_app/licencas")({
  head: () => ({
    meta: [
      { title: "Licenças — MR sem limites" },
      { name: "description", content: "Gestão de licenças no MR sem limites." },
    ],
  }),
  component: LicencasPage,
});

type LicencaRow = {
  id: string;
  chave: string;
  cliente_id: string | null;
  email: string | null;
  status: string;
  device_id: string | null;
  expira_em: string | null;
  ativada_em: string | null;
  duracao_dias: number | null;
  clientes?: { nome: string | null } | null;
};

type ViewStatus = "ativa" | "expirada" | "revogada";

type License = {
  id: string;
  key: string;
  client: string | null;
  email: string;
  status: ViewStatus;
  device: string | null;
  expires: string;
  expiresState: "waiting" | "active" | "expired";
};

type Filter = "todos" | "ativas" | "expiradas" | "revogadas";

function computeView(row: LicencaRow): License {
  const now = Date.now();
  const exp = row.expira_em ? new Date(row.expira_em).getTime() : null;
  let status: ViewStatus = "ativa";
  if (row.status === "revogada") status = "revogada";
  else if (exp !== null && exp < now) status = "expirada";

  let expiresLabel = "—";
  let expiresState: License["expiresState"] = "waiting";
  if (!row.cliente_id) {
    expiresLabel = `${row.duracao_dias ?? 30}d (aguardando)`;
    expiresState = "waiting";
  } else if (exp !== null) {
    const diff = exp - now;
    if (diff <= 0) {
      expiresLabel = "expirada";
      expiresState = "expired";
    } else {
      const days = Math.ceil(diff / 86400000);
      expiresLabel = `${days}d restantes`;
      expiresState = "active";
    }
  }

  return {
    id: row.id,
    key: row.chave,
    client: row.clientes?.nome ?? null,
    email: row.email ?? (row.cliente_id ? "" : "estoque"),
    status,
    device: row.device_id,
    expires: expiresLabel,
    expiresState,
  };
}

function LicencasPage() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("todos");
  const [openNova, setOpenNova] = useState(false);
  const [openTeste, setOpenTeste] = useState(false);
  const [rows, setRows] = useState<LicencaRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [historyOf, setHistoryOf] = useState<LicencaRow | null>(null);
  const [renovarOf, setRenovarOf] = useState<LicencaRow | null>(null);

  async function reload() {
    setLoading(true);
    const { data, error } = await (supabase as any)
      .from("licencas")
      .select("id, chave, cliente_id, email, status, device_id, expira_em, ativada_em, duracao_dias, clientes(nome)")
      .order("created_at", { ascending: false });
    if (error) {
      toast.error(error.message);
      setRows([]);
    } else {
      setRows((data ?? []) as LicencaRow[]);
    }
    setLoading(false);
  }

  useEffect(() => {
    reload();
    const ch = supabase
      .channel("licencas-live")
      .on("postgres_changes", { event: "*", schema: "public", table: "licencas" }, () => reload())
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, []);


  const licenses = rows.map(computeView);

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

  async function resetDevice(id: string) {
    const { error } = await (supabase as any).rpc("resetar_device_licenca", {
      _licenca_id: id,
    });
    if (error) return toast.error(error.message);
    toast.success("Dispositivo liberado");
    reload();
  }

  async function cancelar(id: string) {
    if (!confirm("Cancelar esta licença?")) return;
    const { error } = await (supabase as any).rpc("cancelar_licenca", {
      _licenca_id: id,
      _motivo: "cancelada pelo usuário",
    });
    if (error) return toast.error(error.message);
    toast.success("Licença cancelada");
    reload();
  }

  async function reativar(id: string) {
    const { error } = await (supabase as any).rpc("reativar_licenca", {
      _licenca_id: id,
    });
    if (error) return toast.error(error.message);
    toast.success("Licença reativada");
    reload();
  }


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

        {loading ? (
          <div className="flex items-center justify-center px-6 py-14 text-sm text-muted-foreground">
            <Loader2 className="mr-2 size-4 animate-spin" /> Carregando...
          </div>
        ) : filtered.length === 0 ? (
          <div className="px-6 py-14 text-center text-sm text-muted-foreground">
            Nenhuma licença encontrada.
          </div>
        ) : (
          <ul>
            {filtered.map((l) => (
              <li
                key={l.id}
                className="grid grid-cols-[minmax(220px,1.4fr)_1fr_1fr_120px_1fr_1fr_40px] items-center gap-4 border-b border-border/40 px-6 py-4 text-sm transition-colors last:border-0 hover:bg-white/[0.03]"
              >
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[13px] tracking-tight text-foreground">
                    {l.key}
                  </span>
                  <button
                    type="button"
                    aria-label="Copiar chave"
                    onClick={() => {
                      navigator.clipboard?.writeText(l.key);
                      toast.success("Chave copiada");
                    }}
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
                <div className="text-muted-foreground">
                  {l.device ? (
                    <button
                      type="button"
                      onClick={() => resetDevice(l.id)}
                      title="Resetar dispositivo"
                      className="inline-flex items-center gap-1 rounded-md px-1 py-0.5 hover:bg-white/5 hover:text-foreground"
                    >
                      <RotateCcw className="size-3" strokeWidth={2} />
                      <span className="truncate max-w-[120px]">{l.device}</span>
                    </button>
                  ) : (
                    "—"
                  )}
                </div>
                <div className="flex items-center gap-1.5 text-foreground/85">
                  <Hourglass className="size-3.5 text-primary" strokeWidth={2} />
                  <span className="text-sm">{l.expires}</span>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      aria-label="Mais opções"
                      className="justify-self-end rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground"
                    >
                      <MoreHorizontal className="size-4" strokeWidth={2} />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="glass-strong">
                    <DropdownMenuItem onClick={() => setHistoryOf(rows.find((r) => r.id === l.id) ?? null)}>
                      <History className="size-4" /> Histórico
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setRenovarOf(rows.find((r) => r.id === l.id) ?? null)}>
                      <CalendarPlus className="size-4" /> Renovar
                    </DropdownMenuItem>
                    {l.device ? (
                      <DropdownMenuItem onClick={() => resetDevice(l.id)}>
                        <RotateCcw className="size-4" /> Resetar dispositivo
                      </DropdownMenuItem>
                    ) : null}
                    <DropdownMenuSeparator />
                    {l.status === "revogada" ? (
                      <DropdownMenuItem onClick={() => reativar(l.id)}>
                        <PlayCircle className="size-4" /> Reativar
                      </DropdownMenuItem>
                    ) : (
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => cancelar(l.id)}
                      >
                        <Ban className="size-4" /> Cancelar
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </li>
            ))}
          </ul>
        )}
      </div>

      <NovaLicencaModal
        open={openNova}
        onOpenChange={setOpenNova}
        onSaved={reload}
      />
      <ChaveTesteModal
        open={openTeste}
        onOpenChange={setOpenTeste}
        onSaved={reload}
      />
      <HistoricoLicencaSheet
        licenca={historyOf}
        onOpenChange={(v) => !v && setHistoryOf(null)}
      />
      <RenovarLicencaModal
        licenca={renovarOf}
        onOpenChange={(v) => !v && setRenovarOf(null)}
        onSaved={reload}
      />
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
  onSaved,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSaved: () => void;
}) {
  const [quantidade, setQuantidade] = useState(1);
  const [duracao, setDuracao] = useState(30);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const { error } = await (supabase as any).rpc("gerar_licencas", {
      _quantidade: quantidade,
      _duracao_dias: duracao,
      _revendedor_id: null,
    });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success(`${quantidade} licença(s) geradas`);
    onSaved();
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-strong sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Criar Nova Licença</DialogTitle>
          <DialogDescription>
            Gera chaves únicas no seu estoque. Vincule ao cliente ao cadastrá-lo.
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={submit}>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Quantidade">
              <Input
                type="number"
                min={1}
                max={500}
                value={quantidade}
                onChange={(e) => setQuantidade(parseInt(e.target.value) || 1)}
                autoFocus
              />
            </Field>
            <Field label="Duração (dias)">
              <Input
                type="number"
                min={1}
                value={duracao}
                onChange={(e) => setDuracao(parseInt(e.target.value) || 30)}
              />
            </Field>
          </div>
          <Field label="Observações">
            <Textarea placeholder="Notas..." rows={3} />
          </Field>

          <DialogFooter className="pt-2">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={busy}
              className="gradient-primary text-primary-foreground"
            >
              {busy ? <Loader2 className="size-4 animate-spin" /> : "Gerar chaves"}
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
  onSaved,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSaved: () => void;
}) {
  const [chave, setChave] = useState("");
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);

  async function pasteKey() {
    try {
      const text = await navigator.clipboard.readText();
      setChave(text.trim());
    } catch {
      toast.error("Não foi possível colar");
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!chave.trim() || !email.trim() || !nome.trim()) {
      toast.error("Preencha nome, e-mail e chave");
      return;
    }
    setBusy(true);
    try {
      // 1. Cria cliente (consome crédito) — se o revendedor não tiver, admin pode inserir direto
      const { data: cli, error: cliErr } = await (supabase as any)
        .from("clientes")
        .insert({ nome, email })
        .select("id")
        .single();
      if (cliErr) throw cliErr;

      // 2. Atribui a chave
      const { error: linkErr } = await (supabase as any).rpc(
        "atribuir_licenca_cliente",
        { _chave: chave.trim(), _cliente_id: cli.id, _email: email.trim() },
      );
      if (linkErr) throw linkErr;

      toast.success("Licença vinculada ao cliente");
      setChave("");
      setNome("");
      setEmail("");
      onSaved();
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err?.message ?? "Falha ao salvar");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-strong sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Vincular Chave ao Cliente</DialogTitle>
          <DialogDescription>
            Cole uma chave do estoque e vincule ao cliente.
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={submit}>
          <Field label="Chave">
            <div className="flex items-center gap-2">
              <Input
                value={chave}
                onChange={(e) => setChave(e.target.value)}
                placeholder="XXXXX-XXXXX-XXXXX-XXXXX"
                className="font-mono"
              />
              <button
                type="button"
                aria-label="Colar chave"
                onClick={pasteKey}
                className="grid size-9 place-items-center rounded-md border border-border/60 text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground"
              >
                <ClipboardPaste className="size-4" strokeWidth={2} />
              </button>
              <button
                type="button"
                aria-label="Copiar chave"
                onClick={() => {
                  if (chave) {
                    navigator.clipboard?.writeText(chave);
                    toast.success("Chave copiada");
                  }
                }}
                className="grid size-9 place-items-center rounded-md border border-border/60 text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground"
              >
                <Copy className="size-4" strokeWidth={2} />
              </button>
            </div>
          </Field>
          <Field label="Nome do cliente">
            <Input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex: João Silva" />
          </Field>
          <Field label="Email do cliente">
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="cliente@exemplo.com"
            />
          </Field>

          <DialogFooter className="pt-2">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={busy} className="gradient-primary text-primary-foreground">
              {busy ? <Loader2 className="size-4 animate-spin" /> : "Vincular"}
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

type EventoRow = {
  id: string;
  tipo: string;
  mensagem: string | null;
  device_id: string | null;
  created_at: string;
  metadata: Record<string, unknown> | null;
};

function HistoricoLicencaSheet({
  licenca,
  onOpenChange,
}: {
  licenca: LicencaRow | null;
  onOpenChange: (v: boolean) => void;
}) {
  const [events, setEvents] = useState<EventoRow[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!licenca) return;
    setLoading(true);
    (supabase as any)
      .from("licencas_eventos")
      .select("id, tipo, mensagem, device_id, created_at, metadata")
      .eq("licenca_id", licenca.id)
      .order("created_at", { ascending: false })
      .limit(100)
      .then(({ data }: { data: EventoRow[] | null }) => {
        setEvents(data ?? []);
        setLoading(false);
      });
  }, [licenca]);

  return (
    <Sheet open={!!licenca} onOpenChange={onOpenChange}>
      <SheetContent className="glass-strong w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Histórico da licença</SheetTitle>
          <SheetDescription className="font-mono text-xs">
            {licenca?.chave}
          </SheetDescription>
        </SheetHeader>
        <div className="mt-6 max-h-[calc(100vh-8rem)] overflow-auto pr-1">
          {loading ? (
            <div className="flex items-center justify-center py-10 text-sm text-muted-foreground">
              <Loader2 className="mr-2 size-4 animate-spin" /> Carregando...
            </div>
          ) : events.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">
              Nenhum evento registrado.
            </p>
          ) : (
            <ul className="space-y-3">
              {events.map((e) => (
                <li
                  key={e.id}
                  className="rounded-xl border border-border/50 bg-white/[0.02] p-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-primary">
                      {e.tipo}
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      {new Date(e.created_at).toLocaleString("pt-BR")}
                    </span>
                  </div>
                  {e.mensagem ? (
                    <p className="mt-1 text-sm text-foreground/85">{e.mensagem}</p>
                  ) : null}
                  {e.device_id ? (
                    <p className="mt-1 font-mono text-[11px] text-muted-foreground">
                      device: {e.device_id}
                    </p>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

function RenovarLicencaModal({
  licenca,
  onOpenChange,
  onSaved,
}: {
  licenca: LicencaRow | null;
  onOpenChange: (v: boolean) => void;
  onSaved: () => void;
}) {
  const [dias, setDias] = useState(30);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (licenca) setDias(licenca.duracao_dias ?? 30);
  }, [licenca]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!licenca) return;
    setBusy(true);
    const { error } = await (supabase as any).rpc("renovar_licenca", {
      _licenca_id: licenca.id,
      _dias: dias,
    });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success(`Licença renovada por ${dias} dias`);
    onSaved();
    onOpenChange(false);
  }

  return (
    <Dialog open={!!licenca} onOpenChange={onOpenChange}>
      <DialogContent className="glass-strong sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Renovar licença</DialogTitle>
          <DialogDescription className="font-mono text-xs">
            {licenca?.chave}
          </DialogDescription>
        </DialogHeader>
        <form className="space-y-4" onSubmit={submit}>
          <Field label="Dias a adicionar">
            <Input
              type="number"
              min={1}
              value={dias}
              onChange={(e) => setDias(parseInt(e.target.value) || 1)}
              autoFocus
            />
          </Field>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={busy}
              className="gradient-primary text-primary-foreground"
            >
              {busy ? <Loader2 className="size-4 animate-spin" /> : "Renovar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
