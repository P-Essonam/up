"use client"

import { MoreHorizontal, UserMinus, UserPlus } from "lucide-react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useTRPC } from "@/trpc/client"
import { MemberRole, MembershipStatus } from "@/features/members/lib/types"

export type MemberRowItem = {
  id: string
  email: string
  membershipId: string
  role: MemberRole
  membershipStatus: MembershipStatus
}

type MemberActionsProps = {
  member: MemberRowItem
  currentUserId?: string | null
  currentUserRole: MemberRole
  adminCount: number
}

export default function MemberActions({
  member,
  currentUserId,
  currentUserRole,
  adminCount,
}: MemberActionsProps) {
  const trpc = useTRPC()
  const queryClient = useQueryClient()
  const isSelf = member.id === currentUserId
  const canManage = currentUserRole === "admin" && !isSelf
  // Admin can only leave if there are 2+ admins; member can always leave
  const canLeave = isSelf && (currentUserRole === "member" || adminCount >= 2)
  // Admin can always remove others
  const canRemove = currentUserRole === "admin" && !isSelf

  const updateRole = useMutation(
    trpc.organization.updateOrganizationMembershipRole.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries()
        toast.success("Role updated.")
      },
      onError: () => {
        toast.error("Failed to update role.")
      },
    })
  )

  const deactivate = useMutation(
    trpc.organization.deactivateOrganizationMembership.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries()
        toast.success("Member deactivated.")
      },
      onError: () => {
        toast.error("Failed to deactivate member.")
      },
    })
  )

  const reactivate = useMutation(
    trpc.organization.reactivateOrganizationMembership.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries()
        toast.success("Member reactivated.")
      },
      onError: () => {
        toast.error("Failed to reactivate member.")
      },
    })
  )

  const removeMember = useMutation(
    trpc.organization.deleteOrganizationMembership.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries()
        toast.success("Member removed.")
      },
      onError: () => {
        toast.error("Failed to remove member.")
      },
    })
  )

  if (!canManage && !canLeave) return null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon-sm" className="text-muted-foreground">
          <MoreHorizontal className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {canLeave && (
          <DropdownMenuItem
            onSelect={() => removeMember.mutate({ memberId: member.membershipId })}
            className="text-destructive"
          >
            Leave workspace
          </DropdownMenuItem>
        )}

        {canManage && (
          <>
            {member.role !== "member" && (
              <DropdownMenuItem
                onSelect={() =>
                  updateRole.mutate({
                    memberId: member.membershipId,
                    role: "member",
                  })
                }
              >
                Set as member
              </DropdownMenuItem>
            )}
            {member.role !== "admin" && (
              <DropdownMenuItem
                onSelect={() =>
                  updateRole.mutate({
                    memberId: member.membershipId,
                    role: "admin",
                  })
                }
              >
                Set as admin
              </DropdownMenuItem>
            )}
            {(member.role === "member" || member.role === "admin") && (
              <DropdownMenuSeparator />
            )}

            {member.membershipStatus !== "pending" &&
              (member.membershipStatus === "inactive" ? (
                <DropdownMenuItem
                  onSelect={() =>
                    reactivate.mutate({ memberId: member.membershipId })
                  }
                >
                  <UserPlus className="size-4" />
                  Reactivate
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem
                  onSelect={() =>
                    deactivate.mutate({ memberId: member.membershipId })
                  }
                >
                  <UserMinus className="size-4" />
                  Deactivate
                </DropdownMenuItem>
              ))}

            {canRemove && (
              <DropdownMenuItem
                onSelect={() =>
                  removeMember.mutate({ memberId: member.membershipId })
                }
                className="text-destructive"
              >
                Remove member
              </DropdownMenuItem>
            )}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
