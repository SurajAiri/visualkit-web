# VisualKit Documentation

**VisualKit** is a programmable, local-first video editing engine built for both human engineers and AI agents. It combines exact rational time clocks, a flat versioned SQLite project store, typed timeline/clip handles, node-based Fusion compositing, a non-destructive Director's Cut planning layer, local modular actors, lightweight previews, and deterministic FFmpeg rendering.

## Documentation Map

| Guide | What it covers |
| --- | --- |
| [Getting Started](getting-started.md) | Installation (`uv add visualkit` / `pip install visualkit`), FFmpeg & optional extras, and your first end-to-end project |
| [Getting Started (Human)](getting-started-human.md) | Directing an agent such as Claude Code or Codex: import the skills, give it your assets, print the directory, then review previews and render |
| [Agent Skills](https://visualkit.hyekai.com/docs/skills) | `visualkit-editing` and `visualkit-collab`, the skills your agent imports (in this repository they live in the root `skills/` folder) |
| [Core Concepts](core-concepts.md) | Exact rational clocks, flat entity state (`Draft` / `Session` / `ProjectStore`), transactions, integrity validation, and exit codes |
| [Assets & Coded Visuals](assets.md) | `AssetResolver`, virtual filesystem mounts & variants, pinning, HTML/Remotion coded assets, and `visualkit-doctor` |
| [Clips & Timeline Editing](clips-and-timeline.md) | Tracks, media/text/shape clips, `Transform.crop`, color grading & human scales, speed curves, split/trim, and ripple editing |
| [Keyframes & Animation](keyframes-and-animation.md) | Two-layer (`PRE` / `POST`) keyframe system, interpolation & Bezier handles, and built-in motion presets |
| [Style, Text, Shapes & Templates](style-text-shapes-templates.md) | `TextClip`, `ShapeClip`, `Geometry`, `Paint`, managed Noto fonts, Skia rasterization, and parameterized style templates |
| [Effects & Fusion Graphs](effects-and-fusion.md) | Visual & audio effect stacks, adjustment clips, Fusion node DAGs, `FusionPluginNode`, and reusable `as_effect()` graphs |
| [Compound & Template Clips](compound-and-template-clips.md) | Nested sequences, compound clips, exposed variables, and repeater-driven template clips |
| [Director's Cut](director-cut.md) | Editing plans, stage registries, time/item-anchored markers, nested storyboard clips, stage hints, and render isolation |
| [Built-in & Local Actors](actors.md) | Local-first actor architecture, all 6 built-in actors (`bg_remove`, `ffmpeg_lut`, `local_broll`, `media_tools`, `rembg`, `transcribe`), and caching |
| [Preview & Rendering](preview-and-rendering.md) | Fast frame/video/grid/comparison previews (`PreviewService`) and final FFmpeg export (`FfmpegRenderer`) |
| [Version Control & Collaboration](version-control-and-collaboration.md) | History, undo/redo, checkpoints, rollback, branching, 3-way merge, canonical JSON export/import, workspaces, and multi-agent claimed regions |
| [CLI Reference](cli-reference.md) | Complete `visualkit` and `visualkit-doctor` command reference, environment variables, JSON contract, and exit codes |

## Conventions Used in Code Samples

- Python samples run inside `visualkit exec` (where `engine` is pre-injected) or after `VisualkitEngine.open(...)`. Samples that need a persisted project end with `engine.save()` when it matters (e.g. before `FfmpegRenderer`).
- Placeholder names are handles you already hold: `clip` is any `ClipHandle` (or a specific kind where the text says so, e.g. a `TextClip` for `anchor=`), `v1` is a visual `TrackHandle`, and `a_01...` / `sb_01...` / `mrk_01...` / `rev_01...` are IDs printed by earlier commands, and `<clip_id>` is a bare ULID (clip IDs have no `clp_` prefix).
- Consecutive samples on one page may continue each other (names such as `card_seq` or `shot1` carry over); each page's first sample is self-contained.
- `visualkit exec` scripts may only import `visualkit` and the pure-stdlib allowlist (see [Core Concepts](core-concepts.md)).

## Mental Model in 30 Seconds

1. **A project is a SQLite database** (`project.visualkit`) storing immutable, content-addressed revisions, branches, checkpoints, workspaces, and active claims.
2. **You edit through `VisualkitEngine`** — either in Python directly (`VisualkitEngine.open(...)` / `VisualkitEngine.in_memory()`) or via `visualkit exec`, which injects a ready-to-use `engine` global into your script.
3. **Every commit is validated before persisting** — overlaps, out-of-bounds source trims, cycle checks, and dangling references are caught atomically before anything hits disk.
4. **Preview early, render once** — inspect single frames or contact-sheet grids with `visualkit preview`, then export the final video with `visualkit render`.
