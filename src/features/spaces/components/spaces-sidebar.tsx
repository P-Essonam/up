"use client"

import { useState } from "react"
import { DragDropContext, Droppable, type DragStart, type DropResult } from "@hello-pangea/dnd"
import { Plus } from "lucide-react"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { useSpaces } from "../hooks/use-spaces"
import type { Id } from "../lib/types"
import { SecondarySidebarItem } from "./secondary-sidebar-item"
import { SpaceItem } from "./space-item"

function reorder<T>(list: T[], from: number, to: number): T[] {
  const result = [...list]
  const [removed] = result.splice(from, 1)
  result.splice(to, 0, removed)
  return result
}

type SpacesSidebarProps = {
  onCreateSpace: () => void
  onCreateList: (spaceId: Id<"spaces">) => void
}

export default function SpacesSidebar({ onCreateSpace, onCreateList }: SpacesSidebarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const {
    spaces,
    isLoading,
    toggleSpace,
    updateSpace,
    deleteSpace,
    reorderSpaces,
    updateList,
    deleteList,
    reorderLists,
  } = useSpaces()

  const [isDragging, setIsDragging] = useState(false)
  const [dragType, setDragType] = useState<string | null>(null)
  const [draggedId, setDraggedId] = useState<string | null>(null)

  const activeSpaceId = pathname?.match(/\/spaces\/([^/]+)/)?.[1] ?? null
  const activeListId = pathname?.match(/\/lists\/([^/]+)/)?.[1] ?? null

  const handleRenameSpace = (id: Id<"spaces">) => {
    const space = spaces.find((s) => s._id === id)
    const nextName = window.prompt("Rename space", space?.name)
    if (nextName?.trim()) {
      updateSpace(id, { name: nextName.trim() })
    }
  }

  const handleRenameList = (listId: Id<"lists">) => {
    const list = spaces.flatMap((s) => s.lists).find((l) => l._id === listId)
    const nextName = window.prompt("Rename list", list?.name)
    if (nextName?.trim()) {
      updateList(listId, { name: nextName.trim() })
    }
  }

  const handleSelectList = (spaceId: Id<"spaces">, listId: Id<"lists">) => {
    router.push(`/dashboard/spaces/${spaceId}/lists/${listId}`)
  }

  const handleDragStart = (start: DragStart) => {
    setIsDragging(true)
    setDragType(start.type)
    setDraggedId(start.draggableId)
  }

  const handleDragEnd = async (result: DropResult) => {
    setIsDragging(false)
    setDragType(null)
    setDraggedId(null)

    const { source, destination, type } = result
    if (!destination) return
    if (source.droppableId === destination.droppableId && source.index === destination.index) return

    if (type === "SPACE") {
      const reordered = reorder(spaces, source.index, destination.index)
      await reorderSpaces(reordered.map((s) => s._id))
      return
    }

    if (type === "LIST") {
      const sourceSpaceId = source.droppableId as Id<"spaces">
      const destSpaceId = destination.droppableId as Id<"spaces">

      if (sourceSpaceId === destSpaceId) {
        const space = spaces.find((s) => s._id === sourceSpaceId)
        if (!space) return
        const reordered = reorder(space.lists, source.index, destination.index)
        await reorderLists(sourceSpaceId, reordered.map((l) => l._id))
      } else {
        const destSpace = spaces.find((s) => s._id === destSpaceId)
        const sourceSpace = spaces.find((s) => s._id === sourceSpaceId)
        if (!destSpace || !sourceSpace) return

        const movedList = sourceSpace.lists[source.index]
        if (!movedList) return

        const destLists = [...destSpace.lists]
        destLists.splice(destination.index, 0, movedList)
        await reorderLists(destSpaceId, destLists.map((l) => l._id))
      }
    }
  }

  if (isLoading) return null

  return (
    <DragDropContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className={cn("flex flex-col gap-1", isDragging && "**:cursor-pointer")}>
        <Droppable droppableId="spaces" type="SPACE">
          {(provided) => (
            <div ref={provided.innerRef} {...provided.droppableProps} className="flex flex-col">
              {spaces.map((space, index) => (
                <SpaceItem
                  key={space._id}
                  space={space}
                  index={index}
                  isDragged={draggedId === space._id}
                  isDraggingList={isDragging && dragType === "LIST"}
                  activeSpaceId={activeSpaceId}
                  activeListId={activeListId}
                  onToggle={() => toggleSpace(space._id)}
                  onRename={() => handleRenameSpace(space._id)}
                  onDelete={() => deleteSpace(space._id)}
                  onAddList={() => onCreateList(space._id)}
                  onRenameList={handleRenameList}
                  onDeleteList={deleteList}
                  onSelectList={handleSelectList}
                />
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>

        <SecondarySidebarItem
          label="New Space"
          leading={<Plus className="size-4 text-muted-foreground" />}
          className="cursor-pointer text-muted-foreground"
          onClick={onCreateSpace}
        />
      </div>
    </DragDropContext>
  )
}
