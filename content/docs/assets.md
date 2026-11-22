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

Attach alternative files (such as low-res editing proxies) to the same logical asset ID. VisualKit validates compatibility automatically: the variant must have the same streams as the logical asset (e.g. a proxy without an audio track is rejected with `candidate has no audio stream`), a matching duration (within 60 ms), and a different resolution is accepted with a warning (it is scaled):

```bash
visualkit asset variant add a_01... proxy /proj/proxies/interview_720p.mp4
visualkit asset variant list a_01...

# Resolve or edit using the proxy variant
visualkit asset path a_01... --variant proxy
```

When moving a media drive to a new path, remap the mount cleanly (with `--dry-run` validation first). The mount must already exist (`remap` fails with `no mount at ...` otherwise), and `remap` is blocked (exit `1`) unless every registered asset under it exists at the new location:

```bash
visualkit asset mount add /archive /Volumes/OldDrive/footage   # once, if not already mounted
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

An HTML coded visual **describes itself**; no sidecar file is needed. `vk-duration` is required, and every parameter you intend to pass must be declared in a `vk-params` JSON block (passing an undeclared param fails with `Unknown param(s) ...; this asset declares: none`). Declared values are injected into the page as `window.VK_PARAMS`:

```html
<!-- /proj/graphics/lower_third.html -->
<!doctype html>
<html>
<head>
  <meta name="vk-duration" content="2">          <!-- seconds; required -->
  <meta name="vk-dimension" content="1280x720">  <!-- optional -->
  <meta name="vk-fps" content="12">              <!-- optional -->
  <meta name="vk-transparent" content="true">    <!-- optional: RGBA overlay (.mov) -->
  <script type="application/json" id="vk-params">
    {"name": {"type": "string", "default": "Your Name"},
     "role": {"type": "string", "default": "Your Role"}}
  </script>
  <style>
    body { margin: 0; background: transparent; font-family: sans-serif; }
    .bar { position: absolute; left: 60px; bottom: 80px; padding: 16px 28px; background: #0F172A; color: #fff;
           border-left: 8px solid #F59E0B; animation: slide 1s ease-out both; }
    .bar b { font-size: 44px } .bar span { font-size: 26px; color: #CBD5E1 }
    @keyframes slide { from { transform: translateX(-300px); opacity: 0 } to { transform: none; opacity: 1 } }
  </style>
</head>
<body>
  <div class="bar"><b id="n"></b><br><span id="r"></span></div>
  <script>n.textContent = VK_PARAMS.name; r.textContent = VK_PARAMS.role;</script>
</body>
</html>
```

CSS animations are sampled deterministically per frame; for JS-driven animation define `window.vkSeek(t)` (seconds). Then register it:

```bash
# Register an HTML coded visual with default JSON parameters
visualkit asset register-coded /proj/lower_third \
  --source /proj/graphics/lower_third.html \
  --compiler html_asset_compiler \
  --params '{"name": "Maya Lin", "role": "Director"}' \
  -d "Animated lower third"

# Resolve metadata + source path (the video is compiled and cached lazily, at preview/render time)
visualkit asset resolve /proj/lower_third --params '{"name": "Alex Rivera"}'
visualkit asset source-path /proj/lower_third
```

In Python scripts, pass the asset **ID** (as printed by `asset register-coded` / `asset find`, not the `/proj/...` path) to `engine.add_media(...)` together with `params={...}`; per-call params override the registered defaults. Compile explicitly with `engine.compile_coded(clip_id)` when needed.

### 3. Remotion Compositions

A Remotion coded visual is a React component (`.tsx`) plus a **sidecar JSON next to it with the same name** (`hello.tsx` + `hello.vk.json`) that declares size, timing and params. Unlike HTML, the component does not describe itself. Props arrive as normal React props, and `fps`, `width`, `height` and `duration` (seconds) come from the sidecar.

```tsx
// /proj/graphics/hello.tsx
import React from "react";
import {AbsoluteFill, useCurrentFrame} from "remotion";

export default function Hello({title, background}: {title: string; background: string}) {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{backgroundColor: background, color: "#fff", justifyContent: "center", alignItems: "center", fontSize: 24}}>
      {title} {frame}
    </AbsoluteFill>
  );
}
```

```json
// /proj/graphics/hello.vk.json
{
  "fps": 10, "width": 320, "height": 180, "duration": 1,
  "params": {
    "title":      {"type": "string", "default": "Hello"},
    "background": {"type": "string", "default": "#ff0000"}
  }
}
```

Set it up once (needs Node.js and npm; the browser is downloaded unless you point at an existing Chrome/Chromium), then register and use it exactly like an HTML asset:

```bash
visualkit-doctor install remotion --remotion-project ~/.cache/visualkit/remotion-test-project
export VISUALKIT_REMOTION_PROJECT=~/.cache/visualkit/remotion-test-project
# optional, when Remotion cannot download its own browser (offline / sandbox):
export VISUALKIT_REMOTION_BROWSER=/path/to/chrome-or-chromium

visualkit asset register-coded /proj/hello_rm \
  --source /proj/graphics/hello.tsx \
  --compiler remotion \
  --params '{"title": "Remotion OK", "background": "#7C3AED"}'
```

Place it with `engine.add_media("<asset id>", ..., params={"background": "#16A34A"})`; per-call params override the registered defaults and are what gets compiled. Compiled output is cached by content hash, so unchanged params do not recompile.

## Using `AssetResolver` with `exec`, `preview`, and `render`

Pass `--assets-dir` (or set `VISUALKIT_PROJECT_DIR`) to wire `AssetResolver` automatically into `exec`, `preview`, and `render`:

```bash
export VISUALKIT_PROJECT_DIR=./assets
visualkit exec build_edit.py --db project.visualkit
visualkit preview grid --db project.visualkit -o grid.jpg
visualkit render out.mp4 --db project.visualkit
```
