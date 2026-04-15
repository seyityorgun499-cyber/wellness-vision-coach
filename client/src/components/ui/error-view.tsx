import { AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface ErrorViewProps {
  message?: string
  onRetry?: () => void
  className?: string
}

export function ErrorView({
  message = "Bir hata oluştu. Lütfen tekrar deneyin.",
  onRetry,
  className,
}: ErrorViewProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-4 py-12 px-4 text-center", className)} role="alert">
      <div className="h-12 w-12 rounded-full bg-destructive-light flex items-center justify-center">
        <AlertTriangle className="h-6 w-6 text-destructive" />
      </div>
      <p className="text-body-sm text-muted-foreground max-w-xs">{message}</p>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          Yeniden Dene
        </Button>
      )}
    </div>
  )
}
