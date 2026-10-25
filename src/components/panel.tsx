import * as React from "react"
import { cn } from "cn"

import { Card, CardContent } from "@/components/ui/card"

function Panel({
  title,
  className,
  children,
  ...props
}: React.ComponentProps<typeof Card> & { title: string }) {
  return (
    <Card
      data-slot="panel"
      className={cn("panel gap-0 py-0 ring-0", className)}
      {...props}
    >
      <div className="flex items-center gap-3 px-5 pt-4">
        <span className="h-px flex-1 bg-linear-to-r from-transparent to-salem-eye/40" />
        <h2 className="font-heading text-sm tracking-[0.2em] text-salem-eye uppercase">
          {title}
        </h2>
        <span className="h-px flex-1 bg-linear-to-l from-transparent to-salem-eye/40" />
      </div>
      <CardContent className="p-5">{children}</CardContent>
    </Card>
  )
}

export { Panel }
