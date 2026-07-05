import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { KeyRound, MessageCircle, Search, ShieldCheck, MoreHorizontal } from "lucide-react";

import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/clientes")({
  head: () => ({
    meta: [
      { title: "Clientes — MR sem limites" },
      { name: "description", content: "Clientes vinculados às suas licenças." },
    ],
  }),
  component: ClientesPage,
});

type Client = {
  name: string;
  email: string;
  licencas: number;
  ativas: number;
  mensagens: number;
  color: string;
};

const clients: Client[] = [
  {
    name: "estoque",
    email: "estoque",
    licencas: 1,
    ativas: 1,
    mensagens: 0,
    color: "var(--brand-orange)",
  },
];

const gradientPool = [
  ["var(--brand-magenta)", "var(--brand-orange)"],
  ["var(--brand-violet)", "var(--brand-blue)"],
  ["var(--brand-blue)", "var(--brand-cyan)"],
  ["var(--brand-emerald)", "var(--brand-cyan)"],
  ["var(--brand-pink)", "var(--brand-magenta)"],
];

function ClientesPage() {
  const [query, setQuery] = useState("");
  const filtered = clients.filter((c) =>
    !query.trim() ||
    c.email.toLowerCase().includes(query.toLowerCase()) ||
    c.name.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div className="mx-auto w-full max-w-[1280px] space-y-6">
      {/* Header */}
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.22em] gradient-text-warm">
          Gestão
        </p>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight md:text-5xl">
          Clientes
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Clientes vinculados às suas licenças
        </p>
      </header>

      {/* Search */}
      <label className="glass relative flex h-12 w-full items-center rounded-2xl pl-11 pr-4">
        <Search className="absolute left-4 size-4 text-muted-foreground" strokeWidth={2} aria-hidden />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por email..."
          className="h-full w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground/70"
        />
      </label>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="glass rounded-2xl px-6 py-14 text-center text-sm text-muted-foreground">
          Nenhum cliente encontrado.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((c, i) => (
            <ClientCard key={c.email} client={c} gradient={gradientPool[i % gradientPool.length]} />
          ))}
        </div>
      )}
    </div>
  );
}

function ClientCard({ client, gradient }: { client: Client; gradient: readonly string[] }) {
  const initial = client.name.charAt(0).toUpperCase();
  return (
    <article
      className={cn(
        "glass group relative overflow-hidden rounded-2xl p-5 transition-all duration-300",
        "hover:-translate-y-0.5",
      )}
      style={{
        boxShadow: "var(--shadow-soft)",
      }}
    >
      {/* Ambient glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 -top-16 size-40 rounded-full opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-60"
        style={{ background: `linear-gradient(135deg, ${gradient[0]}, ${gradient[1]})` }}
      />

      <div className="relative flex items-start gap-4">
        <div
          className="relative grid size-14 shrink-0 place-items-center rounded-2xl text-xl font-semibold text-white"
          style={{
            background: `linear-gradient(135deg, ${gradient[0]} 0%, ${gradient[1]} 100%)`,
            boxShadow: `0 0 24px -4px color-mix(in oklab, ${gradient[0]} 65%, transparent), inset 0 1px 0 oklch(1 0 0 / 25%)`,
          }}
        >
          {initial}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-base font-semibold text-foreground">{client.name}</h3>
          <p className="mt-0.5 truncate text-xs text-muted-foreground">{client.email}</p>
        </div>
        <button
          type="button"
          aria-label="Mais opções"
          className="rounded-md p-1.5 text-muted-foreground opacity-0 transition-all hover:bg-white/5 hover:text-foreground group-hover:opacity-100"
        >
          <MoreHorizontal className="size-4" strokeWidth={2} />
        </button>
      </div>

      <div className="relative mt-5 flex items-center gap-4 border-t border-border/50 pt-4 text-xs">
        <Stat icon={KeyRound} value={client.licencas} label="licença(s)" color="var(--brand-violet)" />
        <Stat icon={ShieldCheck} value={client.ativas} label="ativa(s)" color="var(--brand-emerald)" highlight />
        <Stat icon={MessageCircle} value={client.mensagens} label="" color="var(--brand-blue)" />
      </div>
    </article>
  );
}

function Stat({
  icon: Icon,
  value,
  label,
  color,
  highlight,
}: {
  icon: typeof KeyRound;
  value: number;
  label: string;
  color: string;
  highlight?: boolean;
}) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <Icon
        className="size-3.5"
        strokeWidth={2}
        style={{ color }}
      />
      <span className={cn("font-semibold", highlight ? "text-foreground" : "text-foreground/85")}
        style={highlight ? { color } : undefined}
      >
        {value}
      </span>
      {label && <span className="text-muted-foreground">{label}</span>}
    </span>
  );
}
