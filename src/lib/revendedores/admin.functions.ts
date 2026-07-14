/**
 * Server functions administrativas para gestão de revendedores.
 *
 * Fluxos suportados:
 *  - createRevendedorManual: cria auth.user (Admin API) + registro em revendedores.
 *    Opcionalmente envia Magic Link imediatamente e enfileira email de boas-vindas.
 *  - blockRevendedor / unblockRevendedor
 *  - setValidadeRevendedor (data específica ou null = vitalício)
 *  - renovarValidade (adiciona N dias)
 *  - tornarVitalicio (limpa expira_em)
 *  - sendMagicLinkRevendedor: reemissão do link + email boas-vindas
 *
 * Todas as funções exigem role admin (via `has_role`). Auditoria via `log_audit`.
 * Reutiliza o mesmo helper de provisão usado pelo webhook Kiwify para
 * garantir 100% de compatibilidade entre fluxo automático e manual.
 */
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { assertAdmin } from "@/lib/premium-packs/_guard";

const emailSchema = z
  .string()
  .email()
  .max(320)
  .transform((v) => v.toLowerCase().trim());

const nomeSchema = z.string().trim().min(2).max(120);

// ------------------------------ Criar manual ------------------------------
export const createRevendedorManual = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        nome: nomeSchema,
        email: emailSchema,
        whatsapp: z.string().trim().max(40).optional().nullable(),
        empresa: z.string().trim().max(160).optional().nullable(),
        cpf_cnpj: z.string().trim().max(32).optional().nullable(),
        observacoes: z.string().max(1000).optional().nullable(),
        status: z.enum(["ativo", "pendente", "inativo"]).default("ativo"),
        validade_dias: z
          .number()
          .int()
          .min(1)
          .max(3650)
          .optional()
          .nullable(),
        vitalicio: z.boolean().optional().default(false),
        enviarMagicLink: z.boolean().optional().default(true),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // 1. Localiza/cria auth user
    const admin = (supabaseAdmin as unknown as { auth: { admin: any } }).auth.admin;
    let userId: string | null = null;
    try {
      const { data: list } = await admin.listUsers({ page: 1, perPage: 200 });
      const existing = list?.users?.find(
        (u: any) => (u.email ?? "").toLowerCase() === data.email,
      );
      if (existing) {
        userId = existing.id;
      } else {
        const { data: created, error: cErr } = await admin.createUser({
          email: data.email,
          email_confirm: true,
          user_metadata: { nome: data.nome, origem: "admin-manual" },
        });
        if (cErr) throw new Error(cErr.message);
        userId = created?.user?.id ?? null;
      }
    } catch (e: any) {
      throw new Error(`auth-admin: ${e?.message ?? e}`);
    }

    // 2. Calcula expira_em
    let expira_em: string | null = null;
    if (!data.vitalicio && data.validade_dias) {
      expira_em = new Date(
        Date.now() + data.validade_dias * 86400_000,
      ).toISOString();
    }

    // 3. Upsert revendedor (por email)
    const { data: existente } = await supabaseAdmin
      .from("revendedores")
      .select("id")
      .eq("email", data.email)
      .maybeSingle();

    let revendedorId: string;
    if (existente?.id) {
      const { error: uErr } = await supabaseAdmin
        .from("revendedores")
        .update({
          nome: data.nome,
          auth_user_id: userId,
          whatsapp: data.whatsapp ?? null,
          empresa: data.empresa ?? null,
          cpf_cnpj: data.cpf_cnpj ?? null,
          observacoes: data.observacoes ?? null,
          status: data.status,
          bloqueado: data.status === "inativo",
          plano_expira_em: expira_em,
        } as never)
        .eq("id", existente.id);
      if (uErr) throw new Error(uErr.message);
      revendedorId = existente.id;
    } else {
      const { data: novo, error: iErr } = await supabaseAdmin
        .from("revendedores")
        .insert({
          nome: data.nome,
          email: data.email,
          auth_user_id: userId,
          whatsapp: data.whatsapp ?? null,
          empresa: data.empresa ?? null,
          cpf_cnpj: data.cpf_cnpj ?? null,
          observacoes: data.observacoes ?? null,
          status: data.status,
          bloqueado: data.status === "inativo",
          plano_expira_em: expira_em,
          saldo_creditos: 0,
        } as never)
        .select("id")
        .single();
      if (iErr) throw new Error(iErr.message);
      revendedorId = novo.id;
    }

    // 4. Auditoria
    await supabaseAdmin.rpc("log_audit", {
      _acao: "criar_revendedor_manual",
      _entidade: "revendedor",
      _entidade_id: revendedorId,
      _antes: null,
      _depois: null,
      _metadata: {
        email: data.email,
        vitalicio: !!data.vitalicio,
        validade_dias: data.validade_dias ?? null,
      } as never,
    } as never);

    // 5. Magic link + email (opcional)
    let magicLink: string | null = null;
    if (data.enviarMagicLink) {
      const { provisionRevendedor } = await import(
        "@/lib/revendedores/provision.server"
      );
      const res = await provisionRevendedor({
        email: data.email,
        nome: data.nome,
        amount: null,
        externalId: null,
      });
      magicLink = res.magicLink ?? null;
    }

    return { ok: true, revendedorId, magicLink };
  });

