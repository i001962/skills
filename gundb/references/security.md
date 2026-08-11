# GunDB security

Use the official [SEA documentation](https://gun.eco/docs/SEA) and [user-chain documentation](https://gun.eco/docs/User) for the installed library's exact callback/async behavior. SEA operations can return `undefined` on failure, so handle that path and inspect the documented error surface; do not assume every crypto failure throws.

## Classify every field

| Class | Handling |
| --- | --- |
| Public | Assume relays and connected peers can observe it. Avoid sensitive metadata in path names. |
| Integrity-protected | Sign it and verify the expected public key before trusting it. |
| Private | Encrypt before `put`; keep decryption material only with authorized clients. |
| High-consequence | Keep the authoritative decision in a trusted service or contract; use Gun only as a replicated view or transport. |

## Identity, authorization, and sharing

Use `gun.user()`/SEA for user identity only after checking the installed version's documented API. Keep user creation and authentication errors generic so account enumeration is not exposed. Use SEA certificates according to the [official certificate example](https://gun.eco/docs/SEA), with a deliberately narrow path scope.

Design authorization separately:

1. Name the owner public key and permitted writer keys.
2. Define the exact graph paths and fields they may write.
3. Verify signed data or enforce certificate scopes before accepting it as authorized.
4. Define what happens after revocation: issue fresh permissions/keys, stop decrypting old content as applicable, and document that already-replicated plaintext cannot be recalled.

Do not claim that a hidden soul/path, client-side conditional, or relay URL protects data. Do not write secrets into public graph paths and encrypt them afterward—encrypt before replication.

## Key handling

- Generate and retain SEA key material client-side using the target application's approved storage/recovery design.
- Never log, commit, transmit for debugging, or ask a user to paste passwords, private key pairs, recovery phrases, or session tokens.
- Rotate credentials deliberately; encrypted historical data requires a migration/re-encryption plan if it must remain readable.
