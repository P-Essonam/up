import {
  createTRPCRouter,
  protectedProcedure,
  protectedOrganizationCreationProcedure,
} from "@/trpc/init";
import { getWorkOS } from "@workos-inc/authkit-nextjs";
import { Organization } from "@workos-inc/node";
import z from "zod";

export const organizationRouter = createTRPCRouter({
  createOrganization: protectedOrganizationCreationProcedure
    .input(
      z.object({
        name: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const workos = getWorkOS();
      const organization = await workos.organizations.createOrganization({
        name: input.name,
      });

      await workos.userManagement.createOrganizationMembership({
        userId: ctx.userId,
        organizationId: organization.id,
        roleSlug: "admin",
      });
      return organization as Organization;
    }),
  getOrganization: protectedProcedure.query(async ({ ctx }) => {
    const workos = getWorkOS();
    const organization = await workos.organizations.getOrganization(
      ctx.organizationId,
    );
    return organization as Organization;
  }),
  updateOrganizationName: protectedProcedure
    .input(
      z.object({
        name: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const workos = getWorkOS();
      await workos.organizations.updateOrganization({
        organization: ctx.organizationId,
        name: input.name,
      });
    }),
  countMembers: protectedProcedure.query(async ({ ctx }) => {
    const workos = getWorkOS();

    const list = await workos.userManagement.listOrganizationMemberships({
      organizationId: ctx.organizationId,
      // Include all statuses so plan checks account for pending/inactive users
      statuses: ["active", "inactive", "pending"],
    });

    return { count: list.data.length };
  }),
  inviteUser: protectedProcedure
    .input(
      z.object({
        email: z.string(),
        role: z.enum(["owner", "admin", "member"]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const workos = getWorkOS();

      return await workos.userManagement.sendInvitation({
        email: input.email,
        roleSlug: input.role,
        organizationId: ctx.organizationId,
        inviterUserId: ctx.userId,
      });
    }),
  resendInvitation: protectedProcedure
    .input(
      z.object({
        invitationId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const workos = getWorkOS();
      const { invitationId } = input;

      return await workos.userManagement.resendInvitation(invitationId);
    }),
  revokeInvitation: protectedProcedure
    .input(
      z.object({
        invitationId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const workos = getWorkOS();
      const { invitationId } = input;

      return await workos.userManagement.revokeInvitation(invitationId);
    }),
  listInvitations: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).optional().default(100),
        cursor: z.string().nullish(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const workos = getWorkOS();

      const list = await workos.userManagement.listInvitations({
        organizationId: ctx.organizationId,
        limit: input.limit,
        after: input.cursor ?? undefined,
        order: "desc",
      });

      return {
        items: list.data,
        nextCursor: list.listMetadata?.after ?? null,
      };
    }),
  listMembers: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).optional().default(100),
        cursor: z.string().nullish(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const workos = getWorkOS();

      // Get organization memberships (includes role info)
      const memberships =
        await workos.userManagement.listOrganizationMemberships({
          organizationId: ctx.organizationId,
          limit: input.limit,
          after: input.cursor ?? undefined,
          order: "desc",
          statuses: ["active", "inactive", "pending"],
        });

      // Fetch user details for each membership in parallel
      const membersWithUsers = await Promise.all(
        memberships.data.map(async (membership) => {
          const user = await workos.userManagement.getUser(membership.userId);
          return {
            // User info
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            profilePictureUrl: user.profilePictureUrl,
            lastSignInAt: user.lastSignInAt,
            createdAt: user.createdAt,
            // Membership info
            membershipId: membership.id,
            role: membership.role?.slug ?? "member",
            membershipStatus: membership.status,
          };
        }),
      );

      return {
        items: membersWithUsers,
        nextCursor: memberships.listMetadata?.after ?? null,
      };
    }),
  updateOrganizationMembershipRole: protectedProcedure
    .input(
      z.object({
        memberId: z.string(),
        role: z.enum(["owner", "admin", "member"]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const workos = getWorkOS();
      const { memberId, role } = input;
      return await workos.userManagement.updateOrganizationMembership(
        memberId,
        {
          roleSlug: role,
        },
      );
    }),
  deactivateOrganizationMembership: protectedProcedure
    .input(
      z.object({
        memberId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const workos = getWorkOS();
      const { memberId } = input;
      return await workos.userManagement.deactivateOrganizationMembership(
        memberId,
      );
    }),
  reactivateOrganizationMembership: protectedProcedure
    .input(
      z.object({
        memberId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const workos = getWorkOS();
      const { memberId } = input;
      return await workos.userManagement.reactivateOrganizationMembership(
        memberId,
      );
    }),
  deleteOrganizationMembership: protectedProcedure
    .input(
      z.object({
        memberId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const workos = getWorkOS();
      const { memberId } = input;
      return await workos.userManagement.deleteOrganizationMembership(memberId);
    }),
  listOrganizations: protectedProcedure.query(async ({ ctx }) => {
    const workos = getWorkOS();
    const userId = ctx.userId;
    const organizationMemberships =
      await workos.userManagement.listOrganizationMemberships({
        userId: userId,
      });
    return organizationMemberships.data;
  }),
});
