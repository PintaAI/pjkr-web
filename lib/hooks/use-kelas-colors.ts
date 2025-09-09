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

      setColors({
        primary,
        secondary,
        primaryDark,
        secondaryDark
      })
    }
    setIsExtracting(false)
  }

  useEffect(() => {
    if (thumbnailUrl) {
      setIsExtracting(true)
      setColors(null)
    }
  }, [thumbnailUrl])

  return {
    colors,
    isExtracting,
    handleColorExtraction
  }
}
