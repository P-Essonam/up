import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

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
    color: v.optional(v.string()),
    icon: v.optional(v.string()),
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
    description: v.optional(v.string()),
    color: v.optional(v.string()),
    sortOrder: v.number(),
    organizationId: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_space", ["spaceId"])
    .index("by_space_and_sort", ["spaceId", "sortOrder"])
    .index("by_organization", ["organizationId"]),

  // Statuses - Custom status definitions for each list
  statuses: defineTable({
    name: v.string(), // e.g., "To Do", "In Progress", "Done"
    listId: v.id("lists"), // Belongs to a specific list
    color: v.string(), // Hex color for visual distinction
    sortOrder: v.number(), // Order for Kanban column positioning
    organizationId: v.string(), // For access control
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_list", ["listId"])
    .index("by_list_and_sort", ["listId", "sortOrder"])
    .index("by_organization", ["organizationId"]),

  // Tasks - Individual work items within a list
  tasks: defineTable({
    title: v.string(),
    description: v.optional(v.string()),
    listId: v.id("lists"),
    spaceId: v.id("spaces"), // Denormalized for faster queries
    statusId: v.id("statuses"), // Reference to status instead of literal
    sortOrder: v.number(), // Order within status column
    priority: v.optional(
      v.union(
        v.literal("low"),
        v.literal("normal"),
        v.literal("high"),
        v.literal("urgent")
      )
    ),
    assigneeId: v.optional(v.string()),
    startDate: v.optional(v.number()),
    dueDate: v.optional(v.number()),
    timeEstimate: v.optional(v.number()), // Time estimate in minutes
    timeTracked: v.optional(v.number()), // Total time tracked in minutes
    organizationId: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_list", ["listId"])
    .index("by_list_and_status_id", ["listId", "statusId"])
    .index("by_list_status_id_and_sort", ["listId", "statusId", "sortOrder"])
    .index("by_space", ["spaceId"])
    .index("by_status", ["statusId"])
    .index("by_organization", ["organizationId"]),

  // Tags - Color-coded labels for categorizing tasks
  tags: defineTable({
    name: v.string(), // Tag name (e.g., "urgent", "bug", "feature")
    color: v.string(), // Hex color for visual distinction
    spaceId: v.optional(v.id("spaces")), // Optional: space-specific tags
    organizationId: v.string(), // Organization-wide or space-specific
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_organization", ["organizationId"])
    .index("by_space", ["spaceId"])
    .index("by_organization_and_name", ["organizationId", "name"]),

  // TaskTags - Junction table for many-to-many relationship between tasks and tags
  taskTags: defineTable({
    taskId: v.id("tasks"),
    tagId: v.id("tags"),
    organizationId: v.string(),
    createdAt: v.number(),
  })
    .index("by_task", ["taskId"])
    .index("by_tag", ["tagId"])
    .index("by_task_and_tag", ["taskId", "tagId"])
    .index("by_organization", ["organizationId"]),
});
