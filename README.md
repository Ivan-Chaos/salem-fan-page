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

Visitors upload a photo, then pick one of four Salem candidates, one of three frame variants and a background (dark, white or transparent). They download the result as a 1024×1024 PNG, either one variant or all three at once. Everything runs in the browser on a `<canvas>`, so photos never leave the device.

- `src/components/frame-maker.tsx` is the upload, preview, zoom/drag and download UI.
- `src/lib/render-frame.ts` handles drawing and exporting.
- `src/lib/frames.ts` defines the candidates, styles and backgrounds. The artwork lives in `public/frames/`; see `public/frames/README.md` for the file names and spec.

**Redirect (temporary):** `src/app/page.tsx` redirects `/` to `/halloween-2026`, and `src/app/not-found.tsx` (exported as `404.html`) sends every unknown URL there. To bring the home page back, replace `src/app/page.tsx` with `src/app/_home/page.tsx` and remove the redirect in `not-found.tsx`.

## Deploying (GitHub Pages)

The site is a static export (`output: "export"`). `.github/workflows/deploy.yml` builds it and publishes it to GitHub Pages on every push to `main`. One-time setup: in the repo, go to **Settings → Pages → Build and deployment → Source** and choose **GitHub Actions**.

The workflow sets `NEXT_PUBLIC_BASE_PATH` (e.g. `/salem-fan-page`) because Pages serves the site from a sub-path. To preview the export locally: `pnpm build`, then serve `out/`.
