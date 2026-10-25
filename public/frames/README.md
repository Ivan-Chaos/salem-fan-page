# Campaign frame artwork

Put the final frame overlays here, one per candidate:

| File            | Candidate           |
| --------------- | ------------------- |
| `ghost.png`     | Ghost Salem         |
| `invisible.png` | Invisible Man Salem |
| `detective.png` | Detective Salem     |
| `mobboss.png`   | Mob Boss Salem      |

## Spec

- Each file is a 1080×1080 PNG with a transparent background.
- The overlay is drawn on top of the user's photo, which is cropped to a full 1080px circle. Anything outside that circle is cut off.
- Keep the centre transparent so the face shows through. The placeholder ring is 150px wide (14% of the size), which leaves a clear photo circle of about 780px diameter.
- Keep text and emblems inside the ring, at least ~10px from the outer edge.

After adding a file, set `overlaySrc: "/frames/<file>.png"` on that frame in `src/lib/frames.ts`. The overlay then replaces that frame's placeholder ring.
