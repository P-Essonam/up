"use client"

import React from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useTRPC } from "@/trpc/client"

type InviteMemberDialogProps = {
  canInvite: boolean
}

export default function InviteMemberDialog({ canInvite }: InviteMemberDialogProps) {
  const trpc = useTRPC()
  const queryClient = useQueryClient()
  const [open, setOpen] = React.useState(false)
  const [email, setEmail] = React.useState("")
  const [role, setRole] = React.useState<"member" | "admin">("member")

  const { data: organization } = useQuery(
    trpc.organization.getOrganization.queryOptions()
  )

  const inviteUser = useMutation(
    trpc.organization.inviteUser.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries()
        toast.success("Invitation sent.")
        setEmail("")
        setRole("member")
        setOpen(false)
      },
      onError: (error) => {
        toast.error(error.message)
      },
    })
  )

  const handleInvite = (event: React.FormEvent) => {
    event.preventDefault()
    if (!email.trim()) return
    inviteUser.mutate({ email, role })
  }

  if (!canInvite) return null

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">Invite User</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite member</DialogTitle>
          <DialogDescription>
            Send an invitation to join your workspace.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleInvite} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="organization">Workspace</Label>
            <Input
              id="organization"
              value={organization?.name ?? "Workspace"}
              readOnly
              
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="name@company.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select value={role} onValueChange={(value) => setRole(value as "member" | "admin")}>
              <SelectTrigger id="role" className="w-full">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="member">Member</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button
              type="submit"
              disabled={!email.trim() || inviteUser.isPending}
            >
              {inviteUser.isPending ? "Sending..." : "Send invite"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
