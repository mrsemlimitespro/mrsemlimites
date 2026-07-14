/**
 * Impersonation (modo visualização do Admin).
 *
 * Somente client-side. NÃO altera sessão. NÃO altera role. NÃO grava nada.
 * Guardamos no sessionStorage o "alvo" que o admin está visualizando —
 * a UI decide quais botões/ações desabilitar quando `active === true`.
 *
 * Este módulo é puramente frontend / UX. Nenhuma API do backend é chamada,
 * nenhum token é alterado, e o admin permanece logado como admin.
 */

export type ImpersonationTargetKind = "revendedor" | "cliente";

export type ImpersonationState = {
  kind: ImpersonationTargetKind;
  id: string;
  name: string;
  email: string;
  /** URL para retornar ao painel administrativo (com filtros/paginação). */
  returnTo: string;
  startedAt: number;
};

const KEY = "mr:impersonation:v1";
const EVENT = "mr:impersonation:changed";

function isBrowser() {
  return typeof window !== "undefined";
}

export function getImpersonation(): ImpersonationState | null {
  if (!isBrowser()) return null;
  try {
    const raw = window.sessionStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ImpersonationState;
    if (!parsed?.kind || !parsed?.id) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function setImpersonation(state: Omit<ImpersonationState, "startedAt">) {
  if (!isBrowser()) return;
  const full: ImpersonationState = { ...state, startedAt: Date.now() };
  window.sessionStorage.setItem(KEY, JSON.stringify(full));
  window.dispatchEvent(new CustomEvent(EVENT));
}

export function clearImpersonation() {
  if (!isBrowser()) return;
  window.sessionStorage.removeItem(KEY);
  window.dispatchEvent(new CustomEvent(EVENT));
}

export function subscribeImpersonation(cb: () => void): () => void {
  if (!isBrowser()) return () => {};
  const handler = () => cb();
  window.addEventListener(EVENT, handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener(EVENT, handler);
    window.removeEventListener("storage", handler);
  };
}
