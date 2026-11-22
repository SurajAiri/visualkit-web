# VisualKit landing page

Next.js 16 · React 19 · Tailwind 4 (tokens only) · plain CSS per section. One page, plus a 404.

```bash
pnpm install
pnpm dev          # http://localhost:3000 (builds the skill downloads first)
pnpm build        # builds the skill downloads, then the site
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
- Get-started section (skills): per-agent skill folders, the bundle URL and the install command live in `lib/site.ts` (`SKILL_TARGETS`, `SKILLS_BUNDLE_URL`, `skillInstallCommand`). The window (agent / code toggle, copy buttons, typed prompt and script) is `components/closing/GetStarted.tsx`; its styles are the `.gs-*` rules in `closing.css`.
- Docs order and pages: `DOC_SECTIONS` in `lib/docs.ts` (Start Here, then AI Agents, then the rest). Markdown lives in `content/docs/`; `/docs/skills` is a hand-built page in `app/docs/skills/page.tsx`.
- Agent Skills downloads: edit the plain files in `skills/<name>/` (`SKILL.md` plus optional `references/`). `scripts/build-skills.mjs` runs before `dev` and `build` and generates `public/downloads/skills/` (one zip per skill, `visualkit-skills-all.zip`, and a standalone `<name>-SKILL.md` each, so the download URLs stay stable). That folder is gitignored; never edit it. A new folder in `skills/` with a `SKILL.md` is picked up automatically, but add a card for it in `app/docs/skills/page.tsx`.
- GitHub links: `GITHUB_URL` in `lib/site.ts`. While it is `null` (the codebase isn't public yet), every GitHub link (docs header, "Edit this page on GitHub", the skill cards) opens a "we're open-sourcing soon" dialog. Set it to the repo URL (no trailing slash) and they all become real links. All of them go through `components/ui/GithubLink.tsx`; use that for any new GitHub link.
- Library-release countdown (temporary, additive): everything lives in `components/countdown/` and the time is `LAUNCH_AT` in `lib/site.ts` (ISO, UTC). Until then the landing page shows the countdown in place of Get started, and the top banner shows "Almost done… Library coming soon" with a live chip linking to it. Afterwards the normal Get started section and the "Still in beta" banner appear on their own, with no redeploy, and Get started itself is never edited. To switch it off without deleting anything, set `LAUNCH_AT = null`. To delete it for good: (1) in `app/page.tsx` drop the `LaunchGate` import and wrapper so it renders `<Closing />`; (2) in `components/layout/TopBanner.tsx` drop the `LaunchBanner` import and wrapper, leaving the `top-banner-text` span; (3) delete `components/countdown/`; (4) delete `LAUNCH_AT` from `lib/site.ts`.
- Demo video URL: `lib/site.ts` (`HERO_VIDEO`). Python / FFmpeg requirement line: `REQUIREMENTS` in the same file.
- More-features grid: the `FEATURES` array in `more-features/MoreFeatures.tsx`. FAQ: the `FAQ` array in `faq/Faq.tsx` (also feeds the FAQPage JSON-LD).
- Claimed-region scenarios: `claimed-region/claims.ts`. Run the check script after changing them.
- 404 page: `app/not-found.tsx` renders `components/not-found/NotFoundPage.tsx`. The gap (17%–42%) and playhead (00:04:04 = 27.56%) are mirrored between the clip data in that file and `not-found.css` (`--p`, `.nf-gap`). `Logo` and `Footer` take an `href` / `home` prop so they point at `/` instead of `#top` off the landing page.
- Site URL for share images: set `NEXT_PUBLIC_SITE_URL` (e.g. `https://yourdomain.com`) in the host's environment. Without it, `og:image` points at localhost. On Vercel it falls back to the production URL. The share image itself is `app/opengraph-image.tsx`.
- Docs banner: `components/layout/TopBanner.tsx`. Remove its use in `Nav.tsx` when the new docs and library are live, then set `scroll-padding-top` in `globals.css` back to 84px and the `.hx` top padding in `hero.css` back to `clamp(104px, 11vw, 140px)`.
- Hero timeline clock: `Hero.tsx` pushes the time into the scene's paused animations each frame (no inherited CSS variable on the root, which was ~45% of main-thread time). In `HeroScenes.tsx` / `hero.css`, animation delays are static (`--at`); never reintroduce a per-frame custom property on `.hx`.
- Security headers live in `next.config.ts`. If an embed or analytics script is added later, check the CSP there first.
