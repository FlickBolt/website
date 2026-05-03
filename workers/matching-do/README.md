# MatchingDO (Phase 6)

Single (or geohash-sharded) Durable Object that holds:

- `online_capturers: Map<capturer_id, { lat, lng, last_ping }>`
- `open_requests: Map<request_id, { lat, lng, ... }>`
- WebSocket connections to online capturers and waiting customers

Implementation lands in Phase 6. The `workers/api` worker forwards
`/ws/capturer` and request-dispatch calls here via the `MATCHING` binding
declared in `wrangler.toml`.
