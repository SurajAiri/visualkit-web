# VisualKit Documentation

**VisualKit** is a programmable, local-first video editing engine built for both human engineers and AI agents. It combines exact rational time clocks, a flat versioned SQLite project store, typed timeline/clip handles, node-based Fusion compositing, a non-destructive Director's Cut planning layer, local modular actors, lightweight previews, and deterministic FFmpeg rendering.

## Documentation Map

| Guide | What it covers |
| --- | --- |
| [Getting Started](getting-started.md) | Installation (`uv add visualkit` / `pip install visualkit`), FFmpeg & optional extras, and your first end-to-end project |
| [Getting Started (Human)](getting-started-human.md) | Directing an agent such as Claude Code or Codex: import the skills, give it your assets, print the directory, then review previews and render |
| [Agent Skills](/docs/skills) | Download `visualkit-editing` and `visualkit-collab`, and where each agent harness expects them |
| [Core Concepts](core-concepts.md) | Exact rational clocks, flat entity state (`Draft` / `Session` / `ProjectStore`), transactions, integrity validation, and exit codes |
| [Assets & Coded Visuals](assets.md) | `AssetResolver`, virtual filesystem mounts & variants, pinning, HTML/Remotion coded assets, and `visualkit-doctor` |
| [Clips & Timeline Editing](clips-and-timeline.md) | Tracks, media/text/shape clips, `Transform.crop`, color grading & human scales, speed curves, split/trim, and ripple editing |
| [Keyframes & Animation](keyframes-and-animation.md) | Two-layer (`PRE` / `POST`) keyframe system, interpolation & Bezier handles, and built-in motion presets |
| [Style, Text, Shapes & Templates](style-text-shapes-templates.md) | `TextClip`, `ShapeClip`, `Geometry`, `Paint`, bundled fonts, Skia rasterization, and parameterized style templates |
| [Effects & Fusion Graphs](effects-and-fusion.md) | Visual & audio effect stacks, adjustment clips, Fusion node DAGs, `FusionPluginNode`, and reusable `as_effect()` graphs |
| [Compound & Template Clips](compound-and-template-clips.md) | Nested sequences, compound clips, exposed variables, and repeater-driven template clips |
| [Director's Cut](director-cut.md) | Editing plans, stage registries, time/item-anchored markers, nested storyboard clips, stage hints, and render isolation |
| [Built-in & Local Actors](actors.md) | Local-first actor architecture, all 6 built-in actors (`bg_remove`, `ffmpeg_lut`, `local_broll`, `media_tools`, `rembg`, `transcribe`), and caching |
| [Preview & Rendering](preview-and-rendering.md) | Fast frame/video/grid/comparison previews (`PreviewService`) and final FFmpeg export (`FfmpegRenderer`) |
| [Version Control & Collaboration](version-control-and-collaboration.md) | History, undo/redo, checkpoints, rollback, branching, 3-way merge, canonical JSON export/import, workspaces, and multi-agent claimed regions |
| [CLI Reference](cli-reference.md) | Complete `visualkit` and `visualkit-doctor` command reference, environment variables, JSON contract, and exit codes |

## Two Ways In

- **Through an agent (recommended).** Install the [Agent Skills](/docs/skills) into Claude Code, Codex, Cursor, or Gemini CLI and describe the video you want. See [Getting Started (Human)](getting-started-human.md).
- **Through code.** Use the `visualkit` CLI or `VisualkitEngine` directly. See [Getting Started](getting-started.md).

## Mental Model in 30 Seconds

1. **A project is a SQLite database** (`project.visualkit`) storing immutable, content-addressed revisions, branches, checkpoints, workspaces, and active claims.
2. **You edit through `VisualkitEngine`** — either in Python directly (`VisualkitEngine.open(...)` / `VisualkitEngine.in_memory()`) or via `visualkit exec`, which injects a ready-to-use `engine` global into your script.
3. **Every commit is validated before persisting** — overlaps, out-of-bounds source trims, cycle checks, and dangling references are caught atomically before anything hits disk.
4. **Preview early, render once** — inspect single frames or contact-sheet grids with `visualkit preview`, then export the final video with `visualkit render`.
