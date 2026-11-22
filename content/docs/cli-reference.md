# CLI Reference

VisualKit installs two command-line entrypoints:

- **`visualkit`** (also runnable via `python -m visualkit`) — main project, asset, actor, director, preview, and render CLI
- **`visualkit-doctor`** (also runnable via `python -m visualkit.coded.doctor`) — coded visual compiler diagnostics and installer

## Global Conventions

- **JSON output**: Almost every command supports `--format json` (and `--format text`, default).
  - Success payloads include `{"ok": true, ...}`.
  - Failure payloads include `{"ok": false, "exit_code": <int>, "message": "..."}`.
- **Database resolution**: `--db PATH` overrides `VISUALKIT_PROJECT`, which overrides default `./project.visualkit`.
- **Workspace resolution**: `--workspace SLUG` overrides `VISUALKIT_WORKSPACE`. Commands that accept `--branch` automatically follow the active workspace's branch when `--branch` is omitted.

## Environment Variables

| Variable | Purpose |
| --- | --- |
| `VISUALKIT_PROJECT` | Default SQLite project database path |
| `VISUALKIT_WORKSPACE` | Active workspace slug (steers branch & claim ownership) |
| `VISUALKIT_PROJECT_DIR` | Project assets directory for `AssetResolver` |
| `VISUALKIT_GLOBAL_DIR` | Global assets directory |
| `VISUALKIT_HOME_DIR` | Home assets root directory |
| `VISUALKIT_CACHE_DIR` | Coded-asset cache directory |
| `VISUALKIT_CHROME` | Chrome/Chromium binary path for HTML/Remotion compilers |
| `VISUALKIT_REMOTION_PROJECT` | Remotion project directory holding `node_modules` |
| `VISUALKIT_REMOTION_BROWSER` | Existing Chrome/Chromium for Remotion to use instead of downloading its own |
| `VISUALKIT_CHROME_ARGS` | Extra browser launch args for the HTML compiler, shell-split (e.g. `--no-sandbox` inside containers) |
| `VISUALKIT_FONTS_DIR` | Managed-font cache directory (default `~/.visualkit/fonts`) |
| `VISUALKIT_FONTS_OFFLINE` | Set to `1` to forbid font downloads; text rendering then needs a pre-populated font cache |
| `VISUALKIT_SESSION_TOKEN` | Session token for the remote actor proxy (see *Remote actor proxy* below; not usable in this release) |

## Exit Codes

| Code | Meaning |
| --- | --- |
| `0` | Success |
| `1` | Validation / compatibility error |
| `2` | Script crash, syntax/import error, or missing file/resource |
| `3` | Merge conflict |
| `4` | Claim refused or unsettled project |

---

## Project, History & Workspace Commands

| Command | Description |
| --- | --- |
| `visualkit init [PATH] [--fps 30] [--width 1920] [--height 1080] [--title ...] [--author ...]` | Initialize (or open) a SQLite project store |
| `visualkit status [--db ...] [--branch ...] [--workspace ...] [--format json]` | Show compact project overview (tracks, clips, sequences, claims, director counts) |
| `visualkit exec [FILES...] [-c CODE] [--dry-run] [--fail-fast] [--persist run\|steps] [--autosave] [--init]` | Execute Python editing script(s) with pre-injected `engine` global |
| `visualkit log [--branch ...] [--rev ...] [--workspace ...] [--limit 50] [--branch-only]` | List revision ancestry |
| `visualkit runs [--workspace ...] [--outcome ...] [--limit 50]` | List recorded script execution runs |
| `visualkit diff REF_A [REF_B] [--branch ...] [--workspace ...]` | Diff two revisions, checkpoints, or branches (`REF_B` defaults to `HEAD`) |
| `visualkit revert REV [--branch ...] [--workspace ...] [--author ...] [--label ...]` | Create a new revision inverting `REV` |
| `visualkit restore TARGET [--branch ...] [--workspace ...] [--author ...] [--label ...]` | Create a new revision matching checkpoint, rev, or branch `TARGET` |
| `visualkit checkpoint new NAME [--rev ...] [--branch ...] [--workspace ...] [--force]` | Create or move a named checkpoint |
| `visualkit checkpoint list` / `delete NAME` | List or delete checkpoints |
| `visualkit branch new NAME [--from main]` / `list` / `delete NAME` | Fork, list, or delete branches |
| `visualkit merge SOURCE [--into main] [--prefer ours\|theirs]` | Three-way entity merge of `SOURCE` into target branch |
| `visualkit export DIR [--ref ...] [--branch ...] [--allow-claimed]` | Export canonical git-diffable JSON directory |
| `visualkit import DIR [--branch main] [--dry-run] [--create-branch]` | Import canonical JSON directory onto a settled branch |
| `visualkit workspace new [--branch main] [--slug ...] [--ttl 1800] [--claim START END] [--on-straddle reject\|expand\|split]` | Create a workspace (optionally with a claimed region) |
| `visualkit workspace list [--branch ...]` / `close [SLUG]` | List or close workspaces |
| `visualkit claim START END [--on-straddle reject\|expand\|split] [--workspace ...]` | Grant a claimed region |
| `visualkit claim release [SLUG]` / `abort [SLUG]` | Splice & ripple-release a claim, or discard it cleanly |
| `visualkit shell SLUG [--db ...] [--shell ...]` | Spawn a subshell with `VISUALKIT_PROJECT` and `VISUALKIT_WORKSPACE` set |

