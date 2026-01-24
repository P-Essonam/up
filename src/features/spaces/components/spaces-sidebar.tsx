"use client"

import { useState } from "react"
import { DragDropContext, Droppable, type DragStart, type DropResult } from "@hello-pangea/dnd"
import { Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import { useSpaces } from "../hooks/use-spaces"
import { useActiveNavigation } from "../hooks/use-active-navigation"
import { Id } from "../../../../convex/_generated/dataModel"
import { SecondarySidebarItem } from "./secondary-sidebar-item"
import { SpaceItem } from "./space-item"
import SpaceDialog from "./create-space-dialog"
import { reorder } from "../lib/utils"



export default function SpacesSidebar() {
  const { spaces, isLoading, toggleSpace, reorderSpaces, reorderLists } = useSpaces()

  const [isDragging, setIsDragging] = useState(false)
  const [dragType, setDragType] = useState<string | null>(null)
  const [draggedId, setDraggedId] = useState<string | null>(null)
  const [createSpaceOpen, setCreateSpaceOpen] = useState(false)

  const { activeListId, activeSpaceId } = useActiveNavigation(spaces)

  const handleDragStart = (start: DragStart) => {
    setIsDragging(true)
    setDragType(start.type)
    setDraggedId(start.draggableId)
  }

  const handleDragEnd = (result: DropResult) => {
    setIsDragging(false)
    setDragType(null)
    setDraggedId(null)

    const { source, destination, type } = result
    if (!destination) return
    if (source.droppableId === destination.droppableId && source.index === destination.index) return

    if (type === "SPACE") {
      const reordered = reorder(spaces, source.index, destination.index)
      reorderSpaces(reordered.map((s) => s._id))
      return
    }

    if (type === "LIST") {
      const sourceSpaceId = source.droppableId as Id<"spaces">
      const destSpaceId = destination.droppableId as Id<"spaces">

      if (sourceSpaceId === destSpaceId) {
        const space = spaces.find((s) => s._id === sourceSpaceId)
        if (!space) return
        const reordered = reorder(space.lists, source.index, destination.index)
        reorderLists(sourceSpaceId, reordered.map((l) => l._id))
      } else {
        const destSpace = spaces.find((s) => s._id === destSpaceId)
        const sourceSpace = spaces.find((s) => s._id === sourceSpaceId)
        if (!destSpace || !sourceSpace) return

        const movedList = sourceSpace.lists[source.index]
        if (!movedList) return

        // Update source space (remove the moved list)
        const sourceLists = sourceSpace.lists.filter((l) => l._id !== movedList._id)
        reorderLists(sourceSpaceId, sourceLists.map((l) => l._id))

        // Update destination space (add the moved list)
        const destLists = [...destSpace.lists]
        destLists.splice(destination.index, 0, movedList)
        reorderLists(destSpaceId, destLists.map((l) => l._id))
      }
    }
  }

  if (isLoading) return null

  return (
    <>
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
            onClick={() => setCreateSpaceOpen(true)}
          />
        </div>
      </DragDropContext>

      <SpaceDialog
        open={createSpaceOpen}
        onOpenChange={setCreateSpaceOpen}
        mode="create"
      />
    </>
  )
}