// ---------------------------- Bloquear / Desbloquear ----------------------------
export const setRevendedorBloqueio = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        id: z.string().uuid(),
        bloqueado: z.boolean(),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("revendedores")
      .update({
        bloqueado: data.bloqueado,
        status: data.bloqueado ? "inativo" : "ativo",
      })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    await supabaseAdmin.rpc("log_audit", {
      _acao: data.bloqueado ? "bloquear_revendedor" : "desbloquear_revendedor",
      _entidade: "revendedor",
      _entidade_id: data.id,
      _antes: null,
      _depois: null,
      _metadata: {} as never,
    } as never);
    return { ok: true };
  });

// ------------------------------- Validade ---------------------------------
export const setRevendedorValidade = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        id: z.string().uuid(),
        // dias null = vitalício (limpa expira_em)
        dias: z.number().int().min(1).max(3650).nullable(),
        modo: z.enum(["definir", "adicionar"]).default("definir"),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    let novaData: string | null = null;
    if (data.dias === null) {
      novaData = null; // vitalício
    } else if (data.modo === "adicionar") {
      const { data: atual } = await supabaseAdmin
        .from("revendedores")
        .select("plano_expira_em")
        .eq("id", data.id)
        .maybeSingle();
      const base = atual?.plano_expira_em
        ? Math.max(new Date(atual.plano_expira_em).getTime(), Date.now())
        : Date.now();
      novaData = new Date(base + data.dias * 86400_000).toISOString();
    } else {
      novaData = new Date(Date.now() + data.dias * 86400_000).toISOString();
    }

    const { error } = await supabaseAdmin
      .from("revendedores")
      .update({ plano_expira_em: novaData })
      .eq("id", data.id);
    if (error) throw new Error(error.message);

    await supabaseAdmin.rpc("log_audit", {
      _acao:
        data.dias === null
          ? "vitalicio_revendedor"
          : data.modo === "adicionar"
            ? "renovar_revendedor"
            : "definir_validade_revendedor",
      _entidade: "revendedor",
      _entidade_id: data.id,
      _antes: null,
      _depois: null,
      _metadata: { dias: data.dias, modo: data.modo } as never,
    } as never);

    return { ok: true, plano_expira_em: novaData };
  });

// ------------------------- Reenviar magic link + email -------------------------
export const resendMagicLinkRevendedor = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: rev } = await supabaseAdmin
      .from("revendedores")
      .select("id,email,nome")
      .eq("id", data.id)
      .maybeSingle();
    if (!rev?.email) throw new Error("Revendedor sem email cadastrado.");

    // Zera controle de deduplicação para permitir novo envio
    await supabaseAdmin
      .from("email_queue")
      .update({ status: "canceled" } as never)
      .eq("template_chave", "revendedor.boas-vindas")
      .eq("destinatario", rev.email.toLowerCase())
      .in("status", ["pending", "sent"]);

    const { provisionRevendedor } = await import(
      "@/lib/revendedores/provision.server"
    );
    const res = await provisionRevendedor({
      email: rev.email,
      nome: rev.nome ?? null,
      amount: null,
      externalId: null,
    });

    await supabaseAdmin.rpc("log_audit", {
      _acao: "reenviar_magic_link",
      _entidade: "revendedor",
      _entidade_id: data.id,
      _antes: null,
      _depois: null,
      _metadata: { email: rev.email } as never,
    } as never);

    return { ok: res.ok, magicLink: res.magicLink ?? null };
  });
