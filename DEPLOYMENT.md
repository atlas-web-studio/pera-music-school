# Turnstile Release Checks

## Verified Locally (2026-10-13)

- Frontend lint and production build passed.
- 32 backend tests cover token validation and both form submission routes.
- Tests reject missing, invalid, expired, reused, wrong-action and wrong-host tokens.
- Production rejects Cloudflare dummy secret keys.
- Both forms loaded Cloudflare's dummy widget in a browser and produced a token.
- Test submissions appeared in the local admin inbox after signing in.
- Selecting `5:45 PM` in the trial form preserved that time in the inbox and email content.
- Successful submission resets the form, resets the widget and clears the success message.
- Database/email failures do not report success unless a record was saved or email was sent.

The browser tests used an isolated in-memory database and captured emails. They did
not write to production MongoDB or send real email. Production SMTP delivery is
still a separate check.

## Live Read-Only Checks (2026-10-13)

- The Vercel `/api/health` proxy and Render `/api/health` returned HTTP 200 with MongoDB connected.
- `https://peramusicschool.com` redirected to `https://www.peramusicschool.com/` and served the deployed React site.

## Configure Before Publishing

Use the site key and secret key from the same Cloudflare Turnstile widget.

Vercel environment variables (Production, and Preview if testing a preview):

```text
VITE_TURNSTILE_SITE_KEY=<real public site key>
```

Render environment variables:

```text
NODE_ENV=production
TURNSTILE_SECRET_KEY=<real secret key>
TURNSTILE_ALLOWED_HOSTNAMES=www.peramusicschool.com,peramusicschool.com,pera-music-school-sigma.vercel.app
```

Add those hostnames to the Cloudflare widget's allowed hostnames too. If using a
Vercel preview, add its exact hostname to Cloudflare and the Render allowlist.
Hostnames do not include `https://` or paths.

Keep the secret key on Render only. Dummy keys in the ignored `.env.local` files
are for local QA. The hosted Vercel build rejects missing or dummy site keys.

Changing Vercel environment variables requires a new build. `.env.example` files
document the variables; they do not configure either hosting service.

## Publish in Order

1. Configure the real keys and allowed hostnames before releasing the code.
2. For this release, control Render deployment manually if both hosts deploy
   automatically from the production branch.
3. Publish the new frontend first. The existing backend can accept its extra
   `turnstileToken` field while continuing to process forms normally.
4. After the new frontend is serving, deploy the backend that requires Turnstile.
5. Check `/api/health`, then submit one clearly labeled test per form. Confirm
   each record in the live admin inbox and confirm actual receipt of its email.
6. Confirm the security check renews after a submission and a second submission
   works without reloading. Refresh any old browser tabs before testing.
7. Remove or clearly mark test entries using the normal admin workflow.

Old frontend tabs do not send Turnstile tokens; the updated backend rejects their
submissions until the page is refreshed. When rolling back this release, roll
back the backend before the frontend to keep the two compatible.

## Repeatable Checks

Run from the repository root:

```bash
npm run lint
npm run build
npm --prefix backend test
```

Client review is for copy, contact details, programs, pricing and registration
rules. Payment completion has not been verified; do not create a real charge as
part of technical QA without authorization.

Reference: https://developers.cloudflare.com/turnstile/troubleshooting/testing/
