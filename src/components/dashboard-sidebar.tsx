"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Home,
  Layers,
  Bot,
  Calendar,
  Settings,
  UserPlus,
  ChevronDown,
  ChevronsLeft,
  ChevronsRight,
  Plus,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import UserButton from "@/components/user-button"
import WorkspaceHeader from "@/components/workspace-header"
import { cn } from "@/lib/utils"
import { useIsMobile } from "@/hooks/use-mobile"

const navItems = [
  { title: "Home", url: "/dashboard", icon: Home },
  { title: "Spaces", url: "/dashboard/spaces", icon: Layers },
  { title: "Chat", url: "/dashboard/chat", icon: Calendar },
  { title: "AI", url: "/dashboard/ai", icon: Bot },
  { title: "Settings", url: "/dashboard/settings", icon: Settings },
]

interface Props {
  children: React.ReactNode
}

export default function DashboardSidebar({ children }: Props) {
  const pathname = usePathname()
  const isMobile = useIsMobile()
  const [sidebarOpen, setSidebarOpen] = React.useState(true)

  // Auto-collapse on mobile
  React.useEffect(() => {
    setSidebarOpen(!isMobile)
  }, [isMobile])
  
  const isActive = (url: string) => {
    if (url === "/dashboard") return pathname === "/dashboard"
    return pathname.startsWith(url)
  }

  const activeItem = navItems.find((item) => isActive(item.url)) || navItems[0]

  return (
    <div className="flex h-screen flex-col overflow-hidden px-2 pb-2">
      {/* Header */}
      <header className="z-50 flex h-12 shrink-0 items-center justify-between bg-background">
        <WorkspaceHeader />

        <UserButton />
      </header>

      {/* Main layout */}
      <div className="flex flex-1 overflow-hidden gap-2">
        {/* Icon sidebar */}
        <aside className="flex w-16 shrink-0 flex-col rounded-lg bg-primary">
          {/* Expand button - visible when sidebar collapsed */}
          {!sidebarOpen && (
            <div className="flex justify-center border-b border-primary-foreground/15 py-2">
              <button
                onClick={() => setSidebarOpen(true)}
                className="text-primary-foreground/80 transition-colors hover:text-primary-foreground"
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
          {/* Secondary sidebar - part of main content */}
          {sidebarOpen && (
            <div className="group/secondary flex w-72 shrink-0 flex-col border-r bg-muted/30">
              {/* Header with collapse on hover */}
              <div className="flex items-center justify-between border-b border-border/70 px-4 py-3">
                <h2 className="text-sm font-semibold">{activeItem.title}</h2>
                <div className="flex items-center gap-1">
                  {/* Collapse button - always visible on mobile, hover on desktop */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSidebarOpen(false)}
                    className="h-8 border-none bg-transparent px-2 text-muted-foreground transition-opacity hover:bg-muted xl:opacity-0 xl:group-hover/secondary:opacity-100"
                    title="Close sidebar"
                  >
                    <ChevronsLeft className="size-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 gap-1 rounded-md border-border/70 bg-background/60 px-2 text-muted-foreground hover:bg-muted"
                    title="Create"
                  >
                    <Plus className="size-4" />
                    <ChevronDown className="size-3" />
                  </Button>
                </div>
              </div>
              <div className="flex-1 overflow-auto p-3">
                {/* Sidebar content */}
              </div>
            </div>
          )}

          {/* Page content */}
          <div className="flex-1 overflow-auto p-4">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
