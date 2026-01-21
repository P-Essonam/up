import { v } from "convex/values";

import { mutation } from "./_generated/server";

export const startOnboarding = mutation({
  args: {
    organizationId: v.string(),
    workspaceType: v.optional(v.string()),
    manageType: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { organizationId, workspaceType, manageType } = args;
    await ctx.db.insert("onboarding", {
      workosOrganizationId: organizationId,
      workspaceType,
      manageType,
    });
  },
});
