# TASK-06: Transactional Email via Resend

**Status:** DONE
**Priority:** P1 (high)
**Effort:** M (days)
**Depends on:** None (can start independently)
**Assigned to:** Ryujin (dev) + Raiden (devops, DNS setup)

## Summary
Integrate Resend as the transactional email provider so Tony gets notified when someone submits an inquiry, and customers get a confirmation email. Today, inquiries sit silently in the database -- Tony has no way to know about them unless he manually checks the admin panel. For a WhatsApp-first tattoo artist in Costa Rica, email notifications are the bridge between "a lead came in" and "I responded within hours." This task also sets up Tony's Hostinger domain DNS for branded sending (`hola@tonythewitch.com`).

## Current State

### Done
- Resend SDK installed and configured (`server/email.ts`)
- Email templates built (`server/email-templates.ts`): admin notification + customer confirmation
- Inquiry endpoint fires both emails as fire-and-forget after DB insert
- `initEmail()` runs at server startup with graceful degradation (skips if no API key)
- Input validation hardened: `.email()` on email field, `.max()` on all text fields
- Subject line sanitized against header injection (newlines/null bytes stripped)
- HTML escaping covers `& < > " '` for all user-supplied fields
- Rate limiting on `/api/inquiries`: 5 requests per 15 min per IP
- PII-safe error logging: only `err.message` logged, never full error objects
- Environment variables set in Vercel: `RESEND_API_KEY`, `FROM_EMAIL`, `ADMIN_EMAIL`
- Domain DNS records added in Hostinger (SPF, DKIM, MX) — verification in progress

### TODO
- [ ] Confirm DNS verification completes in Resend dashboard
- [ ] Test end-to-end: submit inquiry → admin receives notification → customer receives confirmation
- [ ] Verify emails land in inbox (not spam) with correct branded sender

## Implementation Steps

1. **Install Resend SDK:** `npm install resend`

2. **Create email service** (`server/email.ts`):
   - Initialize Resend client with `RESEND_API_KEY` env var
   - Graceful degradation: if `RESEND_API_KEY` is not set, log warning at startup and skip sending (keeps local dev working)
   - All `resend.emails.send()` calls wrapped in try/catch -- email failures never break the API response
   - Export: `sendInquiryNotificationToAdmin(inquiry)`, `sendInquiryConfirmationToCustomer(inquiry)`
   - Future exports (stubs): `sendOrderConfirmation(...)`, `sendOrderNotificationToAdmin(...)`

3. **Create email templates** (`server/email-templates.ts`):
   - **Inquiry admin notification:** Subject: "Nueva consulta de {name}". Body: name, email, message, tattoo idea, placement, timestamp, mailto reply link
   - **Inquiry customer confirmation:** Subject: "Recibimos tu mensaje - Tony The Witch". Body: thank-you, message summary, expected response time, WhatsApp + Instagram links
   - Use inline HTML template functions (plain HTML strings, not React Email -- simpler, no server React dependency)

4. **Integrate into inquiry route** (`server/routes.ts`):
   - After `storage.createInquiry(input)` succeeds, fire-and-forget both email sends (do not `await` in response path)
   - Errors logged but never propagated to the API response

5. **Add environment variables** to `.env` and Vercel:
   - `RESEND_API_KEY` -- from Resend dashboard
   - `FROM_EMAIL` -- e.g., `Tony The Witch <hola@tonythewitch.com>`
   - `ADMIN_EMAIL` -- Tony's email for admin notifications

6. **Configure DNS for branded sending** (Hostinger):
   - Add domain in Resend dashboard (e.g., `tonythewitch.com` or subdomain `notify.tonythewitch.com`)
   - Add DNS records in Hostinger: MX (bounce handling), TXT (SPF), CNAME x3 (DKIM)
   - If Tony already uses Hostinger email, use a subdomain to avoid conflicts
   - Verify domain in Resend dashboard (DNS propagation: usually minutes, up to 48h)

## Acceptance Criteria
1. [ ] Submit an inquiry via contact form -> Tony receives email at `ADMIN_EMAIL` within seconds with full inquiry details
2. [ ] Submit an inquiry -> customer receives confirmation email at the address they provided
3. [ ] When `RESEND_API_KEY` is not set (local dev), no errors thrown; warning logged at startup
4. [ ] If Resend is down or returns error, `POST /api/inquiries` still returns 201 successfully; error logged server-side
5. [ ] Emails arrive from `hola@tonythewitch.com` (or chosen subdomain), not from `onboarding@resend.dev`
6. [ ] Emails land in inbox (not spam) -- SPF and DKIM configured correctly via DNS
7. [ ] Email templates render correctly in Gmail, Apple Mail, and mobile email clients
8. [ ] `RESEND_API_KEY`, `FROM_EMAIL`, `ADMIN_EMAIL` are set in Vercel environment variables

## Dependencies
- **Tony's Hostinger account access** -- needed to add DNS records for domain verification
- **Resend account** -- free tier (3,000 emails/month, 100/day)
- **Tony's preferred admin email** -- confirm which address receives notifications
- **No code dependencies on other tasks.** This is fully independent and can start immediately.

## Notes
- **Resend free tier is more than sufficient.** At 2 emails per inquiry and ~1-5 inquiries/day, Tony uses ~60-300 emails/month out of the 3,000 limit.
- **Order emails (future):** When TASK-03 (PayPal) or TASK-07 (SINPE) lands, add order confirmation/notification emails by creating new templates and calling new exported functions from `server/email.ts`. No architectural changes needed.
- **React Email is optional.** Plain HTML templates are simpler for v1. If Tony wants more polished emails later, `@react-email/components` can be added.
- **Testing before domain verification:** Resend allows sending from `onboarding@resend.dev` to the account owner's email only. Use this for initial development.
- **Subdomain recommended** if Tony already has Hostinger email: use `notify.tonythewitch.com` to avoid MX record conflicts.
- **No queue needed.** Volume is low enough for direct API calls. No Bull/Redis.
