import type { TaskStatus, TaskPriority } from "./types"

export const defaultStatuses: TaskStatus[] = [
  {
    id: "todo",
    name: "To Do",
    badgeClassName: "bg-muted text-muted-foreground border-border/60",
    columnClassName: "bg-muted/30",
  },
  {
    id: "in-progress",
    name: "In Progress",
    badgeClassName: "bg-primary text-primary-foreground border-primary",
    columnClassName: "bg-primary/5",
  },
  {
    id: "complete",
    name: "Complete",
    badgeClassName: "bg-emerald-600 text-white border-emerald-600",
    columnClassName: "bg-emerald-500/5",
  },
]

export type PriorityOption = {
  value: TaskPriority
  label: string
  color: string
  flagColor: string
}

export const priorityOptions: PriorityOption[] = [
  {
    value: "urgent",
    label: "Urgent",
    color: "text-red-600",
    flagColor: "text-red-600",
  },
  {
    value: "high",
    label: "High",
    color: "text-yellow-600",
    flagColor: "text-yellow-600",
  },
  {
    value: "normal",
    label: "Normal",
    color: "text-blue-600",
    flagColor: "text-blue-600",
  },
  {
    value: "low",
    label: "Low",
    color: "text-muted-foreground",
    flagColor: "text-muted-foreground",
  },
]
