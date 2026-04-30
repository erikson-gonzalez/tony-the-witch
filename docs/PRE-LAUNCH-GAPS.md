# Pre-Launch Gaps (Post-Onvo Integration)

Audit date: 2026-04-26. Address these before accepting real payments.

---

## BLOCKING

### 1. Legal Pages
- `/terms` — Terms of Service
- `/privacy` — Privacy Policy
- `/refund-policy` — Return/Refund Policy
- Add footer links to all three
- i18n: need EN + ES versions
- Consult local lawyer for Costa Rica compliance

### 2. Tax Calculation (IVA 13%)
- Costa Rica IVA = 13% on goods
- Display tax line in cart + checkout summary
- Store tax amount in orders table (`taxUsd`, `taxCrc` fields)
- Server-side: calculate tax, don't trust client
- Consider: does IVA apply to tattoo reservations? (services vs goods)

### 3. Discount/Coupon System
- UI input already exists in `CheckoutInfoStep` — not connected
- Need: `discounts` table (code, type, amount/percent, expiry, usage limit)
- Need: validation endpoint + order schema fields (`discountCode`, `discountAmount`)
- Apply discount server-side, never trust client calculation

---

## IMPORTANT

### 4. Refund Tracking
- Add to orders: `refundStatus`, `refundAmount`, `refundedAt`, `processorTransactionId`
- Admin UI: refund button on approved orders
- Connect to Onvo refund API (once integrated)

### 5. CSP Update for Onvo
- Whitelist Onvo script/connect/frame domains in Helmet CSP (`server/index.ts:19-52`)
- Will be done during Onvo integration — verify after

### 6. Database SSL
- Add `?sslmode=require` to production `DATABASE_URL`
- Neon (if used) enforces SSL by default — verify

### 7. Shipping Preview on Cart
- Cart page only shows item total
- Add shipping estimate before checkout (based on zone selection or default)

---

## NICE TO HAVE

### 8. Structured Logging
- Replace `console.log/error` with pino or winston
- Redact sensitive data in production logs
- Forward to logging service

### 9. Error Page Polish
- 404 page styling
- Generic error boundary with retry
- Network error recovery UX

### 10. Order History
- Currently: single order lookup by number + email
- Future: customer accounts with order history (low priority)
