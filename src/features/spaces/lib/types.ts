import { Doc, Id } from "../../../../convex/_generated/dataModel"
import { api } from "../../../../convex/_generated/api"
import type { FunctionArgs } from "convex/server"

// UI-enhanced type with open/closed state (not persisted)
export type Space = Doc<"spaces"> & {
  lists: Doc<"lists">[]
  isOpen?: boolean
}

export type SpaceDialogState = {
  open: boolean
  mode: "create" | "edit"
  space?: Space
}

export type ListDialogState = {
  open: boolean
  mode: "create" | "edit"
  spaceId: Id<"spaces"> | null
  list?: Doc<"lists">
}

// Derive form types directly from Convex mutation arguments
export type SpaceFormValues = FunctionArgs<typeof api.spaces.create>
export type ListFormValues = FunctionArgs<typeof api.lists.create>
