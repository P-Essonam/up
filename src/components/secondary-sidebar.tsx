"use client"

import * as React from "react"
import { ChevronsLeft, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useSidebar } from "@/components/sidebar-context"

interface SecondarySidebarProps {
  title: string
  showCreateButton?: boolean
  onCreateClick?: () => void
  children: React.ReactNode
}

export default function SecondarySidebar({
  title,
  showCreateButton = true,
  onCreateClick,
  children,
}: SecondarySidebarProps) {
  const { sidebarOpen, closeSidebar } = useSidebar()

  if (!sidebarOpen) return null

  return (
    <div className="group/secondary flex w-72 shrink-0 flex-col border-r bg-muted/30">
      <div className="flex items-center justify-between border-b border-border/70 px-4 py-3">
        <h2 className="text-sm font-semibold">{title}</h2>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={closeSidebar}
            className="h-8 border-none bg-transparent px-2 text-muted-foreground transition-opacity hover:bg-muted xl:opacity-0 xl:group-hover/secondary:opacity-100"
            title="Close sidebar"
            aria-label="Close sidebar"
          >
            <ChevronsLeft className="size-4" />
          </Button>
          {showCreateButton && onCreateClick && (
            <Button
              variant="outline"
              size="sm"
              onClick={onCreateClick}
              className="h-8 gap-1 rounded-md border-border/70 bg-background/60 px-2 text-muted-foreground hover:bg-muted"
              title="Create"
            >
              <Plus className="size-4" />
            </Button>
          )}
        </div>
      </div>
      <div className="flex-1 overflow-auto p-3">{children}</div>
    </div>
  )
}
