/** Rejeita se a promessa não terminar no prazo, para nenhuma tela girar para sempre. */
export function withTimeout<T>(p: PromiseLike<T>, ms: number, msg = "tempo esgotado"): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const t = setTimeout(() => reject(new Error(msg)), ms);
    Promise.resolve(p).then(
      (v) => {
        clearTimeout(t);
        resolve(v);
      },
      (e) => {
        clearTimeout(t);
        reject(e);
      },
    );
  });
}

export const LOGIN_TIMEOUT_MSG =
  "O servidor demorou para responder. Verifique sua internet e tente de novo.";

export function loginErrorPt(msg: string): string {
  if (/invalid login credentials/i.test(msg))
    return "E-mail ou senha incorretos. Use “Esqueci minha senha” para redefinir.";
  if (/email not confirmed/i.test(msg)) return "E-mail ainda não confirmado.";
  if (/tempo esgotado|timeout/i.test(msg)) return LOGIN_TIMEOUT_MSG;
  if (/failed to fetch|network/i.test(msg))
    return "Sem conexão com o servidor. Verifique sua internet e tente de novo.";
  return msg || "Não foi possível entrar. Tente de novo.";
}
