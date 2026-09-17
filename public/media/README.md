# Films and generated imagery

Every film here is scrubbed by scroll or plays as a quiet loop behind copy; every object in
`public/generated/` rests on a tile inside a frame that carries the product shadow. All of it was
generated with Higgsfield (September 2026) from the prompts below, then normalised locally with
ffmpeg (H.264, yuv420p, 24fps, a keyframe every 12 frames so seeking is smooth, no audio,
`+faststart`) and sharp (WebP). The DOM renders no type inside any of it: the type (Newsreader and IBM Plex Sans) lives in the page.

Films are optional at runtime: `<ScrubVideo>` and `<AmbientVideo>` remove themselves when a source
fails, the scene's own choreography stays, and the e2e console-hygiene check ignores `/media/*.mp4`,
`/media/*.jpg`, and `/generated/*`. Under `prefers-reduced-motion` the poster still stands in.

## Films (`public/media/`)

| File                                                                                               | Used by                                                                 | Length    | Size       | Behaviour                                                                                                                                                                                                                                                                                                         |
| -------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- | --------- | ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `hero-ambient.mp4`                                                                                 | Home `HomeHero`, behind the whole light tile                            | 14s loop  | 1.5 MB     | the site's original hero film, restored (not Higgsfield): a paper-toned tabletop model with glass blocks and glowing green paths; ping-pong loop baked into the file (the 7s forward, then reversed) at 60% opacity, leaning a few px toward the pointer; centre crop at every width; poster under reduced motion |
| `term-seal.mp4` · `term-envelope.mp4` · `term-scale.mp4` · `term-stack.mp4` · `term-hourglass.mp4` | Home `TermsStrip` (`ObjectFilm`), one framed object per term            | 5s each   | 0.2–0.5 MB | turntables: scrubbed by the pointer's x across the frame, drifting on their own while on screen; the seal, scale and hourglass are re-cropped to their centre 72% so all five objects fill their frames alike                                                                                                     |
| `market-desk-live.mp4`                                                                             | Home `MarketScene`, behind the paper choreography (tablet up)           | 17s loop  | 0.7 MB     | continuous ping-pong loop at 60% opacity with a 3% scroll parallax; the bottom 7% (the desk's front edge, a seam under the paper) is cropped out; hidden on phones                                                                                                                                                |
| `ledger-glass.mp4`                                                                                 | Home `FinancialPrep`, inside the demo's `DemoFrame`                     | 8.6s loop | 0.3 MB     | loops at 35% behind the ledger rows, tablet up                                                                                                                                                                                                                                                                    |
| `privacy-room.mp4`                                                                                 | Home `PrivacyScene`, framed inside the demo's record column (tablet up) | 20s loop  | 1.3 MB     | take 2: daylight rises behind the glass and settles again (ping-pong); `object-right` keeps the glass in the tall frame; loops at 60% under the record card, never under copy                                                                                                                                     |
| `status-board.mp4`                                                                                 | Home `SellerWorkload`, inside the demo's `DemoFrame`                    | 8.6s loop | 0.2 MB     | loops at 20% behind the stage strip and the letters, tablet up                                                                                                                                                                                                                                                    |
| `speed-hourglasses.mp4`                                                                            | Home `SpeedSection`, framed beside the headline                         | 10s scrub | 1.2 MB     | take 2: scrubbed by the race (`seek(traditional)`), so the sand runs with the bars and the right glass has run through at the finish; the poster is the last frame (the finished race, for reduced motion)                                                                                                        |
| `stages-path.mp4`                                                                                  | How it works `StagesScene`, framed on the right                         | 10s       | 1.2 MB     | scrubbed with scene progress: one lamp per stage                                                                                                                                                                                                                                                                  |
| `seal-press.mp4`                                                                                   | Home `CloseSection` (`SealFilm`)                                        | 10s       | 1.1 MB     | scrubbed as the frame scrolls into view (`revealProgress`)                                                                                                                                                                                                                                                        |
| `archive-hall.mp4`                                                                                 | Home `TransactionCarries`                                               | loop      | 0.5 MB     | loops at 30% opacity on the dark-3 tile; its poster is the film's first frame, drawn with `e2e/tools/first-frame.mjs`                                                                                                                                                                                             |

All fourteen films ship with `<name>-poster.jpg`, their first frame, used as the `poster` and as
the still shown under reduced motion. Thirteen were cut by the ffmpeg line under "Regenerating";
`archive-hall-poster.jpg` was added later, on a machine without ffmpeg, by
`e2e/tools/first-frame.mjs <film> <poster> [quality]` — Playwright's bundled Chromium loads the mp4
from a local http origin, seeks to 0 and draws the frame to a canvas at the film's intrinsic 1280 × 720,
encoded as JPEG at quality 0.70 (63 KB, the band its siblings sit in).
`fees.png` is the fees page photograph (ledgers between sheets of glass on
travertine) from the earlier design pass. Retired in the September 2026 living-site phase and deleted from
this directory (replaced by the films above): `hero-light.mp4` (the 20% high-key caustics, too faint to read),
`market-desk.mp4` (the scrubbed light sweep, replaced by the continuous loop), `privacy-panes.mp4` (the framed
pane-clearing scrub, replaced by the full-panel room loop), and `hero-glass.mp4` (the Higgsfield caustics loop;
on 2026-09-11 the user asked for the site's original hero film back instead). Home page media total: about
8 MB across thirteen films (14 films and 9.2 MB in all, `stages-path.mp4` serving how-it-works).

### The restored hero film (`hero-ambient.mp4`)

The original hero backdrop from the first Heirloom build (commit `11f5fa9`, September 3), not a Higgsfield
generation: a warm paper-toned tabletop model with translucent glass blocks and glowing green paths. The source
was 1920×1080 HEVC 10-bit (`yuv420p10le`, 9.7 MB for 7s), which Chromium and Playwright cannot decode, so it is
transcoded to H.264 8-bit (`libx264`, crf 27, `-pix_fmt yuv420p`) at 1920×1080 and looped as a ping-pong (the
7s forward, then reversed: `split; reverse; concat`), 14s and 1.5 MB, with a first-frame poster. The first
build played it at 85% under paper veils and gradients; the design system now forbids veils in the DOM, so it
runs at 60% straight over the canvas tile and the ink copy stays legible on its light tones.

### Prompts and models

Palette line appended to every prompt: _deep green #0b241b base, mid green #0f7a45, highlight green
#4ce27e_. No people, no readable text, IP-free. Films were made image-to-video from a still so the
first frame doubles as the poster.

- **Hero still** (GPT Image 2, 16:9, 2k): "High-key abstract photograph: soft daylight refracted through a thick
  pane of hand-cut crystal glass onto a smooth cream travertine surface. Large, soft caustic ripples of light in
  cream, warm ivory and the faintest sage green, very low contrast, luminous and serene, edge to edge. No
  objects, no text, no people."
- **`hero-light.mp4`** (Kling 3.0, 10s, sound off, start image = hero still): "Camera locked, top-down. The soft
  caustic ripples of light on the cream travertine drift and breathe very slowly and continuously, as if calm
  water moves above it; the brightness stays even and high-key throughout, no flicker, no cuts, no new objects."
  Made seamless at encode time by cross-fading the last 1.5 s into the first 1.5 s (`xfade`), so the loop point
  is invisible.
- **Desk still** (GPT Image 2, 16:9, 2k): "Top-down photograph of an empty deep green lacquered desk in
  a quiet study, soft directional studio light falling from the upper left across the lacquer with
  faint reflections; a brass letter opener and a stick of cream sealing wax rest near the far right
  edge. Mostly empty surface, calm, cinematic, photorealistic, no paper, no text, no people."
- **`market-desk.mp4`** (Kling 3.0, 10s, sound off, start image = desk still): "Camera locked, top-down.
  Over ten seconds a soft directional studio light sweeps slowly across the deep green lacquered desk
  from the left edge to the right, brightening the surface as it passes and catching the brass letter
  opener and the cream sealing wax in a warm glint before settling. The desk stays empty and still."
  Cropped to the lacquer interior at encode time (`crop=980:551:200:118` on the 1276×720 source) so the paper
  props rest on lacquer alone; the seal film shares the same desk framing and the same crop.
- **Panes still** (GPT Image 2, 16:9, 2k): "Photograph, straight on: five tall panes of frosted glass
  standing in a row inside a deep green room, each pane a step behind the last, soft green light
  glowing through them from behind, the nearest pane the most frosted. Calm, architectural,
  photorealistic, no text, no people, no furniture."
- **`privacy-panes.mp4`** (Kling 3.0, 8s, start image = panes still): "Camera locked. One pane at a
  time, starting with the nearest and ending with the farthest, the frost on each tall glass pane
  dissolves and the pane becomes clear transparent glass, letting the soft green light behind shine
  through more strongly, until all five panes are clear."
- **Path still** (GPT Image 2, 16:9, 2k): "Cinematic photograph looking along a straight travertine
  stone path receding into deep green darkness; eight small brass markers are set into the stone at
  even intervals along the left edge of the path, each holding a tiny green glass lamp; only the
  nearest lamp glows softly green. Low camera height, shallow depth of field, soft studio light."
- **`stages-path.mp4`** (Kling 3.0, 10s, start image = path still): "A slow, perfectly steady dolly
  forward along the travertine stone path at low camera height. As the camera passes each brass marker,
  its small green glass lamp lights up softly, one after another in order from nearest to farthest,
  until all eight lamps glow green."
- **`seal-press.mp4`** (Seedance 2.0, 10s, 720p, no audio, start image = the brass seal composited on
  the desk still, end image = the wax seal composited on the desk still): "Camera locked, top-down on
  the deep green lacquered desk. The brass seal stamp rises smoothly off the desk, turns so its
  engraved face points down, and presses gently onto a small pool of molten cream sealing wax at the
  center of the desk; it holds for a moment, then lifts straight up and drifts out of the top of the
  frame, leaving the finished cream wax seal crisply embossed with the same mark resting on the green
  lacquer in soft studio light."

### Living-site films (September 2026, phase 3)

All stills GPT Image 2 (`gpt_image_2`, 2k for 16:9 environments, 1k for the 1:1 objects), all films Kling 3.0
(`kling3_0`, `--sound off`, image-to-video from the still) unless noted. Every prompt ended with what must not
appear ("no text, no people, …") and carried the palette line. Contact sheets (8 frames, `select+tile`) were
reviewed before any film was encoded.

- **Hero still** (16:9): "High-key abstract photograph, top-down: soft daylight refracted through a thick pane of
  hand-cut crystal glass onto a smooth pale cream travertine surface. Broad caustic ripples and bands of light in
  warm ivory, sage green and pale gold, clearly visible but soft-edged, with gentle mid-tone contrast so the
  pattern reads from across a room; the centre of the frame stays the brightest and calmest, the ripples grow
  richer toward the left and right edges and the bottom. Luminous, serene, edge to edge. No objects, no text, no
  people, no dark areas, no vignette." A second candidate (a glass slab at the right edge throwing bands across
  travertine) barely moved once animated and was dropped.
- **`hero-glass.mp4`** (retired 2026-09-11 in favour of the original `hero-ambient.mp4`; Kling 3.0, 10s): "Camera locked, top-down. The caustic ripples of light drift and breathe
  slowly and continuously across the whole frame, as if calm water moved above the stone; a soft band of brighter
  light sweeps very slowly from left to right over ten seconds; the brightness stays high-key and even and the
  centre stays the calmest. No cuts, no flicker, no new objects, no text, no people." Seamless via `xfade`
  (last 1.5 s into the first 1.5 s), crf 30.
- **Term objects** (1:1, 1k), one prompt frame: "Photorealistic product photograph on a deep green lacquered
  surface (#0b241b), seen from slightly above, soft directional studio light from the upper left with a gentle
  reflection in the lacquer, the object centred with generous empty lacquer around it. No text, no readable
  words, no people, no other objects, no white background." plus the object: the attached brass seal stamp lying
  on its side, face to camera (reference `seal.webp`); a closed cream envelope sealed with a cream wax disc
  embossed with the attached mark (reference: the rasterised mark); a small antique brass balance scale, level;
  a neat stack of five folded cream documents each closed with a wax disc embossed with the mark; a small brass
  hourglass with pale sand, mid-way.
- **`term-*.mp4`** (Kling 3.0, 5s, 1:1): "Camera locked. The <object> slowly rotates about a quarter turn on the
  lacquer while soft light glides across it (the scale's pans swing gently and settle level; the hourglass's
  sand runs). Smooth, continuous, no cuts, no other objects, no text, no hands." Normalised scrub-ready
  (640×640, keyframe every 12 frames, no B-frames) so the turntable can seek to any frame.
- **`market-desk-live.mp4`** (Kling 3.0, 10s, start image = the previous desk poster, so the desk matches the
  seal film): "Camera locked, top-down. Continuous, slow, seamless motion: soft daylight reflections and the
  moving shadows of leaves outside a window drift steadily across the deep green lacquered desk from left to
  right, and the brass letter opener and the cream sealing wax catch the passing light in slow glints. The desk
  stays empty. No cuts, no new objects, no paper, no people, no text." The shadows arrive after the first
  second and never leave, so the loop is a ping-pong of the 1.5–10 s segment (forward, then reversed).
- **Interface material, ledger glass** (16:9): "Photorealistic close-up of a dark green lacquered control surface
  photographed at a slight downward angle: three thin rectangular panes of smoked glass lie flat on the lacquer
  in a row, slightly overlapping, their edges catching soft spring-green edge light; two fine brass rules are
  inlaid into the lacquer running left to right; a faint soft green glow underlights the panes. Shallow depth of
  field, calm, dark, cinematic. No text, no numbers, no icons, no screens, no hands, no people." Film: "Camera
  locked. Soft green light travels slowly along the inlaid brass rules from left to right, the glow beneath the
  three smoked glass panes breathes gently, and faint reflections glide across the panes. Continuous, seamless,
  no cuts, no text, no numbers, no icons, no hands." Seamless via `xfade`.
- **Interface material, status board** (16:9): "Photorealistic photograph of a deep green lacquered wall panel
  seen straight on: a grid of small square frosted glass tiles set flush into the lacquer, eight columns by four
  rows, most tiles dark, a few lit softly from behind in spring green like a quiet status board; fine brass rules
  separate the rows; soft studio light, dark, calm, cinematic. No text, no numbers, no icons, no people." Film:
  "Camera locked. Over ten seconds the small frosted glass tiles light up softly one at a time in a slow, quiet
  sequence and fade again, like a status board updating, never more than a few lit at once; the brass rules
  catch a gentle passing light. Continuous, no cuts, no text, no numbers, no icons, no people." Seamless via `xfade`.
- **Privacy room** (16:9): "Cinematic photograph inside a deep green room: tall panes of frosted glass stand in a
  row along the right half of the frame, each a step behind the last, soft green light glowing through them from
  behind; the left half of the frame is dark, plain deep green lacquered wall with a polished stone floor
  catching a faint reflection. Calm, architectural, photorealistic. No text, no people, no furniture." Film:
  "Camera locked. Soft green daylight and the shadows of foliage shift slowly and continuously behind the fluted
  glass panes, brightening and dimming like a passing cloud; a faint reflection moves across the polished stone
  floor; the plain lacquered wall on the left stays still. No cuts, no people, no text, no new objects." Seamless via `xfade`.
  **Take 1 barely moved** (the review could not see it under the copy). Take 2 is Seedance 2.0 (`seedance_2_0`,
  `--generate_audio false`, 720p, 10s) between the still and a graded end frame (the glass half brightened
  28% and saturated 15% with sharp): "Camera locked. Over ten seconds daylight rises behind the fluted glass
  panes: the panes brighten from soft to luminous while the shadows of swaying foliage move across them and
  highlights slide along the brass frames and the polished floor; the plain lacquered wall on the left stays
  still. Continuous, smooth, no cuts, no people, no text, no new objects." Ping-pong (rises, then settles), 20s.
  A parallel Kling 3.0 take with a larger-motion prompt moved less than the storyboarded one and was dropped.
  Lesson: for an environment that must visibly change, give the model a start and an end frame; a "subtle,
  continuous" prompt from one still returns a near-still.
- **Speed hourglasses** (16:9): "Photorealistic photograph, straight on: two identical brass hourglasses with pale
  cream sand standing side by side on a deep green lacquered surface against a deep green background; the left
  hourglass still holds most of its sand in the upper bulb, the right hourglass has almost all of its sand
  already in the lower bulb. Soft studio light, warm brass, calm, cinematic. No text, no people, no other
  objects." Film: "Camera locked. Pale sand runs steadily through both brass hourglasses at the same time: in the
  left hourglass it falls slowly and the upper bulb stays mostly full, in the right hourglass it runs quickly and
  the upper bulb empties completely, its sand settling into a smooth cone below. No cuts, no other objects, no
  text, no hands." **Take 1 was a still** (Kling held the frame). Take 2 is storyboarded: two GPT Image 2 edits of
  the approved still (`--image` reference, "keep everything identical … changing only the sand": both upper
  bulbs full with a thin stream just begun / the right run through with a smooth cone below and the left half
  way), then Seedance 2.0 (720p, 10s) from the first to the second: "Camera locked, straight on. Pale sand runs
  steadily through both brass hourglasses at the same time: the right hourglass runs fast and empties its upper
  bulb completely, its sand settling into a smooth cone below; the left hourglass runs slowly and is only half
  way through by the end. Smooth, continuous, no cuts, no other objects, no text, no hands." Encoded
  scrub-ready (keyframe every 12 frames, no B-frames) because the race seeks it; poster = last frame.

Re-encodes after the adversarial review (no credits): the hero loop graded toward neutral (`hue=s=0.6`), the desk
loop cropped to its top 93% (the desk's front edge read as a seam under the paper), and the seal, scale and
hourglass turntables cropped to their centre 72% so the five term objects fill their frames alike.

Credits this phase: 11 stills (56.5) + 12 films (142.5) = 199 for the first pass, then 2 storyboard stills (13)
and 3 films (a Kling room take, a Seedance room take, the Seedance hourglass race; 105) = 118 for the review
fixes: 317 of the 454 on hand; 137 remain.

## Objects and textures (`public/generated/`)

| File                             | Used by                                                                           | Prompt (GPT Image 2, transparent background unless noted)                                                                                                                                                                                                                                                      |
| -------------------------------- | --------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `seal.webp` (deleted 2026-09-17) | none: the share card magnifies the bar's lockup and the seal film needed no still | 3:4, mark SVG attached: "Product photograph of a small round brass seal stamp standing upright on a transparent background: a smooth polished brass handle and a round brass die whose face is turned toward the camera, engraved with the attached leaf mark. Soft studio light, warm brass, photorealistic." |
| `passport.webp`                  | Buyers hero figure                                                                | 3:4, mark SVG attached: "Product photograph of a small passport-sized booklet bound in deep green leather, standing upright at a slight three-quarter angle, the attached leaf mark embossed in brass at the center of the cover. Soft studio light, fine-grain leather, photorealistic."                      |
| `envelopes.webp`                 | Home `OfferComparison` header figure                                              | 3:2: "Product photograph of four cream paper envelopes, each closed with a small round brass clasp, fanned in a neat overlapping row on a transparent background. Soft studio light, subtle paper texture, photorealistic."                                                                                    |
| `field-calm.webp`                | `InstrumentField` texture (WebGL), calm                                           | 1:1, 1k: "Abstract close-up photograph of a very dark luminous green field seen through thick hand-cut crystal glass. Nearly black deep green base with slow, soft, barely visible mid-green currents and no bright highlights. Soft caustic refractions, gentle blur, edge to edge, no shapes, no text."      |
| `field-mid.webp`                 | `InstrumentField` texture, mid                                                    | as above with "soft mid-green currents flowing through it and a few faint bright green highlights along the glass facets"                                                                                                                                                                                      |
| `field-bright.webp`              | `InstrumentField` texture, bright                                                 | as above with "alive with flowing mid-green light and clear bright spring-green highlights refracted through the facets, still soft and calm"                                                                                                                                                                  |

The three field textures are 512 × 512 (a power of two, so WebGL 1 can mirror-repeat them) and are
blended calm → mid → bright by the visitor's exitIQ confidence; the shader keeps the material below
the brightness of the copy and falls back to a procedural field when a texture fails to load.

## Regenerating

`higgsfield generate create <model> --prompt "…" [--start-image still.png] [--end-image end.png]
--wait --json`, then normalise:

```
ffmpeg -i in.mp4 -an -vf "scale=1280:-2,fps=24,format=yuv420p" -c:v libx264 -preset slow -crf 27 \
  -g 12 -keyint_min 12 -sc_threshold 0 -bf 0 -movflags +faststart out.mp4
ffmpeg -i out.mp4 -vf "select=eq(n\,0)" -vframes 1 -q:v 3 out-poster.jpg
```

Seamless loop (play from 1.5 s, cross-fade the tail into the first 1.5 s so the last frame meets the first):

```
ffmpeg -ss 1.5 -i in.mp4 -an -vf "scale=1280:-2,fps=24,format=yuv420p" -c:v libx264 -crf 16 -g 12 main.mp4
ffmpeg -t 1.5  -i in.mp4 -an -vf "scale=1280:-2,fps=24,format=yuv420p" -c:v libx264 -crf 16 -g 12 head.mp4
ffmpeg -i main.mp4 -i head.mp4 -an -filter_complex \
  "[0:v][1:v]xfade=transition=fade:duration=1.5:offset=<main length - 1.5>,format=yuv420p[v]" \
  -map "[v]" -c:v libx264 -preset slow -crf 29 -g 48 -movflags +faststart loop.mp4
```

Ping-pong loop (for a film whose end does not resemble its start): `split[a][b];[b]reverse[r];[a][r]concat`.
Turntables and scrubbed films keep a keyframe every 12 frames and no B-frames; loops may use `-g 48`.

Keep films under 2 MB each (about 8 MB per page), 16:9 or 1:1, and free of text; keep objects on transparent
backgrounds so the frame that holds them supplies the surface and the shadow.
