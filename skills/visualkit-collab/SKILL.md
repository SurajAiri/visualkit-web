---
name: visualkit-collab
description: Coordinate VisualKit project version control, branching, checkpoints, rollback, canonical JSON export/import, workspaces, and multi-agent claimed regions (`workspace`, `claim`, `branch`, `merge`, `checkpoint`, `diff`, `revert`, `restore`). Use whenever running parallel editing agents on the same timeline, experimenting on alternate branches, or safely rolling back edits.
---

# VisualKit Collaboration, Branching & Claimed-Regions Playbook

Use this playbook when experimenting on alternate cuts, rolling back safely, or orchestrating multiple agents editing the same VisualKit project in parallel. For timeline editing, effects, actors, preview, and render, use `visualkit-editing`.

## 1. Checkpoints & Safe Rollback

Always drop a checkpoint before destructive edits or major restructuring:

```bash
visualkit checkpoint new before-reorg --db project.visualkit --format json
visualkit diff before-reorg HEAD --db project.visualkit --format json

# Non-destructive restore (creates a new revision matching the checkpoint)
visualkit restore before-reorg --db project.visualkit --format json

# Invert a single past revision
visualkit revert <REV_ID> --db project.visualkit --format json
```

Inside a single Python session, use `engine.undo()` and `engine.redo()`.

## 2. Branching & 3-Way Entity Merge

Use branches when testing independent creative directions or isolating a full-timeline pass:

```bash
visualkit branch new alt-cut --from main --db project.visualkit --format json
visualkit branch list --db project.visualkit --format json

# Edit on the branch
visualkit exec alt_edit.py --db project.visualkit --branch alt-cut --format json

# Merge back into main (exit code 3 on entity conflict; resolve with --prefer ours|theirs)
visualkit merge alt-cut --into main --db project.visualkit --format json
visualkit merge alt-cut --into main --prefer theirs --db project.visualkit --format json
```

## 3. Workspaces (`VISUALKIT_WORKSPACE`)

Bind a session to a branch so `exec`, `status`, `log`, `diff`, `checkpoint`, `export`, `preview`, `render`, and `director` all follow that branch automatically:

```bash
visualkit workspace new --branch alt-cut --slug ws-color --db project.visualkit --format json
export VISUALKIT_PROJECT=project.visualkit
export VISUALKIT_WORKSPACE=ws-color

visualkit status --format json
visualkit workspace list --format json
visualkit workspace close ws-color --format json
```

## 4. Multi-Agent Claimed Regions (Parallel Editing on One Branch)

When multiple agents edit disjoint time windows of the **same branch** concurrently (e.g. Agent A edits `[0s, 30s)` while Agent B edits `[30s, 60s)`), use claimed regions so each agent works in isolation without merge conflicts.

### Step 1: Grant Non-Overlapping Claims

```bash
visualkit workspace new --slug agent-a --claim 0 30 --on-straddle split --db project.visualkit --format json
visualkit workspace new --slug agent-b --claim 30 60 --on-straddle split --db project.visualkit --format json
```

`--on-straddle` policies when existing clips cross a claim boundary:
- `reject` (default): refuse the claim (`exit_code = 4`)
- `expand`: widen the granted range to enclose straddling clips
- `split` (`--split`): cleanly split straddling clips (preserving linked A/V and keyframes) at the boundary

If a claim grant fails, the newly created workspace is rolled back automatically (no orphan workspace is left behind).

### Step 2: Edit Inside Claim-Local Coordinates

- Each claimant runs `visualkit exec ... --workspace <SLUG>`.
- Inside a claimant's `exec`, its claimed window is shifted to start at **`0.0s`** (claim-local coordinates).
- Non-claimants cannot write to the branch while claims are active (`exit_code = 4`).
- `visualkit render` refuses unsettled (claimed) branches (`exit_code = 4`).

### Step 3: Release or Abort Every Claim

```bash
# Splice edited slice back into branch; if duration changed by delta, downstream clips,
# downstream claims, and ripple-following Director's Cut markers/storyboards shift automatically:
visualkit claim release agent-a --db project.visualkit --format json
visualkit claim release agent-b --db project.visualkit --format json

# Or discard a failed agent's work cleanly (restores original slice and removes claimant-added entities/markers):
visualkit claim abort agent-a --db project.visualkit --format json
```

Verify `"settled": true` with `visualkit status --db project.visualkit --format json` before running `visualkit render`.

## 5. Git-Diffable Canonical Export / Import

```bash
visualkit export ./project_snapshot --db project.visualkit --format json
visualkit import ./project_snapshot --db project.visualkit --branch imported --create-branch --dry-run --format json
visualkit import ./project_snapshot --db project.visualkit --branch imported --create-branch --format json
```

## 6. Orchestrator Checklist

1. Create a checkpoint on `main` before dispatching parallel subagents.
2. Grant disjoint `[start, end)` claims with `--on-straddle split` (or `reject` if boundaries must be clean).
3. Pass each subagent its own `--workspace <SLUG>` and remind it that its slice starts at `0.0s`.
4. Release completed claims (`claim release`) or abort failed ones (`claim abort`).
5. Confirm `settled: true` via `visualkit status --format json`, preview the stitched timeline with `visualkit preview grid`, then render.
