import { REMOTE_ACCESS_PRESET } from "./remote-access";

// One catalog supplies creation choices, duration cards and filters.
export const LICENSE_DURATIONS = [
  { id: "teste", label: "Teste 1 hora", kind: "teste", minutos: 60 },
  { id: "1d", label: "1 dia", kind: "teste", minutos: 1440, dias: 1 },
  { id: "2d", label: "2 dias", kind: "teste", minutos: 2880, dias: 2 },
  { id: "3d", label: "3 dias", kind: "teste", minutos: 4320, dias: 3 },
  { id: "7d", label: "7 dias", kind: "premium", dias: 7 },
  { id: "15d", ...REMOTE_ACCESS_PRESET },
  { id: "30d", label: "30 dias", kind: "premium", dias: 30 },
  { id: "60d", label: "60 dias", kind: "premium", dias: 60 },
  { id: "90d", label: "90 dias", kind: "premium", dias: 90 },
  { id: "180d", label: "180 dias", kind: "premium", dias: 180 },
  { id: "1ano", label: "1 ano", kind: "premium", dias: 365 },
] as const;

export type DurationBucket = (typeof LICENSE_DURATIONS)[number]["id"] | "outros";
export type Bucket = "todos" | DurationBucket;
type DurationRow = {
  duracao_dias: number | null;
  trial_duracao_minutos: number | null;
  tipo: string | null;
};

export function bucketOfRow(row: DurationRow): DurationBucket {
  // A one-hour trial stores duracao_dias=1; all day plans use the saved days.
  if (row.tipo?.toLowerCase() === "teste" && row.trial_duracao_minutos === 60) return "teste";
  const duration = LICENSE_DURATIONS.find((entry) => "dias" in entry && entry.dias === row.duracao_dias);
  return duration?.id ?? "outros";
}

export function countDurationBuckets(rows: readonly DurationRow[]): Record<Bucket, number> {
  const counts: Record<Bucket, number> = {
    todos: rows.length, teste: 0, "1d": 0, "2d": 0, "3d": 0, "7d": 0,
    "15d": 0, "30d": 0, "60d": 0, "90d": 0, "180d": 0, "1ano": 0, outros: 0,
  };
  for (const row of rows) counts[bucketOfRow(row)] += 1;
  return counts;
}