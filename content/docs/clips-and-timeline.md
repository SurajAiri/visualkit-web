# Clips & Timeline Editing

This guide covers tracks, clip placement, spatial transforms and cropping, color grading, speed curves, and non-linear editing operations (split, trim, ripple insert/delete, gap closing).

## Tracks

Every clip lives on either a `VisualTrack` (`stream="visual"` or `"video"`) or an `AudioTrack` (`stream="audio"`). Tracks use fractional ordering so inserting or reordering tracks never renumbers other tracks.

```python
with engine.edit(label="setup tracks"):
    v_bg = engine.create_track("visual", name="Background")
    v_fg = engine.create_track("visual", name="Foreground")
    a_vo = engine.create_track("audio", name="Voiceover")

    # Reorder a track to index 0 within its stream
    engine.move_track(v_fg.id, index=0)

# Inspect tracks in order
for th in engine.tracks():
    print(th.id, th.name, th.track.kind.value, len(th.clips()))
```

Locked tracks (`locked=True`) refuse edits and are skipped automatically by sequence-wide operations (`split_all`, `ripple_insert`, `ripple_delete`, `close_gap`) when `skip_locked=True` (the default).

## Placing Clips

`VisualkitEngine` provides dedicated constructors for each clip type:

| Method | Creates | Typical Use |
| --- | --- | --- |
| `engine.add_media(asset_id, ...)` | `MediaClip` and/or `AudioClip` | Video, image, audio, or coded assets (auto-links A/V streams) |
| `engine.add_text(text, visual_track_id=...)` | `TextClip` | Titles, captions, callouts |
| `engine.add_shape(geometry, visual_track_id=...)` | `ShapeClip` | Rectangles, ellipses, lines, vector paths |
| `engine.add_adjustment_clip(...)` | `AdjustmentClipVisual` / `Audio` | Track-wide color grades or effects affecting layers below |
| `engine.add_fusion_clip(graph_id, ...)` | `FusionClipVisual` / `Audio` | Node-based Fusion compositing or audio graphs |
| `engine.add_compound(seq_id, ...)` | `CompoundClipVisual` / `Audio` | Reusable nested sequences |
| `engine.add_template_clip(seq_id, ...)` | `TemplateClipVisual` / `Audio` | Parameterized nested sequences with repeaters |
| `engine.create_clip(clip, track_id=...)` | Any `AllClip` model | Low-level placement when constructing a clip model directly |

`add_media` never silently drops streams: if a video asset has both video and audio, either supply both `visual_track_id` and `audio_track_id`, or explicitly set `include_audio=False` / `include_visual=False`.

## Spatial Transforms & Cropping (`Transform.crop`)

Every visual clip has a `transform` (`Transform`) with `translation`, `rotation`, `scale`, `opacity`, and `crop` (`Crop`).

### Positioning on the Canvas

`Transform.translation` is relative to canvas center `(0, 0)`. Use `clip.place_at(x, y)` or `engine.canvas_pos(x, y)` to place a clip using top-left pixel coordinates:

```python
with engine.edit(label="position overlay"):
    # Place top-left corner at canvas (80, 60)
    clip.place_at(80, 60, anchor=(0.0, 0.0))
    clip.transform.scale = (0.5, 0.5)
    clip.transform.rotation = -3.0
    clip.transform.opacity = 0.9
```

### Cropping & Fitting (`crop_to`)

`Transform.crop` (supported on media, coded, and compound/template visual clips) crops a clip into a target viewport box (`width`, `height`) with `fit` (`FitMode.COVER`, `CONTAIN`, `STRETCH`, `NONE`), `alignment` (`CropAlignment.CENTER`, `TOP_LEFT`, `TOP`, `BOTTOM`, etc.), and `source_position` pan offset. Note that `crop_to(w, h)` sets the clip's output box to `w×h` (it does not auto-scale to canvas dimensions—pair with `transform.scale` for full-frame punch-in zooms):

