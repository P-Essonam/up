"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronsLeft, Clock, Plus, Settings, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useSidebar } from "@/components/sidebar-context"
import { cn } from "@/lib/utils"

const settingsNavItems = [
  { title: "General", url: "/dashboard/settings", icon: Settings },
  { title: "Members", url: "/dashboard/settings/members", icon: Users },
  { title: "Pending", url: "/dashboard/settings/pending", icon: Clock },
]

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const { sidebarOpen, closeSidebar } = useSidebar()

  const isActive = (url: string) => {
    if (url === "/dashboard/settings") return pathname === "/dashboard/settings"
    return pathname.startsWith(url)
  }

  if (!sidebarOpen) return null

  return (
    <div className="flex flex-1 overflow-hidden">
      <div className="group/secondary flex w-72 shrink-0 flex-col border-r bg-muted/30">
        <div className="flex items-center justify-between border-b border-border/70 px-4 py-3">
          <h2 className="text-sm font-semibold">Settings</h2>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={closeSidebar}
              className=" transition-opacity hover:bg-muted xl:opacity-0 xl:group-hover/secondary:opacity-100"
              title="Close sidebar"
              aria-label="Close sidebar"
            >
              <ChevronsLeft className="size-4" />
            </Button>
          </div>
        </div>
        <div className="flex-1 overflow-auto p-3">
          <nav className="flex flex-col gap-2">
            {settingsNavItems.map((item) => {
              const active = isActive(item.url)
              return (
                <Link
                  key={item.title}
                  prefetch={true}
                  href={item.url}
                  className={cn(
                    "flex items-center gap-2 rounded-md p-3 text-sm font-medium text-muted-foreground hover:bg-muted",
                    active && "bg-muted text-foreground"
                  )}
                >
                  <item.icon className="size-4" />
                  <span>{item.title}</span>
                </Link>
              )
            })}
          </nav>
        </div>
      </div>
      <div className="flex-1 overflow-auto p-4">{children}</div>
    </div>
  )
}
