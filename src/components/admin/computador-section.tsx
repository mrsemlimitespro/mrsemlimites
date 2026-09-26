import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

function fmt(v?: string | null) {
  if (!v) return "—";
  const d = new Date(v);
  return isNaN(d.getTime()) ? String(v) : d.toLocaleString("pt-BR");
}

export function ComputadorSection({ licencaId }: { licencaId: string }) {
  const qc = useQueryClient();
  const [confirm, setConfirm] = useState(false);
  const q = useQuery({
    queryKey: ["licenca-computador", licencaId],
    queryFn: async () => {
      const [{ data: lic }, { data: devs }] = await Promise.all([
        (supabase as any)
          .from("licencas")
          .select("device_id, device_vinculado_em, ultimo_acesso")
          .eq("id", licencaId)
          .maybeSingle(),
        (supabase as any)
          .from("licenca_dispositivos")
          .select("device_id, device_nome, primeiro_acesso, ultimo_acesso")
          .eq("licenca_id", licencaId)
          .order("ultimo_acesso", { ascending: false }),
      ]);
      const list: any[] = devs ?? [];
      const deviceId: string | null = lic?.device_id ?? list[0]?.device_id ?? null;
      if (!deviceId) return null;
      const m = list.find((x) => x.device_id === deviceId) ?? list[0] ?? null;
      return {
        deviceId,
        nome: (m?.device_nome as string | null) ?? null,
        desde: lic?.device_vinculado_em ?? m?.primeiro_acesso ?? null,
        ultimo: lic?.ultimo_acesso ?? m?.ultimo_acesso ?? null,
      };
    },
  });

  const soltar = useMutation({
    mutationFn: async () => {
      const { error } = await (supabase as any).rpc("resetar_device_licenca", {
        _licenca_id: licencaId,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Computador solto. A chave continua válida.");
      setConfirm(false);
      qc.invalidateQueries();
    },
    onError: (e: any) => toast.error(e?.message ?? "Não foi possível soltar."),
  });

  const c = q.data;
  return (
    <div className="space-y-2 rounded-xl border border-border bg-muted/20 p-4">
      <div className="text-sm font-semibold">Computador</div>
      {q.isLoading ? (
        <Loader2 className="size-4 animate-spin text-muted-foreground" />
      ) : !c ? (
        <p className="text-sm text-muted-foreground">Nenhum computador vinculado</p>
      ) : (
        <>
          <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
            <dt className="text-muted-foreground">Aparelho</dt>
            <dd>{c.nome ?? "—"}</dd>
            <dt className="text-muted-foreground">Identificador</dt>
            <dd className="font-mono text-xs" title={c.deviceId}>
              {c.deviceId.length > 16 ? c.deviceId.slice(0, 16) + "…" : c.deviceId}
            </dd>
            <dt className="text-muted-foreground">Preso desde</dt>
            <dd>{fmt(c.desde)}</dd>
            <dt className="text-muted-foreground">Último acesso</dt>
            <dd>{fmt(c.ultimo)}</dd>
          </dl>
          <Button type="button" variant="destructive" size="sm" onClick={() => setConfirm(true)}>
            Soltar este computador
          </Button>
        </>
      )}
      <AlertDialog open={confirm} onOpenChange={setConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Soltar este computador?</AlertDialogTitle>
            <AlertDialogDescription>
              O computador atual vai perder o acesso. Na próxima vez que o cliente abrir a
              extensão, ela vai pedir a chave de novo — e vai funcionar, prendendo no computador
              em que ele estiver.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={soltar.isPending}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                soltar.mutate();
              }}
              disabled={soltar.isPending}
            >
              {soltar.isPending ? <Loader2 className="size-4 animate-spin" /> : "Soltar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
