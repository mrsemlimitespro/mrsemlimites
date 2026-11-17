import { withTimeout } from "@/lib/with-timeout";

/** One deadline covers both session restoration and the authenticated query. */
export async function loadWithLicenseSession<T>(
  getSession: () => PromiseLike<{ data: { session: unknown }; error?: { message: string } | null }>,
  read: () => PromiseLike<T>,
): Promise<T | null> {
  return withTimeout(
    (async () => {
      const { data, error } = await getSession();
      if (error) throw new Error(error.message);
      if (!data.session) return null;
      return await read();
    })(),
    15_000,
    "Tempo esgotado ao carregar licenças",
  );
}