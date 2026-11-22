---
name: visualkit-editing
description: Edit, composite, animate, storyboard, preview, and render videos using VisualKit (`visualkit` CLI and `VisualkitEngine` Python scripts). Use for any single-agent video editing task: importing/pinning assets, building tracks and clips, cropping, keyframing, styling text/shapes/templates, applying effects or Fusion graphs, running built-in actors, managing Director's Cut plans/markers/storyboards, and generating previews or final FFmpeg renders.
---

# VisualKit Editing Playbook

Use this playbook for end-to-end video creation and editing with VisualKit. For branching, checkpoints, rollback, workspaces, or multi-agent parallel editing with claimed regions, use the `visualkit-collab` skill.

## 1. Standard Editing Loop

Always follow this 4-step loop:

1. **Orient first**: Run `visualkit status --db <DB> --format json` (and `visualkit asset find --format json` / `visualkit director stages --format json` if applicable) before editing.
2. **Edit atomically via `visualkit exec`**: Run Python scripts (or `-c CODE`) with `--dry-run` first when making large changes, then commit.
3. **Preview early**: Inspect composition, framing, and pacing with `visualkit preview frame` or `visualkit preview grid` before rendering.
4. **Render once settled**: Run `visualkit render out.mp4 --db <DB> --format json` (use `--dry-run --verbose` to inspect the FFmpeg plan if needed).

Always pass `--format json` when parsing CLI output programmatically. Exit codes: `0=ok`, `1=validation_error`, `2=script_crash`, `3=merge_conflict`, `4=claim_refused`.

## 2. Project & Asset Setup

```bash
# Initialize project store
visualkit init project.visualkit --title "My Video" --fps 30 --width 1920 --height 1080 --format json

# Register or scan media into AssetResolver (set VISUALKIT_PROJECT_DIR or pass --assets-dir)
export VISUALKIT_PROJECT_DIR=./assets
visualkit asset scan /proj --recursive --format json
visualkit asset register /proj/intro.mp4 -d "Intro A-roll" -t intro --format json
visualkit asset find --kind video --has-audio --format json
visualkit asset info <ASSET_ID> --format json
```

## 3. Writing `visualkit exec` Scripts

- **Pre-injected global**: `engine` (`VisualkitEngine`). Do **not** guess `vk` or `timeline`.
- **Allowed imports**: `visualkit` plus pure stdlib (`collections`, `copy`, `dataclasses`, `datetime`, `decimal`, `enum`, `fractions`, `functools`, `itertools`, `json`, `math`, `random`, `re`, `string`, `typing`, `uuid`). No `os`, `subprocess`, or network imports inside `exec` scripts.
- **Transactions**: Wrap edits in `with engine.edit(label="..."):`. Uncommitted edits auto-commit on exit; exceptions roll back cleanly.

### Inspection Helpers (No Internal Table Digging)

```python
engine.summary()                     # Compact JSON-serializable overview
engine.tracks()                      # Ordered TrackHandles (optional: sequence_id=, stream="visual"|"audio")
engine.clips()                       # Ordered ClipHandles (optional: sequence_id=, track_id=)
engine.sequences()                   # Nested SequenceHandles
engine.fusion_graphs()               # FusionGraphHandles
```

### Tracks & Clips

```python
from visualkit import CropAlignment, FitMode, Geometry, Insets, LowerThirdParams, Shadow

with engine.edit(label="assemble base cut"):
    v1 = engine.create_track("visual", name="Video")
    v2 = engine.create_track("visual", name="Overlays")
    a1 = engine.create_track("audio", name="Audio")

    # Place media (must specify both tracks for A/V assets, or explicitly pass include_audio=False / include_visual=False)
    res = engine.add_media("a_01...", visual_track_id=v1.id, audio_track_id=a1.id, start_ts=0.0, duration=8.0, source_in=1.0)
    res.visual.crop_to(1080, 1920, fit=FitMode.COVER, alignment=CropAlignment.TOP)  # media, coded, or compound visual clips only

    # Styled text (pass EITHER style= OR quick kwargs, never both)
    title = engine.add_text(
        "Headline",
        visual_track_id=v2.id,
        start_ts=0.5,
        duration=3.0,
        font_size=84,
        color="#FFFFFF",
        font_weight=700,
        bg_color="#0F172ACC",
        bg_radius=14.0,
        bg_padding=Insets(top=16, right=28, bottom=16, left=28),
        shadow=Shadow.drop(),
    )
    title.place_at(960, 540)
    title.fade_in(0.35).pop_in(from_scale=0.9, duration=0.35).fade_out(0.35)

    # Vector shape
    bar = engine.add_shape(Geometry.rect(400, 8), visual_track_id=v2.id, start_ts=0.5, duration=3.0, fill="#38BDF8")

    # Built-in motion-graphics template (title_card, lower_third, subtitle, callout, progress_ring)
    engine.apply_template("lower_third", LowerThirdParams(title="Maya Lin", subtitle="Host"), start_ts=1.0, duration=3.5, auto_tracks=True)
```

### Non-Linear Editing, Color, Speed & Keyframes

