# Assets & Coded Visuals

VisualKit separates **logical assets** (stable IDs like `a_01...` and virtual paths like `/proj/intro.mp4`) from **physical files on disk**. This lets you swap proxy/full-res variants, move folders across machines, detect stale media, and compile HTML or Remotion scenes into cached video assets.

## Virtual Filesystem & Mounts

`AssetResolver` manages media through virtual mount points:

- **`/proj/...`** — Project-scoped assets directory (configured via `--assets-dir` or `VISUALKIT_PROJECT_DIR`)
- **`/home/...`** — User/home assets directory (configured via `--home-assets-dir` or `VISUALKIT_HOME_DIR`)
- **Custom mounts** — Add any external drive or shared library with `visualkit asset mount add /archive /mnt/nas/footage`

Inspect resolved directories and SQLite catalog paths without creating databases:

```bash
visualkit asset paths --format json
```

## Registering, Scanning & Searching Media

### Register a Single File or Scan a Folder

```bash
# Register one file with description and tags
visualkit asset register /proj/interview.mp4 -d "Founder interview A-cam" -t interview -t acam

# Scan a directory recursively for all media files
visualkit asset scan /proj/footage --recursive
```

### Search & Inspect

```bash
# Full-text & metadata search
visualkit asset find --text "interview" --kind video --has-audio --min-width 1920 --format json

# Tree & directory views
visualkit asset tree /proj --depth 2 --ids
visualkit asset ls /proj/footage

# Detailed metadata (duration, resolution, fps, audio rate, content signature, variants)
visualkit asset info a_01...

# Update tags, descriptions, or detect byte-identical duplicates
visualkit asset tag a_01... --add hero --remove draft
visualkit asset describe a_01... "Main opening shot"
visualkit asset duplicates
```

## Variants (Proxy Workflows)

Attach alternative files (such as low-res editing proxies) to the same logical asset ID. VisualKit validates compatibility (duration/stream parity) automatically:

```bash
visualkit asset variant add a_01... proxy /proj/proxies/interview_720p.mp4
visualkit asset variant list a_01...

# Resolve or edit using the proxy variant
visualkit asset path a_01... --variant proxy
```

When moving a media drive to a new path, remap the mount cleanly (with `--dry-run` validation first):

```bash
visualkit asset mount remap /archive /Volumes/NewDrive/footage --dry-run
visualkit asset mount remap /archive /Volumes/NewDrive/footage
```

## Pinning Assets & Staleness Detection

When you place an asset onto a timeline, VisualKit creates an **`AssetPin`** recording the probed duration, dimensions, streams, and content signature so timeline validation stays fast and deterministic (no disk probing inside `commit()`).

```python
with engine.edit(label="place footage"):
    v1 = engine.create_track("visual", name="V1")
    a1 = engine.create_track("audio", name="A1")

    # Auto-pins the asset from engine.resolver and places linked video + audio clips
    res = engine.add_media(
        "a_01...",
        visual_track_id=v1.id,
        audio_track_id=a1.id,
        start_ts=0.0,
        duration=8.0,
        source_in=2.0,
    )
```

If an underlying file changes on disk:

- Run `visualkit asset refresh a_01...` to verify it still matches the logical spec, or `--rebase` to accept the new file.
- `visualkit render` blocks on stale pins by default (pass `--allow-stale` to override).
- To swap a clip to a different asset without losing its keyframes or effects, use `engine.relink_clip(clip_id, new_asset_id)`.

## Coded Visual Assets (HTML & Remotion)

VisualKit can compile programmable web graphics (HTML/CSS/JS or Remotion React compositions) into cached video assets that behave like normal clips on the timeline.

### 1. Check Compiler Readiness (`visualkit-doctor`)

```bash
visualkit-doctor list
visualkit-doctor check
visualkit-doctor check html_asset_compiler --deep
visualkit-doctor steps remotion
visualkit-doctor install html_asset_compiler --dry-run
```

### 2. Register & Render a Coded Asset

```bash
# Register an HTML coded visual with default JSON parameters
visualkit asset register-coded /proj/lower_third \
  --source /proj/graphics/lower_third.html \
  --compiler html_asset_compiler \
  --params '{"name": "Maya Lin", "role": "Director"}' \
  -d "Animated lower third"

# Resolve (compiles & caches on demand; supports per-call --params overrides)
visualkit asset resolve /proj/lower_third --params '{"name": "Alex Rivera"}'
visualkit asset source-path /proj/lower_third
```

In Python scripts, pass `params={...}` to `engine.add_media(...)` and compile explicitly with `engine.compile_coded(clip_id)` when needed.

## Using `AssetResolver` with `exec`, `preview`, and `render`

Pass `--assets-dir` (or set `VISUALKIT_PROJECT_DIR`) to wire `AssetResolver` automatically into `exec`, `preview`, and `render`:

```bash
export VISUALKIT_PROJECT_DIR=./assets
visualkit exec build_edit.py --db project.visualkit
visualkit preview grid --db project.visualkit -o grid.jpg
visualkit render out.mp4 --db project.visualkit
```
