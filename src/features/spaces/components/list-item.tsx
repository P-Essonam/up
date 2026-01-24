"use client"

import { useState } from "react"
import { Draggable } from "@hello-pangea/dnd"
import { ListChecks } from "lucide-react"
import { cn } from "@/lib/utils"
import type { SpaceList } from "../lib/types"
import { SecondarySidebarItem } from "./secondary-sidebar-item"
import { ItemMenu } from "./item-menu"
import { DeleteConfirmDialog } from "./delete-confirm-dialog"

type ListItemProps = {
  list: SpaceList
  index: number
  active: boolean
  onSelect: () => void
  onRename: () => void
  onDelete: () => void
}

export function ListItem({
  list,
  index,
  active,
  onSelect,
  onRename,
  onDelete,
}: ListItemProps) {
  const [deleteOpen, setDeleteOpen] = useState(false)

  return (
    <>
      <Draggable draggableId={list._id} index={index}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
          >
            <SecondarySidebarItem
              label={list.name}
              active={active}
              onClick={onSelect}
              className={cn("cursor-pointer", snapshot.isDragging && "bg-muted opacity-80")}
              leading={<ListChecks className="size-4 text-muted-foreground" />}
              actions={
                <ItemMenu
                  onRename={onRename}
                  onDelete={() => setDeleteOpen(true)}
                />
              }
            />
          </div>
        )}
      </Draggable>

      <DeleteConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete list"
        description="This will permanently delete this list and all its tasks. This action cannot be undone."
        onConfirm={() => {
          onDelete()
          setDeleteOpen(false)
        }}
      />
    </>
  )
}
