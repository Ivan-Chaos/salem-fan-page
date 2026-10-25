import { redirect } from "next/navigation";

// Temporary: the whole site points at the Halloween 2026 election page.
// To restore the home page, replace this file with src/app/_home/page.tsx.
export default function RootPage() {
  redirect("/halloween-2026");
}
