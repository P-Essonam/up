export type TaskPriority = "Urgent" | "High" | "Normal" | "Low"

export type TaskAssignee = {
  id: string
  name: string
  initials: string
  color: string
}

export type TaskStatus = {
  id: string
  name: string
  badgeClassName?: string
  columnClassName?: string
}

export type TaskItem = {
  id: string
  name: string
  statusId: string
  assignees: TaskAssignee[]
  dueDate?: string
  priority?: TaskPriority
}
