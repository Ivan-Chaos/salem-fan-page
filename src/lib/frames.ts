export type FrameId = "ghost" | "invisible" | "detective" | "mobboss"

export type Frame = {
  id: FrameId
  name: string
}

export const FRAMES: Frame[] = [
  { id: "ghost", name: "Ghost Salem" },
  { id: "invisible", name: "Invisible Man Salem" },
  { id: "detective", name: "Detective Salem" },
  { id: "mobboss", name: "Mob Boss Salem" },
]

export type StyleId = "full" | "light" | "ultralight"

export type Style = {
  id: StyleId
  name: string
}

export const STYLES: Style[] = [
  { id: "full", name: "Variant 1" },
  { id: "light", name: "Variant 2" },
  { id: "ultralight", name: "Variant 3" },
]

export type BackgroundId = "dark" | "white" | "transparent"

export const BACKGROUNDS: { id: BackgroundId; name: string; color: string | null }[] = [
  { id: "dark", name: "Dark", color: "#0c0a0e" },
  { id: "white", name: "White", color: "#ffffff" },
  { id: "transparent", name: "Transparent", color: null },
]

/** Artwork in /public/frames: 1024×1024 transparent PNGs, e.g. ghost-light.png */
export function overlayPath(frame: Frame, style: StyleId) {
  return `/frames/${frame.id}${style === "full" ? "" : `-${style}`}.png`
}
