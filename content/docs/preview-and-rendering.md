# Preview & Rendering

VisualKit separates **fast visual inspection (`preview`)** from **final production export (`render`)** so you (and AI agents) can verify composition, typography, cropping, effects, and pacing in seconds before committing to a full-resolution render.

## Fast Previews (`PreviewService` & `visualkit preview`)

You can preview any target at any level of granularity:

- `"timeline"` — full composited root timeline
- Track ID (e.g., `"trk_..."`) — isolated single track
- Clip ID (a bare ULID such as `01M80NYPJ1GV38FYJQVTPPTTX0`; clips have **no** `clp_` prefix, unlike `a_…` assets, `trk_…` tracks and `rev_…` revisions) — isolated single clip
- Source asset ID or file path — raw source footage without timeline compositing

### CLI Preview Commands

All `visualkit preview` subcommands support `--db`, `--branch`, `--workspace` (or `VISUALKIT_WORKSPACE`), `--ref`, `--assets-dir`, and `--format json`:

```bash
# 1. Single composited frame (PNG or JPEG; --transparent preserves alpha)
visualkit preview frame --db project.visualkit --at 2.5 -o frame.png
visualkit preview frame --db project.visualkit --target <clip_id> --at 1.0 --transparent -o clip.png

# 2. Short video snippet
visualkit preview video --db project.visualkit --start 4.0 --duration 3.0 -o snippet.mp4

# 3. Contact-sheet grid (uniformly sampled frames with timestamps)
visualkit preview grid --db project.visualkit --frames 6 --cols 3 -o sheet.jpg

# 4. Multi-target side-by-side comparison grid (one row per candidate target)
visualkit preview compare <clip_id_1> <clip_id_2> --db project.visualkit --frames 4 -o compare.jpg

# 5. Raw source media preview (modes: path | frame | video | grid)
visualkit preview source a_01... --db project.visualkit --mode frame --at 5.0 -o src_5s.png
visualkit preview source a_01... --db project.visualkit --mode grid --frames 6 -o src_grid.jpg
```

### Python Preview API

```python
# On VisualkitEngine:
frame_path = engine.preview_frame("timeline", at=2.5, out_path="frame.png")
video_path = engine.preview_video("timeline", start_ts=0.0, duration=3.0, out_path="clip.mp4")
grid_path = engine.preview_grid("timeline", num_frames=6, quality="draft", out_path="grid.jpg")
cmp_path = engine.preview_comparison_grid([clip_a.id, clip_b.id], frames_per_target=4)

# Or directly on ClipHandle / TrackHandle:
clip.preview_frame(at=0.5, out_path="clip_half.png")
track.preview_grid(num_frames=4, out_path="track_grid.jpg")
```

**Quality presets**: `"draft"` (fast low-res contact sheets), `"fast"` (quick MP4 snippets), `"full"` (native project resolution).

## Final Rendering (`FfmpegRenderer` & `visualkit render`)

`FfmpegRenderer` compiles the validated `ProjectState` into deterministic FFmpeg filtergraphs with support for:

- Multi-track visual compositing, `Transform.crop`, keyframes, color grading, and visual/audio effect stacks
- Adjustment clips, compound/template nested sequences, and Fusion node graphs (including cached `FusionPluginNode`s)
- Automatic parallel chunked rendering for long timelines with silent-chunk audio continuity and immediate scratch cleanup
- Pre-render safety checks: refuses to render unsettled projects (branches with active uncommitted claims) or stale asset pins unless explicitly overridden

### CLI Rendering

```bash
# Inspect the exact render plan and FFmpeg command without running FFmpeg
visualkit render out.mp4 --db project.visualkit --dry-run --verbose --format json

# Render the active branch (or workspace branch) to MP4
visualkit render out.mp4 --db project.visualkit

# Override resolution, fps, target revision/checkpoint, or audio mode
visualkit checkpoint new v1-rough-cut --db project.visualkit   # --ref must name an existing checkpoint/revision
visualkit render proxy.mp4 \
  --db project.visualkit \
  --ref v1-rough-cut \
  --resolution 640x360 \
  --fps 30 \
  --audio-mode auto
```

`--resolution` **scales the finished canvas** (the project's `init --width/--height`) to the output size; it does not re-compose or reframe. Use it for same-aspect downscales or upscales (a 1920x1080 project rendered at 640x360). If the output aspect ratio differs from the canvas, the picture is stretched and the render reports a `WARN`. For a vertical or square deliverable, create the project with that canvas (`visualkit init ... --width 1080 --height 1920`) and lay the clips out for it.

`--audio-mode` options:
- `auto` (default) — includes audio if the timeline has any audio clips
- `always` — always emits an audio stream (generates silence if no audio clips exist)
- `never` — strips audio completely (video-only output)

### Python Rendering

`FfmpegRenderer` renders the **persisted** branch of the store, not your in-memory edits: call `engine.save()` first (`visualkit exec` does this for you at script exit). Rendering an unsaved project fails with a zero-duration error. `resolver` below is the `AssetResolver` the engine was opened with (`engine.resolver`).

```python
from visualkit import FfmpegRenderer, RenderOptions

engine.save(label="ready to render")
resolver = engine.resolver

opts = RenderOptions(
    resolution=(1920, 1080),
    fps=30,
    branch="main",
    audio_mode="auto",
)
result = FfmpegRenderer().render(engine.store, "out.mp4", resolver=resolver, options=opts)
print(result.output_path, result.duration, result.warnings)
```
