import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/**
 * Bootstrap: promove o usuário autenticado atual a admin
 * SOMENTE quando ainda não existe nenhum admin cadastrado.
 * Depois disso, essa função sempre falha, e novos admins só podem ser
 * criados por outro admin dentro do painel.
 */
export const claimInitialAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { count, error: countErr } = await supabaseAdmin
      .from("user_roles")
      .select("id", { count: "exact", head: true })
      .eq("role", "admin");

    if (countErr) throw new Error(countErr.message);
    if ((count ?? 0) > 0) {
      throw new Error("Já existe um administrador. Peça a ele para promover sua conta pelo painel.");
    }

    const { error: insErr } = await supabaseAdmin
      .from("user_roles")
      .insert({ user_id: context.userId, role: "admin" });

    if (insErr) throw new Error(insErr.message);
    return { ok: true as const };
  });
