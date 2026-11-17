export const REMOTE_ACCESS_PRODUCT = "mr-acesso-remoto";
export const REMOTE_ACCESS_PRESET = { label: "15 dias", kind: "premium", dias: 15 } as const;
export function remoteAccessEnabled(row: { ativo: boolean } | null | undefined): boolean {
  return row?.ativo === true;
}