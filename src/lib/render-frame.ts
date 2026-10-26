/** Matches the frame artwork, so exports stay at the art's native resolution. */
export const EXPORT_SIZE = 1024

/**
 * The artwork is painted around a centred photo circle of radius ~365px on a
 * 1024px canvas; every ring's inner edge sits inside it, so the photo's edge
 * tucks under the ring.
 */
export const PHOTO_RADIUS = 365 / 1024

/** Photo pan as a fraction of the photo circle's diameter, so previews and exports match. */
export type Adjust = { zoom: number; x: number; y: number }

export const DEFAULT_ADJUST: Adjust = { zoom: 1, x: 0, y: 0 }

type Photo = { width: number; height: number } & CanvasImageSource

/** Largest pan that still keeps the photo circle covered. */
export function maxPan(photo: Photo, zoom: number) {
  const scale = Math.max(1 / photo.width, 1 / photo.height) * zoom
  return {
    x: Math.max(0, (photo.width * scale - 1) / 2),
    y: Math.max(0, (photo.height * scale - 1) / 2),
  }
}

export function clampAdjust(photo: Photo, adjust: Adjust): Adjust {
  const max = maxPan(photo, adjust.zoom)
  return {
    zoom: adjust.zoom,
    x: Math.min(max.x, Math.max(-max.x, adjust.x)),
    y: Math.min(max.y, Math.max(-max.y, adjust.y)),
  }
}

const overlayCache = new Map<string, Promise<HTMLImageElement>>()

export function loadOverlay(src: string) {
  let pending = overlayCache.get(src)
  if (!pending) {
    pending = new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => resolve(img)
      img.onerror = reject
      // Public files live under the basePath on GitHub Pages
      img.src = `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}${src}`
    })
    overlayCache.set(src, pending)
  }
  return pending
}

export function renderFramed(
  ctx: CanvasRenderingContext2D,
  photo: Photo | null,
  adjust: Adjust,
  background: string | null,
  overlay?: HTMLImageElement
) {
  const size = ctx.canvas.width
  const c = size / 2
  const r = size * PHOTO_RADIUS
  const box = r * 2

  ctx.clearRect(0, 0, size, size)
  if (background) {
    ctx.fillStyle = background
    ctx.fillRect(0, 0, size, size)
  }

  ctx.save()
  ctx.beginPath()
  ctx.arc(c, c, r, 0, Math.PI * 2)
  ctx.clip()
  if (photo) {
    const scale = Math.max(box / photo.width, box / photo.height) * adjust.zoom
    const w = photo.width * scale
    const h = photo.height * scale
    ctx.drawImage(photo, c - w / 2 + adjust.x * box, c - h / 2 + adjust.y * box, w, h)
  } else {
    ctx.fillStyle = "#1a171f"
    ctx.fillRect(0, 0, size, size)
  }
  ctx.restore()

  if (overlay) ctx.drawImage(overlay, 0, 0, size, size)
}

/** Renders a frame at full export size and returns it as a PNG file. */
export async function exportPng(
  photo: Photo,
  adjust: Adjust,
  background: string | null,
  overlay: HTMLImageElement,
  filename: string
) {
  const canvas = document.createElement("canvas")
  canvas.width = canvas.height = EXPORT_SIZE
  renderFramed(canvas.getContext("2d")!, photo, adjust, background, overlay)
  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/png")
  )
  if (!blob) throw new Error("Could not encode image")
  return new File([blob], filename, { type: "image/png" })
}

export function downloadFile(file: File) {
  const url = URL.createObjectURL(file)
  const a = document.createElement("a")
  a.href = url
  a.download = file.name
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
