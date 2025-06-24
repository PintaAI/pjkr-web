"use client"

import { createContext, useContext, ReactNode } from "react"
import { useSession } from "@/lib/hooks/use-session"

type SessionContextType = ReturnType<typeof useSession>

const SessionContext = createContext<SessionContextType | null>(null)

interface SessionProviderProps {
  children: ReactNode
}

export function SessionProvider({ children }: SessionProviderProps) {
  const session = useSession()
  
  return (
    <SessionContext.Provider value={session}>
      {children}
    </SessionContext.Provider>
  )
}

export function useSessionContext(): SessionContextType {
  const context = useContext(SessionContext)
  if (!context) {
    throw new Error("useSessionContext must be used within a SessionProvider")
  }
  return context
}
