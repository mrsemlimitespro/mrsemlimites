/**
 * Normaliza uma chave de licença para comparação e armazenamento.
 */
export function normalizeLicenseKey(input: string | null | undefined): string {
  if (!input) return "";
  return String(input)
    .normalize("NFKC")
    .replace(/[\u200B-\u200D\uFEFF]/g, "") // Unicode invisível
    .replace(/[‐‑‒–—−]/g, "-") // Hífens Unicode para ASCII
    .trim()
    .toUpperCase();
}

/**
 * Valida o formato de uma chave de licença.
 * Aceita exclusivamente o formato MR: MR-XXXX-XXXX-XXXX
 */
export function isValidLicenseFormat(key: string): boolean {
  return /^MR-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(key);
}

/**
 * Regex para o gerador MR produzir exatamente MR-XXXX-XXXX-XXXX
 */
export const MR_KEY_REGEX = /^MR-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/;

