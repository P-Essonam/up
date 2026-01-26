"use client"

import * as React from "react"
import { create } from "zustand"
import { useIsMobile } from "./use-mobile"

type SidebarStore = {
  sidebarOpen: boolean
  openSidebar: () => void
  closeSidebar: () => void
  toggleSidebar: () => void
}

const useSidebarStore = create<SidebarStore>((set) => ({
  sidebarOpen: false,
  openSidebar: () => set({ sidebarOpen: true }),
  closeSidebar: () => set({ sidebarOpen: false }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
}))

// Hook that syncs with mobile state
export function useSidebar() {
  const isMobile = useIsMobile()
  const { sidebarOpen, openSidebar, closeSidebar, toggleSidebar } = useSidebarStore()

  React.useEffect(() => {
    useSidebarStore.setState({ sidebarOpen: !isMobile })
  }, [isMobile])

  return { sidebarOpen, openSidebar, closeSidebar, toggleSidebar }
}
