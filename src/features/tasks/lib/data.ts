import type { TaskAssignee, TaskItem, TaskStatus } from "./types"

const assignees: TaskAssignee[] = [
  { id: "assignee-mm", name: "Mariam M.", initials: "MM", color: "bg-violet-500" },
  { id: "assignee-io", name: "Ibrahim O.", initials: "IO", color: "bg-emerald-500" },
]

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

export const defaultTasks: TaskItem[] = [
  {
    id: "task-io",
    name: "Plan sprint checklist",
    statusId: "in-progress",
    assignees: [assignees[1]],
    dueDate: "Aug 14",
    priority: "High",
  },
  {
    id: "task-jj",
    name: "Draft onboarding copy",
    statusId: "todo",
    assignees: [assignees[0]],
    dueDate: "Aug 16",
    priority: "Normal",
  },
]
