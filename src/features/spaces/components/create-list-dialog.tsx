"use client"

import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { Doc, Id } from "../../../../convex/_generated/dataModel"
import { cn } from "@/lib/utils"
import { getIcon } from "@/components/icon-picker"
import type { ListFormValues } from "../lib/types"
import { useSpaces } from "../hooks/use-spaces"

type ListDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  spaces: Doc<"spaces">[]
  defaultSpaceId?: Id<"spaces"> | null
  initialValues?: ListFormValues
  mode: "create" | "edit"
  listId?: Id<"lists">
}

export default function ListDialog({
  open,
  onOpenChange,
  spaces,
  defaultSpaceId,
  initialValues,
  mode = "create",
  listId,
}: ListDialogProps) {
  const { createList, updateList } = useSpaces()
  const [name, setName] = React.useState("")
  const [spaceId, setSpaceId] = React.useState<Id<"spaces"> | "">("")

  const isEdit = mode === "edit"

  // Populate form when dialog opens
  React.useEffect(() => {
    if (open) {
      setName(initialValues?.name ?? "")
      setSpaceId(initialValues?.spaceId ?? defaultSpaceId ?? spaces[0]?._id ?? "")
    }
  }, [open, initialValues, defaultSpaceId, spaces])

  const canSubmit = name.trim().length > 0 && spaceId.length > 0

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!canSubmit) return
    const values = { name: name.trim(), spaceId: spaceId as Id<"spaces"> } satisfies ListFormValues

    if (isEdit) {
      if (!listId) return
      await updateList(listId, values)
    } else {
      await createList(values.spaceId, values.name)
    }
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit List" : "Create List"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update the list name and location."
              : "All Lists are located within a Space. Lists can house any type of task."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-foreground">Name</Label>
            <Input
              placeholder="e.g. Project, List of items, Campaign"
              value={name}
              onChange={(event) => setName(event.target.value)}
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold text-foreground">Space (location)</Label>
            <Select value={spaceId} onValueChange={(value) => setSpaceId(value as Id<"spaces">)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a space" />
              </SelectTrigger>
              <SelectContent side="top">
                {spaces.map((space) => {
                  const SpaceIcon = getIcon(space.icon)
                  return (
                    <SelectItem key={space._id} value={space._id}>
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            "flex size-5 items-center justify-center rounded-sm",
                            space.color
                          )}
                        >
                          <SpaceIcon className="size-3 text-white" />
                        </span>
                        {space.name}
                      </div>
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={!canSubmit} size="lg">
              {isEdit ? "Save" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
