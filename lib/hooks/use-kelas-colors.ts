"use client"

import { useState, useEffect } from "react"
import { colorUtils } from "@/lib/color-extractor"

interface KelasColors {
  primary: string
  secondary: string
  primaryDark: string
  secondaryDark: string
  primaryLight: string
  secondaryLight: string
}

export const useKelasColors = (thumbnailUrl: string | null) => {
  const [colors, setColors] = useState<KelasColors | null>(null)
  const [isExtracting, setIsExtracting] = useState(false)

  const handleColorExtraction = (extractedColors: string[]) => {
    if (extractedColors.length >= 2) {
      const primary = extractedColors[0]
      const secondary = extractedColors[1]

      // Generate theme-specific variants
      const primaryVariations = colorUtils.generateVariations(primary)
      const secondaryVariations = colorUtils.generateVariations(secondary)

      const extractedColorsObj = {
        primary,
        secondary,
        primaryDark: primaryVariations.darkMode,
        secondaryDark: secondaryVariations.darkMode,
        primaryLight: primaryVariations.lightMode,
        secondaryLight: secondaryVariations.lightMode
      }

      setColors(extractedColorsObj)

      // Apply colors directly via a style tag to properly handle both :root and .dark selectors
      applyThemeColors(primaryVariations, secondaryVariations)
    }
    setIsExtracting(false)
  }

  const applyThemeColors = (primaryVariations: any, secondaryVariations: any) => {
    // Remove existing kelas-colors style if it exists
    const existingStyle = document.getElementById('kelas-colors')
    if (existingStyle) {
      existingStyle.remove()
    }

    // Create a style element with separate :root and .dark definitions
    const style = document.createElement('style')
    style.id = 'kelas-colors'
    style.textContent = `
      :root {
        --primary: ${primaryVariations.lightMode} !important;
        --secondary: ${secondaryVariations.lightMode} !important;
        --primary-foreground: #ffffff !important;
        --secondary-foreground: ${colorUtils.getContrastColor(secondaryVariations.lightMode)} !important;
      }
      
      .dark {
        --primary: ${primaryVariations.darkMode} !important;
        --secondary: ${secondaryVariations.darkMode} !important;
        --primary-foreground: #ffffff !important;
        --secondary-foreground: ${colorUtils.getContrastColor(secondaryVariations.darkMode)} !important;
      }
    `
    document.head.appendChild(style)
  }

  useEffect(() => {
    if (thumbnailUrl) {
      setIsExtracting(true)
      setColors(null)
    } else {
      // Reset to default colors when no thumbnail
      const existingStyle = document.getElementById('kelas-colors')
      if (existingStyle) {
        existingStyle.remove()
      }
    }
  }, [thumbnailUrl])

  return {
    colors,
    isExtracting,
    handleColorExtraction
  }
}
