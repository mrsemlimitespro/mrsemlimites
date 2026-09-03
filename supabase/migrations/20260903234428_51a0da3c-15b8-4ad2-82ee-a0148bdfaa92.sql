CREATE OR REPLACE FUNCTION public.ranking_revendedores_semanal()
RETURNS TABLE (
  posicao bigint,
  revendedor_id uuid,
  nome text,
  vendas bigint,
  receita numeric
)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path TO 'public'
AS $function$
  SELECT
    row_number() OVER (
      ORDER BY COALESCE(count(pt.id) FILTER (WHERE pt.status = 'aprovado'), 0) DESC,
               COALESCE(sum(pt.valor) FILTER (WHERE pt.status = 'aprovado'), 0) DESC,
               r.nome ASC
    ) AS posicao,
    r.id AS revendedor_id,
    r.nome,
    COALESCE(count(pt.id) FILTER (WHERE pt.status = 'aprovado'), 0)::bigint AS vendas,
    COALESCE(sum(pt.valor) FILTER (WHERE pt.status = 'aprovado'), 0)::numeric AS receita
  FROM public.revendedores r
  LEFT JOIN public.payment_transactions pt
    ON pt.revendedor_id = r.id
   AND pt.created_at >= date_trunc('week', now())
   AND pt.created_at < date_trunc('week', now()) + interval '7 days'
  WHERE auth.uid() IS NOT NULL
    AND r.status = 'ativo'
    AND r.deleted_at IS NULL
  GROUP BY r.id, r.nome
  ORDER BY vendas DESC, receita DESC, r.nome ASC
  LIMIT 100;
$function$;