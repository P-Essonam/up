import React from "react"
import MembersTable from "@/features/members/components/members-table"

const MembersPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Members</h1>
        <p className="text-sm text-muted-foreground">
          Manage team members and invitations.
        </p>
      </div>
      <MembersTable />
    </div>
  )
}

export default MembersPage
