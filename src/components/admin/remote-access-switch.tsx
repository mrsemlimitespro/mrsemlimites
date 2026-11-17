import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { REMOTE_ACCESS_PRODUCT, remoteAccessEnabled } from "@/lib/remote-access";

export function RemoteAccessSwitch({ licencaId, disabled = false }: { licencaId: string; disabled?: boolean }) {
  const [enabled, setEnabled] = useState(false);
  const [busy, setBusy] = useState(true);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    let alive = true;
    setBusy(true);
    setFailed(false);
    setEnabled(false);
    void supabase.from("licenca_produto_ativo").select("ativo")
      .eq("licenca_id", licencaId).eq("produto", REMOTE_ACCESS_PRODUCT).maybeSingle()
      .then(({ data, error }) => {
        if (!alive) return;
        setFailed(Boolean(error));
        setEnabled(remoteAccessEnabled(data));
        setBusy(false);
        if (error) toast.error(error.message);
      });
    return () => { alive = false; };
  }, [licencaId]);

  async function save(ativo: boolean) {
    setBusy(true);
    const { error } = await supabase.rpc("set_licenca_produto_ativo", {
      _licenca_id: licencaId, _produto: REMOTE_ACCESS_PRODUCT, _ativo: ativo,
    });
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    setEnabled(ativo);
    toast.success("MR Acesso Remoto atualizado");
  }
  return <label className="flex items-center justify-between gap-3 text-sm">
    <span>MR Acesso Remoto</span>
    <Switch aria-label="MR Acesso Remoto nesta licença" checked={enabled}
      disabled={disabled || busy || failed} onCheckedChange={(value) => void save(value)} />
  </label>;
}