# Effects & Fusion Graphs

VisualKit supports three composable levels of visual and audio processing:

1. **Per-clip effect stacks** (`clip.add_effect(...)`)
2. **Track-wide adjustment clips** (`engine.add_adjustment_clip(...)`)
3. **Node-based Fusion DAGs** (`engine.create_fusion_graph(...)`) usable either as standalone `FusionClipVisual` / `FusionClipAudio` clips or attached to any clip via `graph.as_effect()`

## Built-in Effects

### Visual Effects

- `GaussianBlurEffect` (`sigma`)
- `DropShadowEffect` (`dx`, `dy`, `blur`, `color`, `opacity`)
- `GlowEffect` (`radius`, `intensity`, `threshold`, `tint`)
- `SharpenEffect` (`amount`, `radius`)
- `PixelateEffect` (`block_size`)
- `VignetteEffect` (`angle`, `center`, `mode`, `mix`)
- `ChromaKeyEffect` (`color`, `similarity`, `smoothness`, `spill`)
- `MaskEffect` (shape/alpha masking)
- `FusionEffect` (runs a single-input `FusionGraphEntity` inside a clip's effect stack)

### Audio Effects

- `CompressorEffect`, `ReverbEffect`, `EchoEffect`, `DistortionEffect`, `PanEffect` *(note: `Equalizer` is a built-in property on `AudioClip` via `clip.equalizer.low / mid / high`, not an `add_effect` item)*
- `AudioFusionEffect` (runs an audio `FusionGraphEntity` inside an audio clip's effect stack)

### Adding & Managing Effects on a Clip

```python
from visualkit import GaussianBlurEffect, VignetteEffect

with engine.edit(label="add clip effects"):
    blur = clip.add_effect(GaussianBlurEffect(sigma=4.0))
    vig = clip.add_effect(VignetteEffect(angle=0.5, mix=0.35))

    # Reorder or remove effects by effect ID
    clip.move_effect(vig.id, 0)
    clip.remove_effect(blur.id)
```

## Adjustment Clips

An adjustment clip sits on a track above other clips and applies its effect stack to the composited frame (or mixed audio) beneath it over its `[start_ts, start_ts + duration)` window:

```python
from visualkit import VignetteEffect

with engine.edit(label="global vignette pass"):
    v_adj = engine.create_track("visual", name="Grade")
    engine.add_adjustment_clip(
        visual_track_id=v_adj.id,
        start_ts=0.0,
        duration=10.0,
        effects=[VignetteEffect(angle=0.5, mix=0.4)],
    )
```

## Fusion Node Graphs

A `FusionGraphEntity` is a validated directed acyclic graph (DAG) of typed nodes (`visual`, `mask`, `audio`). VisualKit validates port kinds, references, and acyclicity at commit time.

### Available Node Builders on `FusionGraphHandle`

| Builder Method | Role |
| --- | --- |
| `add_input_node(id=..., port="in", kind="visual")` | External clip or asset input port |
| `add_generator_node(id=..., kind="solid", color=...)` | Procedural solid, checker, or noise source |
| `add_effect_node(id=..., source=..., effect=..., mask_source=...)` | Apply any built-in effect (optionally masked) |
| `add_color_grade_node(id=..., source=..., brightness=..., contrast=..., saturation=..., gamma=...)` | Dedicated color-grading node |
| `add_mask_node(id=..., mode="shape"|"luma"|"chroma", ...)` | Generate an alpha mask |
| `add_apply_mask_node(id=..., source=..., mask=..., invert=...)` | Apply a mask to a visual stream |
| `add_merge_node(id=..., background=..., foreground=..., blend_mode="normal", opacity=1.0, mask=...)` | Composite foreground over background |
| `add_plugin_node(id=..., plugin="bg_remove"|"rembg"|"ffmpeg_lut", source=..., kind="mask"|"visual", params=...)` | Invoke a local actor plugin (cached via `FusionPluginMaterializer`) |
| `add_audio_mix_node(id=..., inputs=[...], weights=[...])` | Weighted multi-stream audio mixer |
| `set_output_node(source=..., kind="visual"|"audio")` | Declare the graph's final output node |

### Example: Green-Screen Removal + Background Merge

```python
with engine.edit(label="green screen composite"):
    fg_graph = engine.create_fusion_graph(name="Keyed Composite")
    fg_graph.add_input_node(id="subject", port="subject", kind="visual")
    fg_graph.add_generator_node(id="bg", kind="solid", color="#1E293B")
    fg_graph.add_plugin_node(
        id="keyed",
        plugin="bg_remove",
        source="subject",
        kind="visual",
        params={"key_color": "#00FF00", "similarity": 0.2, "feather": 2.0},
    )
    fg_graph.add_merge_node(id="comp", background="bg", foreground="keyed")
    fg_graph.set_output_node(source="comp", kind="visual")

    v1 = engine.create_track("visual", name="Comp")
    engine.add_fusion_clip(
        fg_graph.id,
        visual_track_id=v1.id,
        input_assets={"subject": "a_01..."},
        start_ts=0.0,
        duration=5.0,
    )
```

### Reusing a Single-Input Graph as a Clip Effect

Any Fusion graph with one visual (or audio) input can be attached directly to any clip's effect stack with `as_effect()`:

```python
with engine.edit(label="attach fusion effect"):
    fx = engine.create_fusion_graph(name="Teal Grade")
    fx.add_input_node(id="in", port="in", kind="visual")
    fx.add_color_grade_node(id="grade", source="in", contrast=0.15, saturation=0.1)
    fx.set_output_node(source="grade", kind="visual")

    clip.add_effect(fx.as_effect(mix=0.8))
```
