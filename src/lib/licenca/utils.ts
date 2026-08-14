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
 * Aceita:
 * - Formato MR: MR-XXXX-XXXX-XXXX (Regex: /^MR-[A-Z0-9]{4}(?:-[A-Z0-9]{4}){2}$/)
 * - Formato Tradicional: XXXXX-XXXXX-XXXXX-XXXXX (Regex: /^[A-Z0-9]{5}(?:-[A-Z0-9]{5}){3}$/)
 */
export function isValidLicenseFormat(key: string): boolean {
  const mrRegex = /^MR-[A-Z0-9]{4}(?:-[A-Z0-9]{4}){2}$/;
  const traditionalRegex = /^[A-Z0-9]{5}(?:-[A-Z0-9]{5}){3}$/;
  return mrRegex.test(key) || traditionalRegex.test(key);
}

/**
 * Regex para o gerador MR produzir exatamente MR-XXXX-XXXX-XXXX
 * Regex para o gerador tradicional produzir exatamente XXXXX-XXXXX-XXXXX-XXXXX
 */
export const MR_KEY_REGEX = /^MR-[A-Z0-9]{4}(?:-[A-Z0-9]{4}){2}$/;
export const TRADITIONAL_KEY_REGEX = /^[A-Z0-9]{5}(?:-[A-Z0-9]{5}){3}$/;
