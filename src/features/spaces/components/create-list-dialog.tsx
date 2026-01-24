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
import type { Space } from "@/features/spaces/lib/types"
import type { Id } from "../../../../convex/_generated/dataModel"
import { cn } from "@/lib/utils"

export type CreateListValues = {
  name: string
  spaceId: string
}

type CreateListDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  spaces: Space[]
  defaultSpaceId?: Id<"spaces"> | null
  onCreate: (values: CreateListValues) => void | Promise<void>
}

function getSpaceInitials(name: string) {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 1)
    .toUpperCase()
}

export default function CreateListDialog({
  open,
  onOpenChange,
  spaces,
  defaultSpaceId,
  onCreate,
}: CreateListDialogProps) {
  const [name, setName] = React.useState("")
  const [spaceId, setSpaceId] = React.useState("")

  React.useEffect(() => {
    if (!open) return
    setName("")
    setSpaceId(defaultSpaceId ?? spaces[0]?._id ?? "")
  }, [open, defaultSpaceId, spaces])

  const canSubmit = name.trim().length > 0 && spaceId.length > 0

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!canSubmit) return
    await onCreate({ name: name.trim(), spaceId })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Create List</DialogTitle>
          <DialogDescription>
            All Lists are located within a Space. Lists can house any type of task.
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
            <Select value={spaceId} onValueChange={setSpaceId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a space" />
              </SelectTrigger>
              <SelectContent>
                {spaces.map((space) => (
                  <SelectItem key={space._id} value={space._id}>
                    <span
                      className={cn(
                        "flex size-5 items-center justify-center rounded text-[10px] font-bold text-white",
                        space.color
                      )}
                    >
                      {getSpaceInitials(space.name)}
                    </span>
                    {space.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={!canSubmit} size="lg">
              Create
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
