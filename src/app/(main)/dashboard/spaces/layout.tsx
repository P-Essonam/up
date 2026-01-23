"use client"

import * as React from "react"
import SecondarySidebar from "@/components/secondary-sidebar"
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
      <SecondarySidebar title="Spaces" onCreateClick={() => setCreateOpen(true)}>
        <SpacesSidebar
          spaces={spaces}
          setSpaces={setSpaces}
          onCreateClick={() => setCreateOpen(true)}
          onCreateList={(spaceId) => {
            setCreateListSpaceId(spaceId)
            setCreateListOpen(true)
          }}
        />
      </SecondarySidebar>
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
