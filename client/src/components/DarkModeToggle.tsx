import { Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTheme } from "@/components/ThemeProvider"
import { logger } from "@/lib/logger"

export function DarkModeToggle() {
  const { theme, setTheme } = useTheme()

  const toggleTheme = () => {
    let newTheme: "light" | "dark" | "black"
    if (theme === "light") {
      newTheme = "dark"
    } else if (theme === "dark") {
      newTheme = "black"
    } else {
      newTheme = "light"
    }
    logger.log(`Switching from ${theme} to ${newTheme}`)
    setTheme(newTheme)
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="rounded-full"
    >
      <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}