- **Split / Trim / Move / Delete**: `clip.move(t)`, `clip.trim_head(new_start)`, `clip.trim_tail(new_end)`, `s = clip.split(TimelineTime(t)); left, right = s.left, s.right` (plain `float` is clip-relative `ClipTime`!), `engine.delete_clip(clip.id, linked=True|False)`, `engine.split_all(at)`, `engine.trim_head_all(at)`, `engine.trim_tail_all(at)`.
- **Frame Snapping & Clocks**: Use `engine.snap(t)` on non-integer FPS timelines (e.g. `24000/1001`) to avoid frame-grid warnings. `clip.start_ts` is a `TimelineTime`; call `.to_plain_time()` before passing it as a duration.
- **Ripple & Gaps**: `engine.ripple_insert(at, duration)`, `engine.ripple_delete(start, end)`, `engine.close_gap(track_id, at)`, `engine.shift_items(from_t, delta)`.
- **Human color scales**: `clip.set_human_props(brightness=..., contrast=..., saturation=..., vibrance=..., hue=..., opacity=...)` — signed percent offsets (`0` = unchanged; `opacity` is `0–100`). Note: `FusionColorGradeNode` uses `[-1, 1]` floats instead.
- **Speed**: `clip.set_speed(2.0, shrink_to_fit=True)` or `clip.set_speed_curve([SpeedPoint(at=0.0, speed=1.0, interpolation=SpeedInterpolation.LINEAR), SpeedPoint(at=2.0, speed=0.4)])`. Slowing a clip (`< 1.0`) does not auto-lengthen its timeline duration (use `ripple_insert` + `trim_tail`).
- **Keyframes**: `clip.keyframe("transform.opacity", at, value, layer=Layer.POST, interpolation=InterpolationMode.EASE_OUT)`. `PRE` replaces static base; `POST` combines onto it (`ADD` default, `MULTIPLY` for scale/opacity).
- **Presets**: `fade_in`, `fade_out`, `slide_in`, `slide_out`, `pop_in`, `draw_in`.

## 4. Built-in Local Actors

Discover available actors and inspect their schemas before guessing parameters:

```bash
visualkit actors list --format json
visualkit actors info <SLUG> --format json
visualkit actors doctor --format json
```

Built-in actors:
- `bg_remove` (CLI + Fusion): FFmpeg chroma-key with alpha-only `feather`
- `ffmpeg_lut` (CLI + Fusion): Procedural/custom `.cube` LUT grading with RGBA-preserving `intensity`
- `local_broll` (CLI): Fast local synthetic B-roll MP4 generator (`query`, `--duration`, `--color`)
- `media_tools` (CLI): `extract-frames`, `detect-scenes`, `trim`
- `rembg` (CLI + Fusion): AI background segmentation (ONNX)
- `transcribe` (CLI): Speech-to-text + word timestamps

Pass `--save-asset` on `visualkit actor` or `visualkit actors run` to auto-register outputs into `AssetResolver`.

## 5. Preview & Render

```bash
# Lightweight visual checks
visualkit preview frame --db project.visualkit --at 1.5 -o frame.png --format json
visualkit preview grid --db project.visualkit --frames 6 --cols 3 -o grid.jpg --format json
visualkit preview video --db project.visualkit --start 0.0 --duration 3.0 -o snippet.mp4 --format json
visualkit preview compare <ID1> <ID2> --db project.visualkit --frames 4 -o compare.jpg --format json
visualkit preview source <ASSET_ID_OR_PATH> --db project.visualkit --mode frame --at 2.0 -o src.png --format json

# Final render (refuses unsettled/claimed branches or stale pins unless --allow-stale)
visualkit render out.mp4 --db project.visualkit --format json
```

## 6. Critical Gotchas

- Never assign directly to a keyframed scalar (`clip.transform.opacity = 0.5` raises `AnimatedAssignmentError`); use `clip.keyframe(...)` or `clip.clear_keyframes(...)`.
- Never call `clip.opacity` directly — opacity lives at `clip.transform.opacity` or via `clip.set_human_props(opacity=...)`.
- `clip.crop_to(w, h)` only works on `MediaClip`, `CodedVisualClip`, and `CompoundClipVisual`/`TemplateClipVisual`, and sets the output box to `w×h` without auto-scaling to canvas — pair with `transform.scale` for full-frame punch-in zooms.
- `ShapeClip` and shape-based built-in templates (`lower_third`, etc.) require `skia-python` (`visualkit[style]`) to preview/render; check `visualkit.is_skia_available()` in headless environments.
- Visual tracks forbid overlapping clips, and `apply_template(..., auto_tracks=True)` reuses existing top tracks — create `AdjustmentClip` tracks *after* templates or pass explicit track IDs.
- `--dry-run` validates structure only — always run `visualkit preview frame` or `preview grid` after effect/Fusion changes to visually verify output.
- Avoid `print(...)` inside `visualkit exec` scripts when parsing `--format json` stdout.
- `add_text` accepts either `style=TextStyle(...)` OR Tier-1 quick kwargs, never both; `add_media` never silently drops A/V streams (pass both tracks or `include_audio=False` / `include_visual=False`).

## 7. Deep-Dive References (Load Only When Needed)

- **Effects, Adjustment Clips & Fusion DAGs**: Read `references/effects-and-fusion.md`.
- **Compound Clips, Exposed Variables & Template Repeaters**: Read `references/compound-and-templates.md`.
- **Director's Cut (Stages, Markers, Storyboards) & Coded HTML/Remotion Assets**: Read `references/director-and-coded.md`.
