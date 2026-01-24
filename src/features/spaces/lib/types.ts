import type { Doc, Id } from "../../../../convex/_generated/dataModel"

export type SpaceList = Doc<"lists">

export type SpaceWithLists = Doc<"spaces"> & {
  lists: SpaceList[]
}

// UI-enhanced type with open/closed state (not persisted)
export type Space = SpaceWithLists & {
  isOpen?: boolean
}

export type { Id }
