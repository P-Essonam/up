import { v, ConvexError } from "convex/values"
import { mutation, query } from "./_generated/server"
import { paginationOptsValidator } from "convex/server"
import { getOrganizationId } from "./auth"
import { STATUSES } from "./constants"

// Paginated query to get all tasks for a list
export const listByList = query({
  args: {
    listId: v.id("lists"),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, { listId, paginationOpts }) => {
    const org_id = await getOrganizationId(ctx)

    // Verify list exists and belongs to user's organization
    const list = await ctx.db.get(listId)
    if (!list) {
      throw new ConvexError({
        code: "NOT_FOUND",
        message: "List not found",
      })
    }
    if (list.organizationId !== org_id) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "You are not authorized to view this list",
      })
    }

    return ctx.db
      .query("tasks")
      .withIndex("by_list", (q) => q.eq("listId", listId))
      .order("asc")
      .paginate(paginationOpts)
  },
})

// Non-paginated query to get all tasks for a list
export const listAll = query({
  args: { listId: v.id("lists") },
  handler: async (ctx, { listId }) => {
    const org_id = await getOrganizationId(ctx)

    // Verify list exists and belongs to user's organization
    const list = await ctx.db.get(listId)
    if (!list) {
      throw new ConvexError({
        code: "NOT_FOUND",
        message: "List not found",
      })
    }
    if (list.organizationId !== org_id) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "You are not authorized to view this list",
      })
    }

    return ctx.db
      .query("tasks")
      .withIndex("by_list", (q) => q.eq("listId", listId))
      .collect()
  },
})

// Create a new task within a list
export const create = mutation({
  args: {
    listId: v.id("lists"),
    title: v.string(),
    description: v.optional(v.string()),
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
    timeEstimate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const org_id = await getOrganizationId(ctx)
    const now = Date.now()

    // Get list for spaceId denormalization
    const list = await ctx.db.get(args.listId)
    if (!list) {
      throw new ConvexError({
        code: "NOT_FOUND",
        message: "List not found",
      })
    }

    // Get the highest sortOrder for "todo" status to place new task at the end
    const lastTask = await ctx.db
      .query("tasks")
      .withIndex("by_list_status_and_sort", (q) =>
        q.eq("listId", args.listId).eq("status", STATUSES.TODO)
      )
      .order("desc")
      .first()

    const sortOrder = lastTask ? lastTask.sortOrder + 1 : 0

    return ctx.db.insert("tasks", {
      title: args.title,
      description: args.description,
      listId: args.listId,
      spaceId: list.spaceId,
      status: STATUSES.TODO, // Default status
      sortOrder,
      priority: args.priority,
      assigneeId: args.assigneeId,
      startDate: args.startDate,
      dueDate: args.dueDate,
      timeEstimate: args.timeEstimate,
      organizationId: org_id,
      createdAt: now,
      updatedAt: now,
    })
  },
})

// Update a task
export const update = mutation({
  args: {
    id: v.id("tasks"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
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
    timeEstimate: v.optional(v.number()),
    timeTracked: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const org_id = await getOrganizationId(ctx)

    // Verify task exists and belongs to user's organization
    const task = await ctx.db.get(args.id)
    if (!task) {
      throw new ConvexError({
        code: "NOT_FOUND",
        message: "Task not found",
      })
    }
    if (task.organizationId !== org_id) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "You are not authorized to update this task",
      })
    }

    const updates: Record<string, unknown> = { updatedAt: Date.now() }
    if (args.title !== undefined) updates.title = args.title
    if (args.description !== undefined) updates.description = args.description
    if (args.priority !== undefined) updates.priority = args.priority
    if (args.assigneeId !== undefined) updates.assigneeId = args.assigneeId
    if (args.startDate !== undefined) updates.startDate = args.startDate
    if (args.dueDate !== undefined) updates.dueDate = args.dueDate
    if (args.timeEstimate !== undefined) updates.timeEstimate = args.timeEstimate
    if (args.timeTracked !== undefined) updates.timeTracked = args.timeTracked

    return ctx.db.patch(args.id, updates)
  },
})

// Update task status (for drag-and-drop between columns)
export const updateStatus = mutation({
  args: {
    id: v.id("tasks"),
    status: v.string(),
    sortOrder: v.number(),
  },
  handler: async (ctx, args) => {
    const org_id = await getOrganizationId(ctx)

    // Verify task exists and belongs to user's organization
    const task = await ctx.db.get(args.id)
    if (!task) {
      throw new ConvexError({
        code: "NOT_FOUND",
        message: "Task not found",
      })
    }
    if (task.organizationId !== org_id) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "You are not authorized to update this task",
      })
    }

    // Validate status is one of the predefined values
    const validStatuses = Object.values(STATUSES)
    if (!validStatuses.includes(args.status as (typeof validStatuses)[number])) {
      throw new ConvexError({
        code: "BAD_REQUEST",
        message: "Invalid status value",
      })
    }

    return ctx.db.patch(args.id, {
      status: args.status,
      sortOrder: args.sortOrder,
      updatedAt: Date.now(),
    })
  },
})

// Delete a task
export const remove = mutation({
  args: { id: v.id("tasks") },
  handler: async (ctx, args) => {
    const org_id = await getOrganizationId(ctx)

    // Verify task exists and belongs to user's organization
    const task = await ctx.db.get(args.id)
    if (!task) {
      throw new ConvexError({
        code: "NOT_FOUND",
        message: "Task not found",
      })
    }
    if (task.organizationId !== org_id) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "You are not authorized to delete this task",
      })
    }

    // Delete the task
    await ctx.db.delete(args.id)
  },
})

// Reorder tasks within a status column
export const reorder = mutation({
  args: {
    listId: v.id("lists"),
    status: v.string(),
    orderedIds: v.array(v.id("tasks")),
  },
  handler: async (ctx, args) => {
    const org_id = await getOrganizationId(ctx)
    const now = Date.now()

    // Verify list exists and belongs to user's organization
    const list = await ctx.db.get(args.listId)
    if (!list) {
      throw new ConvexError({
        code: "NOT_FOUND",
        message: "List not found",
      })
    }
    if (list.organizationId !== org_id) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "You are not authorized to reorder tasks in this list",
      })
    }

    // Validate status is one of the predefined values
    const validStatuses = Object.values(STATUSES)
    if (!validStatuses.includes(args.status as (typeof validStatuses)[number])) {
      throw new ConvexError({
        code: "BAD_REQUEST",
        message: "Invalid status value",
      })
    }

    // Update sortOrder for each task
    for (let i = 0; i < args.orderedIds.length; i++) {
      const task = await ctx.db.get(args.orderedIds[i])
      if (!task) {
        throw new ConvexError({
          code: "NOT_FOUND",
          message: "Task not found",
        })
      }
      if (task.organizationId !== org_id) {
        throw new ConvexError({
          code: "UNAUTHORIZED",
          message: "You are not authorized to reorder this task",
        })
      }

      await ctx.db.patch(args.orderedIds[i], {
        status: args.status,
        sortOrder: i,
        updatedAt: now,
      })
    }
  },
})