## Asset Commands (`visualkit asset` / `visualkit assets`)

Shared flags (accepted before or after subcommands): `--assets-dir`, `--global-assets-dir`, `--home-assets-dir`, `--cache-dir`, `--variant`, `--actor`, `--role`, `--format text|json`.

| Command | Description |
| --- | --- |
| `visualkit asset register VPATH [-d DESC] [-t TAG]` | Probe and register a media file |
| `visualkit asset register-coded VPATH --source SRC --compiler SLUG [--params JSON]` | Compile and register an HTML/Remotion coded asset |
| `visualkit asset scan VDIR [--recursive \| --no-recursive]` | Scan a virtual directory for media files |
| `visualkit asset resolve TARGET [--params JSON]` | Resolve metadata, variant path, and fingerprint |
| `visualkit asset path TARGET [--params JSON]` / `source-path TARGET` | Print readable media path or coded source path |
| `visualkit asset info TARGET` (alias `get`) | Show full asset record and variants |
| `visualkit asset find [--text ...] [--kind ...] [--tag ...] [--ext ...] [--has-audio] [--min-width ...]` | Search registered assets |
| `visualkit asset tree [VPATH] [--depth 2] [--ids]` / `ls [VPATH]` | Browse virtual directory hierarchy |
| `visualkit asset describe TARGET [TEXT \| --clear]` / `tag TARGET [--add T] [--remove T]` | Update metadata |
| `visualkit asset refresh TARGET [--rebase]` / `remove TARGET` (alias `rm`) | Validate/rebase or forget asset record |
| `visualkit asset duplicates` / `paths` | Find duplicate signatures or inspect resolved paths |
| `visualkit asset variant list TARGET` / `add TARGET TAG VPATH` / `remove TARGET TAG` | Manage proxy/alternate variants |
| `visualkit asset mount list` / `add VPREFIX ROOT` / `remove VPREFIX` / `remap VPREFIX NEW_ROOT [--dry-run]` | Manage virtual mounts |

## Actor Commands (`visualkit actor` & `visualkit actors`)

| Command | Description |
| --- | --- |
| `visualkit actors list` / `info SLUG` / `models SLUG` / `doctor [SLUG]` | Inspect actors, schemas, models, and readiness |
| `visualkit actors install SLUG [--model NAME] [--no-venv] [--dry-run]` | Install local actor venv and model weights |
| `visualkit actors run SLUG [-p KEY=VAL ...] [--out-dir DIR] [--save-asset]` | Invoke any CLI actor with key=value params |
| `visualkit actor [--project-dir DIR] [--save-asset] <SLUG> <SUBCMD> [...] [--format json]` | Run an actor's native subcommands (`bg_remove`, `ffmpeg_lut`, `local_broll`, `media_tools`, `rembg`, `transcribe`) |

## Director's Cut Commands (`visualkit director`)

| Command | Description |
| --- | --- |
| `visualkit director stages` / `stage add\|update\|rename\|remove\|reorder\|list` | Manage workflow stage registry and open counts |
| `visualkit director plan set-approach TEXT` | Set high-level project editing approach |
| `visualkit director storyboard add\|list\|tree\|context\|move\|update\|delete` | Manage nested storyboard scenes |
| `visualkit director storyboard hint set\|remove\|status` | Manage per-stage hints on storyboard clips |
| `visualkit director marker add\|list\|update\|delete` | Manage time-anchored and item-anchored review markers |
| `visualkit director broken-refs` | Report broken asset/clip references or broken item anchors |

### Additional Director's Cut commands

