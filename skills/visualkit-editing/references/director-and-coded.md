# Reference: Director's Cut & Coded Visual Assets

## Director's Cut (Non-Rendered Planning & Review Layer)

Director's Cut entities (`EditingPlan`, `StageDef`, `StoryboardClip`, `DirectorMarker`) are **never rendered**, **never appear in previews**, and **never alter actual video/audio clips**.

- **Ripple alignment is a feature**: markers and storyboards with `follow="ripple"` shift automatically with `ripple_insert`, `ripple_delete`, `close_gap`, and `claim release`. Use `follow="fixed"` to lock to wall-clock time.
- **Item-anchored markers**: attach to a clip via `item_id` + `item_offset` so the marker tracks the clip through moves, ripples, and splits.

### CLI Workflow

```bash
visualkit director stage add rough_cut --title "Rough Cut" --format json
visualkit director plan set-approach "Crisp 45s demo" --format json
# Syntax: storyboard add <START_S> <DURATION_S> "<INTENT>" (2nd arg is duration, not end time)
visualkit director storyboard add 2.5 8.0 "Hook viewer" --title "Act 1" --format json
visualkit director storyboard hint set <SB_ID> rough_cut --note "Trim dead air" --format json
visualkit director storyboard tree --stage rough_cut --format json
visualkit director storyboard context <SB_ID> --stage rough_cut --include-content --format json
visualkit director storyboard hint status <SB_ID> rough_cut resolved --format json

# Time-anchored or item-anchored marker
visualkit director marker add 2.5 --title "Beat drop" --stage rough_cut --storyboard-id <SB_ID> --format json
visualkit director marker add --item <CLIP_ID> --offset 1.0 --title "Zoom in" --stage rough_cut --format json
visualkit director marker list --stage rough_cut --status open --format json
visualkit director broken-refs --format json
```

## Coded Visual Assets (HTML & Remotion)

Check compiler readiness before registering coded assets:

```bash
visualkit-doctor list
visualkit-doctor check html_asset_compiler
visualkit-doctor steps remotion
```

Register and resolve coded visuals through `AssetResolver`:

```bash
visualkit asset register-coded /proj/title_card \
  --source /proj/graphics/title.html \
  --compiler html_asset_compiler \
  --params '{"title": "VisualKit"}' \
  --format json

visualkit asset resolve /proj/title_card --params '{"title": "Custom"}' --format json
```
