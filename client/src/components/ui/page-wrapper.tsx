import * as React from "react"
import { cn } from "@/lib/utils"

interface PageWrapperProps {
  children: React.ReactNode
  className?: string
  scroll?: boolean
}

export function PageWrapper({ children, className, scroll = true }: PageWrapperProps) {
  return (
    <div
      className={cn(
        "min-h-screen bg-background pb-20",
        "pt-[env(safe-area-inset-top)] pr-[env(safe-area-inset-right)] pb-[max(5rem,env(safe-area-inset-bottom))] pl-[env(safe-area-inset-left)]",
        scroll && "overflow-y-auto",
        className
      )}
    >
      {children}
    </div>
  )
}
