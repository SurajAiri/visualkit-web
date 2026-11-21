# Keyframes & Animation

Every animatable property on a clip (`transform.opacity`, `transform.translation`, `transform.scale`, `transform.rotation`, `color.brightness`, effect parameters, shape/text properties, etc.) can be keyframed with exact rational timestamps and smooth easing curves.

## Two-Layer Keyframe Model (`PRE` vs. `POST`)

VisualKit stores keyframes in `AnimEntity` records separated into two explicit layers so speed changes and splits behave predictably:

| Layer | Clock | When to use |
| --- | --- | --- |
| `Layer.PRE` (`"pre"`, default) | Source / anim time (before speed mapping) | Animations tied to the media content itself (e.g., tracking a moving subject in footage) |
| `Layer.POST` (`"post"`) | Clip local time (`0` to `clip.duration`, after speed mapping) | Timing relative to the edited cut (e.g., 0.35s fade-in, slide-in, fade-out regardless of clip speed) |

### Layer Combine Semantics (`PRE` + `POST`)

- **`Layer.PRE`** replaces the clip's static property value at evaluation time (and stretches/reverses with `TimeMap`).
- **`Layer.POST`** combines onto the evaluated `PRE` (or static) base according to the field's `Combine` policy:
  - `Combine.ADD` (default for most properties, including `translation`, `rotation`, and `color` offsets)
  - `Combine.MULTIPLY` (used by `transform.scale` and `transform.opacity`)
  - `Combine.REPLACE` (used where an explicit replacement policy is declared)

When you split a clip with `clip.split(at)`, VisualKit automatically preserves and remaps both `PRE` and `POST` keyframes across the left and right halves.

## Adding, Moving & Inspecting Keyframes

Use `clip.keyframe(...)` (or `clip.add_keyframe(...)`) inside an `engine.edit()` block:

```python
from visualkit import BezierHandles, InterpolationMode, Layer, Vec2d

with engine.edit(label="animate title"):
    # POST-layer fade in over 0.5s
    clip.keyframe("transform.opacity", 0.0, 0.0, layer=Layer.POST, interpolation=InterpolationMode.EASE_OUT)
    clip.keyframe("transform.opacity", 0.5, 1.0, layer=Layer.POST)

    # Custom cubic Bezier slide
    clip.keyframe(
        "transform.translation",
        0.0,
        Vec2d(x=0.0, y=60.0),
        layer=Layer.POST,
        interpolation=InterpolationMode.BEZIER,
        bezier=BezierHandles(out_x=0.22, out_y=1.0, in_x=0.36, in_y=1.0),
    )
    clip.keyframe("transform.translation", 0.6, Vec2d(x=0.0, y=0.0), layer=Layer.POST)
```

### Managing Existing Keyframes

```python
# Query keyframes on a property path
kfs = clip.get_keyframes("transform.opacity", layer=Layer.POST)

# Evaluate the interpolated value at clip time t=0.25s
val = clip.value_at("transform.opacity", 0.25)

# Evaluate the full clip snapshot at timeline time t=1.25s
evaluated_clip = clip.evaluate(1.25)

# Move, remove, or clear keyframes
with engine.edit(label="adjust fade"):
    clip.move_keyframe("transform.opacity", 0.5, 0.8, layer=Layer.POST)
    clip.remove_keyframe("transform.opacity", 0.8, layer=Layer.POST)
    clip.clear_keyframes("transform.opacity")
```

### Interpolation Modes

- `InterpolationMode.LINEAR` — constant rate between keyframes
- `InterpolationMode.HOLD` (step) — holds the previous value until the next keyframe
- `InterpolationMode.EASE_IN`, `EASE_OUT`, `EASE_IN_OUT` — smooth standard easing
- `InterpolationMode.BEZIER` — custom cubic Bezier via `BezierHandles(out_x, out_y, in_x, in_y)`

## Built-in Motion Presets

`ClipHandle` includes chainable motion presets that write clean `POST`-layer keyframes automatically:

```python
with engine.edit(label="motion presets"):
    title.fade_in(0.35).slide_in(dy=40.0, duration=0.4).fade_out(0.35)
    badge.pop_in(from_scale=0.85, duration=0.3).slide_out(dx=60.0, duration=0.35)
    underline.draw_in(duration=0.6)  # animates stroke draw progress on ShapeClip
```

| Preset | Signature | Effect |
| --- | --- | --- |
| `fade_in` | `(duration=0.35, easing=EASE_OUT)` | Opacity `0 → current` at clip head |
| `fade_out` | `(duration=0.35, easing=EASE_IN)` | Opacity `current → 0` at clip tail |
| `slide_in` | `(dx=0.0, dy=0.0, duration=0.4, easing=EASE_OUT)` | Offsets entry by `(dx, dy)` into resting position |
| `slide_out` | `(dx=0.0, dy=0.0, duration=0.4, easing=EASE_IN)` | Slides out by `(dx, dy)` at clip tail |
| `pop_in` | `(from_scale=0.85, duration=0.3, easing=EASE_OUT)` | Scales from `from_scale` to resting scale |
| `draw_in` | `(duration=0.6, easing=EASE_IN_OUT)` | Animates stroke reveal on `ShapeClip` |

> **Important**: Once a property has keyframes, mutate it via `clip.keyframe(...)` rather than direct scalar assignment (`clip.transform.opacity = ...` raises `AnimatedAssignmentError` to prevent accidentally overwriting an animated curve).
