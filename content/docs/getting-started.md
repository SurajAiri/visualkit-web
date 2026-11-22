# Getting Started

This guide gets you from zero to a first video. The fastest route is **Agent Skills**: install VisualKit, drop the official skills into your coding agent (Claude Code, Codex, Cursor, Gemini CLI), and describe the edit you want. The rest of the page covers the library and CLI that those skills drive, for when you want to write edits yourself.

## Start with Agent Skills

### 1. Install the library

See [Requirements](#requirements) and [Installation](#installation) below.

### 2. Add the skills

Put them in your agent's skills folder. `visualkit-editing` teaches the agent the editing loop, exact signatures, and common traps. `visualkit-collab` covers checkpoints, branches, and multi-agent claimed regions:

```bash
# Claude Code shown. Use .agents/skills for Codex, .cursor/skills for Cursor, ~/.gemini/skills for Gemini CLI
mkdir -p .claude/skills
curl -fsSL https://visualkit.hyekai.com/downloads/skills/visualkit-skills-all.zip -o vk-skills.zip
unzip -qo vk-skills.zip -d .claude/skills
rm vk-skills.zip
```

### 3. Ask the agent for the edit

Name the skill so it loads, point it at your footage, and ask for a preview before any render:

```text
Use the visualkit-editing skill to cut /proj/interview.mp4 into a 15s teaser
with a title card. Preview before you render.
```

Prefer to be walked through it? Follow [Getting Started (Human)](getting-started-human.md) for the full step-by-step: importing skills, handing over assets, printing the directory, and reviewing the agent's work. The skills, their files, and per-agent folders are listed under [Agent Skills](/docs/skills).

## Using the Library Directly

Installing the library is needed on both routes. After that, the rest of this page is the CLI and Python workflow that agents run on your behalf. Work through it if you want to write `visualkit exec` scripts or drive `VisualkitEngine` yourself.

## Requirements

- **Python 3.10+** (tested on 3.10, 3.11, and 3.12)
- **FFmpeg and FFprobe** on your `PATH` (required for media probing, previews, actors, and final rendering)

Verify FFmpeg is available:

```bash
ffmpeg -version
ffprobe -version
```

## Installation

Install VisualKit from PyPI using `uv` (recommended) or `pip`:

```bash
# With uv
uv add visualkit

# Or with pip
pip install visualkit
```

### Optional Extras

VisualKit keeps its core install lightweight. Add optional extras only when you need them:

| Extra | Command | What it enables |
| --- | --- | --- |
| `style` | `uv add "visualkit[style]"` / `pip install "visualkit[style]"` | Skia vector rasterization — **required** to preview/render `ShapeClip` and shape-based templates (without it, `TextClip` falls back to basic FFmpeg `drawtext`) |
| `render` | `uv add "visualkit[render]"` / `pip install "visualkit[render]"` | Playwright browser automation for HTML coded visual assets |
| Both | `uv add "visualkit[style,render]"` | Full vector styling + HTML coded visuals |

For coded visual compilers (HTML and Remotion), run the built-in diagnostic tool:

```bash
visualkit-doctor list
visualkit-doctor check
```

## Your First 5-Minute Project (CLI)

### 1. Initialize a Project Store

```bash
visualkit init demo.visualkit --title "Launch Teaser" --fps 30 --width 1920 --height 1080
```

Check the project overview at any time with `visualkit status`:

```bash
visualkit status --db demo.visualkit
```

### 2. Edit with `visualkit exec`

Write a Python script (`edit.py`) — `visualkit exec` automatically injects `engine` (a `VisualkitEngine` instance) and commits uncommitted edits cleanly on exit:

```python
# edit.py
from visualkit import Geometry

with engine.edit(label="create intro scene"):
    bg_track = engine.create_track("visual", name="Background")
    fg_track = engine.create_track("visual", name="Titles")

    # Dark backdrop card
    card = engine.add_shape(
        Geometry.rect(1920, 1080),
        visual_track_id=bg_track.id,
        start_ts=0.0,
        duration=4.0,
        fill="#0F172A",
    )

    # Animated headline
    title = engine.add_text(
        "Built with VisualKit",
        visual_track_id=fg_track.id,
        start_ts=0.3,
        duration=3.4,
        font_size=96,
        color="#F8FAFC",
        font_weight=700,
    )
    title.fade_in(0.4).pop_in(from_scale=0.92, duration=0.4).fade_out(0.4)
```

Validate without writing (`--dry-run`), then commit:

```bash
visualkit exec edit.py --db demo.visualkit --dry-run
visualkit exec edit.py --db demo.visualkit
```

You can also pass inline snippets with `-c` and get structured JSON output with `--format json`:

```bash
visualkit status --db demo.visualkit --format json
```

### 3. Preview Before Rendering

Render a single frame or a 6-frame contact-sheet grid to inspect pacing and layout in seconds:

```bash
visualkit preview frame --db demo.visualkit --at 1.5 -o frame_1_5s.png
visualkit preview grid --db demo.visualkit --frames 6 -o contact_sheet.jpg
```

### 4. Render the Final Video

```bash
visualkit render out.mp4 --db demo.visualkit
```

## Using VisualKit Directly from Python

You can also drive `VisualkitEngine` directly in Python without the CLI:

```python
from visualkit import FfmpegRenderer, Geometry, RenderOptions, VisualkitEngine

# Use VisualkitEngine.open("demo.visualkit") for SQLite persistence,
# or VisualkitEngine.in_memory() for fast ephemeral projects.
with VisualkitEngine.open("demo.visualkit", fps=30, resolution=(1920, 1080)) as engine:
    with engine.edit(label="add title"):
        v1 = engine.create_track("visual", name="V1")
        clip = engine.add_text("Hello World", visual_track_id=v1.id, start_ts=0, duration=3.0, font_size=72)
        clip.fade_in(0.3).fade_out(0.3)

    engine.save(label="initial cut")

    # Fast preview
    grid_path = engine.preview_grid("timeline", num_frames=4, out_path="preview_grid.jpg")

    # Final MP4 render
    result = FfmpegRenderer().render(engine.store, "out.mp4", options=RenderOptions())
    print(f"Rendered {result.output_path} ({result.duration:.2f}s)")
```

## Next Steps

- Hand the editing to an agent with the [Agent Skills](/docs/skills), or follow [Getting Started (Human)](getting-started-human.md).
- Understand clocks, transactions, and validation in [Core Concepts](core-concepts.md).
- Import footage and manage proxy variants in [Assets & Coded Visuals](assets.md).
- Explore [Clips & Timeline Editing](clips-and-timeline.md) and [Director's Cut](director-cut.md).
