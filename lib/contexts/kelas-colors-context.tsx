"use client"

import { createContext, useContext, ReactNode } from "react"

interface KelasColors {
  primary: string
  secondary: string
  primaryDark: string
  secondaryDark: string
}

interface KelasColorsContextType {
  colors: KelasColors | null
  isExtracting: boolean
}

const KelasColorsContext = createContext<KelasColorsContextType | undefined>(undefined)

export const useKelasColorsContext = () => {
  const context = useContext(KelasColorsContext)
  if (!context) {
    throw new Error("useKelasColorsContext must be used within KelasColorsProvider")
  }
  return context
}

interface KelasColorsProviderProps {
  children: ReactNode
  colors: KelasColors | null
  isExtracting: boolean
}

export const KelasColorsProvider = ({ children, colors, isExtracting }: KelasColorsProviderProps) => {
  return (
    <KelasColorsContext.Provider value={{ colors, isExtracting }}>
      {children}
    </KelasColorsContext.Provider>
  )
}