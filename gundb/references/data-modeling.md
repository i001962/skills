# GunDB data modeling

Consult the official [FAQ](https://gun.eco/docs/FAQ) and [Core API](https://gun.eco/docs/API) for graph terminology and installed-version API behavior. The FAQ specifically recommends narrow, specialized indexes rather than SQL-style scans over a huge graph.

## Choose node identities first

Use a stable, opaque ID for each durable entity. A simple shape is:

```js
const task = gun.get(`tasks/${taskId}`);
task.put({ title, ownerPub, createdAt });
gun.get(`users/${ownerPub}/tasks`).get(taskId).put(task);
```

Treat the first path as the canonical entity and the second as a discoverability index. If an index must be protected, write it under the relevant user's namespace or encrypt its contents; a path name alone is not authorization.

## Represent relationships as links or keyed sets

- Use a link for one-to-one ownership/reference.
- Use a keyed set (`get(id).put(link)`) for membership. It makes adds idempotent and avoids array-index conflicts.
- Store mutable fields as separate graph fields so concurrent edits have narrow conflict surfaces.
- Prefer explicit `status` or tombstone fields when consumers need an auditable removal state. Gun's [tombstone guidance](https://gun.eco/docs/FAQ#how-do-i-delete-data) uses `put(null)` for a distributed deletion signal; do not promise erasure merely because a value is overwritten or nulled, since replicated peers may retain history.

## Design for merge semantics

Gun is eventually consistent and resolves concurrent field updates rather than providing multi-record transactions. The official [FAQ](https://gun.eco/docs/FAQ#how-are-conflicts-handled) describes the conflict-resolution model. Do not use it as the only correctness mechanism for:

- balances, inventory, quotas, or one-time redemptions;
- globally unique names without a trusted coordinator;
- sequential counters or append-only audit logs that must never fork;
- a single atomic update across several nodes.

For those cases, introduce a server-side authority or an application protocol with an explicit conflict/reconciliation path. Include a client-generated operation ID so retries are idempotent.

## Read lifecycle

Use a one-shot read for initialization and a subscription for live state. Scope collection subscriptions and release them when the view/process stops. For large sets, query/index by a bounded keyspace or paginate through an application-maintained index; do not subscribe blindly to an unbounded namespace.
