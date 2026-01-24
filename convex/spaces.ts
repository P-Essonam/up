import { v, ConvexError } from "convex/values"
import { mutation, query } from "./_generated/server"
import { paginationOptsValidator } from "convex/server"
import { getOrganizationId } from "./auth"

// Paginated query to get all spaces for the organization
export const list = query({
  args: { paginationOpts: paginationOptsValidator },
  handler: async (ctx, { paginationOpts }) => {
    const org_id = await getOrganizationId(ctx)
    return ctx.db
      .query("spaces")
      .withIndex("by_organization", (q) => q.eq("organizationId", org_id))
      .order("asc")
      .paginate(paginationOpts)
  },
})

// Non-paginated query to get all spaces with their lists (for sidebar)
export const listWithLists = query({
  args: {},
  handler: async (ctx) => {
    const org_id = await getOrganizationId(ctx)

    const spaces = await ctx.db
      .query("spaces")
      .withIndex("by_organization", (q) => q.eq("organizationId", org_id))
      .collect()

    // Fetch lists for each space
    const spacesWithLists = await Promise.all(
      spaces.map(async (space) => {
        const lists = await ctx.db
          .query("lists")
          .withIndex("by_space", (q) => q.eq("spaceId", space._id))
          .collect()
        return {
          ...space,
          lists: lists.sort((a, b) => a.sortOrder - b.sortOrder),
        }
      })
    )

    return spacesWithLists.sort((a, b) => a.sortOrder - b.sortOrder)
  },
})

// Create a new space
export const create = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    color: v.optional(v.string()),
    icon: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const org_id = await getOrganizationId(ctx)
    const now = Date.now()

    // Get the highest sortOrder to place new space at the end
    const lastSpace = await ctx.db
      .query("spaces")
      .withIndex("by_organization_and_sort", (q) =>
        q.eq("organizationId", org_id)
      )
      .order("desc")
      .first()

    const sortOrder = lastSpace ? lastSpace.sortOrder + 1 : 0

    return ctx.db.insert("spaces", {
      name: args.name,
      description: args.description,
      color: args.color,
      icon: args.icon,
      organizationId: org_id,
      sortOrder,
      createdAt: now,
      updatedAt: now,
    })
  },
})

// Update a space
export const update = mutation({
  args: {
    id: v.id("spaces"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    color: v.optional(v.string()),
    icon: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const org_id = await getOrganizationId(ctx)

    // Verify space exists and belongs to user's organization
    const space = await ctx.db.get(args.id)
    if (!space) {
      throw new ConvexError({
        code: "NOT_FOUND",
        message: "Space not found",
      })
    }
    if (space.organizationId !== org_id) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "You are not authorized to update this space",
      })
    }

    const updates: Record<string, unknown> = { updatedAt: Date.now() }
    if (args.name !== undefined) updates.name = args.name
    if (args.description !== undefined) updates.description = args.description
    if (args.color !== undefined) updates.color = args.color
    if (args.icon !== undefined) updates.icon = args.icon

    return ctx.db.patch(args.id, updates)
  },
})

// Delete a space and cascade delete all lists and tasks
export const remove = mutation({
  args: { id: v.id("spaces") },
  handler: async (ctx, args) => {
    const org_id = await getOrganizationId(ctx)

    // Verify space exists and belongs to user's organization
    const space = await ctx.db.get(args.id)
    if (!space) {
      throw new ConvexError({
        code: "NOT_FOUND",
        message: "Space not found",
      })
    }
    if (space.organizationId !== org_id) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "You are not authorized to delete this space",
      })
    }

    // Get all lists in this space
    const lists = await ctx.db
      .query("lists")
      .withIndex("by_space", (q) => q.eq("spaceId", args.id))
      .collect()

    // Delete all tasks in each list
    for (const list of lists) {
      const tasks = await ctx.db
        .query("tasks")
        .withIndex("by_list", (q) => q.eq("listId", list._id))
        .collect()

      for (const task of tasks) {
        await ctx.db.delete(task._id)
      }

      await ctx.db.delete(list._id)
    }

    // Delete the space
    await ctx.db.delete(args.id)
  },
})

// Reorder spaces (for drag-and-drop)
export const reorder = mutation({
  args: {
    orderedIds: v.array(v.id("spaces")),
  },
  handler: async (ctx, args) => {
    const org_id = await getOrganizationId(ctx)
    const now = Date.now()

    // Verify all spaces belong to this organization
    for (const id of args.orderedIds) {
      const space = await ctx.db.get(id)
      if (!space) {
        throw new ConvexError({
          code: "NOT_FOUND",
          message: "Space not found",
        })
      }
      if (space.organizationId !== org_id) {
        throw new ConvexError({
          code: "UNAUTHORIZED",
          message: "You are not authorized to reorder this space",
        })
      }
    }

    // Update sortOrder for each space
    for (let i = 0; i < args.orderedIds.length; i++) {
      await ctx.db.patch(args.orderedIds[i], {
        sortOrder: i,
        updatedAt: now,
      })
    }
  },
})
