# Style, Text, Shapes & Templates

VisualKit includes a full vector styling system for typography, shapes, gradients, strokes, drop shadows, managed Noto fonts, and reusable parameterized motion-graphics templates.

> For crisp vector rasterization of text, shapes, and templates, install the `style` extra: `uv add "visualkit[style]"` (installs `skia-python`).

## Text Clips (`add_text`)

You can style `TextClip` using either **Tier-1 quick kwargs** (fast and concise) or an explicit **`TextStyle`** object (for full control). Pass one or the other, not both.

```python
from visualkit import Insets, Shadow

with engine.edit(label="styled title"):
    v1 = engine.create_track("visual", name="Titles")

    headline = engine.add_text(
        "Quarterly Product Launch",
        visual_track_id=v1.id,
        start_ts=0.0,
        duration=4.0,
        font_family="Noto Sans",
        font_size=84,
        font_weight=700,
        color="#FFFFFF",
        align="center",
        max_width=1400,
        bg_color="#0F172ACC",
        bg_radius=16.0,
        bg_padding=Insets(top=18, right=32, bottom=18, left=32),
        shadow=Shadow.drop(),
    )
    headline.place_at(960, 540)
```

Update text content later with `headline.set_text("New Headline")`.

### Managed Fonts

Text is rendered only with VisualKit's managed SIL OFL Noto faces; **system fonts are never used**, so typography is identical across machines. The font binaries are **not shipped in the wheel**: each face is downloaded on first use into `~/.visualkit/fonts/` (override with `VISUALKIT_FONTS_DIR`) and reused across projects. The first text render therefore needs network access and downloads roughly 27 MB (most of it the color-emoji font).

For offline or sandboxed environments, pre-populate the cache once while online, then block further downloads:

```python
from visualkit import BUNDLED_FAMILIES, ensure_all_fonts, ensure_font

print(sorted(BUNDLED_FAMILIES))                    # ['Noto Color Emoji', 'Noto Sans', 'Noto Sans Devanagari']
font_path = ensure_font("NotoSans-Regular.ttf")    # takes a managed *file name*, not a family name
ensure_all_fonts()                                 # {filename: local_path} for every managed face
```

```bash
export VISUALKIT_FONTS_OFFLINE=1   # fail fast instead of downloading
```

`font_family` must be one of `BUNDLED_FAMILIES` (any other value fails at preview/render time). To use your own typeface, register a `.ttf` / `.otf` / `.ttc` file as a FONT asset and reference it with `TextStyle(font_asset_id=...)`; WOFF/WOFF2 are not supported.

## Shape Clips (`add_shape`)

Build vector shapes with `Geometry` constructors (`Geometry.rect`, `Geometry.ellipse`, `Geometry.line`, `Geometry.path`) and `Paint` (`Paint.solid`, `Paint.linear`, `Paint.none`):

```python
from visualkit import Geometry, Paint, ShapeStroke, Shadow

with engine.edit(label="accent bar"):
    v1 = engine.create_track("visual", name="Graphics")

    pill = engine.add_shape(
        Geometry.rect(420, 88, corner_radius=20.0),
        visual_track_id=v1.id,
        start_ts=0.0,
        duration=4.0,
        fill=Paint.linear("#2563EB", "#7C3AED", angle=45.0),
        stroke=ShapeStroke(paint=Paint.solid("#FFFFFF"), width=3.0),
        shadow=Shadow.drop(),
    )
    pill.place_at(240, 920)
```

## Built-in Style Templates (`apply_template`)

VisualKit provides 5 built-in, schema-validated motion-graphics templates that instantiate multi-clip graphics atomically into a linked group:

| Template Name | Params Model | Purpose |
| --- | --- | --- |
| `title_card` | `TitleCardParams` | Full-screen or centered title + subtitle card |
| `lower_third` | `LowerThirdParams` | Speaker name & role bar with accent stripe |
| `subtitle` | `SubtitleParams` | Styled caption/subtitle block |
| `callout` | `CalloutParams` | Annotated pointer/callout box |
| `progress_ring` | `ProgressRingParams` | Animated circular progress indicator |

### Discover Templates & Schemas

```python
# List registered templates (detail="basic" or "full")
for info in engine.list_templates(detail="basic"):
    print(info.name, "-", info.description)

# Inspect JSON Schema for a template's parameters
schema = engine.template_schema("lower_third", detail="basic")
```

### Apply a Template

```python
from visualkit import LowerThirdParams

with engine.edit(label="add speaker lower third"):
    res = engine.apply_template(
        "lower_third",
        LowerThirdParams(title="Maya Lin", subtitle="Lead Editor"),
        start_ts=1.0,
        duration=4.0,
        auto_tracks=True,
    )
    print("Created clips:", {role: c.id for role, c in res.clips.items()})  # keyed by role
```

You can also register custom templates with `visualkit.register_template(...)`.
