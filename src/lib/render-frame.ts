import type { Frame } from "@/lib/frames"

export const EXPORT_SIZE = 1080

/** Photo pan as a fraction of the canvas size, so previews and exports match. */
export type Adjust = { zoom: number; x: number; y: number }

export const DEFAULT_ADJUST: Adjust = { zoom: 1, x: 0, y: 0 }

const RING_WIDTH = 0.14 // of canvas size

type Photo = { width: number; height: number } & CanvasImageSource

/** Largest pan (fraction of canvas) that still keeps the circle covered. */
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

/** next/font exposes the generated family name through a CSS variable. */
// Ring lettering uses the caps serif: script fonts break apart when drawn
// one glyph at a time along an arc.
export function ringFontFamily() {
  if (typeof document === "undefined") return "serif"
  const family = getComputedStyle(document.documentElement)
    .getPropertyValue("--font-caps")
    .trim()
  return family || "serif"
}

export async function loadFonts() {
  await document.fonts.load(`600 32px ${ringFontFamily()}`)
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
  frame: Frame,
  adjust: Adjust,
  overlay?: HTMLImageElement
) {
  const size = ctx.canvas.width
  const c = size / 2

  ctx.save()
  ctx.clearRect(0, 0, size, size)

  ctx.beginPath()
  ctx.arc(c, c, c, 0, Math.PI * 2)
  ctx.clip()

  if (photo) {
    const scale =
      Math.max(size / photo.width, size / photo.height) * adjust.zoom
    const w = photo.width * scale
    const h = photo.height * scale
    ctx.drawImage(
      photo,
      (size - w) / 2 + adjust.x * size,
      (size - h) / 2 + adjust.y * size,
      w,
      h
    )
  } else {
    drawEmptyPhoto(ctx, size)
  }

  if (overlay) {
    ctx.drawImage(overlay, 0, 0, size, size)
  } else {
    drawPlaceholderRing(ctx, size, frame)
  }

  ctx.restore()
}

function drawEmptyPhoto(ctx: CanvasRenderingContext2D, size: number) {
  ctx.fillStyle = "#0e0c10"
  ctx.fillRect(0, 0, size, size)
  ctx.fillStyle = "#24202a"
  ctx.font = `${size * 0.3}px ${ringFontFamily()}`
  ctx.textAlign = "center"
  ctx.textBaseline = "middle"
  ctx.fillText("?", size / 2, size / 2)
}

function drawPlaceholderRing(
  ctx: CanvasRenderingContext2D,
  size: number,
  frame: Frame
) {
  const c = size / 2
  const band = size * RING_WIDTH
  const inner = c - band

  const gradient = ctx.createLinearGradient(0, 0, size, size)
  gradient.addColorStop(0, frame.ring[0])
  gradient.addColorStop(1, frame.ring[1])

  ctx.beginPath()
  ctx.arc(c, c, c, 0, Math.PI * 2)
  ctx.arc(c, c, inner, 0, Math.PI * 2, true)
  ctx.fillStyle = gradient
  ctx.fill()

  // Fine gold hairlines on both edges of the ring
  ctx.strokeStyle = "#d4af4f"
  ctx.lineWidth = size * 0.004
  if (frame.ringStyle === "dashed") ctx.setLineDash([size * 0.02, size * 0.015])
  for (const r of [inner, c - size * 0.012]) {
    ctx.beginPath()
    ctx.arc(c, c, r, 0, Math.PI * 2)
    ctx.stroke()
  }
  ctx.setLineDash([])

  const fontSize = band * 0.3
  ctx.font = `600 ${fontSize}px ${ringFontFamily()}`
  ctx.fillStyle = frame.textColor
  ctx.textAlign = "center"
  ctx.textBaseline = "middle"
  const textRadius = inner + band / 2
  drawArcText(ctx, "VOTE SALEM 2026", c, textRadius, "top", fontSize)
  drawArcText(ctx, frame.slogan.toUpperCase(), c, textRadius, "bottom", fontSize)

  // Small stars where the two text arcs meet
  ctx.fillStyle = "#d4af4f"
  for (const angle of [0, Math.PI]) {
    drawStar(
      ctx,
      c + textRadius * Math.cos(angle),
      c + textRadius * Math.sin(angle),
      band * 0.16
    )
  }
}

function drawStar(ctx: CanvasRenderingContext2D, x: number, y: number, r: number) {
  // Four-pointed sparkle
  ctx.beginPath()
  for (let i = 0; i < 8; i++) {
    const angle = (i * Math.PI) / 4 - Math.PI / 2
    const radius = i % 2 === 0 ? r : r * 0.3
    ctx.lineTo(x + radius * Math.cos(angle), y + radius * Math.sin(angle))
  }
  ctx.closePath()
  ctx.fill()
}

function drawArcText(
  ctx: CanvasRenderingContext2D,
  text: string,
  c: number,
  radius: number,
  side: "top" | "bottom",
  fontSize: number
) {
  const chars = [...text]
  const gap = fontSize * 0.2
  const widths = chars.map((ch) => ctx.measureText(ch).width + gap)
  const span = widths.reduce((a, b) => a + b, 0) / radius
  const dir = side === "top" ? 1 : -1
  // Top text runs clockwise from the left, bottom text counter-clockwise,
  // so both read left to right and stay upright.
  let angle = side === "top" ? -Math.PI / 2 - span / 2 : Math.PI / 2 + span / 2

  chars.forEach((ch, i) => {
    const half = widths[i] / 2 / radius
    angle += dir * half
    ctx.save()
    ctx.translate(c + radius * Math.cos(angle), c + radius * Math.sin(angle))
    ctx.rotate(angle + (dir * Math.PI) / 2)
    ctx.fillText(ch, 0, 0)
    ctx.restore()
    angle += dir * half
  })
}

export function filenameFor(frame: Frame) {
  return `salem-2026-${frame.id}.png`
}

/** Renders a frame at full export size and returns it as a PNG file. */
export async function exportPng(
  photo: Photo,
  frame: Frame,
  adjust: Adjust,
  overlay?: HTMLImageElement
) {
  const canvas = document.createElement("canvas")
  canvas.width = canvas.height = EXPORT_SIZE
  renderFramed(canvas.getContext("2d")!, photo, frame, adjust, overlay)
  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/png")
  )
  if (!blob) throw new Error("Could not encode image")
  return new File([blob], filenameFor(frame), { type: "image/png" })
}

export function downloadFile(file: File) {
  const url = URL.createObjectURL(file)
  const a = document.createElement("a")
  a.href = url
  a.download = file.name
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
