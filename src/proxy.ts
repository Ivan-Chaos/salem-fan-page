import { NextResponse, type NextRequest } from "next/server";

// Temporary: the whole site points at the Halloween 2026 election page.
// Delete this file to bring the rest of the site back.
export function proxy(request: NextRequest) {
  return NextResponse.redirect(new URL("/halloween-2026", request.url));
}

export const config = {
  matcher: ["/((?!halloween-2026|_next|icon.svg|frames/|.*\\.\\w+$).*)"],
};
