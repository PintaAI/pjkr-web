"use client"

import React, { useState } from "react"
import { KelasColorsProvider } from "@/lib/contexts/kelas-colors-context"
import { KelasColorExtractor } from "./kelas-color-extractor"
import KelasDetailPage from "./kelas-detail-page"

// Import the Kelas interface from KelasDetailPage
interface Author {
  id: string
  name: string | null
  image: string | null
}

interface Materi {
  id: number
  title: string
  description: string
  order: number
  isDemo: boolean
  createdAt: Date
}

interface LiveSession {
  id: string
  name: string
  description: string | null
  status: string
  scheduledStart: Date
  scheduledEnd: Date | null
}

interface VocabularySet {
  id: number
  title: string
  description: string | null
  icon: string | null
  _count: {
    items: number
  }
}

interface Post {
  id: number
  title: string
  type: string
  isPinned: boolean
  likeCount: number
  commentCount: number
  createdAt: Date
  author: {
    id: string
    name: string | null
    image: string | null
  }
}

interface Kelas {
  id: number
  title: string
  description: string | null
  jsonDescription?: any
  htmlDescription?: string | null
  type: any // KelasType
  level: any // Difficulty
  thumbnail: string | null
  icon: string | null
  isPaidClass: boolean
  price: any
  discount: any
  promoCode: string | null
  isDraft: boolean
  createdAt: Date
  updatedAt: Date
  authorId: string
  author: Author
  materis: Materi[]
  liveSessions: LiveSession[]
  vocabularySets: VocabularySet[]
  posts: Post[]
  _count: {
    members: number
    materis: number
    liveSessions: number
    vocabularySets: number
    posts: number
    kelasKoleksiSoals: number
  }
}

interface KelasDetailWrapperProps {
  kelas: Kelas
}

export default function KelasDetailWrapper({ kelas }: KelasDetailWrapperProps) {
  const [extractedColors, setExtractedColors] = useState<any>(null)
  const [isExtracting, setIsExtracting] = useState(false)

  const handleColorsExtracted = (colors: any) => {
    setExtractedColors(colors)
    setIsExtracting(false)
  }

  React.useEffect(() => {
    if (kelas.thumbnail) {
      setIsExtracting(true)
    }
  }, [kelas.thumbnail])

  return (
    <KelasColorsProvider colors={extractedColors} isExtracting={isExtracting}>
      <KelasColorExtractor
        thumbnailUrl={kelas.thumbnail}
        onColorsExtracted={handleColorsExtracted}
      />
      <KelasDetailPage kelas={kelas} />
    </KelasColorsProvider>
  )
}