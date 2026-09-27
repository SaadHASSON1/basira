"""Draws brand/story-light.svg and brand/story-dark.svg: the hero story (bars -> eye) as a looping SMIL
animation, for places without JavaScript such as the GitHub README. Run: python tools/story_svg.py

SMIL can only morph between paths with the same commands, so every shape is written as M + 8 cubic curves."""

from pathlib import Path


def line(p, q):
    return (p[0] + (q[0] - p[0]) / 3, p[1] + (q[1] - p[1]) / 3), (p[0] + 2 * (q[0] - p[0]) / 3, p[1] + 2 * (q[1] - p[1]) / 3), q


def path(start, segs):
    out = [f"M{start[0]:.1f} {start[1]:.1f}"]
    for a, b, c in segs:
        out.append(f"C{a[0]:.1f} {a[1]:.1f} {b[0]:.1f} {b[1]:.1f} {c[0]:.1f} {c[1]:.1f}")
    return " ".join(out) + "Z"


def upper_lid():
    s = (432, 163)
    return path(s, [line(s, (635, 163)), ((745, 163), (830, 250), (845, 370)), ((850, 405), (842, 430), (828, 452)),
                    ((790, 395), (700, 345), (610, 345)), line((610, 345), (525, 345)), ((455, 345), (412, 290), (412, 210)),
                    line((412, 210), (412, 183)), ((412, 172), (421, 163), (432, 163))])


def lower_lid():
    s = (838, 717)
    return path(s, [line(s, (635, 717)), ((525, 717), (440, 630), (425, 510)), ((420, 475), (428, 450), (442, 428)),
                    ((480, 485), (570, 535), (660, 535)), line((660, 535), (745, 535)), ((815, 535), (858, 590), (858, 670)),
                    line((858, 670), (858, 697)), ((858, 708), (849, 717), (838, 717))])


def bar_like_upper(x1, x2, top, bottom=717):
    """Walks the bar the way the upper lid is walked: top edge rightwards, down the right side, back along the bottom."""
    xm, ym = (x1 + x2) / 2, (top + bottom) / 2
    pts = [(x1, top), (xm, top), (x2, top), (x2, ym), (x2, bottom), (xm, bottom), (x1, bottom), (x1, ym), (x1, top)]
    return path(pts[0], [line(pts[i], pts[i + 1]) for i in range(8)])


def bar_like_lower(x1, x2, top, bottom=717):
    xm, ym = (x1 + x2) / 2, (top + bottom) / 2
    pts = [(x2, bottom), (xm, bottom), (x1, bottom), (x1, ym), (x1, top), (xm, top), (x2, top), (x2, ym), (x2, bottom)]
    return path(pts[0], [line(pts[i], pts[i + 1]) for i in range(8)])


KEYS = "0;0.22;0.42;0.86;1"
SPLINES = "0 0 1 1;0.65 0 0.35 1;0 0 1 1;0.65 0 0.35 1"


def morph(a, b):
    return (f'<animate attributeName="d" dur="7s" repeatCount="indefinite" calcMode="spline" keyTimes="{KEYS}" '
            f'keySplines="{SPLINES}" values="{a};{a};{b};{b};{a}"/>')


def fade(attr, a, b):
    return (f'<animate attributeName="{attr}" dur="7s" repeatCount="indefinite" calcMode="spline" keyTimes="{KEYS}" '
            f'keySplines="{SPLINES}" values="{a};{a};{b};{b};{a}"/>')


def svg(brand, accent, grid):
    up, lo = upper_lid(), lower_lid()
    bars = [(420, 500, 517, "lower", 0.45), (536, 616, 397, "lower", 0.6), (652, 732, 457, "upper", 0.75),
            (768, 848, 247, "upper", 1)]
    body = []
    for x1, x2, top, lid, op in bars:
        start = bar_like_lower(x1, x2, top) if lid == "lower" else bar_like_upper(x1, x2, top)
        end = lo if lid == "lower" else up
        body.append(f'<path fill="{brand}" fill-opacity="{op}" d="{start}">{morph(start, end)}{fade("fill-opacity", op, 1)}</path>')
    lines = "".join(f'<line x1="400" x2="870" y1="{y}" y2="{y}"/>' for y in (317, 417, 517, 617))
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="380 120 510 640" width="340" height="427" role="img" aria-label="Basira: from numbers to insight">
<g stroke="{grid}" stroke-width="2">{lines}{fade("opacity", 1, 0)}</g>
{"".join(body)}
<polyline points="460,490 576,370 692,430 808,222" fill="none" stroke="{accent}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round">{fade("opacity", 1, 0)}</polyline>
<circle cx="808" cy="222" r="20" fill="{accent}">{fade("cx", 808, 628)}{fade("cy", 222, 440)}{fade("r", 20, 63)}{fade("fill", accent, brand)}</circle>
</svg>
'''


here = Path(__file__).resolve().parents[1] / "brand"
(here / "story-light.svg").write_text(svg("#066262", "#b86e12", "#dfe4ea"), encoding="utf-8")
(here / "story-dark.svg").write_text(svg("#3fb5a9", "#f0b35a", "#2a383b"), encoding="utf-8")
print("ok")
