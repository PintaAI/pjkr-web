"use client"

import React from "react"
import { useKelasColors } from "@/lib/hooks/use-kelas-colors"
import { ColorExtractor } from "react-color-extractor"

interface KelasColorExtractorProps {
  thumbnailUrl: string | null
  onColorsExtracted: (colors: any) => void
}

export const KelasColorExtractor = ({ thumbnailUrl, onColorsExtracted }: KelasColorExtractorProps) => {
  const { colors, isExtracting, handleColorExtraction } = useKelasColors(thumbnailUrl)

  // Call the callback when colors are extracted
  React.useEffect(() => {
    if (colors) {
      onColorsExtracted(colors)
    }
  }, [colors, onColorsExtracted])

  if (!thumbnailUrl) return null

  return (
    <div className="hidden">
      <ColorExtractor
        src={thumbnailUrl}
        getColors={handleColorExtraction}
        maxColors={5}
        format="hex"
      />
    </div>
  )
}