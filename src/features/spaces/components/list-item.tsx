"use client"

import { useState } from "react"
import { Draggable } from "@hello-pangea/dnd"
import { ListChecks } from "lucide-react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import type { Doc } from "../../../../convex/_generated/dataModel"
import { useSpaces } from "../hooks/use-spaces"
import { SecondarySidebarItem } from "./secondary-sidebar-item"
import { ItemMenu } from "./item-menu"
import { DeleteConfirmDialog } from "../../../components/delete-confirm-dialog"
import ListDialog from "./create-list-dialog"

type ListItemProps = {
  list: Doc<"lists">
  index: number
  active: boolean
}

export function ListItem({ list, index, active }: ListItemProps) {
  const router = useRouter()
  const { spaces, deleteList } = useSpaces()
  
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  const handleSelect = () => {
    router.push(`/dashboard/lists/${list._id}`)
  }

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
              onClick={handleSelect}
              className={cn("cursor-pointer", snapshot.isDragging && "bg-muted opacity-80")}
              leading={<ListChecks className="size-4" />}
              actions={
                <ItemMenu
                  onRename={() => setEditOpen(true)}
                  onDelete={() => setDeleteOpen(true)}
                />
              }
            />
          </div>
        )}
      </Draggable>

      <ListDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        spaces={spaces}
        mode="edit"
        listId={list._id}
        initialValues={{ name: list.name, spaceId: list.spaceId }}
      />

      <DeleteConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete list"
        description="This will permanently delete this list and all its tasks. This action cannot be undone."
        onConfirm={async () => {
          await deleteList(list._id)
          setDeleteOpen(false)
        }}
      />
    </>
  )
}
