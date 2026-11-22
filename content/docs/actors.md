# Built-in & Local Actors

**Actors** are local-first modular plugins that run heavy media-processing tasks (chroma keying, AI background removal, LUT color grading, transcription/diarization, scene detection, frame extraction, procedural B-roll) via both the CLI (`visualkit actor <slug> ...`) and Fusion graph plugin nodes (`FusionPluginNode`).

## Inspecting Available Actors

```bash
# List all available built-in and local actors
visualkit actors list

# Inspect one actor: text lists parameter names; --format json adds types, defaults, ranges, surfaces, and models
visualkit actors info ffmpeg_lut --format json
visualkit actors models rembg

# Check local runtime readiness and model weights
visualkit actors doctor
visualkit actors doctor rembg
```

`actors doctor` exits `1` (validation error) when any checked actor is not ready. The optional ML actors (`rembg`, `transcribe`) are not installed by default, so a plain `visualkit actors doctor` on a fresh machine reports them as `[FAIL]` and exits `1`; pass a slug (e.g. `visualkit actors doctor ffmpeg_lut`) to check only the actors you need.

## The 6 Built-in Actors

| Slug | Surfaces | What it does |
| --- | --- | --- |
| `bg_remove` | CLI, Fusion | FFmpeg chroma-key background removal (`key_color`, `similarity`, `smoothness`, alpha-only `feather`) outputting RGBA visuals or alpha masks |
| `ffmpeg_lut` | CLI, Fusion | Apply built-in procedural `.cube` LUTs (`teal_orange`, `cinematic_warm`, `noir_bw`, `vintage_fade`, `crisp_daylight`, plus downloadable `kodak_2383_d65`) or custom `.cube` files with RGBA-preserving `intensity` blending |
| `local_broll` | CLI | Generate clean local synthetic/placeholder B-roll MP4 clips (`query`, `duration`, `color`) for rapid prototyping and layout tests |
| `media_tools` | CLI | Fast FFmpeg media utilities: `extract-frames`, `detect-scenes`, `trim`, and media probing |
| `rembg` | CLI, Fusion | AI subject segmentation / background removal using ONNX models (supports CPU/CUDA/CoreML device routing and video frame piping) |
| `transcribe` | CLI | Speech-to-text transcription and word timestamps with unified I/O schema across Whisper/faster-whisper engines and optional diarization |

## Running Actors via CLI

### Direct Per-Actor CLI (`visualkit actor <slug> ...`)

Each CLI-enabled actor exposes its own ergonomic subcommands and accepts `--format json`, `--project-dir`, and `--save-asset` (to auto-register produced media into `AssetResolver`):

```bash
# Generate a 3-second placeholder B-roll clip and return JSON
visualkit actor local_broll generate "city night" --duration 3.0 --color "#1E293B" --format json

# Extract preview frames and detect scene cuts from raw footage
visualkit actor media_tools extract-frames raw.mp4 --out-dir ./frames --every 1.0 --max-frames 8
visualkit actor media_tools detect-scenes raw.mp4 --threshold 0.35 --format json
visualkit actor media_tools trim raw.mp4 -o trimmed.mp4 --start 2.0 --duration 5.0

# Apply a LUT to an image or video at 60% intensity
visualkit actor ffmpeg_lut apply clip.mp4 -o graded.mp4 --lut teal_orange --intensity 0.6

# Chroma-key green screen with alpha-only feathering
visualkit actor bg_remove remove green_screen.mp4 -o keyed.mov --key-color "#00FF00" --feather 2.0

# Auto-register produced outputs directly into AssetResolver
visualkit actor --save-asset --assets-dir ./assets local_broll generate "ocean" --duration 2.0
```

### Generic Key-Value Runner (`visualkit actors run`)

You can also invoke any actor uniformly with `-p key=value`:

```bash
visualkit actors run local_broll -p query="studio" -p duration=2.0 --out-dir ./out --format json
```

### Installing Optional Actor Venvs & Models

Actors with heavy ML dependencies (`rembg`, `transcribe`) install into isolated local virtual environments and verify downloaded model weights via SHA-256:

```bash
visualkit actors install rembg --model u2net --dry-run
visualkit actors install rembg --model u2net
```

## Using Actors Inside Fusion Graphs

Actors with the `fusion_node` surface (`bg_remove`, `rembg`, `ffmpeg_lut`) plug directly into `FusionPluginNode`. `ffmpeg_lut` and `bg_remove` lower natively into the FFmpeg filtergraph (so they work on `FusionClipVisual`, `clip.add_effect(fg.as_effect())`, and `AdjustmentClipVisual`), whereas external ML actors like `rembg` run via `FusionPluginMaterializer` and require `add_fusion_clip(..., input_assets=...)`:

```python
with engine.edit(label="LUT grade fusion node"):
    fg = engine.create_fusion_graph(name="Cinematic LUT")
    fg.add_input_node(id="in", port="in", kind="visual")
    fg.add_plugin_node(
        id="lut",
        plugin="ffmpeg_lut",
        source="in",
        kind="visual",
        params={"lut": "teal_orange", "intensity": 0.7},
    )
    fg.set_output_node(source="lut", kind="visual")
    clip.add_effect(fg.as_effect())
```
