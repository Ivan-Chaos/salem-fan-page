"use client"

import * as React from "react"
import { cn } from "cn"
import { ImagePlus } from "lucide-react"

import { Panel } from "@/components/panel"
import { Button } from "@/components/ui/button"
import { FRAMES, type Frame, type FrameId } from "@/lib/frames"
import {
  DEFAULT_ADJUST,
  clampAdjust,
  downloadFile,
  exportPng,
  loadFonts,
  loadOverlay,
  renderFramed,
  type Adjust,
} from "@/lib/render-frame"

const MAX_FILE_BYTES = 20 * 1024 * 1024
const PREVIEW_SIZE = 720
const THUMB_SIZE = 240

type Overlays = Partial<Record<FrameId, HTMLImageElement>>

function FrameMaker() {
  const [photo, setPhoto] = React.useState<ImageBitmap | null>(null)
  const [selectedId, setSelectedId] = React.useState<FrameId>(FRAMES[0].id)
  const [adjust, setAdjust] = React.useState<Adjust>(DEFAULT_ADJUST)
  const [error, setError] = React.useState<string | null>(null)
  const [dragOver, setDragOver] = React.useState(false)
  const [busy, setBusy] = React.useState(false)
  const [fontsReady, setFontsReady] = React.useState(false)
  const [overlays, setOverlays] = React.useState<Overlays>({})
  const [canShare, setCanShare] = React.useState(false)

  const inputRef = React.useRef<HTMLInputElement>(null)
  const previewRef = React.useRef<HTMLCanvasElement>(null)
  const thumbRefs = React.useRef<Partial<Record<FrameId, HTMLCanvasElement | null>>>({})
  const dragRef = React.useRef<{ x: number; y: number } | null>(null)

  const selected = FRAMES.find((f) => f.id === selectedId)!

  React.useEffect(() => {
    loadFonts().finally(() => setFontsReady(true))

    Promise.all(
      FRAMES.filter((f) => f.overlaySrc).map(async (f) => {
        const img = await loadOverlay(f.overlaySrc!).catch(() => undefined)
        return [f.id, img] as const
      })
    ).then((entries) => setOverlays(Object.fromEntries(entries)))

    const probe = new File([""], "probe.png", { type: "image/png" })
    Promise.resolve().then(() =>
      setCanShare(Boolean(navigator.canShare?.({ files: [probe] })))
    )
  }, [])

  React.useEffect(() => () => photo?.close(), [photo])

  React.useEffect(() => {
    const raf = requestAnimationFrame(() => {
      const draw = (canvas: HTMLCanvasElement | null | undefined, frame: Frame) => {
        const ctx = canvas?.getContext("2d")
        if (ctx) renderFramed(ctx, photo, frame, adjust, overlays[frame.id])
      }
      draw(previewRef.current, selected)
      FRAMES.forEach((f) => draw(thumbRefs.current[f.id], f))
    })
    return () => cancelAnimationFrame(raf)
  }, [photo, selected, adjust, overlays, fontsReady])

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

  function onPointerDown(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!photo) return
    e.currentTarget.setPointerCapture(e.pointerId)
    dragRef.current = { x: e.clientX, y: e.clientY }
  }

  function onPointerMove(e: React.PointerEvent<HTMLCanvasElement>) {
    const last = dragRef.current
    if (!photo || !last) return
    const width = e.currentTarget.clientWidth
    const dx = (e.clientX - last.x) / width
    const dy = (e.clientY - last.y) / width
    dragRef.current = { x: e.clientX, y: e.clientY }
    setAdjust((a) => clampAdjust(photo, { ...a, x: a.x + dx, y: a.y + dy }))
  }

  function onPointerUp() {
    dragRef.current = null
  }

  async function download(frames: Frame[]) {
    if (!photo) return
    setBusy(true)
    try {
      for (const frame of frames) {
        downloadFile(await exportPng(photo, frame, adjust, overlays[frame.id]))
        // Browsers drop rapid back-to-back downloads
        if (frames.length > 1) await new Promise((r) => setTimeout(r, 400))
      }
    } finally {
      setBusy(false)
    }
  }

  async function share() {
    if (!photo) return
    const file = await exportPng(photo, selected, adjust, overlays[selected.id])
    await navigator.share({ files: [file], title: selected.name }).catch(() => {})
  }

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
          <div role="radiogroup" aria-label="Frame" className="grid grid-cols-2 gap-3">
            {FRAMES.map((frame) => {
              const active = frame.id === selectedId
              return (
                <button
                  key={frame.id}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => setSelectedId(frame.id)}
                  className={cn(
                    "flex flex-col items-center gap-2 rounded-md border p-2 outline-none transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring",
                    active ? "border-salem-eye/60 bg-muted" : "border-transparent"
                  )}
                >
                  <canvas
                    ref={(el) => {
                      thumbRefs.current[frame.id] = el
                    }}
                    width={THUMB_SIZE}
                    height={THUMB_SIZE}
                    className={cn(
                      "aspect-square w-full rounded-full",
                      active && "ring-2 ring-salem-eye ring-offset-2 ring-offset-card"
                    )}
                  />
                  <span className="text-base leading-tight">{frame.name}</span>
                </button>
              )
            })}
          </div>
        </Panel>

        <Panel title="Adjust & download">
          <div className="flex flex-col items-center gap-4">
            <canvas
              ref={previewRef}
              width={PREVIEW_SIZE}
              height={PREVIEW_SIZE}
              aria-label={`${selected.name} frame preview`}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={onPointerUp}
              className={cn(
                "aspect-square w-full max-w-md touch-none rounded-full",
                photo && "cursor-grab active:cursor-grabbing"
              )}
            />
            <p className="font-script text-4xl text-salem-eye">{selected.name}</p>

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
            {photo && (
              <p className="text-base text-muted-foreground italic">
                Drag the photo to reposition it.
              </p>
            )}

            <div className="flex flex-wrap justify-center gap-3">
              <Button size="lg" disabled={!photo || busy} onClick={() => download([selected])}>
                Download
              </Button>
              <Button variant="gold" size="lg" disabled={!photo || busy} onClick={() => download(FRAMES)}>
                Download all 4
              </Button>
              {canShare && (
                <Button variant="gold" size="lg" disabled={!photo || busy} onClick={share}>
                  Share
                </Button>
              )}
            </div>
          </div>
        </Panel>
      </div>

      <p className="text-center text-base text-muted-foreground italic">
        Your photo is processed on your device and never uploaded anywhere.
      </p>
    </div>
  )
}

export { FrameMaker }
