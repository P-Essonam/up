import type { TaskStatus } from "./types"

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
