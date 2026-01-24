import type { Doc } from "../../../../convex/_generated/dataModel"

export type Task = Doc<"tasks">

export type TaskPriority = "urgent" | "high" | "normal" | "low"

export type TaskStatus = {
  id: string
  name: string
  badgeClassName?: string
  columnClassName?: string
}
