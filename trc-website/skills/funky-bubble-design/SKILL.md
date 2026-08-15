---
name: funky-bubble-design
description: Visual style guide for building loud, playful, "funky" websites and UI in the vein of bubble-letter cartoon logos — thick outlines, candy-bright colors, inflated 3D type, sticker/badge elements, and toy-like plastic energy. Use this whenever the user asks for something "funky," "fun," "playful," "bubbly," "poppy," "cartoony," "kids brand," "toy-like," "candy-colored," "Y2K," or references a mascot/sticker/badge logo aesthetic — even if they don't use the word "design." Works alongside the frontend-design skill: read that one first for general process, then read this one for the specific playful-maximalist aesthetic direction and its CSS techniques.
---

# Funky Bubble Design

This skill covers ONE aesthetic direction, not the whole design process — read `frontend-design/SKILL.md` first for the brainstorm → plan → critique → build loop, brief-grounding, and copywriting guidance. This file adds the specific visual vocabulary for the "funky/bubbly" look: the reference point is bubble-letter mascot logos like theme-park or snack-brand marks — chunky rounded type with heavy outlines sitting on a single saturated color field, with a little 3D sticker or extruded tag for a subtitle.

Not every "fun" or "playful" brief wants THIS exact look — a brief for a kids' reading app might want soft pastel and rounded-but-thin type; a brief for a skate brand might want grungy stickers instead of clean bubbles. Treat what's below as a toolbox of moves, pick the ones that fit the brief's actual subject, and don't apply all of them at once.

## The core visual vocabulary

**Inflated, rounded type.** Letters read as soft 3D objects, not flat glyphs — thick, consistent stroke weight, generous rounding on every corner, counters (the holes in letters like "e," "o," "d") kept large and round. This is a *type* choice as much as an effect: pick or fake a face where letterforms are already chunky (rounded slab/geometric sans with high x-height) rather than trying to inflate a thin face.

**Heavy outline + fill.** Most signature letterforms in this style aren't just colored type — they're a fill color plus a contrasting outline 1/8–1/6 of the letter's stroke width, which is what makes them read as stickers/objects sitting on the page rather than printed text. See CSS technique below.

**One loud saturated field color.** These designs commit to a single bright background (marigold, hot coral, grape purple, bubblegum pink) rather than gradients or busy patterns — the contrast comes from 2-3 other colors in the type/elements, not from the background doing more work.

**The extruded tag/badge.** A secondary label (subtitle, CTA, price tag) rendered as a solid-color 3D block — like it's been pushed out of the page — with a visible side face suggesting depth, often at a slight rotation. This is the "signature element" move: one of these per page, not scattered everywhere.

**Stickers, stamps, and badges.** Circular or die-cut-looking elements (a "new!" burst, a rating stamp, a copyright/registered mark treated as a physical sticker) that look peeled-and-applied rather than printed — usually via a rotation offset (−4° to 8°) and a hard drop shadow.

**Hard offset shadows, not soft blurs.** Depth comes from a crisp, unblurred shadow offset a fixed distance (like a screen print registration error or a sticker's drop shadow), not a soft `blur(20px)` glow. This is what separates "funky/toy" from "generic soft-UI."

**Wobble over precision.** Borders, underlines, and dividers can be intentionally hand-drawn/imperfect (slightly varying stroke, a wavy rather than straight line) — this signals playful/human rather than corporate-precise. Use sparingly, on secondary elements, not the whole layout.

## CSS techniques

### Outlined bubble text
`-webkit-text-stroke` alone looks thin and flat. Layer it with a filled duplicate and an offset shadow for real depth:

```css
.bubble-text {
  color: #3949E0; /* fill */
  -webkit-text-stroke: 10px #3949E0;
  paint-order: stroke fill; /* outline sits behind the fill, not on top of it */
  text-shadow:
    0 4px 0 #1a2299,      /* hard, unblurred — a "bottom edge" not a glow */
    0 8px 12px rgba(0,0,0,0.15); /* faint lift off the page, optional */
}
```
For a light outline color around a dark fill (like white haloing over the background), stack two text layers absolutely positioned, one slightly larger/stroked behind the other — more control than `text-stroke` alone, especially at small sizes where stroke can eat the counters.

### Extruded 3D tag (the "CLUB" block move)
Build the side face with a `::after` skewed and darkened, so the block reads as pushed forward:

```css
.tag {
  position: relative;
  display: inline-block;
  background: #E8483F;
  color: white;
  padding: 0.4em 1em;
  transform: rotate(-3deg);
}
.tag::after {
  content: "";
  position: absolute;
  top: 6px; left: -6px;
  width: 100%; height: 100%;
  background: #B23A32; /* darker shade of the tag color */
  z-index: -1;
  transform: skew(-8deg, 0);
}
```
Keep the offset small (4–8px) — a bigger offset reads as a shadow, not a beveled edge.

### Hard sticker shadow
```css
.sticker {
  box-shadow: 6px 6px 0 rgba(0,0,0,0.85); /* zero blur = sticker, not glow */
  border-radius: 999px;
  transform: rotate(6deg);
}
```

### Chunky tactile button
```css
.btn-funky {
  background: #FFD23F;
  border: 4px solid #1a1a1a;
  border-radius: 16px;
  box-shadow: 5px 5px 0 #1a1a1a;
  font-weight: 800;
  transition: transform 0.1s, box-shadow 0.1s;
}
.btn-funky:active {
  transform: translate(5px, 5px);
  box-shadow: 0 0 0 #1a1a1a; /* shadow "tucks under" on press — satisfying, cheap to build */
}
```

### Wobbly hand-drawn divider
Use an SVG path with a couple of irregular curve points instead of a straight `<hr>`:
```html
<svg viewBox="0 0 300 12" class="wobble-rule"><path d="M2 6 Q 40 2, 80 7 T 160 5 T 240 8 T 298 4" stroke="#1a1a1a" stroke-width="4" fill="none" stroke-linecap="round"/></svg>
```

## Color

Pick one dominant saturated field color, then 2–3 supporting colors that are fully saturated too — this style avoids muddy or muted tones almost entirely. A reliable starter formula: warm saturated background (marigold/coral/grape) + one cool bold accent for type (royal blue/violet/teal) + one hot accent for tags/CTAs (red/hot pink) + off-white or cream for a "paper" contrast layer, not pure white. Avoid tasteful desaturated palettes here — restraint in this style comes from layout and spacing discipline, not from toning down the colors.

## Motion

If animating: squash-and-stretch on hover/click (scale unevenly on x/y for a beat, like the object is made of rubber), a slight rotate-and-settle on entrance, or a wiggle loop on a sticker element. Keep timing snappy (150–250ms) with an overshoot ease (`cubic-bezier(0.34, 1.56, 0.64, 1)`) — linear or slow ease-in-out motion undercuts the toy-like energy. As with `frontend-design`'s guidance: pick one or two moments to animate, not everything.

## Restraint checklist before shipping

- Is there exactly one "signature" extruded/badge element, not three competing for attention?
- Is the background one committed color, not a gradient trying to do the accent's job?
- Do shadows stay hard-edged (0 blur) rather than drifting into soft-UI glow territory?
- Is wobble/imperfection confined to secondary elements (dividers, stamps) rather than the main grid, which should still be readable and aligned?
- Does the body/UI text stay legible (a normal, high-legibility face) even though the display type is inflated — don't apply the bubble treatment to paragraph text or form labels.