```python
from visualkit import CropAlignment, FitMode

with engine.edit(label="vertical crop"):
    # Crop 16:9 footage into a 9:16 1080x1920 box, anchored to top center
    clip.crop_to(1080, 1920, fit=FitMode.COVER, alignment=CropAlignment.TOP)
```

## Color Grading & Human Scales

Adjust color directly on `clip.color` (`ColorEffects`) or use the intuitive human-scale helper `clip.set_human_props(...)` (signed percent offsets where `0` = unchanged for brightness/contrast/saturation/vibrance, and `0–100` for opacity):

```python
with engine.edit(label="grade clip"):
    clip.set_human_props(
        brightness=5,       # subtle lift
        contrast=12,        # +12% contrast
        saturation=10,      # +10% saturation
        opacity=95,         # 95% opacity
    )
```

Read back normalized human values with `clip.get_human_props()`.

## Speed & Variable Speed Curves

### Constant Speed

```python
with engine.edit(label="2x timelapse"):
    clip.set_speed(2.0, shrink_to_fit=True)
```

Note that slowing a clip (e.g., `clip.set_speed(0.5)`) does **not** automatically lengthen its timeline duration; if you want the clip to play longer on the timeline, open space with `engine.ripple_insert(...)` and extend it with `clip.trim_tail(...)`.

### Speed Ramping (`set_speed_curve` / `TimeMap`)

For variable speed ramps (e.g., `1x → 0.4x → 1x`), pass `SpeedPoint(at=, speed=, interpolation=)` to `clip.set_speed_curve(...)` (or `clip.set_speed(TimeMap(...))`). Source time is computed automatically as the exact integral of `speed` over clip time (`SpeedInterpolation.LINEAR` or `HOLD`):

```python
from visualkit import SpeedInterpolation, SpeedPoint

with engine.edit(label="slow-mo ramp"):
    clip.set_speed_curve([
        SpeedPoint(at=0.0, speed=1.0, interpolation=SpeedInterpolation.LINEAR),
        SpeedPoint(at=1.5, speed=0.4, interpolation=SpeedInterpolation.LINEAR),
        SpeedPoint(at=4.0, speed=1.0),
    ])
```

## Non-Linear Editing Operations

All editing operations preserve linked A/V groups, split/remap `AnimEntity` keyframes accurately, and automatically keep ripple-following Director's Cut markers and storyboards aligned.

### Split, Move & Trim

```python
with engine.edit(label="trim and split"):
    # Move clip to t=1.0s
    clip.move(1.0)

    # Trim head (in-point) and tail (out-point) in timeline seconds
    clip.trim_head(1.5)
    clip.trim_tail(6.0)

    # Split a single clip (and its linked audio sibling) at timeline t=3.5s
    # (plain float is clip-relative ClipTime; wrap in TimelineTime for timeline seconds)
    from visualkit import TimelineTime
    split_res = clip.split(TimelineTime(3.5))
    left, right = split_res.left, split_res.right

    # Snap fractional timestamps onto the exact project FPS grid (helpful for 23.976/29.97 fps)
    dur = engine.snap(3.5)  # returns exact Time; use start_ts.to_plain_time() to convert TimelineTime -> Time

    # Split every clip across all unlocked tracks at t=5.0s
    engine.split_all(5.0)
    engine.trim_head_all(0.5)
    engine.trim_tail_all(12.0)
```

### Ripple Editing & Gap Closing

```python
with engine.edit(label="ripple edit"):
    # Open a 2.0s gap at t=4.0s (splits spanning clips and shifts downstream clips + ripple markers)
    engine.ripple_insert(at=4.0, duration=2.0)

    # Delete [6.0s, 8.5s] and pull downstream clips left by 2.5s
    engine.ripple_delete(start=6.0, end=8.5)

    # Close an empty gap on track v1 around t=3.0s
    engine.close_gap(track_id=v1.id, at=3.0)

    # Shift everything starting at or after t=10.0s forward by 1.5s
    engine.shift_items(from_t=10.0, delta=1.5)
```
