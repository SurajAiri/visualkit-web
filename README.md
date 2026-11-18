# VisualKit landing page

Next.js 16 · React 19 · Tailwind 4 (tokens only) · plain CSS per section. One page, plus a 404.

```bash
pnpm install
pnpm dev          # http://localhost:3000
pnpm build
node --experimental-strip-types scripts/check-claims.mjs   # claimed-region data consistency
```

## Page order

| # | Section | Folder | id |
|---|---------|--------|----|
|   | Hero (timeline + demo video) | `components/hero` | `top` |
| 01 | How it works: Agent → VisualKit engine → Renderer | `components/architecture` | `how-it-works` |
| 02 | Benefits: batch edits, coded clips, lightweight | `components/benefits` | `benefits` |
| 03 | Three data states: Draft · Session · Store | `components/engine-states` | `engine` |
| 04 | History: commit, checkpoint, branch, merge, undo, redo, rollback | `components/history` | `history` |
| 05 | Renderer independence | `components/backends` | `backends` |
| 06 | Claimed regions | `components/claimed-region` | `claimed-region` |
| 07 | More features (one-liners) | `components/more-features` | `more` |
| 08 | FAQ | `components/faq` | `faq` |
|   | Install + typed script | `components/closing` | `start` |

Shared pieces: `components/layout` (Nav, Logo, Footer), `components/ui` (Reveal, useInView, Wave).
Each section folder owns its CSS file; `app/globals.css` holds only tokens, buttons, nav and footer.

## Where to edit things

- Hero copy: `components/hero/Hero.tsx`. Hero timeline scenes and retiming: `components/hero/HeroScenes.tsx` (`STAGES`).
- Demo video URL: `lib/site.ts` (`HERO_VIDEO`). Python / FFmpeg requirement line: `REQUIREMENTS` in the same file.
- More-features grid: the `FEATURES` array in `more-features/MoreFeatures.tsx`. FAQ: the `FAQ` array in `faq/Faq.tsx` (also feeds the FAQPage JSON-LD).
- Claimed-region scenarios: `claimed-region/claims.ts`. Run the check script after changing them.
- 404 page: `app/not-found.tsx` renders `components/not-found/NotFoundPage.tsx`. The gap (17%–42%) and playhead (00:04:04 = 27.56%) are mirrored between the clip data in that file and `not-found.css` (`--p`, `.nf-gap`). `Logo` and `Footer` take an `href` / `home` prop so they point at `/` instead of `#top` off the landing page.
- Site URL for share images: set `NEXT_PUBLIC_SITE_URL` (e.g. `https://yourdomain.com`) in the host's environment. Without it, `og:image` points at localhost. On Vercel it falls back to the production URL. The share image itself is `app/opengraph-image.tsx`.
- Docs banner: `components/layout/TopBanner.tsx`. Remove its use in `Nav.tsx` when the new docs and library are live, then set `scroll-padding-top` in `globals.css` back to 84px and the `.hx` top padding in `hero.css` back to `clamp(104px, 11vw, 140px)`.
- Hero timeline clock: `Hero.tsx` pushes the time into the scene's paused animations each frame (no inherited CSS variable on the root, which was ~45% of main-thread time). In `HeroScenes.tsx` / `hero.css`, animation delays are static (`--at`); never reintroduce a per-frame custom property on `.hx`.
- Security headers live in `next.config.ts`. If an embed or analytics script is added later, check the CSP there first.
