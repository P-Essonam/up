"use client"

import React from "react"
import { MoreHorizontal, RotateCcw, X } from "lucide-react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useTRPC } from "@/trpc/client"
import { InvitationState } from "@/features/invitations/lib/types"

type InvitationActionsProps = {
  invitationId: string
  isAdmin: boolean
  state: InvitationState
}

export default function InvitationActions({
  invitationId,
  isAdmin,
  state,
}: InvitationActionsProps) {
  const trpc = useTRPC()
  const queryClient = useQueryClient()

  const resendInvitation = useMutation(
    trpc.organization.resendInvitation.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries()
        toast.success("Invitation resent.")
      },
      onError: (error) => {
        toast.error(error.message)
      },
    })
  )

  const revokeInvitation = useMutation(
    trpc.organization.revokeInvitation.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries()
        toast.success("Invitation revoked.")
      },
      onError: (error) => {
        toast.error(error.message)
      },
    })
  )

  if (!isAdmin || state !== "pending") return null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon-sm" className="text-muted-foreground">
          <MoreHorizontal className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem
          onSelect={() => resendInvitation.mutate({ inviationId: invitationId })}
        >
          <RotateCcw className="size-4" />
          Resend
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={() => revokeInvitation.mutate({ inviationId: invitationId })}
          className="text-destructive"
        >
          <X className="size-4" />
          Revoke
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
