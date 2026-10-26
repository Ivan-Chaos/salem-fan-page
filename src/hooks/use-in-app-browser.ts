"use client"

import * as React from "react"

export type InAppBrowser = {
  app: string
  platform: "ios" | "android" | "other"
}

// User-agent markers the social apps add to their built-in browsers
const APPS: [RegExp, string][] = [
  [/Instagram/i, "Instagram"],
  [/Barcelona/i, "Threads"],
  [/FBAN|FBAV|FB_IAB|FBIOS/i, "Facebook"],
  [/Messenger/i, "Messenger"],
  [/BytedanceWebview|musical_ly|TikTok/i, "TikTok"],
  [/Snapchat/i, "Snapchat"],
  [/LinkedInApp/i, "LinkedIn"],
  [/\bLine\//i, "LINE"],
]

export function detectInAppBrowser(ua: string): InAppBrowser | null {
  const app = APPS.find(([pattern]) => pattern.test(ua))?.[1]
  if (!app) return null
  const platform = /iPhone|iPad|iPod/i.test(ua)
    ? "ios"
    : /Android/i.test(ua)
      ? "android"
      : "other"
  return { app, platform }
}

let cached: { ua: string; result: InAppBrowser | null } | null = null

function getSnapshot() {
  // Dev only: ?inapp=ios or ?inapp=android fakes an in-app browser for testing
  const forced =
    process.env.NODE_ENV === "development" &&
    new URLSearchParams(location.search).get("inapp")
  const ua = forced
    ? `Instagram ${forced === "android" ? "Android" : "iPhone"}`
    : navigator.userAgent
  // useSyncExternalStore needs a stable value between calls
  if (cached?.ua !== ua) cached = { ua, result: detectInAppBrowser(ua) }
  return cached.result
}

const subscribe = () => () => {}

/** The in-app browser the page is open in, or null (always null on the server). */
export function useInAppBrowser() {
  return React.useSyncExternalStore(subscribe, getSnapshot, () => null)
}

/**
 * Android only: an intent link that reopens the current page in Chrome,
 * falling back to the same URL if Chrome isn't installed.
 */
export function openInChromeHref(url: string) {
  // The #fragment is dropped: intent links use "#Intent;…" for their own data
  const { host, pathname, search } = new URL(url)
  const fallback = encodeURIComponent(url)
  return `intent://${host}${pathname}${search}#Intent;scheme=https;package=com.android.chrome;S.browser_fallback_url=${fallback};end`
}
