import type { Metadata } from "next";
import { Cinzel, Cormorant_Garamond, Great_Vibes } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";

const script = Great_Vibes({
  variable: "--font-script",
  weight: "400",
  subsets: ["latin"],
});

const caps = Cinzel({
  variable: "--font-caps",
  subsets: ["latin"],
});

const body = Cormorant_Garamond({
  variable: "--font-body",
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Salem's Lair — A Salem Saberhagen Fan Page",
  description:
    "The #1 fan page for Salem Saberhagen, warlock-turned-cat of the Spellman household.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`dark ${script.variable} ${caps.variable} ${body.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <TooltipProvider>{children}</TooltipProvider>
      </body>
    </html>
  );
}
