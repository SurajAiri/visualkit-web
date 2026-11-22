# Reference: Effects, Adjustment Clips & Fusion DAGs

## Per-Clip Effect Stacks

```python
from visualkit import GaussianBlurEffect, VignetteEffect

with engine.edit(label="clip effects"):
    blur = clip.add_effect(GaussianBlurEffect(sigma=4.0))
    vig = clip.add_effect(VignetteEffect(angle=0.5, mix=0.35))
    clip.move_effect(vig.id, 0)
    clip.remove_effect(blur.id)
```

### Effect Parameter Quick-Reference (Strict Pydantic — Unknown Keys Rejected)

- **Visual**: `GaussianBlurEffect(sigma, sigma_v, steps)`, `DropShadowEffect(dx, dy, blur, color, opacity)`, `GlowEffect(radius, intensity, threshold, tint)`, `SharpenEffect(amount, radius)`, `PixelateEffect(block_size)`, `VignetteEffect(angle, center, mode, mix)`, `ChromaKeyEffect(color, similarity, smoothness, spill)`, `MaskEffect(...)`, `FusionEffect(graph_id, mix)`.
- **Audio**: `CompressorEffect(threshold_db, ratio, attack_ms, release_ms, makeup_db)`, `ReverbEffect(...)`, `EchoEffect(...)`, `DistortionEffect(...)`, `PanEffect(...)`, `AudioFusionEffect(graph_id, mix)`.
- **Audio EQ**: Not an `add_effect` item — set directly on `AudioClip` via `clip.equalizer.low`, `.mid`, `.high`, `.low_pass`, `.high_pass`.

## Adjustment Clips

Apply an effect stack to all tracks below over `[start_ts, start_ts + duration)`:

```python
from visualkit import VignetteEffect

with engine.edit(label="adjustment grade"):
    v_adj = engine.create_track("visual", name="Grade")
    engine.add_adjustment_clip(
        visual_track_id=v_adj.id,
        start_ts=0.0,
        duration=10.0,
        effects=[VignetteEffect(angle=0.5, mix=0.4)],
    )
```

## Fusion Node Graphs

A `FusionGraphEntity` must contain at least one node, must be acyclic, and must declare an output node via `set_output_node(source=..., kind="visual"|"audio")`. All node-builder arguments are keyword-only.

```python
with engine.edit(label="fusion chroma composite"):
    v1 = engine.create_track("visual", name="Comp")
    fg = engine.create_fusion_graph(name="Keyed Comp")
    fg.add_input_node(id="subject", port="subject", kind="visual")
    fg.add_generator_node(id="bg", kind="solid", color="#0F172A")
    fg.add_plugin_node(
        id="keyed",
        plugin="bg_remove",  # or "rembg" or "ffmpeg_lut"
        source="subject",
        kind="visual",       # "visual" or "mask"
        params={"key_color": "#00FF00", "similarity": 0.2, "feather": 2.0},
    )
    fg.add_merge_node(id="comp", background="bg", foreground="keyed", blend_mode="normal", opacity=1.0)
    fg.set_output_node(source="comp", kind="visual")

    engine.add_fusion_clip(
        fg.id,
        visual_track_id=v1.id,
        input_assets={"subject": "a_01..."},
        start_ts=0.0,
        duration=5.0,
    )
```

### Reusable Single-Input Fusion Effect (`as_effect()`)

```python
with engine.edit(label="fusion effect"):
    fx = engine.create_fusion_graph(name="LUT Effect")
    fx.add_input_node(id="in", port="in", kind="visual")
    # Valid offline LUTs: teal_orange, cinematic_warm, noir_bw, vintage_fade, crisp_daylight (plus remote kodak_2383_d65)
    # Note: ffmpeg_lut and bg_remove run natively in as_effect() and AdjustmentClip; rembg requires add_fusion_clip(..., input_assets=...)
    fx.add_plugin_node(id="lut", plugin="ffmpeg_lut", source="in", kind="visual", params={"lut": "teal_orange", "intensity": 0.7})
    fx.set_output_node(source="lut", kind="visual")
    clip.add_effect(fx.as_effect(mix=0.8))
```
