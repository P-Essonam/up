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
import { Textarea } from "@/components/ui/textarea"
import { IconPickerWithColor, getIcon } from "@/components/icon-picker"
import { cn } from "@/lib/utils"

export type CreateSpaceValues = {
  name: string
  description: string
  icon: string
  color: string
}

type CreateSpaceDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreate: (values: CreateSpaceValues) => void
}

export default function CreateSpaceDialog({
  open,
  onOpenChange,
  onCreate,
}: CreateSpaceDialogProps) {
  const [name, setName] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [selectedIcon, setSelectedIcon] = React.useState("Layers")
  const [selectedColor, setSelectedColor] = React.useState("bg-indigo-500")
  const [showIconPicker, setShowIconPicker] = React.useState(false)
  const iconPickerRef = React.useRef<HTMLDivElement | null>(null)
  const iconButtonRef = React.useRef<HTMLButtonElement | null>(null)

  const canSubmit = name.trim().length > 0

  const resetForm = React.useCallback(() => {
    setName("")
    setDescription("")
    setSelectedIcon("Layers")
    setSelectedColor("bg-indigo-500")
    setShowIconPicker(false)
  }, [])

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      resetForm()
    }
    onOpenChange(nextOpen)
  }

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    if (!canSubmit) return
    onCreate({
      name: name.trim(),
      description: description.trim(),
      icon: selectedIcon,
      color: selectedColor,
    })
    resetForm()
    onOpenChange(false)
  }

  const handleReset = () => {
    setSelectedIcon("Layers")
    setSelectedColor("bg-indigo-500")
  }

  React.useEffect(() => {
    if (!showIconPicker) return
    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as Node
      if (iconPickerRef.current?.contains(target)) return
      if (iconButtonRef.current?.contains(target)) return
      setShowIconPicker(false)
    }
    document.addEventListener("mousedown", handleOutsideClick)
    return () => document.removeEventListener("mousedown", handleOutsideClick)
  }, [showIconPicker])

  const SelectedIconComponent = getIcon(selectedIcon)

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Create a Space</DialogTitle>
          <DialogDescription>
            A Space represents teams, departments, or groups.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Icon & name */}
          <div className="relative space-y-2">
            <Label className="text-sm font-semibold text-foreground">
              Icon & name
            </Label>
            <div className="flex items-center gap-3">
              {/* Icon Button */}
              <button
                type="button"
                ref={iconButtonRef}
                onClick={() => setShowIconPicker(!showIconPicker)}
                className={cn(
                  "flex size-9 shrink-0 items-center justify-center rounded-lg text-white transition-colors",
                  selectedColor
                )}
              >
                <SelectedIconComponent className="size-5" />
              </button>

              {/* Name Input */}
              <Input
                id="space-name"
                placeholder="e.g. Marketing, Engineering, HR"
                value={name}
                onChange={(event) => setName(event.target.value)}
                autoFocus
                className="flex-1"
              />
            </div>

            {/* Icon Picker */}
            {showIconPicker && (
              <div
                ref={iconPickerRef}
                className="absolute left-0 top-full z-30 mt-2 w-full max-w-md"
              >
                <IconPickerWithColor
                  icon={selectedIcon}
                  color={selectedColor}
                  onIconChange={setSelectedIcon}
                  onColorChange={setSelectedColor}
                  onReset={handleReset}
                />
              </div>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="space-description" className="text-sm text-muted-foreground">
              Description{" "}
              <span className="font-normal text-muted-foreground">(optional)</span>
            </Label>
            <Textarea
              id="space-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="submit" disabled={!canSubmit} size="lg">
              Continue
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
