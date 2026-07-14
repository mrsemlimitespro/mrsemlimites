import type { EmailProvider } from "./types";
import { makeResendProvider } from "./resend";

/**
 * Seleciona o provider de email ativo com base em process.env.EMAIL_PROVIDER
 * (default "resend"). Stubs futuros para smtp/sendgrid/ses/mailgun podem ser
 * plugados aqui sem alterar chamadores.
 *
 * Retorna null quando nenhum provider está configurado — worker deixa emails
 * na fila com status pending sem falhar a aplicação.
 */
export function getEmailProvider(): EmailProvider | null {
  const kind = (process.env.EMAIL_PROVIDER || "resend").toLowerCase();
  switch (kind) {
    case "resend": {
      const key = process.env.RESEND_API_KEY;
      if (!key) return null;
      return makeResendProvider(key);
    }
    // Placeholders — implementar quando necessário.
    case "smtp":
    case "sendgrid":
    case "ses":
    case "mailgun":
    default:
      return null;
  }
}

export type { EmailProvider, EmailMessage, EmailSendResult } from "./types";
