# ArmsWay DNS + Cloudflare Worker Routes

Use this file as the single source of truth for production routing.

## Required DNS records (`armsway.com` zone)

| Type | Name | Target | Proxy |
|---|---|---|---|
| CNAME | `@` | `armsway-com.goldshore.workers.dev` (or Worker custom domain target) | Proxied |
| CNAME | `www` | `armsway.com` | Proxied |
| MX | `@` | `route1.mx.cloudflare.net` (Priority 10) | N/A |
| MX | `@` | `route2.mx.cloudflare.net` (Priority 20) | N/A |
| MX | `@` | `route3.mx.cloudflare.net` (Priority 30) | N/A |
| TXT | `@` | `v=spf1 include:_spf.mx.cloudflare.net ~all` | N/A |

## Required Worker routes (`armsway-com` script)

Configure in **Workers & Pages → armsway-com → Settings → Triggers**:

- `armsway.com/*`
- `www.armsway.com/*`

These routes are also declared in `wrangler.jsonc` so `npx wrangler deploy` keeps config in source control.

## Post-deploy checks

Run these checks after deployment:

```bash
curl -I https://armsway.com/
curl -I https://www.armsway.com/
curl -I https://armsway.com/assets/logo-armsway.svg
curl -I https://armsway.com/style.css
```

Expected result: HTTP 200 for all assets and homepage requests.

## If website appears unstyled

1. Confirm `style.css` exists in `dist/` and root.
2. Confirm SVG files exist in `dist/assets/`.
3. Purge Cloudflare cache for `armsway.com`.
4. Re-run `npx wrangler deploy`.
## Email Routing

Incoming mail to `*@armsway.com` should be routed to the `armsway-com` Worker in **Email → Email Routing → Routes**.

## Post-deploy checks

Run these checks after deployment:

```bash
curl -I https://armsway.com/
curl -I https://www.armsway.com/
curl -I https://armsway.com/assets/logo-armsway.svg
curl -I https://armsway.com/style.css
```

Expected result: HTTP 200 for all assets and homepage requests.
