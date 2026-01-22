"use client"

import * as React from "react"
import { useIsMobile } from "@/hooks/use-mobile"

type SidebarContextValue = {
  sidebarOpen: boolean
  openSidebar: () => void
  closeSidebar: () => void
  toggleSidebar: () => void
}

const SidebarContext = React.createContext<SidebarContextValue | null>(null)

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const isMobile = useIsMobile()
  const [sidebarOpen, setSidebarOpen] = React.useState(!isMobile)

  React.useEffect(() => {
    setSidebarOpen(!isMobile)
  }, [isMobile])

  const openSidebar = () => setSidebarOpen(true)
  const closeSidebar = () => setSidebarOpen(false)
  const toggleSidebar = () => setSidebarOpen((prev) => !prev)

  return (
    <SidebarContext.Provider
      value={{ sidebarOpen, openSidebar, closeSidebar, toggleSidebar }}
    >
      {children}
    </SidebarContext.Provider>
  )
}

export function useSidebar() {
  const context = React.useContext(SidebarContext)
  if (!context) {
    throw new Error("useSidebar must be used within SidebarProvider")
  }
  return context
}
