import InvitationsTable from "@/features/invitations/components/invitations-table"

const PendingInvitationsPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Invitations</h1>
        <p className="text-sm text-muted-foreground">
          Review and manage pending member invitations.
        </p>
      </div>
      <InvitationsTable />
    </div>
  )
}

export default PendingInvitationsPage
