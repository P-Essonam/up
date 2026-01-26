import { defineSchema, defineTable } from "convex/server"
import { v } from "convex/values"

export default defineSchema({
  onboarding: defineTable({
    workosOrganizationId: v.string(),
    workspaceType: v.optional(v.string()),
    manageType: v.optional(v.string()),
  }).index("by_workos_organization_id", ["workosOrganizationId"]),

  // Spaces - Top level container for lists
  spaces: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    organizationId: v.string(),
    color: v.string(),
    icon: v.string(),
    sortOrder: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_organization", ["organizationId"])
    .index("by_organization_and_sort", ["organizationId", "sortOrder"]),

  // Lists - Container for tasks within a space
  lists: defineTable({
    name: v.string(),
    spaceId: v.id("spaces"),
    sortOrder: v.number(),
    organizationId: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_space", ["spaceId"])
    .index("by_space_and_sort", ["spaceId", "sortOrder"]),

  // Tasks - Individual work items within a list
  tasks: defineTable({
    title: v.string(),
    description: v.optional(v.string()),
    listId: v.id("lists"),
    status: v.union(
      v.literal("todo"),
      v.literal("in-progress"),
      v.literal("complete")
    ),
    sortOrder: v.number(), // Order within status column
    priority: v.optional(
      v.union(
        v.literal("low"),
        v.literal("normal"),
        v.literal("high"),
        v.literal("urgent")
      )
    ),
    assigneeIds: v.array(v.string()),
    startDate: v.optional(v.number()),
    dueDate: v.optional(v.number()),
    organizationId: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_organizationId_and_listId", ["organizationId", "listId"])
    .index("by_list_status_and_sort", ["listId", "status", "sortOrder"])
    .index("by_org_list_status_sort", ["organizationId", "listId", "status", "sortOrder"]),
})
