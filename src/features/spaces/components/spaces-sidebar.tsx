"use client"

import * as React from "react"
import {
  DragDropContext,
  Draggable,
  Droppable,
  type DragStart,
  type DropResult,
} from "@hello-pangea/dnd"
import { ChevronRight, ListChecks, MoreHorizontal, Palette, Pencil, Plus, Trash2 } from "lucide-react"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { SecondarySidebarItem } from "@/features/spaces/components/secondary-sidebar-item"
import type { Space, SpaceList } from "../lib/types"

// --- Utilities ---

function reorder<T>(list: T[], from: number, to: number): T[] {
  const result = [...list]
  const [removed] = result.splice(from, 1)
  result.splice(to, 0, removed)
  return result
}

function moveBetweenSpaces(
  spaces: Space[],
  sourceSpaceId: string,
  destSpaceId: string,
  sourceIndex: number,
  destIndex: number
): Space[] {
  const sourceSpace = spaces.find((s) => s.id === sourceSpaceId)
  const destSpace = spaces.find((s) => s.id === destSpaceId)
  if (!sourceSpace || !destSpace) return spaces

  const item = sourceSpace.lists[sourceIndex]
  if (!item) return spaces

  return spaces.map((space) => {
    if (space.id === sourceSpaceId) {
      return { ...space, lists: space.lists.filter((_, i) => i !== sourceIndex) }
    }
    if (space.id === destSpaceId) {
      const newLists = [...space.lists]
      newLists.splice(destIndex, 0, item)
      return { ...space, lists: newLists }
    }
    return space
  })
}

function getSpaceInitials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
}

// --- Main Component ---

type SpacesSidebarProps = {
  spaces: Space[]
  setSpaces: React.Dispatch<React.SetStateAction<Space[]>>
  onCreateClick?: () => void
  onCreateList?: (spaceId: string) => void
}

