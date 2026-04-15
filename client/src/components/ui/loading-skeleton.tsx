import { cn } from "@/lib/utils"

interface LoadingSkeletonProps {
  width?: string
  height?: string
  rounded?: string
  className?: string
}

export function LoadingSkeleton({
  width = "w-full",
  height = "h-4",
  rounded = "rounded-md",
  className,
}: LoadingSkeletonProps) {
  return (
    <div
      className={cn("animate-pulse bg-muted", width, height, rounded, className)}
      role="status"
      aria-label="Yükleniyor"
    />
  )
}

export function CardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("space-y-3 rounded-2xl border border-border p-6", className)} role="status" aria-label="Yükleniyor">
      <LoadingSkeleton width="w-1/3" height="h-5" />
      <LoadingSkeleton width="w-full" height="h-4" />
      <LoadingSkeleton width="w-2/3" height="h-4" />
      <LoadingSkeleton width="w-full" height="h-10" rounded="rounded-lg" />
    </div>
  )
}

export function ListSkeleton({ count = 3, className }: { count?: number; className?: string }) {
  return (
    <div className={cn("space-y-3", className)} role="status" aria-label="Yükleniyor">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          <LoadingSkeleton width="w-10" height="h-10" rounded="rounded-full" />
          <div className="flex-1 space-y-2">
            <LoadingSkeleton width="w-3/4" height="h-4" />
            <LoadingSkeleton width="w-1/2" height="h-3" />
          </div>
        </div>
      ))}
    </div>
  )
}
