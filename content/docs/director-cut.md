# Director's Cut (Planning & Review Layer)

The **Director's Cut** is a first-class planning, storyboarding, and review layer built directly into every VisualKit project. It lets directors, reviewers, and AI agents structure an edit into stages, nested storyboard scenes, and timeline/clip-anchored review markers.

> **Strict Render & Clip Isolation**: Markers, storyboard clips, editing plans, and stage hints are **never rendered**, **never appear in previews**, and **never alter actual video/audio clips**.

## Core Concepts

1. **Editing Plan & Stage Registry** (`EditingPlan`, `StageDef`) — High-level editing approach plus an ordered registry of workflow stage slugs (e.g., `rough_cut`, `broll`, `color`, `polish`).
2. **Storyboard Clips** (`StoryboardClip`) — Time-ranged planning blocks (`start_ts`, `duration`, `intent`) that can nest hierarchically (`parent_id`) from Act → Scene → Shot, attach rich `description` / `sketch` / `references`, and carry per-stage `StageHint`s.
3. **Director Markers** (`DirectorMarker`) — Point-in-time notes, review comments, or beat markers. Markers can be:
   - **Time-anchored** (`timestamp`, with `follow="ripple"` or `follow="fixed"`)
   - **Item-anchored** (`item_id` + `item_offset` in clip-local time), which automatically track their clip when it moves, ripples, or splits!
4. **Ripple Alignment**: Markers and storyboards with `follow="ripple"` automatically shift alongside `ripple_insert`, `ripple_delete`, `close_gap`, and `claim_release` ripple deltas — while `follow="fixed"` stays locked to absolute wall-clock time.

## Workflow in Python

```python
from visualkit import StageHint

with engine.edit(label="setup director plan"):
    engine.set_approach("Fast-paced 60s product launch with crisp motion graphics.")
    engine.add_stage("rough_cut", title="Rough Cut", description="Assemble A-roll and story beats")
    engine.add_stage("polish", title="Polish", description="Titles, color grade, SFX")

    # Root storyboard section + nested child shot
    act1 = engine.add_storyboard(
        0.0,
        12.0,
        "Hook viewer with the core problem",
        title="Act 1: Hook",
        follow="ripple",
    )
    shot1 = act1.add_child(
        0.0,
        4.0,
        "Cold open punchline",
        title="Shot 1A",
    )
    shot1.set_hint("rough_cut", StageHint(note="Trim first 0.5s of dead air"))
    shot1.set_hint("polish", StageHint(note="Add kinetic title card at 0.3s"))

    # Time-anchored marker linked to storyboard
    m1 = engine.add_marker(
        2.0,
        title="Beat drop",
        stage="polish",
        storyboard_id=shot1.id,
        follow="ripple",
    )

    # Item-anchored marker attached 1.5s into an actual clip
    m2 = engine.add_marker(
        item_id=my_clip.id,
        item_offset=1.5,
        title="Punch in 110% here",
        stage="rough_cut",
    )
```

### Querying Focused Context (Agent-Friendly)

Instead of dumping the entire project, query pruned trees or focused local context for a specific stage:

```python
# Pruned storyboard tree for open `rough_cut` work
tree = engine.get_storyboard_tree(stage="rough_cut", status="open")

# Focused local context for one scene (ancestors, children, stage hint, markers)
ctx = engine.get_storyboard_context(shot1.id, stage="rough_cut", include_content=True)

# Resolve a stage hint when done
with engine.edit(label="complete rough cut on shot 1A"):
    shot1.resolve_hint("rough_cut")
    m2.resolve()

# Audit any broken asset_ids, clip references, or deleted item anchors
broken = engine.list_broken_references()
```

## CLI Workflow (`visualkit director`)

Every Director's Cut operation is available directly from the CLI (all support `--db`, `--branch`, `--workspace`, and `--format json`):

```bash
# Stages & editing plan
visualkit director stage add rough_cut --title "Rough Cut"
visualkit director stage add polish --title "Polish"
visualkit director stages
visualkit director plan set-approach "Tight 60s launch edit"

# Storyboards & stage hints
visualkit director storyboard add 0 12 "Opening hook" --title "Act 1" --format json
visualkit director storyboard hint set sb_01... rough_cut --note "Cut dead air"
visualkit director storyboard hint status sb_01... rough_cut resolved
visualkit director storyboard tree --stage rough_cut
visualkit director storyboard context sb_01... --stage rough_cut --include-content
visualkit director storyboard move sb_01... 2.0

# Markers (time-anchored or item-anchored)
visualkit director marker add 3.5 --title "Beat drop" --stage polish --storyboard-id sb_01...
visualkit director marker add --item <clip_id> --offset 1.2 --title "Audio pop" --stage polish
visualkit director marker list --stage polish --status open
visualkit director marker update mrk_01... --status resolved

# Integrity check for broken references
visualkit director broken-refs
```
