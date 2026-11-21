# Version Control & Multi-Agent Collaboration

Every VisualKit project (`project.visualkit`) is a thread-safe, content-addressed SQLite store supporting full Git-style version control plus **claimed regions** for safe parallel multi-agent editing on the same timeline.

## History, Diff, Undo & Rollback

### In-Memory Session Undo / Redo

Inside a Python session, every `with engine.edit():` block creates an atomic `Step`:

```python
engine.undo()   # Step backward one committed Step
engine.redo()   # Re-apply one undone Step
```

### Persistent Revisions, Checkpoints & Rollback (CLI)

```bash
# View project overview and commit log
visualkit status --db project.visualkit
visualkit log --db project.visualkit --limit 20

# Inspect past script execution runs
visualkit runs --db project.visualkit --limit 10

# Create named checkpoints before risky edits
visualkit checkpoint new before-color-pass --db project.visualkit
visualkit checkpoint list --db project.visualkit

# Diff any two revisions, checkpoints, or branches
visualkit diff before-color-pass HEAD --db project.visualkit

# Non-destructive rollback: creates a new revision matching the target checkpoint/rev
visualkit restore before-color-pass --db project.visualkit

# Invert a single past revision (creates a new revert revision)
visualkit revert rev_01... --db project.visualkit
```

## Branching & 3-Way Entity Merge

Fork alternate cuts instantaneously by content hash (zero media duplication):

```bash
# Fork a feature branch from main (or from a checkpoint/revision)
visualkit branch new alt-pacing --from main --db project.visualkit
visualkit branch list --db project.visualkit

# Edit on the branch
visualkit exec fast_cut.py --db project.visualkit --branch alt-pacing

# Three-way entity merge back into main
visualkit merge alt-pacing --into main --db project.visualkit

# Resolve entity conflicts explicitly with --prefer ours | theirs
visualkit merge alt-pacing --into main --prefer theirs --db project.visualkit
```

## Git-Diffable Canonical Export & Import

Export any settled revision as a deterministic directory of canonical JSON files (ideal for Git review or external tooling) and import it back onto a branch:

```bash
visualkit export ./project_json --db project.visualkit
visualkit import ./project_json --db project.visualkit --branch imported --create-branch --dry-run
visualkit import ./project_json --db project.visualkit --branch imported --create-branch
```

## Workspaces & `VISUALKIT_WORKSPACE`

A **workspace** binds an agent or human session to a branch and tracks its last revision and optional claimed time window:

```bash
# Create a workspace on a branch
visualkit workspace new --branch alt-pacing --slug ws-editor --db project.visualkit

# Bind environment variables for all subsequent CLI commands (exec, status, log, diff, checkpoint, preview, render, director)
export VISUALKIT_PROJECT=project.visualkit
export VISUALKIT_WORKSPACE=ws-editor

# Or spawn an interactive subshell with VISUALKIT_PROJECT, VISUALKIT_WORKSPACE, and PS1 pre-set
visualkit shell ws-editor --db project.visualkit

# List and close workspaces
visualkit workspace list --db project.visualkit
visualkit workspace close ws-editor --db project.visualkit
```

## Multi-Agent Claimed Regions

When multiple agents edit different sections of the **same branch** simultaneously (for example, Agent A edits `[0s, 30s)` while Agent B edits `[30s, 60s)`), **claimed regions** isolate each agent without merge conflicts:

### How Claimed Regions Work

1. **Grant a claim** on a half-open timeline interval `[start, end)`:
   ```bash
   visualkit workspace new --slug agent-intro --claim 0 30 --on-straddle split --db project.visualkit
   visualkit workspace new --slug agent-outro --claim 30 60 --on-straddle split --db project.visualkit
   ```
   `--on-straddle` controls what happens if an existing clip crosses a claim boundary:
   - `reject` (default) — refuse the claim (`EXIT_CLAIM_REFUSED = 4`)
   - `expand` — widen the granted region to enclose straddling clips
   - `split` (or `--split`) — cleanly split straddling clips (preserving linked A/V and keyframes) at the claim boundary
2. **Edit in claim-local coordinates**:
   - Inside `visualkit exec --workspace agent-outro`, the agent sees its claimed slice shifted to start at `0.0s`.
   - Other non-claimants are blocked from writing to the branch while claims are active (`EXIT_CLAIM_REFUSED = 4`).
   - If a claim grant fails (overlap or invalid range), the workspace is rolled back automatically — no orphan workspaces are left behind.
3. **Release or Abort**:
   - **Release (`visualkit claim release agent-intro`)**: Splices the agent's edited slice back into the branch. If the slice grew or shrank by `delta` seconds, downstream clips, downstream claims, and ripple-following Director's Cut markers/storyboards shift automatically!
   - **Abort (`visualkit claim abort agent-intro`)**: Discards all entities created/modified by that claimant (including claimant-added markers and storyboards) and restores the original slice untouched.

```bash
# Release finished claims back onto main
visualkit claim release agent-intro --db project.visualkit
visualkit claim release agent-outro --db project.visualkit

# Once all claims are released, the branch is settled and ready to render
visualkit status --db project.visualkit
visualkit render final.mp4 --db project.visualkit
```
