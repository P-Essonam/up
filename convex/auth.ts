import { ConvexError } from "convex/values"
import { QueryCtx, MutationCtx } from "./_generated/server"

export async function getOrganizationId(
  ctx: QueryCtx | MutationCtx
): Promise<string> {
  const identity = await ctx.auth.getUserIdentity()
  if (identity === null) {
    throw new ConvexError({
      code: "UNAUTHORIZED",
      message: "Identity not found",
    })
  }
  const org_id = identity.org_id as string | undefined
  if (!org_id) {
    throw new ConvexError({
      code: "NOT_FOUND",
      message: "Organization not found",
    })
  }
  return org_id
}
