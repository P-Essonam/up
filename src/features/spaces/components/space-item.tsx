"use client"

import { useState } from "react"
import { Draggable, Droppable } from "@hello-pangea/dnd"
import { ChevronRight, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible"
import { cn } from "@/lib/utils"
import type { Id, Space } from "../lib/types"
import { SecondarySidebarItem } from "./secondary-sidebar-item"
import { ItemMenu } from "./item-menu"
import { ListItem } from "./list-item"
import { DeleteConfirmDialog } from "./delete-confirm-dialog"

function getSpaceInitials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
}

type SpaceItemProps = {
  space: Space
  index: number
  isDragged: boolean
  isDraggingList: boolean
  activeSpaceId: string | null
  activeListId: string | null
  onToggle: () => void
  onRename: () => void
  onDelete: () => void
  onAddList: () => void
  onRenameList: (listId: Id<"lists">) => void
  onDeleteList: (listId: Id<"lists">) => void
  onSelectList: (spaceId: Id<"spaces">, listId: Id<"lists">) => void
}

export function SpaceItem({
  space,
  index,
  isDragged,
  isDraggingList,
  activeSpaceId,
  activeListId,
  onToggle,
  onRename,
  onDelete,
  onAddList,
  onRenameList,
  onDeleteList,
  onSelectList,
}: SpaceItemProps) {
  const [deleteOpen, setDeleteOpen] = useState(false)
  const isOpen = space.isOpen ?? true
  const isActiveSpace = activeSpaceId === space._id

  return (
    <>
      <Draggable draggableId={space._id} index={index}>
        {(provided, snapshot) => (
          <div ref={provided.innerRef} {...provided.draggableProps} className="flex flex-col">
            <div {...provided.dragHandleProps}>
              <SecondarySidebarItem
                label={space.name}
                onClick={onToggle}
                className={cn(
                  "cursor-pointer text-foreground",
                  snapshot.isDragging && "bg-muted opacity-80"
                )}
                leading={
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "flex size-6 items-center justify-center rounded-md text-xs font-semibold text-white",
                        space.color || "bg-indigo-500"
                      )}
                    >
                      {getSpaceInitials(space.name)}
                    </span>
                    <ChevronRight
                      className={cn(
                        "size-4 text-muted-foreground transition-transform",
                        isOpen && "rotate-90"
                      )}
                    />
                  </div>
                }
                actions={
                  <div className="flex items-center gap-1">
                    <ItemMenu onRename={onRename} onDelete={() => setDeleteOpen(true)} />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7"
                      onClick={(e) => {
                        e.stopPropagation()
                        onAddList()
                      }}
                      aria-label="Add list"
                    >
                      <Plus className="size-4" />
                    </Button>
                  </div>
                }
              />
            </div>

            {!isDragged && (
              <Droppable droppableId={space._id} type="LIST">
                {(droppableProvided, droppableSnapshot) => (
                  <div
                    ref={droppableProvided.innerRef}
                    {...droppableProvided.droppableProps}
                    className={cn(
                      "ml-4 flex flex-col border-l border-border pl-2",
                      isDraggingList && "min-h-[8px]",
                      !isOpen && droppableSnapshot.isDraggingOver && "rounded bg-primary/10"
                    )}
                  >
                    <Collapsible open={isOpen}>
                      <CollapsibleContent>
                        {space.lists.map((list, listIndex) => (
                          <ListItem
                            key={list._id}
                            list={list}
                            index={listIndex}
                            active={isActiveSpace && activeListId === list._id}
                            onSelect={() => onSelectList(space._id, list._id)}
                            onRename={() => onRenameList(list._id)}
                            onDelete={() => onDeleteList(list._id)}
                          />
                        ))}
                      </CollapsibleContent>
                    </Collapsible>
                    {droppableProvided.placeholder}
                  </div>
                )}
              </Droppable>
            )}
          </div>
        )}
      </Draggable>

      <DeleteConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete space"
        description="This will permanently delete this space and all its lists and tasks. This action cannot be undone."
        onConfirm={() => {
          onDelete()
          setDeleteOpen(false)
        }}
      />
    </>
  )
}
