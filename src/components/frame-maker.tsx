"use client"

import * as React from "react"
import { cn } from "cn"
import { ImagePlus, Move } from "lucide-react"

import { Panel } from "@/components/panel"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useInAppBrowser } from "@/hooks/use-in-app-browser"
import {
  BACKGROUNDS,
  FRAMES,
  STYLES,
  overlayPath,
  type BackgroundId,
  type Frame,
  type FrameId,
  type StyleId,
} from "@/lib/frames"
import {
  DEFAULT_ADJUST,
  PHOTO_RADIUS,
  clampAdjust,
  downloadFile,
  exportPng,
  loadOverlay,
  renderFramed,
  type Adjust,
} from "@/lib/render-frame"

const MAX_FILE_BYTES = 20 * 1024 * 1024
const PREVIEW_SIZE = 768
const THUMB_SIZE = 256

// Shown behind canvases when the background is transparent
const CHECKERBOARD = {
  background: "repeating-conic-gradient(#24202a 0 25%, #16131a 0 50%) 0 0 / 16px 16px",
}

// A data: URL rather than a blob: URL, so in-app browsers' "save image" works
function readAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}

function FrameMaker() {
  const [photo, setPhoto] = React.useState<ImageBitmap | null>(null)
  const [frameId, setFrameId] = React.useState<FrameId>(FRAMES[0].id)
  const [styleId, setStyleId] = React.useState<StyleId>("full")
  const [backgroundId, setBackgroundId] = React.useState<BackgroundId>("dark")
  const [adjust, setAdjust] = React.useState<Adjust>(DEFAULT_ADJUST)
  const [error, setError] = React.useState<string | null>(null)
  const [dragOver, setDragOver] = React.useState(false)
  const [busy, setBusy] = React.useState(false)
  const [overlays, setOverlays] = React.useState<Record<string, HTMLImageElement>>({})
  /** Finished image as a data URL, shown for press-and-hold saving in in-app browsers */
  const [saveable, setSaveable] = React.useState<string | null>(null)
  const inApp = useInAppBrowser()

  const inputRef = React.useRef<HTMLInputElement>(null)
  const previewRef = React.useRef<HTMLCanvasElement>(null)
  const frameThumbRefs = React.useRef<Partial<Record<FrameId, HTMLCanvasElement | null>>>({})
  const styleThumbRefs = React.useRef<Partial<Record<StyleId, HTMLCanvasElement | null>>>({})
  const dragRef = React.useRef<{ x: number; y: number } | null>(null)

  const frame = FRAMES.find((f) => f.id === frameId)!
  const style = STYLES.find((s) => s.id === styleId)!
  const background = BACKGROUNDS.find((b) => b.id === backgroundId)!

  // Load only the artwork currently on screen: every candidate in the chosen
  // style, plus every style of the chosen candidate.
  React.useEffect(() => {
    const paths = new Set([
      ...FRAMES.map((f) => overlayPath(f, styleId)),
      ...STYLES.map((s) => overlayPath(frame, s.id)),
    ])
    for (const path of paths) {
      loadOverlay(path)
        .then((img) => setOverlays((o) => (o[path] ? o : { ...o, [path]: img })))
        .catch(() => setError("Some frame artwork failed to load. Try refreshing."))
    }
  }, [frame, styleId])

  React.useEffect(() => () => photo?.close(), [photo])

  React.useEffect(() => {
    const raf = requestAnimationFrame(() => {
      const draw = (canvas: HTMLCanvasElement | null | undefined, f: Frame, s: StyleId) => {
        const ctx = canvas?.getContext("2d")
        if (ctx) renderFramed(ctx, photo, adjust, background.color, overlays[overlayPath(f, s)])
      }
      draw(previewRef.current, frame, styleId)
      FRAMES.forEach((f) => draw(frameThumbRefs.current[f.id], f, styleId))
      STYLES.forEach((s) => draw(styleThumbRefs.current[s.id], frame, s.id))
    })
    return () => cancelAnimationFrame(raf)
  }, [photo, frame, styleId, background, adjust, overlays])

  async function acceptFile(file: File | undefined) {
    if (!file) return
    if (!file.type.startsWith("image/")) {
      setError("That's not an image. Even Salem knows that.")
      return
    }
    if (file.size > MAX_FILE_BYTES) {
      setError("That photo is over 20 MB. Try a smaller one.")
      return
    }
    try {
      const bitmap = await createImageBitmap(file, {
        imageOrientation: "from-image",
      })
      setPhoto(bitmap)
      setAdjust(DEFAULT_ADJUST)
      setError(null)
    } catch {
      setError("Couldn't read that image. Try a JPG or PNG.")
    }
  }

  function onPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    if (!photo) return
    e.currentTarget.setPointerCapture(e.pointerId)
    dragRef.current = { x: e.clientX, y: e.clientY }
  }

  function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    const last = dragRef.current
    if (!photo || !last) return
    // The handle is exactly the photo circle, so pan is relative to its width
    const box = e.currentTarget.clientWidth
    const dx = (e.clientX - last.x) / box
    const dy = (e.clientY - last.y) / box
    dragRef.current = { x: e.clientX, y: e.clientY }
    setAdjust((a) => clampAdjust(photo, { ...a, x: a.x + dx, y: a.y + dy }))
  }

  function onPointerUp() {
    dragRef.current = null
  }

  async function render(s: StyleId) {
    const overlay = await loadOverlay(overlayPath(frame, s))
    return exportPng(photo!, adjust, background.color, overlay, `salem-2026-${frame.id}-${s}.png`)
  }

  async function download() {
    if (!photo) return
    setBusy(true)
    try {
      const file = await render(styleId)
      if (inApp) {
        // In-app browsers ignore downloads; show the image to press-and-hold instead
        setSaveable(await readAsDataUrl(file))
      } else {
        downloadFile(file)
      }
    } catch {
      setError("Something went wrong making your image. Try again.")
    } finally {
      setBusy(false)
    }
  }

  const checker = background.color ? undefined : CHECKERBOARD

  return (
    <div className="flex flex-col gap-6">
      <Panel title="Upload your photo">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault()
            setDragOver(true)
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault()
            setDragOver(false)
            acceptFile(e.dataTransfer.files[0])
          }}
          className={cn(
            "panel-inset flex w-full flex-col items-center gap-2 rounded-md px-4 py-10 text-center text-xl transition-colors hover:border-salem-eye/50 focus-visible:outline-2 focus-visible:outline-ring",
            dragOver && "border-salem-eye text-salem-eye"
          )}
        >
          <ImagePlus className="size-8 text-salem-eye/80" strokeWidth={1.25} />
          <span>
            {photo ? "Choose a different photo" : "Drop your photo here, or click to choose"}
          </span>
          <span className="text-base text-muted-foreground italic">
            JPG, PNG or WEBP, up to 20 MB
          </span>
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={(e) => {
            acceptFile(e.target.files?.[0])
            e.target.value = ""
          }}
        />
        {error && (
          <p role="alert" className="mt-3 text-lg text-destructive">
            {error}
          </p>
        )}
      </Panel>

      <div className="grid gap-6 md:grid-cols-[minmax(0,17rem)_minmax(0,1fr)]">
        <Panel title="Choose your Salem">
          <div role="radiogroup" aria-label="Candidate" className="grid grid-cols-2 gap-3">
            {FRAMES.map((f) => {
              const active = f.id === frameId
              return (
                <button
                  key={f.id}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => setFrameId(f.id)}
                  className={cn(
                    "flex flex-col items-center gap-2 rounded-md border p-2 outline-none transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring",
                    active ? "border-salem-eye/60 bg-muted" : "border-transparent"
                  )}
                >
                  <canvas
                    ref={(el) => {
                      frameThumbRefs.current[f.id] = el
                    }}
                    width={THUMB_SIZE}
                    height={THUMB_SIZE}
                    style={checker}
                    className="aspect-square w-full rounded-sm"
                  />
                  <span className="text-base leading-tight">{f.name}</span>
                </button>
              )
            })}
          </div>
        </Panel>

        <Panel title="Adjust & download">
          <div className="flex flex-col items-center gap-5">
            <div className="flex w-full max-w-md flex-col items-center gap-2">
              <div className="relative w-full">
                <canvas
                  ref={previewRef}
                  width={PREVIEW_SIZE}
                  height={PREVIEW_SIZE}
                  aria-label={`${frame.name}, ${style.name}, preview`}
                  aria-describedby="drag-tip"
                  style={checker}
                  className="block aspect-square w-full rounded-md"
                />
                {/* Only the photo circle is draggable, and it alone blocks touch
                    scrolling; swipes elsewhere on the preview scroll the page. */}
                {photo && (
                  <div
                    aria-hidden
                    onPointerDown={onPointerDown}
                    onPointerMove={onPointerMove}
                    onPointerUp={onPointerUp}
                    onPointerCancel={onPointerUp}
                    className="absolute cursor-grab touch-none rounded-full active:cursor-grabbing"
                    style={{
                      inset: `${(0.5 - PHOTO_RADIUS) * 100}%`,
                    }}
                  />
                )}
              </div>
              <p
                id="drag-tip"
                className="flex items-center gap-2 text-base text-muted-foreground italic"
              >
                <Move className="size-4 shrink-0 text-salem-eye/80" strokeWidth={1.5} />
                Tip: drag the image to reposition your photo
              </p>
            </div>
            <p className="font-script text-4xl text-salem-eye">{frame.name}</p>

            <fieldset className="w-full max-w-md">
              <legend className="mb-2 font-heading text-xs tracking-[0.15em] uppercase">
                Variant
              </legend>
              <div role="radiogroup" aria-label="Variant" className="grid grid-cols-3 gap-2">
                {STYLES.map((s) => {
                  const active = s.id === styleId
                  return (
                    <button
                      key={s.id}
                      type="button"
                      role="radio"
                      aria-checked={active}
                      onClick={() => setStyleId(s.id)}
                      className={cn(
                        "flex flex-col items-center gap-1 rounded-md border p-1.5 outline-none transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring",
                        active ? "border-salem-eye/60 bg-muted" : "border-border"
                      )}
                    >
                      <canvas
                        ref={(el) => {
                          styleThumbRefs.current[s.id] = el
                        }}
                        width={THUMB_SIZE}
                        height={THUMB_SIZE}
                        style={checker}
                        className="aspect-square w-full rounded-sm"
                      />
                      <span className="text-base leading-tight">{s.name}</span>
                    </button>
                  )
                })}
              </div>
            </fieldset>

            <fieldset className="flex w-full max-w-md items-center gap-3">
              <legend className="sr-only">Background</legend>
              <span aria-hidden className="font-heading text-xs tracking-[0.15em] uppercase">
                Background
              </span>
              <div role="radiogroup" aria-label="Background" className="flex flex-1 gap-1">
                {BACKGROUNDS.map((b) => (
                  <Button
                    key={b.id}
                    role="radio"
                    aria-checked={b.id === backgroundId}
                    variant={b.id === backgroundId ? "gold" : "ghost"}
                    size="sm"
                    onClick={() => setBackgroundId(b.id)}
                    className="flex-1 font-sans text-base tracking-normal normal-case"
                  >
                    {b.name}
                  </Button>
                ))}
              </div>
            </fieldset>

            <div className="flex w-full max-w-md items-center gap-3">
              <label htmlFor="zoom" className="font-heading text-xs tracking-[0.15em] uppercase">
                Zoom
              </label>
              <input
                id="zoom"
                type="range"
                min={1}
                max={3}
                step={0.01}
                value={adjust.zoom}
                disabled={!photo}
                onChange={(e) =>
                  photo &&
                  setAdjust((a) =>
                    clampAdjust(photo, { ...a, zoom: Number(e.target.value) })
                  )
                }
                className="flex-1 accent-salem-eye disabled:opacity-50"
              />
              <Button
                variant="ghost"
                size="sm"
                disabled={!photo}
                onClick={() => setAdjust(DEFAULT_ADJUST)}
                className="text-base"
              >
                Reset
              </Button>
            </div>

            <Button size="lg" disabled={!photo || busy} onClick={download}>
              {/* Encoding the PNG takes a couple of seconds on phones */}
              {busy ? "Preparing…" : "Download"}
            </Button>
          </div>
        </Panel>
      </div>

      <footer className="flex flex-col items-center gap-2 text-center text-base text-muted-foreground italic">
        <p className="max-w-2xl">
          An unofficial fan project. Sabrina the Teenage Witch and Salem
          Saberhagen are owned by Archie Comic Publications, Inc.; the
          1996–2003 television series belongs to Paramount. All rights remain
          with their respective owners.
        </p>
        <p>Your photo is processed on your device and never uploaded anywhere.</p>
      </footer>

      <Dialog open={saveable !== null} onOpenChange={(open) => !open && setSaveable(null)}>
        <DialogContent className="panel max-w-sm bg-card">
          <DialogHeader>
            <DialogTitle className="font-script text-4xl font-normal text-salem-eye">
              Save your picture
            </DialogTitle>
            <DialogDescription className="text-lg text-foreground">
              Press and hold the picture, then choose “Save image” or “Add to Photos”.
            </DialogDescription>
          </DialogHeader>
          {saveable && (
            // eslint-disable-next-line @next/next/no-img-element -- a generated data: URL, not an optimisable asset
            <img
              src={saveable}
              alt={`Your photo in the ${frame.name} frame`}
              className="aspect-square w-full rounded-md"
              style={checker}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export { FrameMaker }
