import type { Metadata } from "next";
import { FrameMaker } from "@/components/frame-maker";
import { InAppBrowserNotice } from "@/components/in-app-browser-notice";

export const metadata: Metadata = {
  title: "Halloween 2026 Election — Salem's Lair",
  description:
    "Pick your Salem candidate, frame your profile photo, and download it.",
};

const TICKER = [
  "Salem for Supreme Ruler",
  "Nine lives, one vote",
  "Ghost · Invisible Man · Detective · Mob Boss",
  "Polls close at midnight on October 31st",
];

export default function Halloween2026Page() {
  const ticker = TICKER.join("   ✦   ");

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-10 px-4 py-12">
      <InAppBrowserNotice />

      <header className="flex flex-col items-center gap-3 text-center">
        <p className="font-heading text-xs tracking-[0.35em] text-salem-eye uppercase">
          Official Campaign Headquarters
        </p>
        <h1 className="text-glow font-script text-6xl leading-tight text-primary-foreground sm:text-7xl">
          Halloween 2026 Election
        </h1>
        <p className="max-w-xl text-xl text-muted-foreground italic">
          Express support for your candidate
        </p>
      </header>

      <div className="overflow-hidden border-y border-salem-eye/20 py-2 text-lg text-salem-eye/80 italic">
        <div className="flex w-max animate-marquee whitespace-nowrap">
          <span className="pr-12">{ticker}   ✦</span>
          <span className="pr-12" aria-hidden>
            {ticker}   ✦
          </span>
        </div>
      </div>

      <FrameMaker />
    </div>
  );
}
