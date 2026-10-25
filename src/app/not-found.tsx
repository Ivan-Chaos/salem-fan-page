"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

// Exported as 404.html, which GitHub Pages serves for every unknown path.
// Temporary: send everyone to the election page.
export default function NotFound() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/halloween-2026");
  }, [router]);

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 px-4 text-center">
      <p className="font-script text-5xl text-salem-eye">Lost in the fog…</p>
      <Link href="/halloween-2026" className="text-xl italic underline">
        Take me to the election
      </Link>
    </div>
  );
}
