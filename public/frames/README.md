# Campaign frame artwork

Each candidate has three variants, shown on the site as Variant 1, 2 and 3 and named `<candidate>[-<style>].png`:

| Candidate           | Variant 1       | Variant 2             | Variant 3                  |
| ------------------- | --------------- | --------------------- | -------------------------- |
| Ghost Salem         | `ghost.png`     | `ghost-light.png`     | `ghost-ultralight.png`     |
| Invisible Man Salem | `invisible.png` | `invisible-light.png` | `invisible-ultralight.png` |
| Detective Salem     | `detective.png` | `detective-light.png` | `detective-ultralight.png` |
| Mob Boss Salem      | `mobboss.png`   | `mobboss-light.png`   | `mobboss-ultralight.png`   |

## Spec

- Each file is a 1024×1024 PNG with a transparent background.
- The user's photo is cropped to a circle centred on the image with a radius of 365px (`PHOTO_RADIUS` in `src/lib/render-frame.ts`). The artwork is drawn on top of it, unclipped, so decorations can overflow the circle.
- A ring's inner edge should sit inside that 365px radius so it covers the edge of the photo.
- Anything outside the photo circle shows the background the visitor picks: dark, white or transparent.

To add a style or a candidate, add the PNGs here and add an entry to `STYLES` or `FRAMES` in `src/lib/frames.ts`.
