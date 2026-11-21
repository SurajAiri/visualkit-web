# Core Concepts

VisualKit is designed so timeline math never drifts, invalid edits never corrupt a project, and every change is inspectable, undoable, and mergeable.

## Exact Rational Clocks

Floating-point timestamps accumulate drift at non-integer frame rates like `29.97` (`30000/1001`) or `23.976` (`24000/1001`). VisualKit represents all timestamps and durations as exact `fractions.Fraction` values wrapped in domain-specific clock types:

| Clock Type | Meaning | Example |
| --- | --- | --- |
| `Time` | Generic duration or offset | `Time(2.5)`, `Time("1/3")`, `Time.from_frames(15, fps=30)` |
| `TimelineTime` | Position on a sequence timeline (`>= 0`) | `start_ts=TimelineTime(4.0)` |
| `ClipTime` | Local time inside a clip (`0` = clip start) | Keyframes on the `POST` layer |
| `SourceTime` | Time inside the underlying media file | `source_in=SourceTime(10.0)`, keyframes on the `PRE` layer |
| `AnimTime` | Clock used by keyframe tracks (`PRE` = source/anim time, `POST` = clip time) | Internal animation evaluation |

Most high-level engine methods (`add_media`, `add_text`, `move`, `split`, `trim_head`, etc.) automatically coerce `int`, `float`, `Fraction`, and string timestamps (such as `"00:01:15.5"`, `"2.5"`, or `"1001/30000"`).

## Flat Entity Architecture

Instead of a deeply nested mutable object graph, a VisualKit project is stored as a flat, normalized `ProjectState` dictionary of immutable Pydantic entities:

- **`meta`** (`ProjectMeta`) — project title, `fps`, `resolution`, `timeline_id`, and `editing_plan`
- **`sequences`** (`dict[str, SequenceEntity]`) — nested sequences for compound and template clips
- **`tracks`** (`dict[str, VisualTrack | AudioTrack]`) — ordered tracks using fractional order keys
- **`items`** (`dict[str, TrackItem]`) — timeline placements (`track_id`, `sequence_id`, `start_ts`, `duration`, `source_in`, `speed`, `time_map`)
- **`clips`** (`dict[str, AllClip]`) — clip content (`MediaClip`, `AudioClip`, `TextClip`, `ShapeClip`, `CodedVisualClip`, `CompoundClipVisual`, `TemplateClipVisual`, `FusionClipVisual`, `AdjustmentClipVisual`, and audio counterparts)
- **`anims`** (`dict[AnimKey, AnimEntity]`) — keyframe tracks decoupled from clip structs so splits, trims, and diffs stay clean
- **`fusion_graphs`** (`dict[str, FusionGraphEntity]`) — reusable node-based compositing/audio graphs
- **`assets`** / **`compiled`** / **`compiler_versions`** — pinned asset metadata and coded-asset build records
- **`markers`** / **`storyboards`** — Director's Cut planning entities (strictly isolated from rendering)

### State Lifecycle: `ProjectStore` → `Snapshot` → `Session` → `Draft`

1. **`ProjectStore`** (SQLite): Durable, content-addressed history of revisions, branches, checkpoints, workspaces, and active claims.
2. **`Snapshot`**: Immutable point-in-time `ProjectState` loaded from a revision.
3. **`Session`**: In-memory undo/redo stack of validated `Step` patches on top of a base `Snapshot`.
4. **`Draft`**: Copy-on-write staging buffer where edits happen. Uncommitted mutations never leak into `Session` or `ProjectStore`.

## Handle API & Transactions

You interact with entities through lightweight handles (`ClipHandle`, `TrackHandle`, `SequenceHandle`, `FusionGraphHandle`, `MarkerHandle`, `StoryboardHandle`) returned by `VisualkitEngine`. Handles always read and write through the live `Draft` so they stay valid across commits, undos, and splits.

Wrap related mutations in `with engine.edit(label=...):`:

```python
with engine.edit(label="place intro and fade"):
    v1 = engine.create_track("visual", name="V1")
    title = engine.add_text("Episode 1", visual_track_id=v1.id, start_ts=0, duration=3.0)
    title.fade_in(0.4)
```

- **On normal exit**: `engine.edit()` runs incremental integrity validation and commits a `Step` into `Session`.
- **On any exception** (including validation failure or an error inside a nested `edit()` block): the entire transaction rolls back cleanly to the pre-`edit()` state — nothing partial is kept.
- **Persistence**: Call `engine.save()` in Python (or let `visualkit exec` save automatically at script exit) to flush committed steps atomically to SQLite.

## Inspecting Project State

`VisualkitEngine` exposes symmetric inspection helpers so both humans and agents can orient themselves without touching internal tables:

```python
engine.tracks()                          # All root-timeline TrackHandles (ordered visual, then audio)
engine.tracks(stream="visual")           # Visual tracks only
engine.clips()                           # All ClipHandles in time order
engine.clips(track_id=v1.id)             # Clips on a specific track
engine.sequences()                       # All nested SequenceHandles
engine.fusion_graphs()                   # All FusionGraphHandles
engine.list_markers(status="open")       # Open Director's Cut markers
engine.list_storyboards(root_only=True)  # Top-level storyboard sections
engine.summary()                         # Compact JSON-serializable overview dict
```

## Integrity Validation

Every `commit()` validates the mutated entities incrementally (`validate_incremental`), and `validate_full()` checks the entire project graph. VisualKit enforces:

- No overlapping clips on the same track (`TrackOverlapError`)
- No stream mismatches (e.g., audio clip on a visual track: `StreamMismatchError`)
- No source out-of-bounds trims against pinned media duration (`ClipRangeError`)
- No cycles in nested compound/template sequences (`SequenceCycleError`) or Fusion DAGs
- No dangling references across tracks, items, clips, anims, markers, or storyboards
- Frame-grid alignment warnings (`FrameGridWarning`) and keyframe range warnings (`KeyframeRangeWarning`)

## Script Execution (`visualkit exec`)

`visualkit exec` runs one or more Python files (or `-c CODE`) against a project store with:

- **Pre-injected global**: `engine` (`VisualkitEngine`)
- **Shared Draft**: Multiple script files in a single `exec` share one `Draft` and namespace, committing atomically at the end (or per step with `--persist steps`).
- **Import allowlist**: `visualkit` plus pure standard library modules (`collections`, `copy`, `dataclasses`, `datetime`, `decimal`, `enum`, `fractions`, `functools`, `itertools`, `json`, `math`, `random`, `re`, `string`, `typing`, `uuid`).
- **Structured diagnostics**: Collects field/graph errors and attaches actionable `cascade_hint` messages in both text and `--format json` modes.

## CLI Exit Codes

Every `visualkit` command uses deterministic exit codes:

| Exit Code | Constant | Meaning |
| --- | --- | --- |
| `0` | `EXIT_SUCCESS` | Command succeeded |
| `1` | `EXIT_VALIDATION_ERROR` | Timeline integrity, schema, or compatibility validation failed |
| `2` | `EXIT_SCRIPT_CRASH` | Script runtime exception, syntax/import error, or missing file/resource |
| `3` | `EXIT_MERGE_CONFLICT` | Three-way branch merge or concurrent save hit an entity conflict |
| `4` | `EXIT_CLAIM_REFUSED` | Operation blocked by an active claimed region or unsettled project |
