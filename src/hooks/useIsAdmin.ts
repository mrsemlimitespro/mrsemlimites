import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const ADMIN_EMAIL_PREFIX = "rogeriocftv.mr";

export function useIsAdmin() {
  const [isAdmin, setIsAdmin] = useState(false);
  useEffect(() => {
    let mounted = true;
    const check = (session: { user?: { email?: string | null } | null } | null) => {
      if (!mounted) return;
      const email = (session?.user?.email || "").toLowerCase();
      const match =
        email.startsWith(ADMIN_EMAIL_PREFIX + "@") || email.split("@")[0] === ADMIN_EMAIL_PREFIX;
      setIsAdmin(match);
    };
    supabase.auth.getSession().then(({ data }) => check(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => check(s));
    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);
  return isAdmin;
}
