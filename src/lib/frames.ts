export type FrameId = "ghost" | "invisible" | "detective" | "mobboss"

export type Frame = {
  id: FrameId
  name: string
  slogan: string
  /** Gradient stops for the placeholder ring. */
  ring: [string, string]
  textColor: string
  ringStyle: "solid" | "dashed"
  /**
   * Final artwork: a transparent 1080×1080 PNG in /public/frames.
   * When set, it is drawn instead of the placeholder ring.
   */
  overlaySrc?: string
}

export const FRAMES: Frame[] = [
  {
    id: "ghost",
    name: "Ghost Salem",
    slogan: "Haunting the Polls",
    ring: ["#3a3640", "#121014"],
    textColor: "#ece4ff",
    ringStyle: "solid",
  },
  {
    id: "invisible",
    name: "Invisible Man Salem",
    slogan: "Now You See Him",
    ring: ["#1f5552", "#0a1f1f"],
    textColor: "#d6f2ec",
    ringStyle: "dashed",
  },
  {
    id: "detective",
    name: "Detective Salem",
    slogan: "Case Closed",
    ring: ["#6b4a22", "#2a1a0a"],
    textColor: "#f3e2c0",
    ringStyle: "solid",
  },
  {
    id: "mobboss",
    name: "Mob Boss Salem",
    slogan: "Fuhgeddaboutit",
    ring: ["#1a1420", "#050307"],
    textColor: "#d4af4f",
    ringStyle: "solid",
  },
]
