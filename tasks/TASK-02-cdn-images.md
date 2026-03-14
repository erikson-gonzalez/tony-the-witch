# TASK-02: CDN for Images and Videos (Cloudinary)

**Status:** MOSTLY DONE
**Priority:** P0 (critical)
**Effort:** M (days)
**Depends on:** TASK-01 (Vercel deploy)
**Assigned to:** Ryujin (dev)

## Summary
Replace base64 data-URLs and placeholder images with a Cloudinary-backed media pipeline. Images and videos are uploaded to Cloudinary via a server-side endpoint, stored as CDN URLs in the database, and rendered with automatic format negotiation (WebP/AVIF), responsive `srcset`, and lazy loading. This dramatically reduces API response size (base64 in the DB can add 2-5MB per high-res image to `/api/content`) and improves page load performance -- critical for mobile users on Costa Rican networks.

## Current State

### Done
- Cloudinary SDK installed and configured (`server/cloudinary.ts`)
- Upload endpoint live at `POST /api/admin/upload` (multer + Cloudinary, in `server/routes-admin.ts`)
- `useUpload` hook created (`client/src/admin/hooks/use-upload.ts`) -- uploads via FormData to the server endpoint
- `MediaUploadField` component updated to use `useUpload` instead of `FileReader.readAsDataURL()` (`client/src/admin/components/media-upload-field.tsx`)
- `OptimizedImage` component created (`client/src/components/optimized-image.tsx`) with `srcset`, `f_auto,q_auto`, and lazy loading
- `OptimizedImage` deployed across all frontend components: gallery items, lightbox, shop cards, product detail, ParallaxHero, artist section, nav cards, footer, cart items
- Environment variables (`CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`) set in Vercel

### TODO
- [ ] Upload `home-video.mp4` and `logo-ttw.png` to Cloudinary (via dashboard or script)
- [ ] Update `shared/defaults.ts` with Cloudinary URLs for hero video and logo
- [ ] Update `site_config` row in production DB with new Cloudinary URLs
- [ ] Verify all pages render correctly with CDN URLs in production
- [ ] Delete `client/public/home-video.mp4` from repo (saves ~12MB from build)
- [ ] Scan `site_config.data` JSONB for residual `data:` prefixed values and re-upload
- [ ] Verify `/api/content` response size is under 50KB (no embedded base64)

## Implementation Steps (Remaining)

1. Upload `client/public/home-video.mp4` and `client/public/logo-ttw.png` to Cloudinary (manually via dashboard or via a migration script)
2. Update `shared/defaults.ts` -- replace `/home-video.mp4` and `/logo-ttw.png` references with Cloudinary URLs
3. Update the `site_config` row in the production database with the new Cloudinary URLs for hero video, logo, and any other local-path references
4. Verify all pages render correctly with CDN URLs in production
5. Delete `client/public/home-video.mp4` from the repo
6. Optionally scan `site_config.data` JSONB for any remaining `data:` prefixed values and re-upload them

## Acceptance Criteria
1. [ ] All admin uploads (site config, gallery, products, nav cards) store Cloudinary CDN URLs in the database -- no base64 data-URLs
2. [ ] `OptimizedImage` renders `srcset` with multiple widths for Cloudinary URLs; verify in DevTools Network tab that different sizes load at different viewports
3. [ ] Cloudinary serves WebP/AVIF automatically -- verify `Content-Type` header in browser DevTools
4. [ ] Below-the-fold images use `loading="lazy"`; hero logo uses `priority` (no lazy)
5. [ ] Hero video serves from Cloudinary with format negotiation
6. [ ] `client/public/home-video.mp4` is removed from the repository
7. [ ] No broken images across gallery, shop, nav cards, site config, or cart
8. [ ] `/api/content` response size is under 50KB (no embedded base64)

## Dependencies
- TASK-01 (Vercel deploy) -- DONE
- Cloudinary account configured with API credentials -- DONE

## Notes
- **Cloudinary free tier:** 25 credits/month. Sufficient for a portfolio site with < 10K visitors/month.
- **Gallery + nav cards + products still use inline upload logic** (not `MediaUploadField`). Those pages use `createObjectURL` for preview and fall back to `placehold.co` placeholder URLs on submit. TASK-04 addresses standardizing all upload points to use `MediaUploadField` -> Cloudinary. However, the upload endpoint itself works, so admin config uploads already go through Cloudinary.
- **`OptimizedVideo` component** was planned but not built. The `ParallaxHero` currently uses `OptimizedImage`-style URL transforms on the video `src`. A dedicated video component could be a future enhancement.
- **Cost at scale:** If traffic grows beyond free tier, Cloudinary Plus is $89/month. Unlikely to be needed soon.
