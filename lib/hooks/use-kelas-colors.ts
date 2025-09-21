"use client"

import { useState, useEffect } from "react"
import { colorUtils } from "@/lib/color-extractor"

interface KelasColors {
  primary: string
  secondary: string
  primaryDark: string
  secondaryDark: string
}

export const useKelasColors = (thumbnailUrl: string | null) => {
  const [colors, setColors] = useState<KelasColors | null>(null)
  const [isExtracting, setIsExtracting] = useState(false)

  const handleColorExtraction = (extractedColors: string[]) => {
    if (extractedColors.length >= 2) {
      const primary = extractedColors[0]
      const secondary = extractedColors[1]

      // Generate dark mode variants
      const primaryDark = colorUtils.generateVariations(primary).darker
      const secondaryDark = colorUtils.generateVariations(secondary).darker

      const extractedColorsObj = {
        primary,
        secondary,
        primaryDark,
        secondaryDark
      }

      setColors(extractedColorsObj)

      // Override global CSS variables to make all Tailwind classes use extracted colors
      const root = document.documentElement
      
      // Use hex colors directly - Tailwind can handle them
      root.style.setProperty('--primary', primary)
      root.style.setProperty('--secondary', secondary)
      root.style.setProperty('--primary-foreground', '#ffffff')
      root.style.setProperty('--secondary-foreground', colorUtils.getContrastColor(secondary))
    }
    setIsExtracting(false)
  }

  useEffect(() => {
    if (thumbnailUrl) {
      setIsExtracting(true)
      setColors(null)
    } else {
      // Reset to default colors when no thumbnail
      const root = document.documentElement
      root.style.removeProperty('--primary')
      root.style.removeProperty('--secondary')
      root.style.removeProperty('--primary-foreground')
      root.style.removeProperty('--secondary-foreground')
    }
  }, [thumbnailUrl])

  return {
    colors,
    isExtracting,
    handleColorExtraction
  }
}
