# Compound & Template Clips

Nested sequences let you package multi-track edits into reusable building blocks — either as **Compound Clips** (parameterized nested sequences) or **Template Clips** (parameterized sequences with repeaters for lists, chapters, bullets, or lower-third series).

## Nested Sequences & Compound Clips

Create a nested sequence with `engine.create_sequence(name=...)`, build tracks and clips inside it by passing `sequence_id=seq.id`, and place it onto the root timeline with `engine.add_compound(...)`:

```python
from visualkit import Geometry

with engine.edit(label="create reusable card sequence"):
    card_seq = engine.create_sequence(name="Feature Card")
    v_bg = engine.create_track("visual", name="Card BG", sequence_id=card_seq.id)
    v_txt = engine.create_track("visual", name="Card Text", sequence_id=card_seq.id)

    engine.add_shape(
        Geometry.rect(700, 140, corner_radius=16.0),
        visual_track_id=v_bg.id,
        sequence_id=card_seq.id,
        start_ts=0.0,
        duration=3.0,
        fill="#1E293B",
    )
    title_clip = engine.add_text(
        "Default Title",
        visual_track_id=v_txt.id,
        sequence_id=card_seq.id,
        start_ts=0.0,
        duration=3.0,
        font_size=48,
        color="#F8FAFC",
    )
```

### Exposing Parameters with `declare_variable`

Expose internal clip properties on a nested sequence so every placed instance can override them independently:

```python
from visualkit import VariableTarget

with engine.edit(label="expose card title"):
    card_seq.declare_variable(
        "headline",
        label="Headline",
        type="string",
        targets=[VariableTarget(clip_id=title_clip.id, path="text")],
        default="Default Title",
    )

    root_v1 = engine.create_track("visual", name="Main")
    inst = engine.add_compound(
        card_seq.id,
        visual_track_id=root_v1.id,
        start_ts=0.0,
        duration=3.0,
        param_values={"headline": "Exact Rational Clocks"},
        include_audio=False,
    )
```

Update instance parameters later via `inst.visual.set_param("headline", "Updated Title")` or `set_params({...})`.

## Template Clips & Repeaters

When you need a sequence to repeat a group of clips *N* times (for example, an animated bullet list where each item staggers in by 0.5s and stacks vertically), attach a `RepeaterSpec` to the sequence and place it with `engine.add_template_clip(...)`:

```python
from visualkit import RepeaterLayout, RepeaterSpec, VariableSpec, VariableTarget

with engine.edit(label="configure bullet repeater"):
    list_seq = engine.create_sequence(name="Bullet List")
    v_row = engine.create_track("visual", name="Row", sequence_id=list_seq.id)
    row_text = engine.add_text(
        "Bullet item",
        visual_track_id=v_row.id,
        sequence_id=list_seq.id,
        start_ts=0.0,
        duration=1.5,
        font_size=42,
    )

    list_seq.set_repeater(
        member_clip_ids=[row_text.id],
        variables={
            "label": VariableSpec(
                slug="label",
                label="Item Label",
                type="string",
                targets=[VariableTarget(clip_id=row_text.id, path="text")],
                default="Bullet item",
            )
        },
        step=0.6,
        hold_to_end=True,
        layout=RepeaterLayout(offset_y=68.0),
    )

    root_v1 = engine.create_track("visual", name="Main")
    tmpl = engine.add_template_clip(
        list_seq.id,
        visual_track_id=root_v1.id,
        start_ts=1.0,
        count=3,
        repeat_values=[
            {"label": "1. Exact rational clocks"},
            {"label": "2. Atomic SQLite history"},
            {"label": "3. Multi-agent claimed regions"},
        ],
        include_audio=False,
    )
```

You can adjust the count or per-slot values later with `tmpl.visual.set_count(4)` and `tmpl.visual.set_repeat_values([...])`.

## Rules & Validation

- **No cycles**: A nested sequence cannot reference itself directly or indirectly (`SequenceCycleError`).
- **No root-sequence nesting**: Compound/template clips cannot play the root timeline itself.
- **Variable target protection**: Deleting a track or clip referenced by an active `VariableTarget` is blocked cleanly until the variable is removed.
- **Full compositing support**: Compound and template clips support nested Fusion graphs, adjustment clips, `Transform.crop`, and audio mixing automatically during preview and render.
