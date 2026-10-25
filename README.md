# Salem's Lair

A dark, witchy fan page for Salem Saberhagen, the cat from *Sabrina the Teenage Witch*.

Next.js (App Router) · Tailwind v4 · shadcn/ui (Base UI) · pnpm

## Run

```bash
pnpm install
pnpm dev      # http://localhost:3000
pnpm build
pnpm lint
```

## Theme

The site is dark only. All tokens live in `src/app/globals.css`:

- Colors: near-black background, deep witchy purple `primary`, dark plum `accent`, and an antique-gold `salem-eye` used for focus rings, titles and highlights.
- `--radius: 0.375rem` for softly rounded corners.
- Utilities: `panel` (bordered surface with a soft purple glow), `panel-inset` (recessed surface), `glow`, `text-glow`, `animate-marquee` and `animate-float`. The animations turn off when the user prefers reduced motion.
- Fonts (set in `src/app/layout.tsx`): Great Vibes script (`font-script`) for display headings, Cinzel (`font-heading`) for labels and buttons, and Cormorant Garamond (`font-sans`) for body text.

Components: `src/components/panel.tsx` is a titled panel built on `Card`. `Button` adds a `gold` outline variant, and its default variant is restyled.

Add more shadcn components with `pnpm dlx shadcn@latest add <name>`.

## Halloween 2026 Election (`/halloween-2026`)

Visitors upload a photo, pick one of four Salem candidates, and download it with a round profile-picture frame as a 1080×1080 PNG. They can also download all four at once. Everything runs in the browser on a `<canvas>`, so photos never leave the device.

- `src/components/frame-maker.tsx` is the upload, preview, zoom/drag and download UI.
- `src/lib/render-frame.ts` handles drawing and exporting.
- `src/lib/frames.ts` defines the four candidates. Until real artwork arrives, each one draws a placeholder ring. See `public/frames/README.md` to plug in the final PNGs.

**Redirect:** `src/proxy.ts` currently sends every route to `/halloween-2026`. Delete that file to bring back the home page and the rest of the site.
