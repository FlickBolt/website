# LiveChannelDO (Phase 9)

One Durable Object instance per active broadcast. Responsibilities:

- WebSocket fan-out for chat
- Slow-mode + chat buffer
- On-stream alerts (tips, subs, raids)

Implementation lands in Phase 9. `workers/api` forwards `/live/:handle/ws`
to this DO via the `LIVE_CHANNEL` binding.
