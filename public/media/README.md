# Ambient video assets

The site expects three decorative MP4 files here. They come from the Heirloom design project
(`assets/` in the Claude Design workspace) and are too large to ship through the design import:

| File | Used by | Behaviour |
|---|---|---|
| `hero-ambient.mp4` | Home hero backdrop | plays forward, then scrubs back (ping-pong) |
| `reveal.mp4` | Home privacy scene | loops, screen-blended at 14% opacity |
| `archive-hall.mp4` | "What the transaction carries" panel | loops at 50% opacity |

Every `<AmbientVideo>` hides itself when its source fails to load, so the pages render correctly
without these files. Drop the MP4s in place to enable the motion backdrops.
