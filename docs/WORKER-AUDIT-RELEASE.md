# Inquiry queue release prerequisites

The audit fix configures a dedicated `armsway-inquiries` queue, a consumer on this Worker, and `armsway-inquiries-dead-letter`. These resources must be created before deploying the updated manifest. They are intentionally separate from the shared Gold Shore jobs/mail queues.

1. Verify Email Routing authorizes the sender `no-reply@armsway.com` and the verified recipient `goldshorelabs@gmail.com`.
2. Create both named queues, then verify the `inquiries` table matches `migrations/0001_initial.sql`. Review migrations separately; do not apply an unchecked schema change to the shared audit database.
3. Run `node --test --test-isolation=none tests/worker.test.mjs tests/intake.test.mjs` on Node 24 and a Wrangler dry-run.
4. Review the final production bindings and consumer backlog before authorizing a release. A missing mail binding now returns 503 before persistence and retries queued inquiries rather than silently acknowledging them.
5. Validate persistence and delivery with a consented test inquiry after release. Monitor retry/dead-letter behavior; do not attach a consumer to the dead-letter queue automatically.

No queues, email destinations, database schemas, or deployments were changed by this commit.

Current main was merged without replacing its overlapping repairs. Its pinned Wrangler 4.146.0 requires Workers types ^5.20261001.1; the previous 5.20260903.1 pin made npm ci fail with ERESOLVE. The types pin now matches the required minimum, and clean npm ci plus the final Wrangler dry-run pass.
