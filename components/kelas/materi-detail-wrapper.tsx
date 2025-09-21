"use client"

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
  // No longer need wrapper complexity - the hook handles color extraction directly
  return <MateriDetailPage materi={materi} />
}