export default function SpacesSidebar({
  spaces,
  setSpaces,
  onCreateClick,
  onCreateList,
}: SpacesSidebarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [isDragging, setIsDragging] = React.useState(false)
  const [dragType, setDragType] = React.useState<string | null>(null)
  const [draggedId, setDraggedId] = React.useState<string | null>(null)
  const activeSpaceId = React.useMemo(() => {
    const match = pathname?.match(/\/spaces\/([^/]+)/)
    return match?.[1] ?? null
  }, [pathname])
  const activeListId = React.useMemo(() => {
    const match = pathname?.match(/\/lists\/([^/]+)/)
    return match?.[1] ?? null
  }, [pathname])

  const toggleSpace = (id: string) => {
    setSpaces((prev) =>
      prev.map((s) => (s.id === id ? { ...s, isOpen: !(s.isOpen ?? true) } : s))
    )
  }

  const renameSpace = (id: string) => {
    const nextName = window.prompt("Rename space")
    if (!nextName?.trim()) return
    setSpaces((prev) => prev.map((s) => (s.id === id ? { ...s, name: nextName } : s)))
  }

  const deleteSpace = (id: string) => {
    setSpaces((prev) => prev.filter((s) => s.id !== id))
  }

  const renameList = (spaceId: string, listId: string) => {
    const nextName = window.prompt("Rename list")
    if (!nextName?.trim()) return
    setSpaces((prev) =>
      prev.map((space) =>
        space.id === spaceId
          ? {
              ...space,
              lists: space.lists.map((list) =>
                list.id === listId ? { ...list, name: nextName } : list
              ),
            }
          : space
      )
    )
  }

  const deleteList = (spaceId: string, listId: string) => {
    setSpaces((prev) =>
      prev.map((space) =>
        space.id === spaceId
          ? { ...space, lists: space.lists.filter((list) => list.id !== listId) }
          : space
      )
    )
  }

  const handleSelectList = React.useCallback(
    (spaceId: string, listId: string) => {
      router.push(`/dashboard/spaces/${spaceId}/lists/${listId}`)
    },
    [router]
  )

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
      setSpaces((prev) => reorder(prev, source.index, destination.index))
      return
    }

    if (type === "LIST") {
      const sourceSpaceId = source.droppableId
      const destSpaceId = destination.droppableId

      if (sourceSpaceId === destSpaceId) {
        setSpaces((prev) =>
          prev.map((space) =>
            space.id === sourceSpaceId
              ? { ...space, lists: reorder(space.lists, source.index, destination.index) }
              : space
          )
        )
      } else {
        setSpaces((prev) =>
          moveBetweenSpaces(prev, sourceSpaceId, destSpaceId, source.index, destination.index)
        )
      }
    }
  }

  return (
    <DragDropContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className={cn("flex flex-col gap-1", isDragging && "**:cursor-pointer")}>
        <Droppable droppableId="spaces" type="SPACE">
          {(provided) => (
            <div ref={provided.innerRef} {...provided.droppableProps} className="flex flex-col">
              {spaces.map((space, index) => (
                <SpaceRow
                  key={space.id}
                  space={space}
                  index={index}
                  onToggle={() => toggleSpace(space.id)}
                  onRename={() => renameSpace(space.id)}
                  onDelete={() => deleteSpace(space.id)}
                  onRenameList={(listId) => renameList(space.id, listId)}
                  onDeleteList={(listId) => deleteList(space.id, listId)}
                  onAddList={() => onCreateList?.(space.id)}
                  isDragged={draggedId === space.id}
                  isDraggingList={isDragging && dragType === "LIST"}
                  activeSpaceId={activeSpaceId}
                  activeListId={activeListId}
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
          onClick={onCreateClick}
        />
      </div>
    </DragDropContext>
  )
}

// --- Space Row ---

function SpaceRow({
  space,
  index,
  onToggle,
  onRename,
  onDelete,
  onRenameList,
  onDeleteList,
  onAddList,
  isDragged,
  isDraggingList,
  activeSpaceId,
  activeListId,
  onSelectList,
}: {
  space: Space
  index: number
  onToggle: () => void
  onRename: () => void
  onDelete: () => void
  onRenameList: (listId: string) => void
  onDeleteList: (listId: string) => void
  onAddList: () => void
  isDragged: boolean
  isDraggingList: boolean
  activeSpaceId: string | null
  activeListId: string | null
  onSelectList: (spaceId: string, listId: string) => void
}) {
  const isOpen = space.isOpen ?? true
  const isActiveSpace = activeSpaceId === space.id

  return (
    <Draggable draggableId={space.id} index={index}>
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
                      space.color
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
                  <SpaceMenu onRename={onRename} onDelete={onDelete} />
                  <ActionButton icon={Plus} label="Add list" onClick={onAddList} />
                </div>
              }
            />
          </div>

          {!isDragged && (
            <Droppable droppableId={space.id} type="LIST">
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
                        <ListRow
                          key={list.id}
                          item={list}
                          index={listIndex}
                          onRename={() => onRenameList(list.id)}
                          onDelete={() => onDeleteList(list.id)}
                          onSelect={() => onSelectList(space.id, list.id)}
                          active={isActiveSpace && activeListId === list.id}
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
  )
}

// --- List Row ---

function ListRow({
  item,
  index,
  onRename,
  onDelete,
  onSelect,
  active,
}: {
  item: SpaceList
  index: number
  onRename: () => void
  onDelete: () => void
  onSelect: () => void
  active: boolean
}) {
  return (
    <Draggable draggableId={item.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
        >
          <SecondarySidebarItem
            label={item.name}
            count={item.count}
            active={active}
            onClick={onSelect}
            className={cn("cursor-pointer", snapshot.isDragging && "bg-muted opacity-80")}
            leading={<ListChecks className="size-4 text-muted-foreground" />}
            actions={<ListMenu onRename={onRename} onDelete={onDelete} />}
          />
        </div>
      )}
    </Draggable>
  )
}

// --- Action Button ---

function ActionButton({
  icon: Icon,
  label,
  onClick,
  variant = "ghost",
  size = "icon-sm",
  className,
  ...props
}: {
  icon: React.ElementType
  label: string
  onClick?: (e: React.MouseEvent) => void
} & React.ComponentProps<typeof Button>) {
  return (
    <Button
      variant={variant}
      size={size}
      className={cn("size-7", className)}
      onClick={(e) => {
        e.stopPropagation()
        onClick?.(e)
      }}
      aria-label={label}
      {...props}
    >
      <Icon className="size-4" />
    </Button>
  )
}

function SpaceMenu({ onRename, onDelete }: { onRename: () => void; onDelete: () => void }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <ActionButton icon={MoreHorizontal} label="More actions" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem
          onSelect={(e) => {
            e.preventDefault()
            e.stopPropagation()
          }}
        >
          <Palette className="size-4" />
          Icon & name
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={(e) => {
            e.preventDefault()
            e.stopPropagation()
            onRename()
          }}
        >
          <Pencil className="size-4" />
          Rename
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          onSelect={(e) => {
            e.preventDefault()
            e.stopPropagation()
            onDelete()
          }}
        >
          <Trash2 className="size-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function ListMenu({ onRename, onDelete }: { onRename: () => void; onDelete: () => void }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <ActionButton icon={MoreHorizontal} label="More actions" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem
          onSelect={(e) => {
            e.preventDefault()
            e.stopPropagation()
          }}
        >
          <Palette className="size-4" />
          Icon & name
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={(e) => {
            e.preventDefault()
            e.stopPropagation()
            onRename()
          }}
        >
          <Pencil className="size-4" />
          Rename
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          onSelect={(e) => {
            e.preventDefault()
            e.stopPropagation()
            onDelete()
          }}
        >
          <Trash2 className="size-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
