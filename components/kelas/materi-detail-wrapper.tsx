"use client"

import React, { useState } from "react"
import { KelasColorsProvider } from "@/lib/contexts/kelas-colors-context"
import { KelasColorExtractor } from "./kelas-color-extractor"
import MateriDetailPage from "./materi-detail-page"

interface Kelas {
  id: number
  title: string
  authorId: string
  thumbnail: string | null
}

interface Materi {
  id: number
  title: string
  description: string
  jsonDescription: any
  htmlDescription: string
  order: number
  isDemo: boolean
  createdAt: Date
  kelas: Kelas
}

interface MateriDetailWrapperProps {
  materi: Materi
}

export default function MateriDetailWrapper({ materi }: MateriDetailWrapperProps) {
  const [extractedColors, setExtractedColors] = useState<any>(null)
  const [isExtracting, setIsExtracting] = useState(false)

  const handleColorsExtracted = (colors: any) => {
    setExtractedColors(colors)
    setIsExtracting(false)
  }

  React.useEffect(() => {
    if (materi.kelas.thumbnail) {
      setIsExtracting(true)
    }
  }, [materi.kelas.thumbnail])

  return (
    <KelasColorsProvider colors={extractedColors} isExtracting={isExtracting}>
      <KelasColorExtractor
        thumbnailUrl={materi.kelas.thumbnail}
        onColorsExtracted={handleColorsExtracted}
      />
      <MateriDetailPage materi={materi} />
    </KelasColorsProvider>
  )
}