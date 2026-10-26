"use client"

import { ExternalLink } from "lucide-react"

import { buttonVariants } from "@/components/ui/button"
import { openInChromeHref, useInAppBrowser } from "@/hooks/use-in-app-browser"

/**
 * Social apps' built-in browsers ignore file downloads, so ask visitors to
 * reopen the page in their real browser. Renders nothing elsewhere.
 */
function InAppBrowserNotice() {
  const inApp = useInAppBrowser()
  if (!inApp) return null

  return (
    <div
      role="note"
      className="panel flex flex-col items-center gap-3 rounded-md border-salem-eye/50 px-5 py-4 text-center"
    >
      <p className="font-heading text-xs tracking-[0.2em] text-salem-eye uppercase">
        Opened inside {inApp.app}?
      </p>
      <p className="text-lg leading-snug">
        {inApp.app}&apos;s built-in browser can&apos;t download images.{" "}
        {inApp.platform === "android"
          ? "Open this page in Chrome to save your picture."
          : "Tap the ••• menu in the top corner and choose “Open in browser” to save your picture."}
      </p>
      {inApp.platform === "android" && (
        <a
          href={openInChromeHref(location.href)}
          className={buttonVariants({ variant: "gold", size: "lg" })}
        >
          <ExternalLink data-icon="inline-start" />
          Open in Chrome
        </a>
      )}
      <p className="text-base text-muted-foreground italic">
        Staying here? Tap Download and then press and hold the picture to save it.
      </p>
    </div>
  )
}

export { InAppBrowserNotice }
