"use client"

import { useState, useMemo } from "react"
import { Calendar as CalendarIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { formatTaskDate } from "@/features/tasks/lib/utils"
import type { Task } from "@/features/tasks/lib/types"
import type { DateRange } from "react-day-picker"

type TaskDueDateCellProps = {
  task: Task
  onUpdate: (startDate: number | null, dueDate: number | null) => void
}

export function TaskDueDateCell({ task, onUpdate }: TaskDueDateCellProps) {
  const [open, setOpen] = useState(false)

  const dateRange = useMemo<DateRange | undefined>(() => {
    const start = task.startDate ? new Date(task.startDate) : undefined
    const end = task.dueDate ? new Date(task.dueDate) : undefined
    return start || end ? { from: start, to: end } : undefined
  }, [task.startDate, task.dueDate])

  const handleDateSelect = (range: DateRange | undefined) => {
    const startDate = range?.from?.getTime() ?? null
    const dueDate = range?.to?.getTime() ?? null
    onUpdate(startDate, dueDate)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          className={cn(
            "h-auto w-full cursor-pointer justify-start gap-2 px-0! py-1 text-xs text-muted-foreground hover:bg-transparent items-center",
            task.dueDate && "text-foreground"
          )}
        >
          {task.dueDate ? (
            <span>{formatTaskDate(task.dueDate)}</span>
          ) : (
            <CalendarIcon className="size-4" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="end">
        <Calendar
          mode="range"
          defaultMonth={dateRange?.from}
          selected={dateRange}
          onSelect={handleDateSelect}
          numberOfMonths={2}
        />
      </PopoverContent>
    </Popover>
  )
}
