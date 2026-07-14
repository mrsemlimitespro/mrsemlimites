import type { EmailProvider } from "./types";
import { makeMockEmailProvider } from "./mock";
import { makeResendProvider } from "./resend";

/**
 * Seleciona o provider de email ativo.
 *
 * Ordem de decisão:
 *   1. process.env.EMAIL_PROVIDER define explicitamente o adapter
 *      (`resend`, `mock`, `smtp`, `sendgrid`, `ses`, `mailgun`).
 *   2. Se não definido, cai no MockEmailProvider — permite que todo o fluxo
 *      (fila, triggers, logs, portal, admin) funcione sem credenciais reais.
 *
 * Adicionar um provider novo é isolado: implementar o contrato
 * `EmailProvider` num arquivo próprio e ligá-lo aqui. Nenhuma outra parte
 * do sistema precisa mudar (Adapter Pattern).
 */
export function getEmailProvider(): EmailProvider {
  const kind = (process.env.EMAIL_PROVIDER || "mock").toLowerCase();

  switch (kind) {
    case "resend": {
      const key = process.env.RESEND_API_KEY;
      if (!key) return makeMockEmailProvider();
      return makeResendProvider(key);
    }
    // Placeholders — plugar quando o cliente fornecer as credenciais.
    case "smtp":
    case "sendgrid":
    case "ses":
    case "mailgun":
      return makeMockEmailProvider();

    case "mock":
    default:
      return makeMockEmailProvider();
  }
}

export type { EmailProvider, EmailMessage, EmailSendResult } from "./types";
