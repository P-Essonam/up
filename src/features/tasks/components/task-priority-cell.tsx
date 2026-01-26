"use client"

import * as React from "react"
import { Flag, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { formatPriority } from "@/features/tasks/lib/utils"
import { priorityOptions } from "@/features/tasks/lib/constants"
import type { Task, TaskPriority } from "@/features/tasks/lib/types"

type TaskPriorityCellProps = {
  task: Task
  onUpdate: (priority: TaskPriority | undefined) => void
}

export function TaskPriorityCell({ task, onUpdate }: TaskPriorityCellProps) {
  const [open, setOpen] = React.useState(false)

  const priority = task.priority
  const currentOption = priority ? priorityOptions.find((opt) => opt.value === priority) : null
  const hasPriority = priority !== undefined

  const handleSelect = (newPriority: TaskPriority) => {
    onUpdate(newPriority)
    setOpen(false)
  }

  const handleClear = () => {
    onUpdate(undefined)
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          className={cn(
            "h-auto w-full cursor-pointer gap-2 px-0! justify-start py-1 text-xs hover:bg-transparent items-center",
            hasPriority ? "text-foreground" : "text-muted-foreground"
          )}
        >
          <Flag className={cn("size-4", currentOption?.flagColor)} />
          {hasPriority && priority && <span>{formatPriority(priority)}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-56 p-2"
        align="end"
      >
        <div className="space-y-1">
          <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
            Task Priority
          </div>
          {priorityOptions.map((option) => {
            const isSelected = priority === option.value
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => handleSelect(option.value)}
                className={cn(
                  "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent",
                  isSelected && "bg-accent"
                )}
              >
                <Flag className={cn("size-4", option.flagColor)} />
                <span className={option.color}>{option.label}</span>
              </button>
            )
          })}
          <div className="border-t border-border my-1" />
          <Button
            variant="ghost"
            onClick={handleClear}
            className="w-full justify-start gap-2"
          >
            <X className="size-4" />
            <span>Clear</span>
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
