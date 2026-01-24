"use client"

import * as React from "react"
import { ChevronsLeft, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useSidebar } from "@/components/sidebar-context"
import CreateListDialog, {
  type CreateListValues,
} from "@/features/spaces/components/create-list-dialog"
import CreateSpaceDialog, {
  type CreateSpaceValues,
} from "@/features/spaces/components/create-space-dialog"
import SpacesSidebar from "@/features/spaces/components/spaces-sidebar"
import { initialSpaces } from "@/features/spaces/lib/data"
import type { Space } from "@/features/spaces/lib/types"

export default function SpacesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [spaces, setSpaces] = React.useState<Space[]>(() => initialSpaces)
  const [createOpen, setCreateOpen] = React.useState(false)
  const [createListOpen, setCreateListOpen] = React.useState(false)
  const [createListSpaceId, setCreateListSpaceId] = React.useState<string | null>(null)
  const { sidebarOpen, closeSidebar } = useSidebar()

  const handleCreateSpace = React.useCallback((values: CreateSpaceValues) => {
    setSpaces((prev) => [
      ...prev,
      {
        id: `space-${Math.random().toString(36).slice(2, 9)}`,
        name: values.name,
        description: values.description,
        color: values.color,
        icon: values.icon,
        lists: [],
        isOpen: true,
      },
    ])
  }, [])

  const handleCreateList = React.useCallback((values: CreateListValues) => {
    setSpaces((prev) =>
      prev.map((space) =>
        space.id === values.spaceId
          ? {
              ...space,
              lists: [
                ...space.lists,
                {
                  id: `list-${Math.random().toString(36).slice(2, 9)}`,
                  name: values.name,
                },
              ],
            }
          : space
      )
    )
  }, [])

  return (
    <div className="flex flex-1 overflow-hidden">
      {sidebarOpen && (
        <div className="group/secondary flex w-72 shrink-0 flex-col border-r bg-muted/30">
          <div className="flex items-center justify-between border-b border-border/70 px-4 py-3">
            <h2 className="text-sm font-semibold">Spaces</h2>
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
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCreateOpen(true)}
                className="h-8 gap-1 rounded-md border-border/70 bg-background/60 px-2 text-muted-foreground hover:bg-muted"
                title="Create"
              >
                <Plus className="size-4" />
              </Button>
            </div>
          </div>
          <div className="flex-1 overflow-auto p-3">
            <SpacesSidebar
              spaces={spaces}
              setSpaces={setSpaces}
              onCreateClick={() => setCreateOpen(true)}
              onCreateList={(spaceId) => {
                setCreateListSpaceId(spaceId)
                setCreateListOpen(true)
              }}
            />
          </div>
        </div>
      )}
      <CreateSpaceDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreate={handleCreateSpace}
      />
      <CreateListDialog
        open={createListOpen}
        onOpenChange={setCreateListOpen}
        spaces={spaces}
        defaultSpaceId={createListSpaceId}
        onCreate={handleCreateList}
      />
      <div className="flex-1 overflow-auto p-4">{children}</div>
    </div>
  )
}