| Command | Description |
| --- | --- |
| `visualkit director stage list` | Same listing as `director stages` (open marker/hint counts per stage) |
| `visualkit director stage update SLUG [--title ...] [--description ...]` / `rename OLD NEW` / `reorder SLUG [SLUG ...]` | Edit, rename, or reorder stages |
| `visualkit director stage remove SLUG` | Remove a stage; refused (exit `2`) while any marker or storyboard hint still references it |
| `visualkit director storyboard list [--status ...] [--exclude-status ...] [--stage ...] [--author ...] [--tag ...] [--follow ripple\|fixed] [--parent-id ...] [--root-only] [--sequence-id ...] [--at T] [--start-ts T] [--end-ts T] [--search TEXT]` | Filtered flat listing of storyboards |
| `visualkit director storyboard update ID [--start-ts ...] [--duration ...] [--follow ripple\|fixed] [--intent ...] [--title ...] [--status ...] [--author ...] [--color ...]` | Edit a storyboard. A storyboard's status is derived from its stage hints and children, so only `rejected`/`deferred` can be set directly |
| `visualkit director storyboard delete ID [--children-policy error\|cascade\|reparent] [--keep-marker-links]` | Delete a storyboard |
| `visualkit director storyboard hint remove ID STAGE` | Remove a stage hint from a storyboard |
| `visualkit director marker delete ID` | Delete a marker |

## Preview & Render Commands

| Command | Description |
| --- | --- |
| `visualkit preview frame [--target timeline] [--at 0.0] [--transparent] [-o PATH]` | Render a single preview frame |
| `visualkit preview video [--target timeline] [--start 0.0] [--duration ...] [-o PATH]` | Render a trimmed preview video snippet |
| `visualkit preview grid [--target timeline] [--frames 6] [--cols ...] [-o PATH]` | Render a contact-sheet preview grid |
| `visualkit preview compare TARGET1 TARGET2 [...] [--frames 6] [-o PATH]` | Render a multi-target comparison grid |
| `visualkit preview source ASSET [--mode path\|frame\|video\|grid] [--at 0.0] [-o PATH]` | Preview a raw source media asset directly |
| `visualkit render OUTPUT [--branch ...] [--workspace ...] [--ref ...] [--resolution WxH] [--fps ...] [--audio-mode auto\|always\|never] [--allow-stale] [--dry-run] [--verbose]` | Render a settled project revision via FFmpeg |

### Additional preview options

`preview frame|video|grid|compare` also accept `--ref REF` (preview a revision/checkpoint instead of the branch head) and `--no-animated`. `grid`/`compare` accept `--rows`, `--cols`, `--img-format jpeg|png` and `--quality` (JPEG compression, 1-100); `grid` and `video` accept `--start`/`--end` to restrict the time window. Run `visualkit preview <sub> --help` for the exact set.

### Additional asset commands and filters

| Command | Description |
| --- | --- |
| `visualkit asset variant remove TARGET TAG` | Detach a variant from an asset |
| `visualkit asset mount remove PREFIX` | Remove a mount; refused (exit `2`) while assets are still served through it (remove or `remap` them first) |
| `visualkit asset find [--desc ...] [--name-glob ...] [--under VPATH] [--mime ...] [--has-visual\|--no-has-visual] [--has-audio\|--no-has-audio] [--min-height N] [--min-duration-ms N] [--max-duration-ms N] [--sort ...] [--limit N]` | Additional `find` filters beyond those shown in the Assets guide |
| `visualkit asset register\|register-coded\|resolve\|path ... --params-file FILE` | Read coded-asset params from a JSON file instead of inline `--params` |

### Additional actor commands

| Command | Description |
| --- | --- |
| `visualkit actor media_tools probe INPUT` | One-line media summary (resolution, duration, codec, audio) |
| `visualkit actor ffmpeg_lut luts [--query ...] [--tag ...]` / `download [--lut NAME]` | List or fetch LUTs |
| `visualkit actor rembg models\|download\|remove\|install\|doctor` and `visualkit actor transcribe engines\|models\|run\|install\|doctor` | Optional ML actors. Not installed by default (`actors install rembg` / `transcribe` first); `remove` and `run` expose many model/device options, see `--help` |
| `visualkit actor <slug> doctor` | Check one actor's dependencies |

### Features not available in this release

- **`visualkit actors search` and `visualkit actors sync`** are disabled: they exit `1` with "only built-in local actors are accessible", even though they still appear in `--help`.
- **Remote actor proxy:** `visualkit auth token create|list|update|revoke` talk to a proxy server whose address is hardcoded to `http://127.0.0.1:8787` (deliberately not configurable, so a prompt-injected agent cannot redirect a session token). The production server has not launched, so without a local dummy server on that port these commands fail with `Unable to reach VisualKit proxy server` (exit `2`). Every built-in actor supports only `--runtime local` (`--runtime remote` is rejected up front with `supported: ['local']`).

## Coded Compiler Doctor (`visualkit-doctor`)

| Command | Description |
| --- | --- |
| `visualkit-doctor list` | Show which coded-asset compilers (`html_asset_compiler`, `remotion`) are ready |
| `visualkit-doctor check [SLUG] [--deep]` | Detailed dependency report (`--deep` launches headless browser self-test) |
| `visualkit-doctor install [SLUG] [--dry-run]` | Automatically install missing compiler dependencies |
| `visualkit-doctor steps SLUG` | Print numbered manual setup instructions |
