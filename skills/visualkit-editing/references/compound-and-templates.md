# Reference: Compound Clips, Exposed Variables & Template Repeaters

## Nested Sequence + Exposed Variable (`add_compound`)

`declare_variable` requires `label=` and `type=` (`"string"`, `"number"`, `"integer"`, `"boolean"`, `"json"`, or `"asset"`):

```python
from visualkit import VariableTarget

with engine.edit(label="compound card"):
    seq = engine.create_sequence(name="Title Card")
    v_txt = engine.create_track("visual", name="Text", sequence_id=seq.id)
    txt = engine.add_text("Default", visual_track_id=v_txt.id, sequence_id=seq.id, start_ts=0.0, duration=3.0)

    seq.declare_variable(
        "headline",
        label="Headline",
        type="string",
        targets=[VariableTarget(clip_id=txt.id, path="text")],
        default="Default",
    )

    inst = engine.add_compound(
        seq.id,
        visual_track_id=root_v1.id,
        start_ts=0.0,
        duration=3.0,
        param_values={"headline": "Custom Title"},
        include_audio=False,
    )
    inst.visual.set_param("headline", "Updated Title")
```

## Repeater Template Clip (`set_repeater` + `add_template_clip`)

`SequenceHandle.set_repeater(...)` takes keyword arguments directly (`member_clip_ids`, `variables`, `step`, `hold_to_end`, `layout`). Each entry in `variables` is a `VariableSpec`:

```python
from visualkit import RepeaterLayout, VariableSpec, VariableTarget

with engine.edit(label="repeater bullets"):
    seq = engine.create_sequence(name="Bullets")
    v_row = engine.create_track("visual", name="Row", sequence_id=seq.id)
    row = engine.add_text("Item", visual_track_id=v_row.id, sequence_id=seq.id, start_ts=0.0, duration=1.5)

    seq.set_repeater(
        member_clip_ids=[row.id],
        variables={
            "label": VariableSpec(
                slug="label",
                label="Item Label",
                type="string",
                targets=[VariableTarget(clip_id=row.id, path="text")],
                default="Item",
            )
        },
        step=0.6,
        hold_to_end=True,
        layout=RepeaterLayout(offset_y=68.0),
    )

    tmpl = engine.add_template_clip(
        seq.id,
        visual_track_id=root_v1.id,
        start_ts=1.0,
        count=3,
        repeat_values=[{"label": "First"}, {"label": "Second"}, {"label": "Third"}],
        include_audio=False,
    )
```

## Rules

- Cycles between nested sequences are rejected (`SequenceCycleError`).
- Compound/template clips cannot play the root timeline itself.
- A `CompoundClip`'s `duration` cannot exceed the nested sequence's content span (`ClipSourceError`).
- Tracks/clips referenced by an active `VariableTarget` cannot be deleted until the variable is removed.
