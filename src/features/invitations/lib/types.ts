export type InvitationState = "pending" | "accepted" | "revoked" | "expired"

export type InvitationItem = {
  id: string
  email: string
  state: InvitationState
  createdAt: string
  expiresAt: string | null
}
