"use client"

import { useState } from "react"
import { ChevronsLeft, Plus } from "lucide-react"
import type { Id } from "../../../../../convex/_generated/dataModel"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useSidebar } from "@/components/sidebar-context"
import { useSpaces } from "@/features/spaces/hooks/use-spaces"
import CreateListDialog from "@/features/spaces/components/create-list-dialog"
import CreateSpaceDialog from "@/features/spaces/components/create-space-dialog"
import SpacesSidebar from "@/features/spaces/components/spaces-sidebar"

export default function SpacesLayout({ children }: { children: React.ReactNode }) {
  const { sidebarOpen, closeSidebar } = useSidebar()
  const { spaces, isLoading, createSpaceWithDefaults, createList } = useSpaces()

 
  const [createSpaceOpen, setCreateSpaceOpen] = useState(false)
  const [createListOpen, setCreateListOpen] = useState(false)
  const [createListSpaceId, setCreateListSpaceId] = useState<Id<"spaces"> | null>(null)

  const handleCreateList = async (values: { name: string; spaceId: string }) => {
    await createList(values.spaceId as Id<"spaces">, values.name)
  }

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
                className=" transition-opacity hover:bg-muted xl:opacity-0 xl:group-hover/secondary:opacity-100"
                title="Close sidebar"
                aria-label="Close sidebar"
              >
                <ChevronsLeft className="size-4" />
              </Button>
              <Button
                size="sm"
                onClick={() => setCreateSpaceOpen(true)}
                className=""
                title="Create"
              >
                <Plus className="size-4" />
              </Button>
            </div>
          </div>
          <div className="flex-1 overflow-auto p-3">
            {isLoading ? (
              <div className="flex flex-col gap-4 p-2">
                {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                  <div key={i} className="flex flex-col gap-2">
                    {/* Space Header */}
                    <div className="flex items-center gap-2 px-2">
                      <Skeleton className="size-6 rounded-md" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                    {/* Space Lists */}
                    <div className="ml-4 flex flex-col gap-2 border-l border-border pl-2">
                      <div className="flex items-center gap-2 px-2">
                        <Skeleton className="size-4 rounded-sm" />
                        <Skeleton className="h-3 w-20" />
                      </div>
                      <div className="flex items-center gap-2 px-2">
                        <Skeleton className="size-4 rounded-sm" />
                        <Skeleton className="h-3 w-16" />
                      </div>
                    </div>
                  </div>
                ))}
                {/* New Space Button */}
                <div className="mt-2 flex items-center gap-2 px-2 opacity-50">
                  <Skeleton className="size-4 rounded-sm" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
            ) : (
              <SpacesSidebar
                onCreateSpace={() => setCreateSpaceOpen(true)}
                onCreateList={(spaceId) => {
                  setCreateListSpaceId(spaceId)
                  setCreateListOpen(true)
                }}
              />
            )}
          </div>
        </div>
      )}

      <CreateSpaceDialog
        open={createSpaceOpen}
        onOpenChange={setCreateSpaceOpen}
        onCreate={createSpaceWithDefaults}
      />
      <CreateListDialog
        open={createListOpen}
        onOpenChange={setCreateListOpen}
        spaces={spaces}
        defaultSpaceId={createListSpaceId}
        onCreate={handleCreateList}
      />
      <div className="flex-1 overflow-auto">{children}</div>
    </div>
  )
}
