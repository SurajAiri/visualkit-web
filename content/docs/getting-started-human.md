# Getting Started (Human)

This guide is for people who want to make videos with VisualKit by **directing an AI coding agent** such as Claude Code, Codex, Cursor, or Gemini CLI, instead of writing the Python yourself. You bring the footage and the brief. The agent writes and runs the edits. You review previews and say what to change.

If you would rather write the edits yourself, see [Getting Started](getting-started.md).

## How the Pieces Fit

| Piece | Who provides it | Job |
| --- | --- | --- |
| **You** | You | Supply footage and a brief, review previews, approve the render |
| **Agent** | Claude Code, Codex, Cursor, Gemini CLI | Plans the edit and runs VisualKit commands in your terminal |
| **Skills** | VisualKit (`visualkit-editing`, `visualkit-collab`) | Teach the agent the API, the editing loop, and the common traps |
| **Engine** | The VisualKit library (`pip install visualkit`) | Validates every edit, records history, previews and renders with FFmpeg |

The agent does not guess how VisualKit works. The skills tell it, which is why importing them is step 2.

## What You Need

- An agent that runs **on your own machine** and can execute shell commands
- **Python 3.10+** and **FFmpeg and FFprobe** on your `PATH`
- Your video, audio, and image files in one folder

## 1. Set Up a Project Folder

Create a folder for the edit, with a subfolder for your media, and install VisualKit into it:

```bash
mkdir my-edit && cd my-edit
mkdir assets

python -m venv .venv && source .venv/bin/activate
pip install visualkit

ffmpeg -version
visualkit --help
```

Using `uv`? Run `uv init` and then `uv add visualkit` instead of the `venv` and `pip` lines.

Launch your agent from `my-edit`, so the project folder is its working directory.

## 2. Import the Skills

Skills are folders with a `SKILL.md` that the agent reads when a task matches. Unpack the bundle into the folder your agent scans:

| Agent | Project skills folder |
| --- | --- |
| Claude Code | `.claude/skills/` |
| Codex | `.agents/skills/` (or `~/.agents/skills/` for every project) |
| Cursor | `.cursor/skills/` |
| Gemini CLI | `.gemini/skills/` (or `~/.gemini/skills/` for every project) |

```bash
# Claude Code shown. Swap the folder for your agent.
mkdir -p .claude/skills
curl -fsSL https://visualkit.hyekai.com/downloads/skills/visualkit-skills-all.zip -o vk-skills.zip
unzip -qo vk-skills.zip -d .claude/skills
rm vk-skills.zip
```

Working from a clone of the VisualKit repository instead? The skills are in the [`skills/`](https://github.com/SurajAiri/visualkit/tree/main/skills) folder at the repository root, so copy `skills/visualkit-editing` and `skills/visualkit-collab` into your agent's skills folder rather than downloading the bundle.

Restart the agent, or open a new session, so it rescans its skills. Then check:

```text
Which VisualKit skills do you have available?
```

It should name `visualkit-editing` and `visualkit-collab`. If it does not, the files are in the wrong folder for that agent. You can also download each skill on its own: [`visualkit-editing.zip`](https://visualkit.hyekai.com/downloads/skills/visualkit-editing.zip) and [`visualkit-collab.zip`](https://visualkit.hyekai.com/downloads/skills/visualkit-collab.zip).

## 3. Give the Agent Your Assets

Copy your footage, music, and images into `assets/`, then point VisualKit at that folder. Set the variable in the **same terminal you launch the agent from**, so the commands it runs inherit it:

```bash
export VISUALKIT_PROJECT_DIR=./assets
```

VisualKit exposes that folder to edits as the virtual path `/proj`, so `assets/interview.mp4` is addressed as `/proj/interview.mp4`. See [Assets & Coded Visuals](assets.md) for how virtual paths work.

### Print the directory

An agent running locally works best when it can see exactly what you have. Print the folder and share the output, or ask the agent to run these itself:

```bash
pwd
ls -R assets
visualkit asset scan /proj --recursive
visualkit asset tree /proj --depth 2 --ids
```

- `pwd` gives the absolute path of the project, so the agent never has to guess where it is.
- `ls -R assets` shows the real file names and formats on disk.
- `asset scan` registers the media, and `asset tree` shows the `/proj/...` paths and asset IDs the agent will use in its edits.

If your agent runs in a sandbox or in the cloud, it cannot see folders on your computer. Upload or copy the files into the workspace it can access, then print that directory instead.

## 4. Write the First Prompt

Start with the skill, the location of the files, and what you want. Ask it to orient first and to preview before rendering:

```text
Use the visualkit-editing skill.

Project: my-edit.visualkit (create it if missing, 1080p, 30 fps)
Assets: ./assets, available as /proj

First print the asset tree and tell me what you found.
Then build a 15-second teaser from /proj/interview.mp4:
- open with a title card that reads "Launch Day"
- keep the strongest 10 seconds of the interview
- finish with a fade to black

Show me a preview contact sheet. Do not render until I approve.
```

Good prompts share a few traits: they name the skill, they give paths rather than descriptions, they state the length and look, and they say when to stop and ask.

## 5. Review, Adjust, Render

1. The agent edits and runs a preview, such as `visualkit preview grid`, which writes an image like `contact_sheet.jpg`.
2. Open the image and reply in plain language, for example "hold the title two seconds longer" or "crop tighter on the speaker".
3. Every change is a labelled, validated transaction, so a bad edit is rejected before it is saved.
4. When you like a version, say **"checkpoint this as first-cut"**. The `visualkit-collab` skill turns that into a named checkpoint you can return to.
5. When the previews look right, say **"render it to out.mp4"**.

To go back, ask the agent to restore the checkpoint. Restoring creates a new revision, so nothing is lost. See [Version Control & Collaboration](version-control-and-collaboration.md).

## Working with Several Agents

For parallel work, each agent can edit its own time range through a claimed region, and the engine refuses overlapping edits. The `visualkit-collab` skill covers workspaces and claims. Read [Version Control & Collaboration](version-control-and-collaboration.md) before running more than one agent on the same project.

## Troubleshooting

| Symptom | Likely cause | Fix |
| --- | --- | --- |
| Agent does not mention VisualKit skills | Skills are in the wrong folder, or the session predates them | Check the folder table above and restart the agent |
| Agent cannot find `/proj/...` | `VISUALKIT_PROJECT_DIR` is not set in the agent's terminal | Export it, restart the agent from that terminal, and print the directory again |
| `ffmpeg` or `ffprobe` not found | FFmpeg is not on your `PATH` | Install it and run `ffmpeg -version` |
| Shapes or vector templates look wrong | The `style` extra is missing | Install `visualkit[style]` as described in [Getting Started](getting-started.md) |
| Actor or coded-asset errors | A local dependency is not ready | Ask the agent to run `visualkit actors doctor` and `visualkit-doctor check` |

## Next Steps

- Browse the two skills and what each covers in the [`skills/`](https://github.com/SurajAiri/visualkit/tree/main/skills) folder.
- Learn the vocabulary the agent will use in [Core Concepts](core-concepts.md).
- Plan longer edits with [Director's Cut](director-cut.md).
