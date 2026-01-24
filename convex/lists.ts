import { v, ConvexError } from "convex/values"
import { mutation, query } from "./_generated/server"
import { paginationOptsValidator } from "convex/server"
import { getOrganizationId } from "./auth"

// Paginated query to get all lists for a space
export const listBySpace = query({
  args: {
    spaceId: v.id("spaces"),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, { spaceId, paginationOpts }) => {
    const org_id = await getOrganizationId(ctx)

    // Verify space exists and belongs to user's organization
    const space = await ctx.db.get(spaceId)
    if (!space) {
      throw new ConvexError({
        code: "NOT_FOUND",
        message: "Space not found",
      })
    }
    if (space.organizationId !== org_id) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "You are not authorized to view this space",
      })
    }

    return ctx.db
      .query("lists")
      .withIndex("by_space", (q) => q.eq("spaceId", spaceId))
      .order("asc")
      .paginate(paginationOpts)
  },
})

// Create a new list within a space
export const create = mutation({
  args: {
    spaceId: v.id("spaces"),
    name: v.string(),
    description: v.optional(v.string()),
    color: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const org_id = await getOrganizationId(ctx)
    const now = Date.now()

    // Get the highest sortOrder to place new list at the end
    const lastList = await ctx.db
      .query("lists")
      .withIndex("by_space_and_sort", (q) => q.eq("spaceId", args.spaceId))
      .order("desc")
      .first()

    const sortOrder = lastList ? lastList.sortOrder + 1 : 0

    return ctx.db.insert("lists", {
      name: args.name,
      spaceId: args.spaceId,
      description: args.description,
      color: args.color,
      organizationId: org_id,
      sortOrder,
      createdAt: now,
      updatedAt: now,
    })
  },
})

// Update a list
export const update = mutation({
  args: {
    id: v.id("lists"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    color: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const org_id = await getOrganizationId(ctx)

    // Verify list exists and belongs to user's organization
    const list = await ctx.db.get(args.id)
    if (!list) {
      throw new ConvexError({
        code: "NOT_FOUND",
        message: "List not found",
      })
    }
    if (list.organizationId !== org_id) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "You are not authorized to update this list",
      })
    }

    const updates: Record<string, unknown> = { updatedAt: Date.now() }
    if (args.name !== undefined) updates.name = args.name
    if (args.description !== undefined) updates.description = args.description
    if (args.color !== undefined) updates.color = args.color

    return ctx.db.patch(args.id, updates)
  },
})

// Delete a list and cascade delete all tasks
export const remove = mutation({
  args: { id: v.id("lists") },
  handler: async (ctx, args) => {
    const org_id = await getOrganizationId(ctx)

    // Verify list exists and belongs to user's organization
    const list = await ctx.db.get(args.id)
    if (!list) {
      throw new ConvexError({
        code: "NOT_FOUND",
        message: "List not found",
      })
    }
    if (list.organizationId !== org_id) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "You are not authorized to delete this list",
      })
    }

    // Delete all tasks in this list
    const tasks = await ctx.db
      .query("tasks")
      .withIndex("by_list", (q) => q.eq("listId", args.id))
      .collect()

    for (const task of tasks) {
      await ctx.db.delete(task._id)
    }

    // Delete the list
    await ctx.db.delete(args.id)
  },
})

// Reorder lists within a space (supports cross-space moves)
export const reorder = mutation({
  args: {
    spaceId: v.id("spaces"),
    orderedIds: v.array(v.id("lists")),
  },
  handler: async (ctx, args) => {
    const org_id = await getOrganizationId(ctx)
    const now = Date.now()

    // Verify space exists and belongs to user's organization
    const space = await ctx.db.get(args.spaceId)
    if (!space) {
      throw new ConvexError({
        code: "NOT_FOUND",
        message: "Space not found",
      })
    }
    if (space.organizationId !== org_id) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "You are not authorized to reorder lists in this space",
      })
    }

    // Update sortOrder and spaceId for each list
    for (let i = 0; i < args.orderedIds.length; i++) {
      const list = await ctx.db.get(args.orderedIds[i])
      if (!list) {
        throw new ConvexError({
          code: "NOT_FOUND",
          message: "List not found",
        })
      }
      if (list.organizationId !== org_id) {
        throw new ConvexError({
          code: "UNAUTHORIZED",
          message: "You are not authorized to reorder this list",
        })
      }

      await ctx.db.patch(args.orderedIds[i], {
        spaceId: args.spaceId,
        sortOrder: i,
        updatedAt: now,
      })
    }
  },
})
