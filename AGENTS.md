<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Auth-state callbacks must return synchronously and defer database reads to a later task, because awaiting a read while the auth session lock is held can deadlock all panel requests.
- License loading uses a single 15-second deadline spanning session restoration and the authenticated query, so a stalled session cannot leave the list loading indefinitely.
- Remote Access entitlement uses licenca_produto_ativo via the existing audited RPC; missing rows deny access, leaving legacy product flags and v17 authorization unchanged.
- License creation presets, duration cards and filters share one browser-safe catalog and classify saved day durations independently of activation dates; the one-hour trial is the sole minute-based exception.
