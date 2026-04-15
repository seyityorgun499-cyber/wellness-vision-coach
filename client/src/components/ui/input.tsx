import * as React from "react"
import { Eye, EyeOff } from "lucide-react"

import { cn } from "@/lib/utils"

export interface InputProps extends React.ComponentProps<"input"> {
  label?: string
  hint?: string
  error?: string
  showPasswordToggle?: boolean
  characterCount?: boolean
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, hint, error, showPasswordToggle, characterCount, maxLength, id, ...props }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false)
    const [charCount, setCharCount] = React.useState(
      typeof props.defaultValue === "string" ? props.defaultValue.length : 0
    )
    const inputId = id || (label ? `input-${label.toLowerCase().replace(/\s+/g, "-")}` : undefined)
    const isPassword = type === "password"
    const inputType = isPassword && showPasswordToggle && showPassword ? "text" : type

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (characterCount) setCharCount(e.target.value.length)
      props.onChange?.(e)
    }

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label htmlFor={inputId} className="text-body-sm font-medium text-foreground">
            {label}
          </label>
        )}
        <div className="relative">
          <input
            id={inputId}
            type={inputType}
            className={cn(
              "flex h-10 w-full rounded-md border bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
              error ? "border-destructive focus-visible:ring-destructive" : "border-input",
              isPassword && showPasswordToggle && "pr-10",
              className
            )}
            ref={ref}
            maxLength={maxLength}
            aria-invalid={!!error}
            aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
            {...props}
            onChange={handleChange}
          />
          {isPassword && showPasswordToggle && (
            <button
              type="button"
              tabIndex={-1}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground"
              onClick={() => setShowPassword(v => !v)}
              aria-label={showPassword ? "Şifreyi gizle" : "Şifreyi göster"}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          )}
        </div>
        <div className="flex items-center justify-between gap-2">
          {error ? (
            <p id={`${inputId}-error`} className="text-caption text-destructive" role="alert">{error}</p>
          ) : hint ? (
            <p id={`${inputId}-hint`} className="text-caption text-muted-foreground">{hint}</p>
          ) : <span />}
          {characterCount && maxLength && (
            <p className={cn("text-caption", charCount >= maxLength ? "text-destructive" : "text-muted-foreground")}>
              {charCount}/{maxLength}
            </p>
          )}
        </div>
      </div>
    )
  }
)
Input.displayName = "Input"

export { Input }
