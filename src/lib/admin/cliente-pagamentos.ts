/**
 * Camada única para "pagamentos de um cliente".
 *
 * ⚠️  FALLBACK TEMPORÁRIO  ⚠️
 * Hoje `payment_transactions` NÃO possui a coluna `cliente_id`.
 * Enquanto isso, vinculamos pagamentos ao cliente por `cliente_nome`
 * (ILIKE exato ao nome cadastrado).
 *
 * Quando `payment_transactions.cliente_id` existir, a migração é:
 *   1. Ativar `USES_CLIENTE_ID = true` abaixo.
 *   2. As duas funções passam a filtrar por `cliente_id`.
 *   3. NENHUMA tela precisa ser alterada — todas consomem estas funções.
 *
 * NÃO USE `cliente_nome` FORA DESTE ARQUIVO.
 */
import { supabase } from "@/integrations/supabase/client";

// ⚠️ FALLBACK FLAG — trocar para `true` quando a coluna existir.
export const USES_CLIENTE_ID = false;

export type ClientePagamento = {
  id: string;
  gateway_slug: string | null;
  valor: number | null;
  moeda: string | null;
  status: string | null;
  metodo: string | null;
  created_at: string;
  aprovado_em: string | null;
};

const APROVADO = ["approved", "pago", "paid", "aprovado"];

export type ClienteRef = { id: string; nome: string | null; email: string | null };

const COLUMNS =
  "id, gateway_slug, valor, moeda, status, metodo, created_at, aprovado_em";

/** Pagamentos de UM cliente. */
export async function fetchPagamentosByCliente(
  cliente: ClienteRef,
): Promise<ClientePagamento[]> {
  const q = (supabase as any).from("payment_transactions").select(COLUMNS);

  if (USES_CLIENTE_ID) {
    // Caminho definitivo (a ser ativado quando a coluna existir).
    const { data, error } = await q
      .eq("cliente_id", cliente.id)
      .order("created_at", { ascending: false });
    if (error) return [];
    return (data ?? []) as ClientePagamento[];
  }

  // ⚠️ FALLBACK — remover quando USES_CLIENTE_ID = true.
  const nome = (cliente.nome ?? "").trim();
  if (!nome) return [];
  const { data, error } = await q
    .ilike("cliente_nome", nome)
    .order("created_at", { ascending: false });
  if (error) return [];
  return (data ?? []) as ClientePagamento[];
}

/** Mapa `cliente.id -> total gasto` para uma lista de clientes. */
export async function fetchGastoMapForClientes(
  clientes: ClienteRef[],
): Promise<Record<string, number>> {
  if (clientes.length === 0) return {};

  if (USES_CLIENTE_ID) {
    const ids = clientes.map((c) => c.id);
    const { data, error } = await (supabase as any)
      .from("payment_transactions")
      .select("cliente_id, valor, status")
      .in("cliente_id", ids)
      .in("status", APROVADO);
    if (error) return {};
    const map: Record<string, number> = {};
    for (const r of (data ?? []) as Array<{
      cliente_id: string;
      valor: number | null;
    }>) {
      map[r.cliente_id] = (map[r.cliente_id] ?? 0) + Number(r.valor ?? 0);
    }
    return map;
  }

  // ⚠️ FALLBACK — agrega por nome (case-insensitive) e reprojeta para cliente.id.
  const { data, error } = await (supabase as any)
    .from("payment_transactions")
    .select("cliente_nome, valor, status")
    .in("status", APROVADO);
  if (error) return {};

  const porNome: Record<string, number> = {};
  for (const r of (data ?? []) as Array<{
    cliente_nome: string | null;
    valor: number | null;
  }>) {
    const k = (r.cliente_nome ?? "").trim().toLowerCase();
    if (!k) continue;
    porNome[k] = (porNome[k] ?? 0) + Number(r.valor ?? 0);
  }
  const out: Record<string, number> = {};
  for (const c of clientes) {
    const k = (c.nome ?? "").trim().toLowerCase();
    if (k && porNome[k] != null) out[c.id] = porNome[k];
  }
  return out;
}

export function totalAprovado(ps: ClientePagamento[]): number {
  return ps
    .filter((p) => APROVADO.includes((p.status ?? "").toLowerCase()))
    .reduce((s, p) => s + Number(p.valor ?? 0), 0);
}
