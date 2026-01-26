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

    return ctx.db
      .query("tasks")
      .withIndex("by_organizationId_and_listId", (q) =>
        q.eq("organizationId", org_id).eq("listId", listId)
      )
      .order("asc")
      .paginate(paginationOpts)
  },
})

// Paginated query to get tasks for a list filtered by status
export const listByListAndStatus = query({
  args: {
    listId: v.id("lists"),
    status: v.union(v.literal("todo"), v.literal("in-progress"), v.literal("complete")),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, { listId, status, paginationOpts }) => {
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
        message: "You are not authorized to view tasks in this list",
      })
    }

    return ctx.db
      .query("tasks")
      .withIndex("by_list_status_and_sort", (q) =>
        q.eq("listId", listId).eq("status", status)
      )
      .order("asc")
      .paginate(paginationOpts)
  },
})

// Create a new task within a list
export const create = mutation({
  args: {
    listId: v.id("lists"),
    title: v.string(),
    description: v.optional(v.string()),
    status: v.union(v.literal("todo"), v.literal("in-progress"), v.literal("complete")),
    priority: v.optional(
      v.union(
        v.literal("low"),
        v.literal("normal"),
        v.literal("high"),
        v.literal("urgent")
      )
    ),
    assigneeIds: v.optional(v.array(v.string())),
    startDate: v.optional(v.number()),
    dueDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const org_id = await getOrganizationId(ctx)
    const now = Date.now()

    // Get the highest sortOrder for the specified status to place new task at the end
    const lastTask = await ctx.db
      .query("tasks")
      .withIndex("by_list_status_and_sort", (q) =>
        q.eq("listId", args.listId).eq("status", args.status)
      )
      .order("desc")
      .first()

    const sortOrder = lastTask ? lastTask.sortOrder + 1 : 0

    return ctx.db.insert("tasks", {
      title: args.title,
      description: args.description,
      listId: args.listId,
      status: args.status,
      sortOrder,
      priority: args.priority,
      assigneeIds: args.assigneeIds ?? [],
      startDate: args.startDate,
      dueDate: args.dueDate,
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
    status: v.optional(v.union(v.literal("todo"), v.literal("in-progress"), v.literal("complete"))),
    priority: v.optional(v.union(v.literal("low"), v.literal("normal"), v.literal("high"), v.literal("urgent"))),
    assigneeIds: v.optional(v.array(v.string())),
    startDate: v.optional(v.number()),
    dueDate: v.optional(v.number()),
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

    // If status is being updated, we need to recalculate sortOrder for the new status
    let sortOrder = task.sortOrder
    if (args.status !== undefined && args.status !== task.status) {
      const newStatus: "todo" | "in-progress" | "complete" = args.status
      const lastTask = await ctx.db
        .query("tasks")
        .withIndex("by_list_status_and_sort", (q) =>
          q.eq("listId", task.listId).eq("status", newStatus)
        )
        .order("desc")
        .first()
      sortOrder = lastTask ? lastTask.sortOrder + 1 : 0
    }

    return ctx.db.patch(args.id, {
      ...(args.title !== undefined && { title: args.title }),
      description: args.description,
      ...(args.status !== undefined && { status: args.status }),
      ...(args.status !== undefined && args.status !== task.status && { sortOrder }),
      priority: args.priority,
      assigneeIds: args.assigneeIds,
      startDate: args.startDate,
      dueDate: args.dueDate,
      updatedAt: Date.now(),
    })
  },
})

// Update task status (for drag-and-drop between columns)
export const updateStatus = mutation({
  args: {
    id: v.id("tasks"),
    status: v.union(
      v.literal("todo"),
      v.literal("in-progress"),
      v.literal("complete")
    ),
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
    status: v.union(
      v.literal("todo"),
      v.literal("in-progress"),
      v.literal("complete")
    ),
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
