"use client"

import React from "react"
import { useQuery } from "@tanstack/react-query"
import { useAuth } from "@workos-inc/authkit-nextjs/components"

import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useTRPC } from "@/trpc/client"
import InvitationActions from "@/features/invitations/components/invitation-actions"
import InvitationStatusBadge from "@/features/invitations/components/invitation-status-badge"

import { formatDate } from "@/lib/utils"
import { InvitationItem } from "@/features/invitations/lib/types"

export default function InvitationsTable() {
  const trpc = useTRPC()
  const { role } = useAuth()
  const { data: invitationsData, isLoading: isInvitationsLoading } = useQuery(
    trpc.organization.listInvitations.queryOptions({ limit: 100 })
  )
  const invitations = (invitationsData?.items ?? []) as InvitationItem[]

  return (
    <div className="rounded-xl border border-border/60 bg-background">
      <div className="flex items-center justify-between border-b border-border/60 px-2 py-3">
        <div>
          <h2 className="text-sm font-semibold">Pending invitations</h2>
          <p className="text-xs text-muted-foreground">
            Manage pending member invitations.
          </p>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Email</TableHead>
            <TableHead>Sent at</TableHead>
            <TableHead>Status</TableHead>
          
            <TableHead className="text-right" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {isInvitationsLoading &&
            Array.from({ length: 5 }).map((_, index) => (
              <TableRow key={index}>
                <TableCell>
                  <Skeleton className="h-3 w-40" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-3 w-32" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-3 w-24" />
                </TableCell>
                <TableCell className="text-right">
                  <Skeleton className="h-6 w-6 justify-self-end" />
                </TableCell>
              </TableRow>
            ))}

          {!isInvitationsLoading && invitations.length === 0 && (
            <TableRow>
              <TableCell colSpan={4} className="py-10 text-center">
                <span className="text-sm text-muted-foreground">
                  No pending invitations.
                </span>
              </TableCell>
            </TableRow>
          )}

          {!isInvitationsLoading &&
            invitations.map((invitation) => {
              return (
                <TableRow key={invitation.id}>
                  <TableCell className="text-sm font-medium">
                    {invitation.email}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(invitation.createdAt)}
                  </TableCell>
                  <TableCell>
                    <InvitationStatusBadge
                      state={invitation.state}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end">
                      <InvitationActions
                        invitationId={invitation.id}
                        isAdmin={role === "admin"}
                        state={invitation.state}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
        </TableBody>
      </Table>
    </div>
  )
}
