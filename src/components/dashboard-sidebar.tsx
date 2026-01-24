"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Layers,
  Bot,
  Calendar,
  Settings,
  UserPlus,
  ChevronsRight,
} from "lucide-react"
import UserButton from "@/components/user-button"
import WorkspaceHeader from "@/components/workspace-header"
import { cn } from "@/lib/utils"
import { SidebarProvider, useSidebar } from "@/components/sidebar-context"

const navItems = [
  { title: "Spaces", url: "/dashboard", icon: Layers },
  { title: "Chat", url: "/dashboard/chat", icon: Calendar },
  { title: "AI", url: "/dashboard/ai", icon: Bot },
  { title: "Settings", url: "/dashboard/settings", icon: Settings },
]

interface Props {
  children: React.ReactNode
}

export default function DashboardSidebar({ children }: Props) {
  return (
    <SidebarProvider>
      <DashboardSidebarContent>{children}</DashboardSidebarContent>
    </SidebarProvider>
  )
}


function DashboardSidebarContent({ children }: Props) {
  const pathname = usePathname()
  const { sidebarOpen, openSidebar } = useSidebar()
  const isActive = (url: string) => {
    if (url === "/dashboard") return pathname === "/dashboard"
    return pathname.startsWith(url)
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden px-2 pb-2">
      {/* Header */}
      <header className="flex h-12 shrink-0 items-center justify-between bg-background">
        <WorkspaceHeader />

        <UserButton />
      </header>

      {/* Main layout */}
      <div className="flex flex-1 overflow-hidden gap-2">
        {/* Icon sidebar */}
        <aside className="flex w-16 shrink-0 flex-col rounded-lg bg-primary">
          {!sidebarOpen && (
            <div className="flex justify-center border-b border-primary-foreground/15 py-2">
              <button
                onClick={openSidebar}
                className="text-primary-foreground/80 transition-colors hover:text-primary-foreground"
                aria-label="Open sidebar"
              >
                <span className="flex size-9 items-center justify-center rounded-lg transition-colors hover:bg-primary-foreground/10">
                  <ChevronsRight className="size-4" />
                </span>
              </button>
            </div>
          )}
          <nav className="flex flex-1 flex-col items-center gap-2 py-1">
            {navItems.map((item) => {
              const active = isActive(item.url)
              return (
                <Link
                  key={item.title}
                  prefetch={true}
                  href={item.url}
                  className="group flex flex-col items-center gap-1 px-2 py-1 text-sm font-medium text-primary-foreground"
                >
                  <span
                    className={cn(
                      "flex size-9 items-center justify-center rounded-lg transition-colors",
                      active
                        ? "bg-primary-foreground text-primary"
                        : "group-hover:bg-primary-foreground/10"
                    )}
                  >
                    <item.icon className="size-4" />
                  </span>
                  <span className="text-xs font-medium">{item.title}</span>
                </Link>
              )
            })}
          </nav>

          <div className="flex flex-col items-center gap-2 border-t border-primary-foreground/20 pb-2">
            <button className="group flex flex-col items-center gap-1 px-2 py-1 text-xs font-medium text-primary-foreground/70 transition-colors hover:text-primary-foreground">
              <span className="flex size-9 items-center justify-center rounded-lg transition-colors group-hover:bg-primary-foreground/10">
                <UserPlus className="size-4" />
              </span>
              <span className="text-xs font-medium">Invite</span>
            </button>
          </div>
        </aside>

        {/* Main content area */}
        <main className="flex flex-1 overflow-hidden border rounded-lg">
          {children}
        </main>
      </div>
    </div>
  )
}