# TASK-04: Standardize Upload Component Across All Admin Pages

**Status:** DONE
**Priority:** P1 (high)
**Effort:** M (days)
**Depends on:** TASK-02 (CDN/Cloudinary -- mostly done)
**Assigned to:** Ryujin (dev)

## Summary
The `MediaUploadField` component now uploads to Cloudinary via `useUpload`, but it is only used in the Site Config admin page (6 instances). The Gallery, Nav Cards, and Products admin pages still use inline `createObjectURL`/`readAsDataURL` logic and fall back to `placehold.co` placeholder URLs on submit -- meaning actual images are never stored. This task replaces all ad-hoc upload logic with `MediaUploadField` so every admin form uploads real images to Cloudinary.

## Current State

### Done
- `MediaUploadField` component uploads to Cloudinary via `useUpload` hook -> `POST /api/admin/upload` -> `server/cloudinary.ts`
- Used in `admin-config.tsx` for 6 upload fields (hero video, logo, artist image, reservation image, tattoo session image, footer image)
- Upload endpoint is live and working in production

### All Admin Pages Now Using MediaUploadField + Cloudinary
| Admin Page | File | Status |
|---|---|---|
| Site Config | `client/src/admin/pages/admin-config.tsx` | Done (6 upload fields) |
| Nav Cards | `client/src/admin/pages/admin-nav-cards.tsx` | Done (3 form variants) |
| Gallery (new) | `client/src/admin/pages/admin-gallery-form-page.tsx` | Done (multi-file + edit single) |
| Products | `client/src/admin/components/product-form-content.tsx` | Done (multi-file up to 4) |
| Products (legacy) | `client/src/admin/components/product-form.tsx` | Deleted (unused) |

## Implementation Steps

1. **Enhance `MediaUploadField` with multi-file support** (`client/src/admin/components/media-upload-field.tsx`):
   - Add props: `multiple?: boolean`, `maxFiles?: number`, `values?: string[]`, `onChangeMultiple?: (urls: string[]) => void`, `maxSizeMB?: number`
   - When `multiple=true`, render a grid of thumbnails with individual remove buttons and an "add more" button
   - Add file size validation (reject files exceeding `maxSizeMB` with a user-friendly error)
   - Add drag-and-drop zone with visual feedback (dashed border, highlight on dragover)
   - Show upload progress/loading state per file

2. **Integrate into Nav Cards** (`client/src/admin/pages/admin-nav-cards.tsx`):
   - Remove inline `handleFileSelect`, `clearImage`, and `imagePreview` state from `NavCardForm`
   - Replace all three inline `<input type="file">` blocks with `<MediaUploadField label="Imagen" type="image" value={image} onChange={setImage} />`

3. **Integrate into Gallery Form** (`client/src/admin/pages/admin-gallery-form-page.tsx`):
   - Replace inline multi-file input + `createObjectURL` logic with `<MediaUploadField multiple maxFiles={6} type="image" ... />`
   - For edit mode: replace raw text `<Input>` for URL with `<MediaUploadField>` in single mode
   - Remove `handleFileSelect`, `removeImage` callbacks
   - Eliminate the `placehold.co` placeholder URL fallback

4. **Integrate into Product Form** (`client/src/admin/components/product-form-content.tsx`):
   - Replace inline image upload section with `<MediaUploadField multiple maxFiles={4} type="image" ... />`
   - Remove `handleFileSelect`, `removeImage` callbacks
   - Eliminate the `placehold.co` placeholder URL fallback

5. **Clean up legacy product form** (`client/src/admin/components/product-form.tsx`):
   - Apply same `MediaUploadField` integration, or remove the file if unused (check imports first)

6. **Verify end-to-end**: Upload images in each admin section, confirm they persist as Cloudinary URLs in the DB, and render correctly on the public site via `OptimizedImage`

## Acceptance Criteria
1. [x] Nav Cards: image upload uses `MediaUploadField` and stores Cloudinary URL in DB (no more base64 data-URLs)
2. [x] Gallery (new works): multi-image upload works via `useUpload`, images stored as Cloudinary URLs (no more `placehold.co`)
3. [x] Gallery (edit): single image can be replaced via `MediaUploadField`
4. [x] Products: multi-image upload works via `useUpload`, images stored as Cloudinary URLs (no more `placehold.co`)
5. [x] MIME type validation: only allowed image/video types accepted (via `MediaUploadField`)
6. [x] Image/video preview shown after upload, before form submission
7. [x] Remove/clear button works for each uploaded file
8. [x] No inline `FileReader.readAsDataURL()` or `URL.createObjectURL()` upload logic remains outside of `MediaUploadField`
9. [x] All uploaded images render correctly on public pages (gallery, shop, nav cards) via `OptimizedImage`
10. [x] Unused `product-form.tsx` deleted

## Dependencies
- TASK-02 (Cloudinary integration) -- mostly done. The upload endpoint and `useUpload` hook are working. This task consumes that infrastructure.

## Notes
- **File size limits:** Images 10MB max, video 50MB max. Base64 encoding adds ~33% overhead, but since we now upload via FormData to Cloudinary, this is no longer an issue.
- **Drag-and-drop is a nice-to-have** for v1. The core value is replacing placeholder URLs with real Cloudinary uploads. Drag-and-drop can be added as polish.
- **Loading state:** The form submit button should be disabled while any files are uploading to prevent submitting with incomplete uploads.
- **Batch upload UX:** For gallery (up to 6 images), uploading sequentially is fine. Parallel uploads with a concurrency limit of 2-3 would be better but not required for v1.
