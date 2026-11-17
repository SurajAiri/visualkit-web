# VisualKit landing page

Next.js 16 · React 19 · Tailwind 4 (tokens only) · plain CSS per section. One page, no routes.

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
