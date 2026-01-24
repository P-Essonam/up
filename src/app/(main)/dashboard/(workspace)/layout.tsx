"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { SecondarySidebar } from "@/components/secondary-sidebar"
import { useSpaces } from "@/features/spaces/hooks/use-spaces"
import SpacesSidebar from "@/features/spaces/components/spaces-sidebar"
import SpaceDialog from "@/features/spaces/components/create-space-dialog"
import { Plus } from "lucide-react"

export default function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  const { isLoading } = useSpaces()
  const [createSpaceOpen, setCreateSpaceOpen] = useState(false)

  return (
    <div className="flex flex-1 overflow-hidden">
      <SecondarySidebar
        title="Spaces"
        actions={
          <Button size="sm" onClick={() => setCreateSpaceOpen(true)} title="Create">
            <Plus className="size-4" />
          </Button>
        }
      >
        {isLoading ? (
          <div className="flex flex-col gap-4 p-2">
            {[1, 2, 3, 4, 5, 6, 7].map((i) => (
              <div key={i} className="flex flex-col gap-2">
                <div className="flex items-center gap-2 px-2">
                  <Skeleton className="size-6 rounded-md" />
                  <Skeleton className="h-4 w-24" />
                </div>
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
            <div className="mt-2 flex items-center gap-2 px-2 opacity-50">
              <Skeleton className="size-4 rounded-sm" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
        ) : (
          <SpacesSidebar />
        )}
      </SecondarySidebar>
      <div className="flex-1 size-full">{children}</div>
      <SpaceDialog
        open={createSpaceOpen}
        onOpenChange={setCreateSpaceOpen}
        mode="create"
      />
    </div>
  )
}
