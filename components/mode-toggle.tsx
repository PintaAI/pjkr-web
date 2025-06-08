"use client"

import * as React from "react"
import { Moon, Sun, Laptop } from "lucide-react" // Added Laptop icon
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"

export function ModeToggle() {
  const { theme, setTheme } = useTheme() // Removed resolvedTheme as we'll show a specific system icon
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const toggleTheme = () => {
    if (theme === "light") {
      setTheme("dark")
    } else if (theme === "dark") {
      setTheme("system")
    } else { // theme === "system"
      setTheme("light")
    }
  }

  if (!mounted) {
    return <Button variant="outline" size="icon" disabled><Sun className="h-[1.2rem] w-[1.2rem]" /></Button>;
  }

  let currentIcon = <Sun className="h-[1.2rem] w-[1.2rem] transition-all" />;
  if (theme === "dark") {
    currentIcon = <Moon className="h-[1.2rem] w-[1.2rem] transition-all" />;
  } else if (theme === "system") {
    currentIcon = <Laptop className="h-[1.2rem] w-[1.2rem] transition-all" />;
  }
  // Default is Sun for "light"

  return (
    <Button variant="outline" size="icon" onClick={toggleTheme}>
      {currentIcon}
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
